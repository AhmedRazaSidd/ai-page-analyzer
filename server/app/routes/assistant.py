from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Conversation, Message
from app.schemas.chat import ChatRequest, ChatResponse, MessageResponse


router = APIRouter(
    prefix="/assistant",
    tags=["Assistant"],
)


@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
):
    # Find existing conversation
    if payload.conversation_id:
        conversation = (
            db.query(Conversation)
            .filter(Conversation.id == payload.conversation_id)
            .first()
        )

        if not conversation:
            conversation = Conversation(
                id=payload.conversation_id,
                user_id=payload.user_id,
            )
            db.add(conversation)

    else:
        conversation = Conversation(
            user_id=payload.user_id,
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

    # Temporary AI response
    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content="This is a temporary AI response",
    )

    db.add(assistant_message)

    db.commit()

    return ChatResponse(
        conversation_id=conversation.id,
        content="Message received successfully",
    )


@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=list[MessageResponse],
)
def get_messages(
    conversation_id: UUID,
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id)
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return messages