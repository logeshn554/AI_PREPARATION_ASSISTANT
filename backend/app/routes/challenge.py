from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.challenge import (
    DailyChallengeResponse,
    ChallengeSubmitRequest,
    ChallengeSubmitResponse,
    LeaderboardResponse,
)
from app.services.challenge_service import ChallengeService

router = APIRouter(tags=["challenges", "leaderboard"])


@router.get("/challenges/today", response_model=DailyChallengeResponse)
def get_today_challenge(db: Session = Depends(get_db)):
    challenge = ChallengeService.get_today_challenge(db)
    return {
        "id": challenge.id,
        "challenge_date": challenge.challenge_date,
        "title": challenge.title,
        "question_text": challenge.question_text,
        "question_type": challenge.question_type,
        "difficulty": challenge.difficulty,
    }


@router.post("/challenges/submit", response_model=ChallengeSubmitResponse)
def submit_challenge(user_id: int, payload: ChallengeSubmitRequest, db: Session = Depends(get_db)):
    try:
        submission = ChallengeService.submit_challenge(db, user_id, payload)
        return {
            "challenge_id": submission.challenge_id,
            "user_id": submission.user_id,
            "score": submission.score or 0,
            "feedback": submission.feedback or "",
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/leaderboard", response_model=LeaderboardResponse)
def leaderboard(limit: int = 20, db: Session = Depends(get_db)):
    return {"rows": ChallengeService.get_leaderboard(db, limit=limit)}
