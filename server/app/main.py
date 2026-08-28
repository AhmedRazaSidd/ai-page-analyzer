from fastapi import FastAPI
from app.routes.assistant import router as assistant_router

app = FastAPI(
    title="AI Page Assistant API",
    version="1.0.0"
)

app.include_router(assistant_router)

@app.get("/health")
def health():
    return {
        "status":"ok"
    }