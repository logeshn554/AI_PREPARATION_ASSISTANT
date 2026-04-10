from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_resumes: int
    total_interviews: int
    average_score: float
    weak_areas: list[str]
    recent_scores: list[dict]


class DashboardResponse(BaseModel):
    user_id: int
    stats: DashboardStats
