from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Resume, Answer, Question


class DashboardService:
    """Service for dashboard-related operations."""

    ROLE_SKILL_MATRIX = {
        "backend developer": ["python", "sql", "fastapi", "docker", "postgresql"],
        "frontend developer": ["javascript", "react", "html", "css", "typescript"],
        "full stack developer": ["python", "javascript", "react", "sql", "docker"],
        "data scientist": ["python", "machine learning", "sql", "nlp", "pandas"],
        "devops engineer": ["docker", "kubernetes", "aws", "linux", "python"],
    }
    
    @staticmethod
    def get_dashboard_stats(db: Session, user_id: int) -> dict:
        """Get dashboard statistics for a user."""
        
        total_resumes = db.query(func.count(Resume.id)).filter(
            Resume.user_id == user_id
        ).scalar() or 0

        user_resumes = db.query(Resume).filter(Resume.user_id == user_id).all()
        extracted_skills = sorted({skill for r in user_resumes for skill in (r.skills or [])})
        latest_resume = user_resumes[-1] if user_resumes else None
        
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
            "extracted_skills": extracted_skills,
            "skill_gaps": DashboardService._calculate_skill_gaps(extracted_skills),
            "recommended_learning_paths": DashboardService._recommended_learning_paths(extracted_skills),
            "suggested_roles": DashboardService._suggest_roles(extracted_skills),
            "latest_ats_score": latest_resume.ats_score if latest_resume else None,
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

    @staticmethod
    def _calculate_skill_gaps(extracted_skills: list[str]) -> list[str]:
        if not extracted_skills:
            return ["python", "sql", "system design", "communication"]

        extracted = {s.lower() for s in extracted_skills}
        demand = {skill for skills in DashboardService.ROLE_SKILL_MATRIX.values() for skill in skills}
        gaps = sorted(skill for skill in demand if skill not in extracted)
        return gaps[:8]

    @staticmethod
    def _recommended_learning_paths(extracted_skills: list[str]) -> list[dict]:
        gaps = DashboardService._calculate_skill_gaps(extracted_skills)
        catalog = {
            "docker": "Containerization Fundamentals and Deployment Pipelines",
            "kubernetes": "Kubernetes Workloads, Services, and Production Ops",
            "system design": "Scalable System Design for Interviews",
            "nlp": "Applied NLP with Python and Transformers",
            "typescript": "TypeScript for Large Frontend Codebases",
            "aws": "AWS Essentials for Application Engineers",
            "postgresql": "PostgreSQL Query Optimization and Indexing",
        }

        paths = []
        for gap in gaps:
            title = catalog.get(gap, f"Hands-on {gap.title()} Practice Path")
            paths.append({"skill": gap, "path": title})
        return paths[:6]

    @staticmethod
    def _suggest_roles(extracted_skills: list[str]) -> list[dict]:
        if not extracted_skills:
            return []

        skill_set = {s.lower() for s in extracted_skills}
        suggestions = []

        for role, required in DashboardService.ROLE_SKILL_MATRIX.items():
            overlap = len(skill_set.intersection(required))
            fit = (overlap / max(1, len(required))) * 100
            suggestions.append({
                "role": role.title(),
                "fit_score": round(fit, 2),
                "matched_skills": sorted(skill_set.intersection(required)),
            })

        suggestions.sort(key=lambda x: x["fit_score"], reverse=True)
        return suggestions[:4]
