from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import Question
from app.schemas import QuestionCreate, QuestionGenerateRequest
from app.utils.question_generator import generate_questions, extract_keywords_from_question


class QuestionService:
    """Service for question-related operations."""
    
    @staticmethod
    def create_question(db: Session, question: QuestionCreate) -> Question:
        """Create a new question."""
        db_question = Question(
            role=question.role,
            question_text=question.question_text,
            question_type=question.question_type,
            keywords=question.keywords,
        )
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        return db_question
    
    @staticmethod
    def generate_and_save_questions(
        db: Session,
        request: QuestionGenerateRequest
    ) -> list:
        """Generate questions and save them to database."""
        generated_questions = generate_questions(
            role=request.role,
            skills=request.skills,
            num_questions=request.num_questions
        )
        
        saved_questions = []
        for q in generated_questions:
            db_question = Question(
                role=request.role,
                question_text=q["question_text"],
                question_type=q["question_type"],
                keywords=q["keywords"],
            )
            db.add(db_question)
            saved_questions.append(db_question)
        
        db.commit()
        
        for q in saved_questions:
            db.refresh(q)
        
        return saved_questions
    
    @staticmethod
    def get_questions_by_role(db: Session, role: str) -> list:
        """Get all questions for a specific role."""
        return db.query(Question).filter(Question.role == role).all()
    
    @staticmethod
    def get_question_by_id(db: Session, question_id: int) -> Question:
        """Get a question by ID."""
        return db.query(Question).filter(Question.id == question_id).first()
    
    @staticmethod
    def get_random_questions(
        db: Session,
        role: str,
        limit: int = 10
    ) -> list:
        """Get random questions for a role."""
        from sqlalchemy import func
        return db.query(Question).filter(
            Question.role == role
        ).order_by(func.random()).limit(limit).all()
