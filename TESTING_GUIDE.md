# Testing & Examples

Complete testing guide and API usage examples for the AI Interview Preparation System.

## Unit Test Examples

### Backend Testing

Create `backend/test_api.py`:

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User
from app.utils.auth import hash_password

client = TestClient(app)

@pytest.fixture
def test_user():
    """Create test user"""
    db = SessionLocal()
    user = User(
        name="Test User",
        email="test@example.com",
        password_hash=hash_password("testpassword")
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    yield user
    db.delete(user)
    db.commit()
    db.close()

def test_register():
    """Test user registration"""
    response = client.post(
        "/auth/register",
        json={
            "name": "New User",
            "email": "newuser@example.com",
            "password": "securepass"
        }
    )
    assert response.status_code == 201
    assert response.json()["name"] == "New User"

def test_login(test_user):
    """Test user login"""
    response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpassword"
        }
    )
    assert response.status_code == 200
    assert response.json()["user_id"] == test_user.id

def test_login_invalid_credentials():
    """Test login with wrong password"""
    response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401

def test_health():
    """Test health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

Run tests:
```bash
pip install pytest pytest-asyncio
pytest backend/test_api.py -v
```

## API Usage Examples

### 1. Complete User Workflow

```bash
# 1. Register new user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Developer",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Expected Response:
{
  "id": 1,
  "name": "John Developer",
  "email": "john@example.com",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}

# 2. Login with credentials
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Expected Response:
{
  "user_id": 1,
  "name": "John Developer",
  "email": "john@example.com",
  "message": "Login successful"
}

# 3. Upload resume (user_id=1)
curl -X POST http://localhost:8000/resume/upload?user_id=1 \
  -F "file=@resume.pdf"

# Expected Response:
{
  "id": 1,
  "user_id": 1,
  "file_name": "resume.pdf",
  "skills": ["python", "javascript", "react", "fastapi"],
  "experience": [...],
  "projects": [...],
  "created_at": "2024-01-15T10:30:00"
}

# 4. Generate interview questions
curl -X POST http://localhost:8000/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Senior Python Developer",
    "skills": ["python", "fastapi", "postgresql"],
    "num_questions": 5
  }'

# Expected Response:
{
  "role": "Senior Python Developer",
  "total_questions": 5,
  "questions": [
    {
      "id": 1,
      "role": "Senior Python Developer",
      "question_text": "Explain how you would implement a REST API using FastAPI...",
      "question_type": "technical",
      "keywords": "fastapi"
    },
    {
      "id": 2,
      "role": "Senior Python Developer",
      "question_text": "Tell me about a time you had to learn FastAPI quickly...",
      "question_type": "behavioral",
      "keywords": "fastapi"
    },
    ...
  ]
}

# 5. Evaluate an answer
curl -X POST "http://localhost:8000/answers/evaluate?user_id=1" \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": 1,
    "answer_text": "I would create FastAPI application with endpoints using decorators. First, I would create the main FastAPI app instance, then define route handlers with appropriate HTTP methods like @app.get, @app.post, etc. I would use Pydantic models for request/response validation. For database operations, I would use SQLAlchemy ORM with PostgreSQL. I would implement proper error handling with custom exceptions, add middleware for logging, and use dependency injection for reusable logic."
  }'

# Expected Response:
{
  "score": 87.5,
  "feedback": "Excellent answer! You demonstrated strong understanding with relevant details and examples.",
  "improvement_suggestions": "Great job! Continue to practice and refine your answers for even better responses."
}

# 6. Get dashboard
curl -X GET http://localhost:8000/dashboard/1

# Expected Response:
{
  "user_id": 1,
  "stats": {
    "total_resumes": 1,
    "total_interviews": 5,
    "average_score": 82.3,
    "weak_areas": [
      "Senior Python Developer - Behavioral"
    ],
    "recent_scores": [
      {
        "question_id": 5,
        "score": 78.5,
        "created_at": "2024-01-15T11:00:00"
      },
      ...
    ]
  }
}
```

### 2. Resume Upload Examples

```python
# Python client example
import requests

API_URL = "http://localhost:8000"

# Upload resume
with open("resume.pdf", "rb") as file:
    files = {"file": file}
    response = requests.post(
        f"{API_URL}/resume/upload?user_id=1",
        files=files
    )
    print(response.json())

# Upload DOCX
with open("resume.docx", "rb") as file:
    files = {"file": file}
    response = requests.post(
        f"{API_URL}/resume/upload?user_id=1",
        files=files
    )
    print(response.json())
```

### 3. Question Generation Examples

```python
# Generate technical questions
response = requests.post(
    f"{API_URL}/questions/generate",
    json={
        "role": "Senior Python Developer",
        "skills": ["python", "fastapi", "postgresql"],
        "num_questions": 10
    }
)

# Generate for different role
response = requests.post(
    f"{API_URL}/questions/generate",
    json={
        "role": "Full Stack Developer",
        "skills": ["javascript", "react", "node.js", "mongodb"],
        "num_questions": 15
    }
)

# Get existing questions
questions = requests.get(
    f"{API_URL}/questions/random?role=Senior%20Python%20Developer&limit=5"
)
```

### 4. Answer Evaluation Examples

```python
import json

# Example 1: Good technical answer
answer_text = """
I would implement the REST API following these principles:

