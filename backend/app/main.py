from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routes import (
    auth_router,
    resume_router,
    answer_router,
    questions_router,
    dashboard_router,
    quiz_router,
    company_router,
    mock_test_router,
    analytics_router,
    ai_interviewer_router,
    challenge_router,
)

app = FastAPI(
    title="AI Interview Preparation System",
    description="A comprehensive system for interview preparation",
    version="1.0.0"
)

allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    """Initialize database on startup."""
    init_db()


@app.on_event("shutdown")
async def shutdown():
    """Cleanup on shutdown."""
    pass


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "AI Interview Preparation System API"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


app.include_router(auth_router)
app.include_router(resume_router)
app.include_router(answer_router)
app.include_router(questions_router)
app.include_router(dashboard_router)
app.include_router(quiz_router)
app.include_router(company_router)
app.include_router(mock_test_router)
app.include_router(analytics_router)
app.include_router(ai_interviewer_router)
app.include_router(challenge_router)
