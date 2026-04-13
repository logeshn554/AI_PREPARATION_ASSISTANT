from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.company import CompanyPrepRequest, CompanyPrepResponse
from app.services.company_service import CompanyService

router = APIRouter(prefix="/company", tags=["company"])


@router.post("/prepare", response_model=CompanyPrepResponse, status_code=status.HTTP_200_OK)
def prepare_company_content(request: CompanyPrepRequest, db: Session = Depends(get_db)):
    try:
        insight = CompanyService.get_or_create_company_insight(
            db,
            company_name=request.company_name,
            role=request.role,
            refresh=request.refresh,
        )
        return {
            "company_name": insight.company_name,
            "role": insight.role,
            "interview_questions": insight.interview_questions or [],
            "hiring_process": insight.hiring_process.splitlines() if insight.hiring_process else [],
            "preparation_tips": insight.preparation_tips.splitlines() if insight.preparation_tips else [],
            "source_urls": insight.source_urls or [],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to prepare company data: {str(e)}",
        )


@router.get("/{company_name}", response_model=CompanyPrepResponse)
def get_company_content(company_name: str, db: Session = Depends(get_db)):
    insight = CompanyService.get_company_insight(db, company_name)
    if not insight:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company insight not found")

    return {
        "company_name": insight.company_name,
        "role": insight.role,
        "interview_questions": insight.interview_questions or [],
        "hiring_process": insight.hiring_process.splitlines() if insight.hiring_process else [],
        "preparation_tips": insight.preparation_tips.splitlines() if insight.preparation_tips else [],
        "source_urls": insight.source_urls or [],
    }
