import hashlib
from datetime import datetime,timezone

from fastapi import Cookie, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import AnonymousSession,User

def get_current_user(
    anonymous_token:str | None = Cookie(default=None),
    db: Session = Depends(get_db)
):
    
    if not anonymous_token:
        raise HTTPException(
            status_code=401,
            detail="Anonymous session not found"
        )
    
    token_hash = hashlib.sha256(anonymous_token.encode()).hexdigest()
    
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