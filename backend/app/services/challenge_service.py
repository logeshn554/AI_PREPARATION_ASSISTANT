from datetime import date
from sqlalchemy.orm import Session

from app.models import DailyChallenge, ChallengeSubmission, User, Answer, QuizSession, MockTest
from app.schemas.challenge import ChallengeSubmitRequest
from app.utils.evaluator import evaluate_answer


class ChallengeService:
    """Daily challenges and leaderboard points."""

    @staticmethod
    def _build_default_challenge(today: date) -> DailyChallenge:
        prompts = [
            (
                "Debugging Under Pressure",
                "A production API latency spiked by 4x after release. Explain your triage and rollback strategy.",
                "technical",
                "hard",
                ["rollback", "metrics", "root cause", "monitoring", "communication"],
            ),
            (
                "System Design Snapshot",
                "Design a scalable notification system for 1 million users with retry and observability.",
                "technical",
                "hard",
                ["queue", "retry", "idempotency", "monitoring", "scaling"],
            ),
            (
                "Behavioral Leadership",
                "Describe a conflict you resolved between engineering and product while keeping delivery on track.",
                "behavioral",
                "medium",
                ["stakeholders", "communication", "trade-off", "result"],
            ),
        ]

        idx = today.toordinal() % len(prompts)
        title, question_text, qtype, difficulty, keywords = prompts[idx]

        return DailyChallenge(
            challenge_date=today,
            title=title,
            question_text=question_text,
            question_type=qtype,
            difficulty=difficulty,
            expected_keywords=keywords,
        )

    @staticmethod
    def get_today_challenge(db: Session) -> DailyChallenge:
        today = date.today()
        challenge = db.query(DailyChallenge).filter(DailyChallenge.challenge_date == today).first()
        if challenge:
            return challenge

        challenge = ChallengeService._build_default_challenge(today)
        db.add(challenge)
        db.commit()
        db.refresh(challenge)
        return challenge

    @staticmethod
    def submit_challenge(db: Session, user_id: int, payload: ChallengeSubmitRequest) -> ChallengeSubmission:
        challenge = db.query(DailyChallenge).filter(DailyChallenge.id == payload.challenge_id).first()
        if not challenge:
            raise ValueError("Challenge not found")

        evaluation = evaluate_answer(
            answer=payload.answer_text,
            keywords=",".join(challenge.expected_keywords or []),
            question_type=challenge.question_type,
        )

        submission = db.query(ChallengeSubmission).filter(
            ChallengeSubmission.challenge_id == challenge.id,
            ChallengeSubmission.user_id == user_id,
        ).first()

        if submission:
            submission.answer_text = payload.answer_text
            submission.score = evaluation["score"]
            submission.feedback = evaluation["feedback"]
        else:
            submission = ChallengeSubmission(
                challenge_id=challenge.id,
                user_id=user_id,
                answer_text=payload.answer_text,
                score=evaluation["score"],
                feedback=evaluation["feedback"],
            )
            db.add(submission)

        db.commit()
        db.refresh(submission)
        return submission

    @staticmethod
    def get_leaderboard(db: Session, limit: int = 20) -> list[dict]:
        users = db.query(User).all()
        rows = []

        for user in users:
            answer_scores = [a.score for a in db.query(Answer).filter(Answer.user_id == user.id).all() if a.score is not None]
            quiz_scores = [q.score for q in db.query(QuizSession).filter(QuizSession.user_id == user.id, QuizSession.status == "completed").all() if q.score is not None]
            mock_scores = [m.score for m in db.query(MockTest).filter(MockTest.user_id == user.id, MockTest.status == "completed").all() if m.score is not None]
            challenge_scores = [c.score for c in db.query(ChallengeSubmission).filter(ChallengeSubmission.user_id == user.id).all() if c.score is not None]

            points = (
                sum(answer_scores) * 0.4
                + sum(quiz_scores) * 1.0
                + sum(mock_scores) * 1.2
                + sum(challenge_scores) * 0.8
            )

            rows.append(
                {
                    "user_id": user.id,
                    "name": user.name,
                    "points": round(points, 2),
                }
            )

        rows.sort(key=lambda r: r["points"], reverse=True)
        return rows[:limit]
