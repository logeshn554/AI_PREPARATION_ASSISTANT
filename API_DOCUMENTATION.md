# API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication

All endpoints that require authentication should include the `user_id` as a query parameter.

## Endpoints

### 1. Authentication

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}

Response:
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

#### Login User
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}

Response:
{
  "user_id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Login successful"
}
```

### 2. Resume Management

#### Upload Resume
```
POST /resume/upload?user_id=1
Content-Type: multipart/form-data

file: <binary file content>

Response:
{
  "id": 1,
  "user_id": 1,
  "file_name": "resume.pdf",
  "skills": ["python", "javascript", "react"],
  "experience": [...],
  "projects": [...],
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

#### Get User's Resumes
```
GET /resume/user/1

Response:
{
  "resumes": [
    {
      "id": 1,
      "user_id": 1,
      "file_name": "resume.pdf",
      "skills": ["python", "javascript"],
      ...
    }
  ]
}
```

#### Get Specific Resume
```
GET /resume/1

Response:
{
  "id": 1,
  "user_id": 1,
  "file_name": "resume.pdf",
  ...
}
```

#### Delete Resume
```
DELETE /resume/1

Response: 204 No Content
```

### 3. Question Generation & Management

#### Generate Questions
```
POST /questions/generate
Content-Type: application/json

{
  "role": "Senior Python Developer",
  "skills": ["python", "fastapi", "postgresql"],
  "num_questions": 10
}

Response:
{
  "role": "Senior Python Developer",
  "total_questions": 10,
  "questions": [
    {
      "id": 1,
      "role": "Senior Python Developer",
      "question_text": "Explain how you would implement...",
      "question_type": "technical",
      "keywords": "python",
      "created_at": "2024-01-15T10:30:00",
      "updated_at": "2024-01-15T10:30:00"
    },
    ...
  ]
}
```

#### Get Questions by Role
```
GET /questions/role/Senior%20Python%20Developer

Response:
{
  "role": "Senior Python Developer",
  "total": 30,
  "questions": [...]
}
```

#### Get Random Questions
```
GET /questions/random?role=Senior%20Python%20Developer&limit=10

Response:
{
  "role": "Senior Python Developer",
  "requested": 10,
  "returned": 10,
  "questions": [...]
}
```

#### Get Specific Question
```
GET /questions/1

Response:
{
  "id": 1,
  "role": "Senior Python Developer",
  "question_text": "...",
  "question_type": "technical",
  "keywords": "python",
  ...
}
```

### 4. Answer Submission & Evaluation

#### Submit Answer
```
POST /answers/submit?user_id=1
Content-Type: application/json

{
  "question_id": 1,
  "answer_text": "This is my answer..."
}

Response:
{
  "id": 1,
  "user_id": 1,
  "question_id": 1,
  "answer_text": "This is my answer...",
  "score": null,
  "feedback": null,
  "improvement_suggestions": null,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

#### Evaluate Answer
```
POST /answers/evaluate?user_id=1
Content-Type: application/json

{
  "question_id": 1,
  "answer_text": "This is my answer..."
}

Response:
{
  "score": 85.5,
  "feedback": "Excellent answer! You demonstrated strong understanding...",
  "improvement_suggestions": "Continue to practice with more complex scenarios."
}
```

#### Get User's Answers
```
GET /answers/user/1

Response:
{
  "user_id": 1,
  "total": 25,
  "answers": [...]
}
```

#### Get Specific Answer
```
GET /answers/1

Response:
{
  "id": 1,
  "user_id": 1,
  "question_id": 1,
  "answer_text": "...",
  "score": 85.5,
  "feedback": "...",
  "improvement_suggestions": "...",
  ...
}
```

#### Get User Statistics
```
GET /answers/stats/1

Response:
{
  "total_answers": 25,
  "average_score": 78.5,
  "highest_score": 95.0,
  "lowest_score": 42.0,
  "recent_scores": [
    {
      "question_id": 25,
      "score": 85.5
    },
    ...
  ]
}
```

### 5. Dashboard

#### Get Dashboard Statistics
```
GET /dashboard/1

Response:
{
  "user_id": 1,
  "stats": {
    "total_resumes": 2,
    "total_interviews": 25,
    "average_score": 78.5,
    "weak_areas": [
      "Senior Python Developer - Technical",
      "Full Stack Developer - Behavioral"
    ],
    "recent_scores": [
      {
        "question_id": 1,
        "score": 85.5,
        "created_at": "2024-01-15T10:30:00"
      },
      ...
    ]
  }
}
```

### 6. Health Check

#### API Health
```
GET /health

Response:
{
  "status": "healthy"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid input data"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid credentials"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Request Headers

```
Content-Type: application/json
Accept: application/json
```

For file uploads:
```
Content-Type: multipart/form-data
```

## Rate Limiting

Currently no rate limiting is implemented. Consider adding:
- 100 requests per minute per IP
- 10,000 requests per hour per user

## CORS

Frontend running on ports:
- http://localhost:3000
- http://localhost:5173
- http://127.0.0.1:3000
- http://127.0.0.1:5173

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass"}'

# Generate Questions
curl -X POST http://localhost:8000/questions/generate \
  -H "Content-Type: application/json" \
  -d '{"role":"Senior Python Developer","skills":["python"],"num_questions":5}'

# Evaluate Answer
curl -X POST "http://localhost:8000/answers/evaluate?user_id=1" \
  -H "Content-Type: application/json" \
  -d '{"question_id":1,"answer_text":"My answer here"}'
```

## Testing with Postman

1. Import endpoints from FastAPI docs: `http://localhost:8000/docs`
2. Set environment variables
3. Create requests with proper headers and body
4. Test workflow:
   - Register → Login → Upload Resume → Generate Questions → Submit Answers → View Dashboard
