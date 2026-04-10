from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Resume, Answer, Question


class DashboardService:
    """Service for dashboard-related operations."""
    
    @staticmethod
    def get_dashboard_stats(db: Session, user_id: int) -> dict:
        """Get dashboard statistics for a user."""
        
        total_resumes = db.query(func.count(Resume.id)).filter(
            Resume.user_id == user_id
        ).scalar() or 0
        
        user_answers = db.query(Answer).filter(Answer.user_id == user_id).all()
        total_interviews = len(user_answers)
        
        scores = [a.score for a in user_answers if a.score is not None]
        average_score = sum(scores) / len(scores) if scores else 0
        
        weak_areas = DashboardService._identify_weak_areas(db, user_id)
        
        recent_scores = [
            {
                "question_id": a.question_id,
                "score": a.score,
                "created_at": a.created_at.isoformat()
            }
            for a in user_answers[-10:]
        ]
        
        return {
            "total_resumes": total_resumes,
            "total_interviews": total_interviews,
            "average_score": round(average_score, 2),
            "weak_areas": weak_areas,
            "recent_scores": recent_scores,
        }
    
    @staticmethod
    def _identify_weak_areas(db: Session, user_id: int) -> list:
        """Identify weak areas based on low scores."""
        
        answers = db.query(Answer).filter(Answer.user_id == user_id).all()
        
        if not answers:
            return []
        
        weak_answers = [a for a in answers if a.score and a.score < 50]
        
        if not weak_answers:
            return []
        
        weak_areas_dict = {}
        for answer in weak_answers:
            question = db.query(Question).filter(Question.id == answer.question_id).first()
            if question:
                key = f"{question.role}_{question.question_type}"
                if key not in weak_areas_dict:
                    weak_areas_dict[key] = 0
                weak_areas_dict[key] += 1
        
        weak_areas = sorted(
            weak_areas_dict.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]
        
        return [area[0].replace("_", " - ").title() for area in weak_areas]
