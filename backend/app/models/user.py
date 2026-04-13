from sqlalchemy import Column, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship
from .base import BaseModel


class User(BaseModel):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    auth_provider = Column(String(50), nullable=False, default="email")
    google_sub = Column(String(255), unique=True, nullable=True, index=True)
    
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    answers = relationship("Answer", back_populates="user", cascade="all, delete-orphan")
    quiz_sessions = relationship("QuizSession", back_populates="user", cascade="all, delete-orphan")
    mock_tests = relationship("MockTest", back_populates="user", cascade="all, delete-orphan")
    challenge_submissions = relationship("ChallengeSubmission", back_populates="user", cascade="all, delete-orphan")
    
    __table_args__ = (
        UniqueConstraint('email', name='uq_users_email'),
        UniqueConstraint('google_sub', name='uq_users_google_sub'),
    )
