from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas import QuestionResponse, QuestionGenerateRequest
from app.services import QuestionService
from app.database import get_db

router = APIRouter(prefix="/questions", tags=["questions"])


@router.post("/generate", status_code=status.HTTP_201_CREATED)
def generate_questions(
    request: QuestionGenerateRequest,
    db: Session = Depends(get_db)
):
    """Generate questions based on role and skills."""
    try:
        questions = QuestionService.generate_and_save_questions(db, request)
        return {
            "role": request.role,
            "total_questions": len(questions),
            "questions": questions
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating questions: {str(e)}"
        )


@router.get("/role/{role}")
def get_questions_by_role(
    role: str,
    db: Session = Depends(get_db)
):
    """Get all questions for a specific role."""
    questions = QuestionService.get_questions_by_role(db, role)
    
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No questions found for role: {role}"
        )
    
    return {
        "role": role,
        "total": len(questions),
        "questions": questions
    }


@router.get("/random")
def get_random_questions(
    role: str,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get random questions for a role."""
    questions = QuestionService.get_random_questions(db, role, limit)
    
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No questions found for role: {role}"
        )
    
    return {
        "role": role,
        "requested": limit,
        "returned": len(questions),
        "questions": questions
    }


@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(
    question_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific question."""
    question = QuestionService.get_question_by_id(db, question_id)
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    return question
