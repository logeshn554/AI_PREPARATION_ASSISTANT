from pydantic import BaseModel
from datetime import date


class DailyChallengeResponse(BaseModel):
    id: int
    challenge_date: date
    title: str
    question_text: str
    question_type: str
    difficulty: str


class ChallengeSubmitRequest(BaseModel):
    challenge_id: int
    answer_text: str


class ChallengeSubmitResponse(BaseModel):
    challenge_id: int
    user_id: int
    score: float
    feedback: str


class LeaderboardRow(BaseModel):
    user_id: int
    name: str
    points: float


class LeaderboardResponse(BaseModel):
    rows: list[LeaderboardRow]
