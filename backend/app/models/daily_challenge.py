from sqlalchemy import Column, Integer, String, Text, Date, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel


class DailyChallenge(BaseModel):
    __tablename__ = "daily_challenges"

    id = Column(Integer, primary_key=True, index=True)
    challenge_date = Column(Date, nullable=False, unique=True, index=True)
    title = Column(String(255), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=False, default="technical")
    difficulty = Column(String(50), nullable=False, default="medium")
    expected_keywords = Column(JSON, nullable=True)

    submissions = relationship("ChallengeSubmission", back_populates="challenge", cascade="all, delete-orphan")


class ChallengeSubmission(BaseModel):
    __tablename__ = "challenge_submissions"

    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(Integer, ForeignKey("daily_challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    answer_text = Column(Text, nullable=False)
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)

    challenge = relationship("DailyChallenge", back_populates="submissions")
    user = relationship("User", back_populates="challenge_submissions")
