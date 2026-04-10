# AI Interview Preparation System

A production-ready AI-powered interview preparation system with resume analysis, question generation, mock interviews, and performance evaluation.

## Features

### 1. Resume Analyzer
- Upload resumes (PDF/DOCX)
- Extract skills, experience, and projects
- Structured JSON output
- NLP-based parsing with spaCy

### 2. Question Generator
- Generate tailored questions based on job role
- Mix of technical and behavioral questions
- Keyword-based relevance
- Customizable question count

### 3. Mock Interview System
- Chat-based interview interface
- One question at a time
- Real-time evaluation
- Progress tracking

### 4. Answer Evaluation
- Automated scoring (0-100)
- Relevance and keyword matching
- Contextual feedback
- Improvement suggestions

### 5. Dashboard
- Performance summary
- Score history
- Weak areas identification
- Resume management

## Tech Stack

- **Frontend**: React 18.2, Vite, React Router
- **Backend**: FastAPI, Python 3.10+
- **Database**: PostgreSQL with SQLAlchemy ORM
- **NLP**: spaCy for resume parsing
- **Authentication**: bcrypt for password hashing

## Project Structure

```
AI Interview Preparation System/
├── backend/
│   ├── app/
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response models
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic layer
│   │   ├── utils/            # Utilities (parsing, evaluation, etc.)
│   │   ├── database.py       # Database configuration
│   │   └── main.py           # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   └── run.py               # Entry point
├── frontend/
│   ├── src/
│   │   ├── pages/           # React pages
│   │   ├── services/        # API services
│   │   ├── styles/          # CSS styles
│   │   └── main.jsx         # React entry point
│   ├── public/              # Static files
│   ├── package.json         # npm dependencies
│   └── vite.config.js       # Vite configuration
├── database/
│   ├── init.sql             # Database initialization script
│   └── setup.sh             # Setup automation script
└── README.md
```

## Prerequisites

- Python 3.10+
- Node.js 16+
- PostgreSQL 12+
- pip (Python package manager)
- npm (Node package manager)

## Installation & Setup

### 1. Database Setup

```bash
# Windows (PowerShell)
psql -U postgres -c "CREATE DATABASE ai_interview_db;"

# Or use the SQL script
psql -U postgres -d postgres -f database/init.sql
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env
```

## Running the Application

### 1. Start PostgreSQL

```bash
# Windows
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### 2. Start Backend

```bash
cd backend
python run.py
```

Backend will run on: `http://localhost:8000`

API Documentation (Swagger): `http://localhost:8000/docs`

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Resume
- `POST /resume/upload` - Upload and parse resume
- `GET /resume/user/{user_id}` - Get user's resumes
- `GET /resume/{resume_id}` - Get specific resume
- `DELETE /resume/{resume_id}` - Delete resume

### Questions
- `POST /questions/generate` - Generate questions
- `GET /questions/role/{role}` - Get questions by role
- `GET /questions/random` - Get random questions
- `GET /questions/{question_id}` - Get specific question

### Answers
- `POST /answers/submit` - Submit answer
- `POST /answers/evaluate` - Evaluate answer
- `GET /answers/user/{user_id}` - Get user's answers
- `GET /answers/{answer_id}` - Get specific answer
- `GET /answers/stats/{user_id}` - Get answer statistics

### Dashboard
- `GET /dashboard/{user_id}` - Get dashboard statistics

## Database Schema

### Users
```sql
id (PK) | name | email | password_hash | created_at | updated_at
```

### Resumes
```sql
id (PK) | user_id (FK) | file_name | parsed_data | skills | experience | projects | created_at | updated_at
```

### Questions
```sql
id (PK) | role | question_text | question_type | keywords | created_at | updated_at
```

### Answers
```sql
id (PK) | user_id (FK) | question_id (FK) | answer_text | score | feedback | improvement_suggestions | created_at | updated_at
```

## Configuration

### Environment Variables

Backend (.env or environment):
```
DATABASE_URL=postgresql://postgres:<your_postgres_password>@localhost:5432/ai_interview_db
```

Frontend (.env):
```
VITE_API_URL=http://localhost:8000
```

## Usage Workflow

1. **Register**: Create new account
2. **Upload Resume**: Upload PDF/DOCX resume
3. **Select Role**: Choose job role and skills
4. **Start Interview**: Answer AI-generated questions
5. **View Results**: See scores and feedback
6. **Track Progress**: Monitor performance on dashboard

## Scoring Algorithm

Answers are evaluated on:
- **Relevance** (40%): Keyword matching from question
- **Length** (30%): Adequate answer depth (10-200 words)
- **Similarity** (30%): Semantic word overlap

Final Score: 0-100

## Performance Considerations

- Database indexes on frequently queried columns
- Connection pooling for database
- Async file upload handling
- CORS enabled for cross-origin requests
- Proper error handling and validation

## Security Features

- Password hashing with bcrypt
- SQL injection prevention via ORM
- Input validation with Pydantic
- CORS middleware configuration
- Email validation

## Future Enhancements

- User authentication tokens (JWT)
- Video recording of interviews
- Advanced NLP models
- Real-time collaborative features
- Interview templates library
- Email notifications
- Payment integration
- Multi-language support

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Verify DATABASE_URL environment variable
echo $DATABASE_URL
```

### spaCy Model Missing
```bash
python -m spacy download en_core_web_sm
```

### Port Already in Use
```bash
# Change port in backend
# In backend/run.py: uvicorn.run(app, host="0.0.0.0", port=8001)

# Change port in frontend
# In frontend/vite.config.js: port: 5174
```

### CORS Errors
Ensure `VITE_API_URL` points to correct backend URL and CORS is enabled in FastAPI.

## Development Tips

- Use FastAPI automatic documentation at `/docs`
- React DevTools browser extension for debugging
- PostgreSQL pgAdmin for database management
- Postman for API testing

## License

MIT License - Feel free to use for personal and commercial projects

## Support

For issues, questions, or contributions:
1. Check existing documentation
2. Review API documentation at `/docs`
3. Check browser console for client-side errors
4. Check server logs for backend errors
