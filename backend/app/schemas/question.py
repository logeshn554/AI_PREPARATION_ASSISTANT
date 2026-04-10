from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class QuestionType(str, Enum):
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"


class QuestionBase(BaseModel):
    role: str
    question_text: str
    question_type: QuestionType
    keywords: Optional[str] = None


class QuestionCreate(QuestionBase):
    pass


class QuestionResponse(QuestionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class QuestionGenerateRequest(BaseModel):
    role: str
    skills: list[str]
    num_questions: int = 10
