from uuid import UUID
import asyncio
import json
from fastapi.responses import StreamingResponse

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime,timezone

from app.db.database import get_db
from app.db.models import Conversation, Message, User
from app.dependencies.auth import get_current_user
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    MessageResponse,
    ConversationResponse,
)
from app.services.groq_service import (
    stream_groq_response,
    get_groq_completion,
)


router = APIRouter(
    prefix="/assistant",
    tags=["Assistant"],
)


@router.get(
    "/conversations",
    response_model=list[ConversationResponse],
)
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversations = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )

    return conversations


@router.post(
    "/chat",
    response_model=ChatResponse,
)
async def chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = current_user

    if payload.conversation_id:
        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.id == payload.conversation_id,
                Conversation.user_id == user.id,
            )
            .first()
        )

        if not conversation:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found",
            )
    else:
        title = "New Conversation"
        if payload.context and payload.context.title:
            title = payload.context.title[:255]
        elif payload.content:
            title = payload.content[:100]

        conversation = Conversation(
            user_id=user.id,
            title=title,
        )
        db.add(conversation)
        db.flush()

    # Save user message
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=payload.content,
    )
    db.add(user_message)
    db.commit()

    # Load conversation history
    history_messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.asc())
        .all()
    )
    history = [
        {"role": msg.role, "content": msg.content}
        for msg in history_messages
        if msg.id != user_message.id
    ]

    # Generate real AI response via Groq
    assistant_content = await get_groq_completion(
        history=history,
        current_content=payload.content,
        context=payload.context,
        action=payload.action,
    )

    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=assistant_content,
    )
    db.add(assistant_message)
    conversation.updated_at = datetime.now()
    db.commit()

    return ChatResponse(
        conversation_id=conversation.id,
        content=assistant_content,
    )


@router.post("/chat/stream")
async def chat_stream(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 1. Find existing conversation or create a new one
    if payload.conversation_id:
        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.id == payload.conversation_id,
                Conversation.user_id == current_user.id,
            )
            .first()
        )

        if not conversation:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found",
            )
    else:
        title = "New Conversation"
        if payload.context and payload.context.title:
            title = payload.context.title[:255]
        elif payload.content:
            title = payload.content[:100]

        conversation = Conversation(
            user_id=current_user.id,
            title=title,
        )
        db.add(conversation)
        db.flush()

    # 2. Save user message
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=payload.content,
    )

    db.add(user_message)
    conversation.updated_at = datetime.now()

    db.commit()
    db.refresh(conversation)
    db.refresh(user_message)

    conversation_id = str(conversation.id)

    user_message_data = {
        "id": str(user_message.id),
        "conversation_id": conversation_id,
        "role": user_message.role,
        "content": user_message.content,
        "created_at": user_message.created_at.isoformat(),
    }

    # Retrieve previous conversation history
    history_messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.asc())
        .all()
    )
    history = [
        {"role": msg.role, "content": msg.content}
        for msg in history_messages
        if msg.id != user_message.id
    ]

    # 3. SSE event helper
    def event(name: str, data: dict) -> str:
        return f"event: {name}\ndata: {json.dumps(data)}\n\n"

    # 4. Stream response
    async def event_stream():
        try:
            yield event(
                "meta",
                {
                    "conversation_id": conversation_id,
                    "user_message": user_message_data,
                },
            )

            yield event("status", {"status": "thinking"})

            full_response_parts = []
            has_started_generating = False

            # Real Groq stream
            async for chunk in stream_groq_response(
                history=history,
                current_content=payload.content,
                context=payload.context,
                action=payload.action,
            ):
                if not has_started_generating:
                    has_started_generating = True
                    yield event("status", {"status": "generating"})

                full_response_parts.append(chunk)
                yield event("delta", {"content": chunk})

            full_response = "".join(full_response_parts).strip()
            if not full_response:
                full_response = "I was unable to generate a response. Please verify the page content and try again."

            # 5. Save completed assistant response
            assistant_message = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=full_response,
            )

            db.add(assistant_message)
            conversation.updated_at = datetime.now()

            db.commit()
            db.refresh(assistant_message)

            yield event(
                "done",
                {
                    "conversation_id": conversation_id,
                    "assistant_message": {
                        "id": str(assistant_message.id),
                        "conversation_id": conversation_id,
                        "role": "assistant",
                        "content": assistant_message.content,
                        "created_at": assistant_message.created_at.isoformat(),
                    },
                },
            )

        except Exception as e:
            db.rollback()
            yield event(
                "error",
                {"message": f"Unable to complete response: {str(e)}"},
            )

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=list[MessageResponse],
)
def get_messages(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    print("REQUESTED CONVERSATION ID:", conversation_id)
    print("CURRENT USER ID:", current_user.id)

    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )

    print(
        "CONVERSATION OWNER ID:",
        conversation.user_id if conversation else None,
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )


    messages = (
        db.query(Message)
        .filter(
            Message.conversation_id == conversation_id
        )
        .order_by(
            Message.created_at.asc()
        )
        .all()
    )

    return messages

@router.delete("/conversation/{conversation_id}")
def delete_conversation(
    conversation_id:UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        )
        .first()
    )
    
    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )
        
    db.delete(conversation)
    db.commit()
    
    return {
        "message":"Conversation deleted successfully"
    }


@router.patch("/conversation/{conversation_id}")
def update_conversation_title(
    conversation_id:UUID,
    title:str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        )
        .first()
    )
    
    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )
    
    title = title.strip()
    
    if not title:
        raise HTTPException(
            status_code=400,
            detail="Title connot be empty"
        )
    
    conversation.title = title[:255]
    conversation.updated_at = datetime.now()
    
    db.commit()
    db.refresh(conversation)
    
    return conversation