1. **Architecture**:
   - Use FastAPI for async request handling
   - SQLAlchemy ORM for database abstraction
   - Pydantic models for data validation

2. **Implementation**:
   - Define routes with decorators (@app.get, @app.post)
   - Create request/response models
   - Implement middleware for logging and error handling
   - Add dependency injection for database sessions

3. **Best Practices**:
   - Use status codes correctly (200, 201, 400, 404, 500)
   - Implement proper error handling
   - Add API documentation with docstrings
   - Use async/await for I/O operations
   - Implement database transactions

4. **Example**:
```python
from fastapi import FastAPI
from sqlalchemy.orm import Session

app = FastAPI()

@app.post("/items/")
async def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    db_item = Item(**item.dict())
    db.add(db_item)
    db.commit()
    return db_item
```
"""

response = requests.post(
    f"{API_URL}/answers/evaluate?user_id=1",
    json={
        "question_id": 1,
        "answer_text": answer_text
    }
)
result = response.json()
print(f"Score: {result['score']}%")
print(f"Feedback: {result['feedback']}")

# Example 2: Average answer
short_answer = """
I would use FastAPI because it's fast and has automatic documentation. 
I would create endpoints for CRUD operations and use SQLAlchemy for database.
"""

response = requests.post(
    f"{API_URL}/answers/evaluate?user_id=1",
    json={
        "question_id": 2,
        "answer_text": short_answer
    }
)

# Example 3: Poor answer
poor_answer = """
I would make an API.
"""

response = requests.post(
    f"{API_URL}/answers/evaluate?user_id=1",
    json={
        "question_id": 3,
        "answer_text": poor_answer
    }
)
```

## Frontend Testing

### React Component Test Example

```javascript
// frontend/src/pages/__tests__/Login.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '../Login'

jest.mock('../../services/api')

describe('Login Page', () => {
  test('renders login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  test('submits form with valid data', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
    
    await waitFor(() => {
      expect(screen.queryByText('Logging in...')).not.toBeInTheDocument()
    })
  })

  test('shows error on invalid credentials', async () => {
    const mockError = new Error('Invalid credentials')
    authAPI.login.mockRejectedValueOnce(mockError)
    
    // ... test error handling
  })
})
```

## Performance Testing

### Load Testing with Apache Bench

```bash
# Simple request
ab -n 1000 -c 10 http://localhost:8000/health

# With authentication (POST)
ab -n 100 -c 5 -p data.json http://localhost:8000/auth/login
```

### API Response Times

```bash
# Measure endpoint response time
time curl http://localhost:8000/questions/random?role=Senior%20Python%20Developer&limit=10

# Batch test multiple endpoints
for i in {1..10}; do
  curl -o /dev/null -s -w "%{time_total}\n" http://localhost:8000/health
done
```

## Data Seeding

Create sample data for testing:

```bash
# Create seed script: backend/seed_data.py
python backend/seed_data.py
```

```python
# backend/seed_data.py
from app.database import SessionLocal
from app.models import Question, User
from app.utils.auth import hash_password

db = SessionLocal()

# Create test user
user = User(
    name="Test User",
    email="test@example.com",
    password_hash=hash_password("password123")
)
db.add(user)

# Create test questions
questions_data = [
    {
        "role": "Senior Python Developer",
        "question_text": "Explain the difference between list and tuple",
        "question_type": "technical",
        "keywords": "python"
    },
    # ... more questions
]

for q_data in questions_data:
    q = Question(**q_data)
    db.add(q)

db.commit()
print("Seed data created successfully!")
```

## API Monitoring

### Health Check Script

```bash
#!/bin/bash
# monitor.sh

echo "Checking API Health..."

while true; do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  
  if [ $RESPONSE -eq 200 ]; then
    echo "[$TIMESTAMP] ✓ API is healthy"
  else
    echo "[$TIMESTAMP] ✗ API returned $RESPONSE"
    # Send alert here
  fi
  
  sleep 30
done
```

## Test Coverage

```bash
# Install coverage
pip install pytest-cov

# Run tests with coverage report
pytest backend/ --cov=app --cov-report=html

# View coverage
open htmlcov/index.html
```

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: 3.10
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          python -m spacy download en_core_web_sm
      
      - name: Run tests
        run: pytest backend/
        env:
          DATABASE_URL: postgresql://postgres:<test_db_password>@localhost/test_db
```

## Stress Testing

```python
# concurrent_requests.py
import concurrent.futures
import requests
import time

API_URL = "http://localhost:8000"

def make_request(endpoint):
    try:
        response = requests.get(f"{API_URL}{endpoint}")
        return response.status_code, time.time()
    except Exception as e:
        return None, str(e)

# Test with 100 concurrent requests
endpoints = ["/health"] * 100

start = time.time()
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    results = list(executor.map(make_request, endpoints))
end = time.time()

print(f"Completed {len(results)} requests in {end - start:.2f}s")
print(f"Success rate: {len([r for r in results if r[0] == 200]) / len(results) * 100:.1f}%")
```

## Debugging Tips

```python
# Add logging to FastAPI
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.post("/answers/evaluate")
async def evaluate(request, db: Session = Depends(get_db)):
    logger.debug(f"Evaluating answer: {request.answer_text[:50]}...")
    # ... rest of code
```

This comprehensive testing guide covers unit tests, API examples, frontend testing, performance testing, and monitoring strategies for the complete system.
