# Frontend README

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API

Create `.env` file:
```
VITE_API_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

App: http://localhost:5173

### 4. Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── pages/                # React pages (routes)
│   │   ├── Home.jsx          # Landing page
│   │   ├── Login.jsx         # Login page
│   │   ├── Register.jsx      # Registration page
│   │   ├── ResumeUpload.jsx  # Resume upload
│   │   ├── RoleSelection.jsx # Job role selection
│   │   ├── Interview.jsx     # Interview chat
│   │   ├── Results.jsx       # Results display
│   │   └── Dashboard.jsx     # User dashboard
│   ├── services/
│   │   └── api.js            # Axios API client
│   ├── styles/
│   │   └── global.css        # Global styles
│   ├── main.jsx              # React entry point
│   └── App.jsx               # Main app component
├── public/
│   └── index.html            # HTML template
├── package.json              # npm dependencies
├── vite.config.js            # Vite config
├── tsconfig.json             # TypeScript config
└── README.md
```

## Pages Overview

### Home
- Landing page with features overview
- Links to login/register

### Login / Register
- User authentication
- Email and password validation
- Session management via localStorage

### Resume Upload
- Upload PDF/DOCX files
- Display uploaded resumes
- Delete resumes
- Extract skills automatically

### Role Selection
- Choose job role from predefined list
- Select skills (from resume or manually)
- Set number of questions
- Generate questions via API

### Interview
- Chat-style interview interface
- Display questions one at a time
- Real-time answer evaluation
- Progress bar
- Skip question option

### Results
- Show all scores
- Display feedback for each answer
- Show improvement suggestions
- Expandable answer details

### Dashboard
- Performance statistics
- Average score
- Interview history
- Weak areas identification
- Recent scores table
- Quick action buttons

## API Service (api.js)

Axios client with methods organized by feature:

```javascript
// Auth
authAPI.register(name, email, password)
authAPI.login(email, password)

// Resume
resumeAPI.upload(userId, file)
resumeAPI.getUserResumes(userId)
resumeAPI.getResume(resumeId)
resumeAPI.deleteResume(resumeId)

// Questions
questionAPI.generateQuestions(role, skills, numQuestions)
questionAPI.getQuestionsByRole(role)
questionAPI.getRandomQuestions(role, limit)
questionAPI.getQuestion(questionId)

// Answers
answerAPI.submitAnswer(userId, questionId, answerText)
answerAPI.evaluateAnswer(userId, questionId, answerText)
answerAPI.getUserAnswers(userId)
answerAPI.getAnswer(answerId)
answerAPI.getUserStats(userId)

// Dashboard
dashboardAPI.getDashboard(userId)
```

## Styling

Global CSS in `src/styles/global.css`:
- Reset and base styles
- Button variations (.btn-primary, .btn-secondary, etc.)
- Form elements
- Card layout
- Alert styles
- Score badge colors

### CSS Classes

- `.container` - Max-width 1200px container
- `.card` - White box with shadow and padding
- `.btn-primary` - Blue button
- `.btn-secondary` - Gray button
- `.btn-success` - Green button
- `.btn-danger` - Red button
- `.form-group` - Form field wrapper
- `.error` - Red alert
- `.success` - Green alert
- `.score-badge` - Score display (with .high, .medium, .low)

## State Management

Uses React hooks (useState, useEffect) and Context via localStorage:
- `userId` - Current user ID
- `userName` - Current user name

```javascript
const userId = localStorage.getItem('userId')
const userName = localStorage.getItem('userName')

localStorage.setItem('userId', id)
localStorage.setItem('userName', name)
```

## Routing

React Router v6 with these routes:
- `/` - Home
- `/login` - Login
- `/register` - Register
- `/resume-upload` - Upload resume
- `/role-selection` - Select role
- `/interview` - Interview chat
- `/results` - View results
- `/dashboard` - User dashboard

## Form Handling

All forms use controlled components with useState:

```javascript
const [formData, setFormData] = useState({})

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value })
}

const handleSubmit = async (e) => {
  e.preventDefault()
  // API call
}
```

## Error Handling

- Try-catch blocks in API calls
- User-friendly error messages
- Error state display
- Redirect on unauthorized (401)

## Loading States

- Loading spinners during API calls
- Disabled states on buttons
- Loading messages

## Responsive Design

Uses CSS Grid for responsive layouts:
```css
display: grid;
gridTemplateColumns: repeat(auto-fit, minmax(250px, 1fr));
gap: 20px;
```

## Development Tips

- Use React DevTools extension for debugging
- Check Network tab for API requests
- Verify `VITE_API_URL` environment variable
- Clear localStorage if session issues
- Check console for JavaScript errors

## Building

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

Build output in `dist/` folder.

## Deployment

1. Build: `npm run build`
2. Deploy `dist/` folder to static hosting
3. Set `VITE_API_URL` to production API URL

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir dist
```

## Dependencies

- **react**: UI library
- **react-dom**: React DOM rendering
- **react-router-dom**: Client-side routing
- **axios**: HTTP client
- **vite**: Build tool
- **@vitejs/plugin-react**: React plugin for Vite

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```
