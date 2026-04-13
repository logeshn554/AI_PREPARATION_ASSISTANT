from pydantic import BaseModel


class MockTestCreateRequest(BaseModel):
    company_name: str
    role: str
    skills: list[str] = []
    num_questions: int = 12
    duration_minutes: int = 45


class MockQuestion(BaseModel):
    question_id: str
    question_text: str
    question_type: str
    options: list[str] = []


class MockTestCreateResponse(BaseModel):
    test_id: int
    company_name: str
    role: str
    duration_minutes: int
    total_questions: int
    questions: list[MockQuestion]


class MockAnswerItem(BaseModel):
    question_id: str
    answer: str
    time_spent_seconds: int = 0


class MockTestSubmitRequest(BaseModel):
    answers: list[MockAnswerItem]
    total_time_seconds: int = 0


class MockTestSubmitResponse(BaseModel):
    test_id: int
    score: float
    accuracy: float
    correct_answers: int
    total_questions: int
    weak_areas: list[str]
    feedback: list[dict]
