from sqlalchemy.orm import Session
from app.models import QuizSession
from app.schemas.quiz import QuizGenerateRequest, QuizSubmitRequest
from app.utils.quiz_generator import generate_quiz_questions
from app.utils.evaluator import evaluate_answer


class QuizService:
    """Business logic for adaptive quizzes."""

    @staticmethod
    def create_quiz_session(db: Session, user_id: int, request: QuizGenerateRequest) -> QuizSession:
        generated = generate_quiz_questions(
            role=request.role,
            skills=request.skills,
            num_questions=request.num_questions,
        )

        session = QuizSession(
            user_id=user_id,
            role=request.role,
            skills=request.skills,
            questions=generated,
            total_questions=len(generated),
            status="pending",
        )

        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def submit_quiz_session(db: Session, session_id: int, payload: QuizSubmitRequest) -> QuizSession:
        session = db.query(QuizSession).filter(QuizSession.id == session_id).first()
        if not session:
            raise ValueError("Quiz session not found")

        question_map = {q["question_id"]: q for q in (session.questions or [])}
        feedback_rows = []
        correct_answers = 0
        weak_areas: dict[str, int] = {}

        for answer in payload.answers:
            question = question_map.get(answer.question_id)
            if not question:
                continue

            qtype = question.get("question_type", "technical_mcq")
            expected = str(question.get("correct_answer", "")).strip().lower()
            user_answer = (answer.answer or "").strip()

            if qtype in {"technical_mcq", "aptitude"}:
                is_correct = user_answer.lower() == expected
                score = 100.0 if is_correct else 0.0
                if is_correct:
                    correct_answers += 1
                else:
                    weak_areas[qtype] = weak_areas.get(qtype, 0) + 1
                feedback = "Correct answer." if is_correct else f"Expected: {question.get('correct_answer')}"
            else:
                evaluation = evaluate_answer(
                    answer=user_answer,
                    keywords=",".join(question.get("keywords", [])),
                    question_type="technical" if qtype == "coding" else "behavioral",
                )
                score = float(evaluation["score"])
                is_correct = score >= 60
                if is_correct:
                    correct_answers += 1
                else:
                    weak_areas[qtype] = weak_areas.get(qtype, 0) + 1
                feedback = evaluation["feedback"]

            feedback_rows.append(
                {
                    "question_id": answer.question_id,
                    "question_type": qtype,
                    "is_correct": is_correct,
                    "score": round(score, 2),
                    "feedback": feedback,
                    "time_spent_seconds": answer.time_spent_seconds,
                }
            )

        total_questions = max(1, session.total_questions)
        accuracy = (correct_answers / total_questions) * 100

        session.correct_answers = correct_answers
        session.score = round(accuracy, 2)
        session.accuracy = round(accuracy, 2)
        session.time_spent_seconds = payload.total_time_seconds
        session.weak_areas = sorted(weak_areas, key=weak_areas.get, reverse=True)
        session.results = feedback_rows
        session.status = "completed"

        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def get_quiz_session(db: Session, session_id: int) -> QuizSession:
        return db.query(QuizSession).filter(QuizSession.id == session_id).first()
