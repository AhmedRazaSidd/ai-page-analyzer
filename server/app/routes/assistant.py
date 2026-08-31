from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.database import get_db
from app.db.models import Conversation, Message, User
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    MessageResponse,
    ConversationResponse
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
    user_id: UUID,
    db: Session = Depends(get_db),
):
    conversations = (
        db.query(Conversation)
        .filter(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )

    return conversations
@router.post(
    "/chat",
    response_model=ChatResponse,
)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
):
    # -----------------------------------
    # 1. Get user
    # -----------------------------------

    user = (
        db.query(User)
        .filter(User.id == payload.user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    # -----------------------------------
    # 2. Get or create conversation
    # -----------------------------------

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

        conversation = Conversation(
            user_id=user.id,
        )

        db.add(conversation)
        db.flush()

    # -----------------------------------
    # 3. Save user message
    # -----------------------------------

    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=payload.content,
    )

    db.add(user_message)

    # -----------------------------------
    # 4. Temporary AI response
    # -----------------------------------

    assistant_content = "This is a temporary AI response"

    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=assistant_content,
    )

    db.add(assistant_message)

    # -----------------------------------
    # 5. Update conversation timestamp
    # -----------------------------------

    conversation.updated_at = conversation.updated_at

    # -----------------------------------
    # 6. Commit
    # -----------------------------------

    db.commit()

    # -----------------------------------
    # 7. Return response
    # -----------------------------------

    return ChatResponse(
        user_id=user.id,
        conversation_id=conversation.id,
        content=assistant_content,
    )


@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=list[MessageResponse],
)
def get_messages(
    conversation_id: UUID,
    db: Session = Depends(get_db),
):
    # -----------------------------------
    # 1. Check conversation
    # -----------------------------------

    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    # -----------------------------------
    # 2. Get messages
    # -----------------------------------

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
    user_id:UUID,
    db: Session = Depends(get_db)
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
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
    user_id:UUID,
    title:str,
    db: Session = Depends(get_db)
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
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