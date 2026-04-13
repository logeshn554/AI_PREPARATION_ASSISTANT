from pydantic import BaseModel


class AnalyticsResponse(BaseModel):
    user_id: int
    total_attempts: int
    overall_accuracy: float
    average_time_per_question: float
    weak_areas: list[str]
    progress_scores: list[dict]
