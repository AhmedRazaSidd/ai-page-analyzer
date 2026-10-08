import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import AnonymousSession, User
from app.schemas.session import AnonymousSessionResponse


router = APIRouter(
    prefix="/assistant",
    tags=["Session"]
)

@router.post(
    "/session",
    response_model=AnonymousSessionResponse
)
def create_anonymous_session(
    response: Response,
    db: Session = Depends(get_db)
):
    
    user = User()
    
    db.add(user)
    db.flush()
    
    raw_token = secrets.token_urlsafe(32)
    
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    
    now = datetime.now(timezone.utc)
    
    session = AnonymousSession(
        token_hash=token_hash,
        user_id=user.id,
        created_at=now,
        last_seen_at=now,
        expires_at=now + timedelta(days=30)
    )
    
    db.add(session)
    db.commit()
    
    response.set_cookie(
        key="anonymous_token",
        value=raw_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * 30,
    )
    
    
    return AnonymousSessionResponse(
        user_id=user.id,
        session_id=session.id
    )