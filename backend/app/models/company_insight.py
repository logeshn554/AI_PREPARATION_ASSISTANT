from sqlalchemy import Column, Integer, String, Text, JSON
from .base import BaseModel


class CompanyInsight(BaseModel):
    __tablename__ = "company_insights"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False, index=True, unique=True)
    role = Column(String(255), nullable=True)
    source_urls = Column(JSON, nullable=True)
    interview_questions = Column(JSON, nullable=True)
    hiring_process = Column(Text, nullable=True)
    preparation_tips = Column(Text, nullable=True)
