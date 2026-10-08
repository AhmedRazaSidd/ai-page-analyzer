from uuid import UUID
from pydantic import BaseModel

class AnonymousSessionResponse(BaseModel):
    user_id: UUID
    session_id:UUID