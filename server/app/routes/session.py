import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import AnonymousSession, User
from app.schemas.session import AnonymousSessionResponse


router = APIRouter(
    prefix="/assistant",
    tags=["Session"],
)


@router.post(
    "/session",
    response_model=AnonymousSessionResponse,
)
def create_anonymous_session(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)

    # 1. Check existing anonymous cookie
    raw_token = request.cookies.get("anonymous_token")

    if raw_token:
        token_hash = hashlib.sha256(
            raw_token.encode()
        ).hexdigest()

        session = (
            db.query(AnonymousSession)
            .filter(
                AnonymousSession.token_hash == token_hash,
                AnonymousSession.expires_at > now,
            )
            .first()
        )

        # 2. Reuse the existing valid guest session
        if session:
            user = (
                db.query(User)
                .filter(User.id == session.user_id)
                .first()
            )

            if user:
                session.last_seen_at = now
                db.commit()

                return AnonymousSessionResponse(
                    user_id=user.id,
                    session_id=session.id,
                )

    # 3. Create a new guest only when necessary
    user = User()
    db.add(user)
    db.flush()

    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(
        raw_token.encode()
    ).hexdigest()

    session = AnonymousSession(
        token_hash=token_hash,
        user_id=user.id,
        created_at=now,
        last_seen_at=now,
        expires_at=now + timedelta(days=30),
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    response.set_cookie(
        key="anonymous_token",
        value=raw_token,
        httponly=True,
        secure=False,  # Local HTTP development only
        samesite="lax",
        max_age=60 * 60 * 24 * 30,
        path="/",
    )

    return AnonymousSessionResponse(
        user_id=user.id,
        session_id=session.id,
    )