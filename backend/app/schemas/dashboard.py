from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_resumes: int
    total_interviews: int
    average_score: float
    weak_areas: list[str]
    recent_scores: list[dict]
    extracted_skills: list[str]
    skill_gaps: list[str]
    recommended_learning_paths: list[dict]
    suggested_roles: list[dict]
    latest_ats_score: float | None = None


class DashboardResponse(BaseModel):
    user_id: int
    stats: DashboardStats
