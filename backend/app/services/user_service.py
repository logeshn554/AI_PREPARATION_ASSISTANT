from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models import User
from app.schemas import UserCreate
from app.utils.auth import hash_password, verify_password


class UserService:
    """Service for user-related operations."""
    
    @staticmethod
    def create_user(db: Session, user_create: UserCreate) -> User:
        """Create a new user."""
        try:
            hashed_password = hash_password(user_create.password)
            db_user = User(
                name=user_create.name,
                email=user_create.email,
                password_hash=hashed_password
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            return db_user
        except IntegrityError:
            db.rollback()
            raise ValueError("Email already exists")
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User:
        """Get user by email."""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def verify_user_credentials(db: Session, email: str, password: str) -> User:
        """Verify user email and password."""
        user = UserService.get_user_by_email(db, email)
        if not user:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        return user
