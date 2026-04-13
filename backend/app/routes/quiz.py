from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.quiz import QuizGenerateRequest, QuizGenerateResponse, QuizSubmitRequest, QuizSubmitResponse
from app.services.quiz_service import QuizService

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.post("/generate", response_model=QuizGenerateResponse, status_code=status.HTTP_201_CREATED)
def generate_quiz(user_id: int, request: QuizGenerateRequest, db: Session = Depends(get_db)):
    try:
        session = QuizService.create_quiz_session(db, user_id, request)
        public_questions = [
            {
                "question_id": q["question_id"],
                "question_text": q["question_text"],
                "question_type": q["question_type"],
                "options": q.get("options", []),
            }
            for q in session.questions
        ]
        return {
            "session_id": session.id,
            "role": session.role,
            "total_questions": session.total_questions,
            "questions": public_questions,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quiz: {str(e)}",
        )


@router.post("/{session_id}/submit", response_model=QuizSubmitResponse)
def submit_quiz(session_id: int, payload: QuizSubmitRequest, db: Session = Depends(get_db)):
    try:
        session = QuizService.submit_quiz_session(db, session_id, payload)
        return {
            "session_id": session.id,
            "score": session.score or 0,
            "accuracy": session.accuracy or 0,
            "correct_answers": session.correct_answers,
            "total_questions": session.total_questions,
            "weak_areas": session.weak_areas or [],
            "feedback": session.results or [],
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit quiz: {str(e)}",
        )


@router.get("/{session_id}")
def get_quiz_session(session_id: int, db: Session = Depends(get_db)):
    session = QuizService.get_quiz_session(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz session not found")
    return session
