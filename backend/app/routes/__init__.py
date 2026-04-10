from .auth import router as auth_router
from .resume import router as resume_router
from .answer import router as answer_router
from .questions import router as questions_router
from .dashboard import router as dashboard_router

__all__ = [
    "auth_router",
    "resume_router",
    "answer_router",
    "questions_router",
    "dashboard_router",
]
