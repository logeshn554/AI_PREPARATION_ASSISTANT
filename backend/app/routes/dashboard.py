from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas import DashboardResponse
from app.services import DashboardService
from app.database import get_db

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/{user_id}", response_model=DashboardResponse)
def get_dashboard(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for a user."""
    try:
        stats = DashboardService.get_dashboard_stats(db, user_id)
        
        return {
            "user_id": user_id,
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard: {str(e)}"
        )
