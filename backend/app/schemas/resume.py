from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class ResumeBase(BaseModel):
    file_name: str


class ResumeCreate(ResumeBase):
    pass


class ResumeResponse(ResumeBase):
    id: int
    user_id: int
    parsed_data: Optional[Any] = None
    skills: Optional[List[str]] = None
    experience: Optional[List[dict]] = None
    projects: Optional[List[dict]] = None
    ats_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
