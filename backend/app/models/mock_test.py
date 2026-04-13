from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel


class MockTest(BaseModel):
    __tablename__ = "mock_tests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    company_name = Column(String(255), nullable=False, index=True)
    role = Column(String(255), nullable=False, index=True)
    duration_minutes = Column(Integer, nullable=False, default=30)
    questions = Column(JSON, nullable=False)
    results = Column(JSON, nullable=True)
    total_questions = Column(Integer, nullable=False, default=0)
    correct_answers = Column(Integer, nullable=False, default=0)
    score = Column(Float, nullable=True)
    accuracy = Column(Float, nullable=True)
    time_spent_seconds = Column(Integer, nullable=True)
    weak_areas = Column(JSON, nullable=True)
    status = Column(String(50), nullable=False, default="pending")

    user = relationship("User", back_populates="mock_tests")
