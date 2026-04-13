from fastapi import APIRouter

from app.schemas.ai_interviewer import AIChatRequest, AIChatResponse
from app.services.ai_interviewer_service import AIInterviewerService

router = APIRouter(prefix="/ai-interviewer", tags=["ai-interviewer"])


@router.post("/chat", response_model=AIChatResponse)
def chat(payload: AIChatRequest):
    return AIInterviewerService.respond(
        role=payload.role,
        skills=payload.skills,
        answer=payload.answer,
        previous_question=payload.previous_question,
    )
