from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.mock_test import (
    MockTestCreateRequest,
    MockTestCreateResponse,
    MockTestSubmitRequest,
    MockTestSubmitResponse,
)
from app.services.mock_test_service import MockTestService

router = APIRouter(prefix="/mock-tests", tags=["mock-tests"])


@router.post("/create", response_model=MockTestCreateResponse, status_code=status.HTTP_201_CREATED)
def create_mock_test(user_id: int, request: MockTestCreateRequest, db: Session = Depends(get_db)):
    try:
        test = MockTestService.create_mock_test(db, user_id, request)
        public_questions = [
            {
                "question_id": q["question_id"],
                "question_text": q["question_text"],
                "question_type": q["question_type"],
                "options": q.get("options", []),
            }
            for q in test.questions
        ]
        return {
            "test_id": test.id,
            "company_name": test.company_name,
            "role": test.role,
            "duration_minutes": test.duration_minutes,
            "total_questions": test.total_questions,
            "questions": public_questions,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create mock test: {str(e)}",
        )


@router.post("/{test_id}/submit", response_model=MockTestSubmitResponse)
def submit_mock_test(test_id: int, payload: MockTestSubmitRequest, db: Session = Depends(get_db)):
    try:
        test = MockTestService.submit_mock_test(db, test_id, payload)
        return {
            "test_id": test.id,
            "score": test.score or 0,
            "accuracy": test.accuracy or 0,
            "correct_answers": test.correct_answers,
            "total_questions": test.total_questions,
            "weak_areas": test.weak_areas or [],
            "feedback": test.results or [],
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit mock test: {str(e)}",
        )


@router.get("/{test_id}")
def get_mock_test(test_id: int, db: Session = Depends(get_db)):
    test = MockTestService.get_mock_test(db, test_id)
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mock test not found")
    return test
