from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Answer
from app.schemas import AnswerCreate, AnswerEvaluateRequest
from app.utils.evaluator import evaluate_answer as evaluate_answer_util


class AnswerService:
    """Service for answer-related operations."""
    
    @staticmethod
    def submit_answer(
        db: Session,
        user_id: int,
        answer_create: AnswerCreate
    ) -> Answer:
        """Submit an answer."""
        db_answer = Answer(
            user_id=user_id,
            question_id=answer_create.question_id,
            answer_text=answer_create.answer_text,
        )
        db.add(db_answer)
        db.commit()
        db.refresh(db_answer)
        return db_answer
    
    @staticmethod
    def evaluate_and_save_answer(
        db: Session,
        user_id: int,
        question_id: int,
        answer_text: str,
        keywords: str = None
    ) -> Answer:
        """Evaluate an answer and save to database."""
        
        evaluation = evaluate_answer_util(answer_text, keywords, "technical")
        
        db_answer = Answer(
            user_id=user_id,
            question_id=question_id,
            answer_text=answer_text,
            score=evaluation["score"],
            feedback=evaluation["feedback"],
            improvement_suggestions=evaluation["improvement_suggestions"],
        )
        db.add(db_answer)
        db.commit()
        db.refresh(db_answer)
        return db_answer
    
    @staticmethod
    def get_user_answers(db: Session, user_id: int) -> list:
        """Get all answers from a user."""
        return db.query(Answer).filter(Answer.user_id == user_id).all()
    
    @staticmethod
    def get_answer_by_id(db: Session, answer_id: int) -> Answer:
        """Get an answer by ID."""
        return db.query(Answer).filter(Answer.id == answer_id).first()
    
    @staticmethod
    def get_user_scores(db: Session, user_id: int) -> dict:
        """Get score statistics for a user."""
        answers = db.query(Answer).filter(Answer.user_id == user_id).all()
        
        if not answers:
            return {
                "total_answers": 0,
                "average_score": 0.0,
                "highest_score": 0.0,
                "lowest_score": 0.0,
                "scores_by_type": {}
            }
        
        scores = [a.score for a in answers if a.score is not None]
        
        return {
            "total_answers": len(answers),
            "average_score": sum(scores) / len(scores) if scores else 0,
            "highest_score": max(scores) if scores else 0,
            "lowest_score": min(scores) if scores else 0,
            "recent_scores": [{"question_id": a.question_id, "score": a.score} for a in answers[-5:]]
        }
