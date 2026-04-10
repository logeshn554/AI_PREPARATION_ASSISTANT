# Installation & Deployment Guide

## System Requirements

- **OS**: Windows, macOS, or Linux
- **Python**: 3.10 or higher
- **Node.js**: 16 or higher
- **PostgreSQL**: 12 or higher
- **RAM**: Minimum 4GB
- **Disk**: Minimum 2GB for dependencies

## Step 1: Install Package Managers

### Windows

**Python**:
1. Download from https://www.python.org/downloads/
2. Run installer
3. Check "Add Python to PATH"
4. Verify: `python --version`

**Node.js**:
1. Download from https://nodejs.org/ (LTS recommended)
2. Run installer
3. Verify: `node --version` and `npm --version`

**PostgreSQL**:
1. Download from https://www.postgresql.org/download/windows/
2. Run installer
3. Set password for postgres user
4. Keep port as 5432 (default)
5. Verify: `psql --version`

### macOS

```bash
# Using Homebrew
brew install python3
brew install node
brew install postgresql

# Verify
python3 --version
node --version
npm --version
psql --version
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
sudo apt install nodejs npm
sudo apt install postgresql postgresql-contrib

# Verify
python3 --version
node --version
npm --version
psql --version
```

## Step 2: Clone/Extract Project

```bash
# Navigate to project
cd "AI Interview Preparation System"
```

## Step 3: Database Setup

### Windows PowerShell

```powershell
# Start PostgreSQL
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start

# Create database
psql -U postgres -c "CREATE DATABASE ai_interview_db;"

# Run initialization script
psql -U postgres -d ai_interview_db -f database/init.sql
```

### macOS

```bash
# Start PostgreSQL
brew services start postgresql

# Create database
createdb ai_interview_db

# Run initialization script
psql -U $(whoami) -d ai_interview_db -f database/init.sql
```

### Linux

```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb ai_interview_db

# Run initialization script
sudo -u postgres psql -d ai_interview_db -f database/init.sql
```

## Step 4: Backend Setup

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

# Set database URL (Windows PowerShell)
$env:DATABASE_URL="postgresql://postgres:<your_postgres_password>@localhost:5432/ai_interview_db"

# Or Windows CMD
set DATABASE_URL=postgresql://postgres:<your_postgres_password>@localhost:5432/ai_interview_db

# Or macOS/Linux
export DATABASE_URL="postgresql://postgres:<your_postgres_password>@localhost:5432/ai_interview_db"

# Test run
python run.py

# Visit http://localhost:8000/docs to verify
```

## Step 5: Frontend Setup

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

# Run development server
npm run dev

# Open http://localhost:5173 in browser
```

## Running the Complete System

### Terminal 1: PostgreSQL
```bash
# Windows (run once)
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Terminal 2: Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python run.py
```

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
```

Application ready at: http://localhost:5173

## Production Deployment

### Backend (Using Gunicorn)

```bash
cd backend

# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app.main:app
```

### Frontend (Build & Deploy)

```bash
cd frontend

# Build
npm run build

# Deploy 'dist' folder to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - GitHub Pages
# - Any static host
```

### Using Docker (Optional)

**Backend Dockerfile**:
```dockerfile
FROM python:3.10

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN python -m spacy download en_core_web_sm
COPY . .

EXPOSE 8000
CMD ["python", "run.py"]
```

**Frontend Dockerfile**:
```dockerfile
FROM node:18 as builder
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Environment Configuration

### Backend (.env or System Variables)

```
DATABASE_URL=postgresql://<db_user>:<db_password>@<db_host>:5432/ai_interview_db
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:8000
```

## Troubleshooting

### PostgreSQL Won't Start
```bash
# Windows - Find data directory
where postgres

# Check if port 5432 is in use
netstat -ano | findstr :5432

# Try different port in DATABASE_URL
postgresql://postgres:<your_postgres_password>@localhost:5433/ai_interview_db
```

### Python Venv Issues
```bash
# Recreate venv
rm -rf venv  # or rmdir venv /s on Windows
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Port Conflicts
```bash
# Kill process using port 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

### Module Not Found Errors
```bash
# Verify venv is activated
which python  # Should show venv path

# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### CORS Errors
Ensure backend is running on `http://localhost:8000` and frontend `VITE_API_URL` is set correctly.

## Maintenance

### Regular Updates
```bash
# Backend
pip list --outdated
pip install --upgrade <package>

# Frontend
npm outdated
npm update
```

### Database Backup
```bash
# Backup
pg_dump -U postgres ai_interview_db > backup.sql

# Restore
psql -U postgres ai_interview_db < backup.sql
```

### Logs

**Backend**: Check console output
**Frontend**: Check browser console (F12)
**Database**: 
```bash
psql -U postgres -d ai_interview_db -c "SELECT * FROM users;"
```

## Performance Optimization

1. **Database**: Use indexes (already configured)
2. **Frontend**: Run `npm run build` for production
3. **Backend**: Use Gunicorn with multiple workers
4. **Caching**: Implement Redis for session management
5. **CDN**: Serve frontend from CDN

## Security Checklist

- [ ] Change default PostgreSQL password
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS in production
- [ ] Set strong JWT secret (if added)
- [ ] Configure CORS properly
- [ ] Rate limiting on API endpoints
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (ORM used)

## Support Resources

- Python: https://docs.python.org/3/
- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- PostgreSQL: https://www.postgresql.org/docs/
- Vite: https://vitejs.dev/
