from fastapi import FastAPI

app = FastAPI(
    title="AI Page Assistant API",
    version="1.0.0"
)

@app.get("/health")
def health():
    return {
        "status":"ok"
    }