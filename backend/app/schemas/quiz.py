from pydantic import BaseModel


class QuizGenerateRequest(BaseModel):
    role: str
    skills: list[str] = []
    num_questions: int = 10


class QuizQuestion(BaseModel):
    question_id: str
    question_text: str
    question_type: str
    options: list[str] = []


class QuizGenerateResponse(BaseModel):
    session_id: int
    role: str
    total_questions: int
    questions: list[QuizQuestion]


class QuizAnswerItem(BaseModel):
    question_id: str
    answer: str
    time_spent_seconds: int = 0


class QuizSubmitRequest(BaseModel):
    answers: list[QuizAnswerItem]
    total_time_seconds: int = 0


class QuizSubmitResponse(BaseModel):
    session_id: int
    score: float
    accuracy: float
    correct_answers: int
    total_questions: int
    weak_areas: list[str]
    feedback: list[dict]
