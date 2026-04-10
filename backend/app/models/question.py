from sqlalchemy import Column, Integer, String, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from .base import BaseModel


class QuestionType(str, enum.Enum):
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"


class Question(BaseModel):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String(255), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(SQLEnum(QuestionType), nullable=False)
    keywords = Column(String, nullable=True)
    
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")
