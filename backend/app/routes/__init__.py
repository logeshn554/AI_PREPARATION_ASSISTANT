from .auth import router as auth_router
from .resume import router as resume_router
from .answer import router as answer_router
from .questions import router as questions_router
from .dashboard import router as dashboard_router
from .quiz import router as quiz_router
from .company import router as company_router
from .mock_test import router as mock_test_router
from .analytics import router as analytics_router
from .ai_interviewer import router as ai_interviewer_router
from .challenge import router as challenge_router

__all__ = [
    "auth_router",
    "resume_router",
    "answer_router",
    "questions_router",
    "dashboard_router",
    "quiz_router",
    "company_router",
    "mock_test_router",
    "analytics_router",
    "ai_interviewer_router",
    "challenge_router",
]
