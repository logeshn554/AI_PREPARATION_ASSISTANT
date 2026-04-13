from sqlalchemy.orm import Session

from app.models import MockTest
from app.schemas.mock_test import MockTestCreateRequest, MockTestSubmitRequest
from app.utils.quiz_generator import generate_quiz_questions
from app.utils.evaluator import evaluate_answer


class MockTestService:
    """Timed mock tests tailored to role/company and skills."""

    @staticmethod
    def create_mock_test(db: Session, user_id: int, request: MockTestCreateRequest) -> MockTest:
        questions = generate_quiz_questions(
            role=f"{request.company_name} {request.role}",
            skills=request.skills,
            num_questions=request.num_questions,
        )

        mock = MockTest(
            user_id=user_id,
            company_name=request.company_name,
            role=request.role,
            duration_minutes=request.duration_minutes,
            questions=questions,
            total_questions=len(questions),
            status="pending",
        )
        db.add(mock)
        db.commit()
        db.refresh(mock)
        return mock

    @staticmethod
    def submit_mock_test(db: Session, test_id: int, payload: MockTestSubmitRequest) -> MockTest:
        mock = db.query(MockTest).filter(MockTest.id == test_id).first()
        if not mock:
            raise ValueError("Mock test not found")

        question_map = {q["question_id"]: q for q in (mock.questions or [])}
        feedback_rows = []
        correct_answers = 0
        weak_areas: dict[str, int] = {}

        for row in payload.answers:
            q = question_map.get(row.question_id)
            if not q:
                continue

            qtype = q.get("question_type", "technical_mcq")
            expected = str(q.get("correct_answer", "")).strip().lower()
            user_answer = (row.answer or "").strip()

            if qtype in {"technical_mcq", "aptitude"}:
                is_correct = user_answer.lower() == expected
                score = 100.0 if is_correct else 0.0
                feedback = "Correct." if is_correct else f"Expected: {q.get('correct_answer')}"
            else:
                evaluation = evaluate_answer(
                    answer=user_answer,
                    keywords=",".join(q.get("keywords", [])),
                    question_type="technical" if qtype == "coding" else "behavioral",
                )
                score = float(evaluation["score"])
                is_correct = score >= 60
                feedback = evaluation["feedback"]

            if is_correct:
                correct_answers += 1
            else:
                weak_areas[qtype] = weak_areas.get(qtype, 0) + 1

            feedback_rows.append(
                {
                    "question_id": row.question_id,
                    "question_type": qtype,
                    "is_correct": is_correct,
                    "score": round(score, 2),
                    "feedback": feedback,
                    "time_spent_seconds": row.time_spent_seconds,
                }
            )

        total_questions = max(1, mock.total_questions)
        accuracy = (correct_answers / total_questions) * 100

        mock.correct_answers = correct_answers
        mock.score = round(accuracy, 2)
        mock.accuracy = round(accuracy, 2)
        mock.time_spent_seconds = payload.total_time_seconds
        mock.weak_areas = sorted(weak_areas, key=weak_areas.get, reverse=True)
        mock.results = feedback_rows
        mock.status = "completed"

        db.commit()
        db.refresh(mock)
        return mock

    @staticmethod
    def get_mock_test(db: Session, test_id: int) -> MockTest | None:
        return db.query(MockTest).filter(MockTest.id == test_id).first()
