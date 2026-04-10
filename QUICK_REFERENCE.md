# AI Interview Preparation System - Quick Reference

## Project Overview

A production-ready AI Interview Preparation System with resume analysis, question generation, mock interviews, and performance evaluation.

## File Structure

```
AI Interview Preparation System/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utilities
│   │   ├── database.py
│   │   ├── main.py
│   │   └── __init__.py
│   ├── requirements.txt
│   ├── run.py
│   ├── .env.example
│   └── README.md
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── pages/             # React pages
│   │   ├── services/          # API client
│   │   ├── styles/            # CSS
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── README.md
│
├── database/                   # Database setup
│   ├── init.sql               # SQL initialization
│   └── setup.sh
│
├── START.bat                   # Windows startup
├── START.sh                    # Unix startup
├── README.md                   # Main documentation
├── INSTALLATION.md             # Installation guide
├── API_DOCUMENTATION.md        # API reference
└── .gitignore
```

## Quick Start

### Windows
```bat
START.bat
```

### macOS/Linux
```bash
chmod +x START.sh
./START.sh
```

## Access Points

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432

## Key Technologies

| Component | Technology |
|-----------|-----------|
| Frontend | React 18.2 + Vite |
| Backend | FastAPI + Uvicorn |
| Database | PostgreSQL + SQLAlchemy |
| NLP | spaCy |
| HTTP | Axios |
| Auth | bcrypt |

## Main Features

✅ Resume upload & parsing (PDF/DOCX)  
✅ AI-generated interview questions  
✅ Mock interview chat interface  
✅ Automated answer evaluation  
✅ Performance dashboard  
✅ Score tracking & analytics  
✅ Weak areas identification  

## API Endpoints Summary

**Auth**
- POST /auth/register
- POST /auth/login

**Resume**
- POST /resume/upload
- GET /resume/user/{id}
- DELETE /resume/{id}

**Questions**
- POST /questions/generate
- GET /questions/role/{role}
- GET /questions/random

**Answers**
- POST /answers/submit
- POST /answers/evaluate
- GET /answers/stats/{id}

**Dashboard**
- GET /dashboard/{id}

## Database Tables

| Table | Purpose |
|-------|---------|
| users | User accounts |
| resumes | Uploaded resumes |
| questions | Interview questions |
| answers | User answers |

## User Workflow

1. **Register** → Create account
2. **Upload Resume** → PDF/DOCX parsing
3. **Select Role** → Choose job position
4. **Interview** → Answer AI questions
5. **Results** → View scores & feedback
6. **Dashboard** → Track progress

## Environment Setup

### Backend .env
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_interview_db
```

### Frontend .env
```
VITE_API_URL=http://localhost:8000
```

## Common Commands

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python run.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev      # development
npm run build    # production
```

### Database
```bash
# PostgreSQL service
pg_ctl start                    # Windows
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux

# Create database
createdb ai_interview_db
psql -d ai_interview_db -f database/init.sql
```

## Troubleshooting Checklist

- [ ] PostgreSQL running on port 5432
- [ ] Django`DATABASE_URL` environment variable set
- [ ] Backend virtual environment activated
- [ ] spaCy model installed: `python -m spacy download en_core_web_sm`
- [ ] Frontend `.env` file created with `VITE_API_URL`
- [ ] Node modules installed: `npm install`
- [ ] Port 8000 (backend) and 5173 (frontend) available

## Performance Tips

- Build frontend: `npm run build` for production
- Use Gunicorn for backend: `pip install gunicorn`
- Enable database connection pooling
- Implement caching for questions
- Use CDN for static files

## Security Considerations

✓ Passwords hashed with bcrypt  
✓ SQL injection prevention (ORM)  
✓ Input validation (Pydantic)  
✓ CORS configured  
✓ Environment variables for secrets  

Enhance with:
- JWT authentication tokens
- Rate limiting
- HTTPS in production
- Database encryption

## Deployment Targets

**Frontend**
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

**Backend**
- AWS EC2
- Heroku
- Railway
- DigitalOcean

**Database**
- AWS RDS
- Google Cloud SQL
- Heroku Postgres
- Render

## Documentation Files

- **README.md** - Project overview
- **INSTALLATION.md** - Setup instructions
- **API_DOCUMENTATION.md** - Endpoint reference
- **backend/README.md** - Backend details
- **frontend/README.md** - Frontend details

## Support & Resources

- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **SQLAlchemy**: https://docs.sqlalchemy.org/
- **spaCy**: https://spacy.io/

## License

MIT License - Free for personal and commercial use

## Version

**Current**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready
