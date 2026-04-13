import random

from app.utils.evaluator import evaluate_answer


class AIInterviewerService:
    """Simple AI interviewer loop with adaptive follow-up prompts."""

    @staticmethod
    def generate_question(role: str, skills: list[str]) -> str:
        skill = skills[0] if skills else "problem solving"
        templates = [
            f"As a {role}, explain a complex challenge where you used {skill} and how you measured success.",
            f"Design a small production-ready component for {role} work using {skill}. What trade-offs did you make?",
            f"Tell me about a failure in a {role} project and how you improved your approach with {skill}.",
        ]
        return random.choice(templates)

    @staticmethod
    def respond(role: str, skills: list[str], answer: str | None, previous_question: str | None) -> dict:
        if not answer:
            return {
                "question": AIInterviewerService.generate_question(role, skills),
                "feedback": None,
                "score": None,
                "follow_up": "Answer in STAR format for stronger evaluation.",
            }

        evaluation = evaluate_answer(
            answer=answer,
            keywords=",".join(skills[:5]),
            question_type="behavioral",
        )

        follow_up = (
            "Can you quantify impact with metrics?"
            if evaluation["score"] < 70
            else "Great. Now describe how you would mentor a junior teammate on this topic."
        )

        return {
            "question": previous_question or AIInterviewerService.generate_question(role, skills),
            "feedback": evaluation["feedback"],
            "score": evaluation["score"],
            "follow_up": follow_up,
        }
