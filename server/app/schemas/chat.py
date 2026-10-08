from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ChatContext(BaseModel):
    url: str | None = None
    title: str | None = None
    page_content: str | None = None


class ChatRequest(BaseModel):
    conversation_id: UUID | None = None
    content: str
    context: ChatContext | None = None


class ChatResponse(BaseModel):
    conversation_id: UUID
    content: str

class MessageResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    role: str
    content: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )
    
    
    
class ConversationResponse(BaseModel):
    id: UUID
    user_id:UUID
    title:str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)