# Backend README

## Quick Start

### 1. Setup Python Environment

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 3. Configure Database

```bash
# Set environment variable
set DATABASE_URL=postgresql://postgres:<your_postgres_password>@localhost:5432/ai_interview_db

# Or Windows PowerShell
$env:DATABASE_URL="postgresql://postgres:<your_postgres_password>@localhost:5432/ai_interview_db"

# Run migrations
alembic upgrade head
```

### 4. Run Server

```bash
python run.py
```

Server: http://localhost:8000
Docs: http://localhost:8000/docs

## Project Structure

```
backend/
├── app/
│   ├── models/              # Database models
│   │   ├── __init__.py
│   │   ├── base.py          # Base model class
│   │   ├── user.py
│   │   ├── resume.py
│   │   ├── question.py
│   │   └── answer.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── resume.py
│   │   ├── question.py
│   │   ├── answer.py
│   │   └── dashboard.py
│   ├── routes/              # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── resume.py
│   │   ├── questions.py
│   │   ├── answer.py
│   │   └── dashboard.py
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   ├── resume_service.py
│   │   ├── question_service.py
│   │   ├── answer_service.py
│   │   └── dashboard_service.py
│   ├── utils/               # Utilities
│   │   ├── __init__.py
│   │   ├── auth.py          # Password hashing
│   │   ├── resume_parser.py # PDF/DOCX parsing
│   │   ├── question_generator.py # Question generation
│   │   └── evaluator.py     # Answer evaluation
│   ├── database.py          # Database configuration
│   ├── main.py              # FastAPI app
│   └── __init__.py
├── requirements.txt
├── run.py                   # Entry point
└── README.md
```

## API Endpoints Reference

### Auth Routes
- `POST /auth/register` - Register user and return JWT
- `POST /auth/login` - Login user and return JWT
- `POST /auth/google` - Google ID token login
- `GET /auth/me` - Get current user profile (Bearer token)

### Resume Routes
- `POST /resume/upload?user_id={id}` - Upload resume
- `GET /resume/user/{user_id}` - Get user resumes
- `GET /resume/{resume_id}` - Get resume
- `DELETE /resume/{resume_id}` - Delete resume

### Question Routes
- `POST /questions/generate` - Generate questions
- `GET /questions/role/{role}` - Get questions by role
- `GET /questions/random?role={role}&limit={n}` - Get random questions
- `GET /questions/{question_id}` - Get question

### Answer Routes
- `POST /answers/submit?user_id={id}` - Submit answer
- `POST /answers/evaluate?user_id={id}` - Evaluate answer
- `GET /answers/user/{user_id}` - Get user answers
- `GET /answers/{answer_id}` - Get answer
- `GET /answers/stats/{user_id}` - Get stats

### Dashboard Routes
- `GET /dashboard/{user_id}` - Get dashboard

### Quiz Routes
- `POST /quiz/generate?user_id={id}` - Generate adaptive quiz
- `POST /quiz/{session_id}/submit` - Submit quiz answers
- `GET /quiz/{session_id}` - Get quiz session details

### Company Prep Routes
- `POST /company/prepare` - Scrape/cache company interview prep data
- `GET /company/{company_name}` - Get cached company prep data

### Mock Test Routes
- `POST /mock-tests/create?user_id={id}` - Create timed mock test
- `POST /mock-tests/{test_id}/submit` - Submit mock test answers
- `GET /mock-tests/{test_id}` - Get mock test details

### Analytics Routes
- `GET /analytics/{user_id}` - Get overall analytics

### AI Interviewer Routes
- `POST /ai-interviewer/chat` - Simulated interviewer interaction

### Daily Challenges and Leaderboard
- `GET /challenges/today` - Get today's challenge
- `POST /challenges/submit?user_id={id}` - Submit challenge response
- `GET /leaderboard?limit={n}` - Get ranked leaderboard

## Development

### Adding New Route

1. Create route file in `app/routes/`
2. Define router with FastAPI
3. Import in `app/routes/__init__.py`
4. Add to `app/main.py`

Example:
```python
# app/routes/new_route.py
from fastapi import APIRouter

router = APIRouter(prefix="/new", tags=["new"])

@router.get("/")
def get_new():
    return {"message": "new route"}
```

### Adding New Service

1. Create Python file in `app/services/`
2. Define service class with static methods
3. Import in `app/services/__init__.py`

### Database Migrations

Schema is managed with Alembic migrations.

```bash
# Apply latest migration
alembic upgrade head

# Create a new migration after model changes
alembic revision --autogenerate -m "describe change"

# Rollback last migration
alembic downgrade -1
```

## Environment Variables

```
DATABASE_URL=postgresql://<db_user>:<db_password>@<db_host>:<db_port>/<db_name>
```

## Error Handling

All routes return:
- 200/201: Success
- 400: Bad request
- 404: Not found
- 500: Server error

## Testing

```bash
# With curl
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass"}'

# Or use http://localhost:8000/docs for interactive testing
```
