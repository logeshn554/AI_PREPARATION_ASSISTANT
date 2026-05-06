"""
AI Interview Preparation System — FastAPI Application
Features: Rate Limiting · Structured Logging · Connection Pooling · Health Check
"""
import logging
import os
import time

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.database import init_db
from app.utils import shutdown_executor
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
    jd_analysis_router,
    chat_router,
    learning_path_router,
)
from app.routes.personalization import router as personalization_router
from app.routes.analytics_v2 import router as analytics_v2_router
from app.routes.system_design import router as system_design_router
from app.routes.community import router as community_router
from app.routes.subscription import router as subscription_router
from app.routes.async_execution import router as async_router


# ──────────────────────────────────────────────────────────────────────
# Structured Logging (#19)
# ──────────────────────────────────────────────────────────────────────
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer() if os.getenv("ENV", "dev") == "dev"
        else structlog.processors.JSONRenderer(),
    ],
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

log = structlog.get_logger()


# ──────────────────────────────────────────────────────────────────────
# Rate Limiter (#4)
# ──────────────────────────────────────────────────────────────────────
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/minute"],
    storage_uri="memory://",
)


# ──────────────────────────────────────────────────────────────────────
# FastAPI App
# ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Interview Preparation System",
    description="A comprehensive system for interview preparation with AI-powered features",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ── CORS ─────────────────────────────────────────────────────────────
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1):\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request logging + timing middleware ──────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = round((time.perf_counter() - start) * 1000, 1)

    log.info(
        "http_request",
        method=request.method,
        path=str(request.url.path),
        status=response.status_code,
        duration_ms=elapsed,
        client=request.client.host if request.client else "unknown",
    )
    return response


# ── Global exception handler ─────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.error(
        "unhandled_exception",
        path=str(request.url.path),
        error=str(exc),
        exc_type=type(exc).__name__,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again."},
    )


# ── Lifecycle events ──────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    """Initialize database on startup."""
    init_db()
    log.info("app_startup", message="AI Interview Prep System v2.0 started")


@app.on_event("shutdown")
async def shutdown():
    """Cleanup on shutdown."""
    shutdown_executor()
    log.info("app_shutdown", message="Shutting down gracefully")


# ── Root & Health ─────────────────────────────────────────────────────
@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "AI Interview Preparation System API", "version": "2.0.0"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "version": "2.0.0"}


# ── Route Registration ───────────────────────────────────────────────
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
app.include_router(async_router)
app.include_router(jd_analysis_router)
app.include_router(chat_router)
app.include_router(learning_path_router)
app.include_router(personalization_router)
app.include_router(analytics_v2_router)
app.include_router(system_design_router)
app.include_router(community_router)
app.include_router(subscription_router)
