from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.assistant import router as assistant_router
from app.routes.session import router as session_router

app = FastAPI(
    title="AI Page Assistant API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(assistant_router)
app.include_router(session_router)

@app.get("/health")
def health():
    return {
        "status":"ok"
    }