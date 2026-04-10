from sqlalchemy.orm import Session
from io import BytesIO
from app.models import Resume
from app.schemas import ResumeCreate
from app.utils.resume_parser import (
    extract_text_from_pdf,
    extract_text_from_docx,
    extract_resume_data,
    parse_skills_from_text,
)


class ResumeService:
    """Service for resume-related operations."""
    
    @staticmethod
    def create_resume(
        db: Session,
        user_id: int,
        file_name: str,
        file_content: bytes
    ) -> Resume:
        """Create a resume record and extract data."""
        
        text = ""
        
        if file_name.endswith(".pdf"):
            text = extract_text_from_pdf(BytesIO(file_content))
        elif file_name.endswith((".docx", ".doc")):
            text = extract_text_from_docx(BytesIO(file_content))
        else:
            raise ValueError("Unsupported file format. Please upload PDF or DOCX.")
        
        parsed_data = extract_resume_data(text)
        skills = parse_skills_from_text(text)
        
        db_resume = Resume(
            user_id=user_id,
            file_name=file_name,
            parsed_data=parsed_data,
            skills=skills,
            experience=parsed_data.get("entities", []),
            projects=parsed_data.get("entities", []),
        )
        
        db.add(db_resume)
        db.commit()
        db.refresh(db_resume)
        
        return db_resume
    
    @staticmethod
    def get_resume_by_id(db: Session, resume_id: int) -> Resume:
        """Get resume by ID."""
        return db.query(Resume).filter(Resume.id == resume_id).first()
    
    @staticmethod
    def get_user_resumes(db: Session, user_id: int) -> list:
        """Get all resumes for a user."""
        return db.query(Resume).filter(Resume.user_id == user_id).all()
    
    @staticmethod
    def delete_resume(db: Session, resume_id: int) -> bool:
        """Delete a resume."""
        resume = ResumeService.get_resume_by_id(db, resume_id)
        if not resume:
            return False
        
        db.delete(resume)
        db.commit()
        return True
