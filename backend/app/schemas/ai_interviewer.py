from pydantic import BaseModel


class AIChatRequest(BaseModel):
    user_id: int
    role: str
    skills: list[str] = []
    answer: str | None = None
    previous_question: str | None = None


class AIChatResponse(BaseModel):
    question: str
    feedback: str | None = None
    score: float | None = None
    follow_up: str | None = None
