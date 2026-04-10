from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.schemas import ResumeResponse
from app.services import ResumeService
from app.database import get_db

router = APIRouter(prefix="/resume", tags=["resume"])


@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and parse a resume."""
    
    if not file.filename.endswith((".pdf", ".docx", ".doc")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX files are supported"
        )
    
    try:
        file_content = await file.read()
        resume = ResumeService.create_resume(
            db,
            user_id,
            file.filename,
            file_content
        )
        return resume
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing resume: {str(e)}"
        )


@router.get("/user/{user_id}")
def get_user_resumes(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all resumes for a user."""
    resumes = ResumeService.get_user_resumes(db, user_id)
    
    if not resumes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resumes found"
        )
    
    return {"resumes": resumes}


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific resume."""
    resume = ResumeService.get_resume_by_id(db, resume_id)
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    return resume


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db)
):
    """Delete a resume."""
    success = ResumeService.delete_resume(db, resume_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    return None
