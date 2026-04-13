from sqlalchemy.orm import Session

from app.models import Answer, QuizSession, MockTest


class AnalyticsService:
    """Aggregate progress analytics across interviews, quizzes, and mock tests."""

    @staticmethod
    def get_user_analytics(db: Session, user_id: int) -> dict:
        answers = db.query(Answer).filter(Answer.user_id == user_id).all()
        quiz_sessions = db.query(QuizSession).filter(QuizSession.user_id == user_id, QuizSession.status == "completed").all()
        mock_tests = db.query(MockTest).filter(MockTest.user_id == user_id, MockTest.status == "completed").all()

        progress_scores = []
        weak_area_counter: dict[str, int] = {}

        answer_scores = [a.score for a in answers if a.score is not None]
        for score in answer_scores:
            progress_scores.append({"source": "interview", "score": round(score, 2)})

        quiz_scores = []
        total_question_time = 0
        total_question_count = 0

        for quiz in quiz_sessions:
            if quiz.score is not None:
                quiz_scores.append(quiz.score)
                progress_scores.append({"source": "quiz", "score": round(quiz.score, 2)})
            total_question_time += quiz.time_spent_seconds or 0
            total_question_count += quiz.total_questions or 0
            for area in quiz.weak_areas or []:
                weak_area_counter[area] = weak_area_counter.get(area, 0) + 1

        mock_scores = []
        for mock in mock_tests:
            if mock.score is not None:
                mock_scores.append(mock.score)
                progress_scores.append({"source": "mock_test", "score": round(mock.score, 2)})
            total_question_time += mock.time_spent_seconds or 0
            total_question_count += mock.total_questions or 0
            for area in mock.weak_areas or []:
                weak_area_counter[area] = weak_area_counter.get(area, 0) + 1

        all_scores = answer_scores + quiz_scores + mock_scores
        overall_accuracy = sum(all_scores) / len(all_scores) if all_scores else 0.0
        avg_time_per_q = (total_question_time / total_question_count) if total_question_count else 0.0

        weak_areas = sorted(weak_area_counter.keys(), key=lambda x: weak_area_counter[x], reverse=True)[:5]

        return {
            "user_id": user_id,
            "total_attempts": len(answers) + len(quiz_sessions) + len(mock_tests),
            "overall_accuracy": round(overall_accuracy, 2),
            "average_time_per_question": round(avg_time_per_q, 2),
            "weak_areas": weak_areas,
            "progress_scores": progress_scores[-20:],
        }
