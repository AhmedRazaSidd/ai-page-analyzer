import hashlib
from datetime import datetime,timezone

from fastapi import Cookie, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import AnonymousSession,User

def get_current_user(
    anonymous_token: str | None = Cookie(default=None),
    x_anonymous_token: str | None = Header(default=None, alias="x-anonymous-token"),
    authorization: str | None = Header(default=None, alias="authorization"),
    db: Session = Depends(get_db)
):
    token = x_anonymous_token
    if not token and authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
    if not token:
        token = anonymous_token

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Anonymous session not found"
        )
    
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    anonymous_session = (
        db.query(AnonymousSession).filter(AnonymousSession.token_hash == token_hash).first()
    )
    
    if not anonymous_session:
        raise HTTPException(
            status_code=401,
            detail="Invalid anonymous session"
        )
    
    
    now = datetime.now(timezone.utc)
    
    if anonymous_session.expires_at <= now:
        raise HTTPException(
            status_code=401,
            detail="Anonymous session expired"
        )
        
    user = (
        db.query(User).filter(User.id == anonymous_session.user_id).first()
    )
    
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
        
    anonymous_session.last_seen_at=now
    
    db.commit()
    
    return user