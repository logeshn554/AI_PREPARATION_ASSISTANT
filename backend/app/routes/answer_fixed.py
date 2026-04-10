from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas import AnswerCreate, AnswerResponse, AnswerEvaluateRequest, AnswerEvaluateResponse
from app.services import AnswerService
from app.models import Question
from app.database import get_db

router = APIRouter(prefix="/answers", tags=["answers"])


@router.post("/submit", response_model=AnswerResponse, status_code=status.HTTP_201_CREATED)
def submit_answer(
    user_id: int,
    answer_create: AnswerCreate,
    db: Session = Depends(get_db)
):
    """Submit an answer."""
    
    question = db.query(Question).filter(Question.id == answer_create.question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    try:
        answer = AnswerService.submit_answer(db, user_id, answer_create)
        return answer
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting answer: {str(e)}"
        )


@router.post("/evaluate", response_model=AnswerEvaluateResponse, status_code=status.HTTP_200_OK)
def evaluate_answer(
    user_id: int,
    request: AnswerEvaluateRequest,
    db: Session = Depends(get_db)
):
    """Evaluate an answer and provide feedback."""
    
    question = db.query(Question).filter(Question.id == request.question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    try:
        answer = AnswerService.evaluate_and_save_answer(
            db,
            user_id,
            request.question_id,
            request.answer_text,
            question.keywords
        )
        
        return {
            "score": answer.score,
            "feedback": answer.feedback,
            "improvement_suggestions": answer.improvement_suggestions
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error evaluating answer: {str(e)}"
        )


@router.get("/user/{user_id}")
def get_user_answers(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all answers from a user."""
    answers = AnswerService.get_user_answers(db, user_id)
    
    if not answers:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No answers found"
        )
    
    return {
        "user_id": user_id,
        "total": len(answers),
        "answers": answers
    }


@router.get("/{answer_id}", response_model=AnswerResponse)
def get_answer(
    answer_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific answer."""
    answer = AnswerService.get_answer_by_id(db, answer_id)
    
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    
    return answer


@router.get("/stats/{user_id}")
def get_user_stats(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get answer statistics for a user."""
    stats = AnswerService.get_user_scores(db, user_id)
    return stats
