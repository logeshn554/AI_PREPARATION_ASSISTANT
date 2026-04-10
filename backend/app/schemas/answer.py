from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AnswerBase(BaseModel):
    question_id: int
    answer_text: str


class AnswerCreate(AnswerBase):
    pass


class AnswerResponse(AnswerBase):
    id: int
    user_id: int
    score: Optional[float] = None
    feedback: Optional[str] = None
    improvement_suggestions: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AnswerEvaluateRequest(BaseModel):
    question_id: int
    answer_text: str


class AnswerEvaluateResponse(BaseModel):
    score: float
    feedback: str
    improvement_suggestions: str
