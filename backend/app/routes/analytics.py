from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.analytics import AnalyticsResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/{user_id}", response_model=AnalyticsResponse)
def get_analytics(user_id: int, db: Session = Depends(get_db)):
    return AnalyticsService.get_user_analytics(db, user_id)
