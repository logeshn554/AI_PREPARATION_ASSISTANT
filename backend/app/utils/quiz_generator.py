import random
from typing import List, Dict


APTITUDE_TEMPLATES = [
    {
        "question_text": "If a process improves throughput by 25% and the old throughput was 80 tasks/hour, what is the new throughput?",
        "options": ["90", "95", "100", "105"],
        "correct_answer": "100",
        "keywords": ["throughput", "percent", "math"],
    },
    {
        "question_text": "A team completes 3 modules in 6 days. At the same pace, how many modules in 14 days?",
        "options": ["6", "7", "8", "9"],
        "correct_answer": "7",
        "keywords": ["ratio", "estimation", "delivery"],
    },
]


def _technical_mcq(skill: str, role: str) -> Dict:
    pool = {
        "python": {
            "question_text": f"For a {role}, which Python structure gives O(1) average key lookup?",
            "options": ["list", "tuple", "dict", "set"],
            "correct_answer": "dict",
            "keywords": ["python", "dict", "complexity"],
        },
        "react": {
            "question_text": f"In React, what hook is used for side effects in a {role} project?",
            "options": ["useMemo", "useEffect", "useRef", "useId"],
            "correct_answer": "useEffect",
            "keywords": ["react", "hooks", "side effects"],
        },
        "sql": {
            "question_text": "Which SQL clause filters grouped results?",
            "options": ["WHERE", "ORDER BY", "HAVING", "LIMIT"],
            "correct_answer": "HAVING",
            "keywords": ["sql", "aggregation", "having"],
        },
    }
    return pool.get(skill.lower(), {
        "question_text": f"Which best describes clean architecture in a {role} codebase?",
        "options": [
            "Business logic depends on framework",
            "Framework depends on business logic",
            "UI layer owns domain rules",
            "Data layer controls all decisions",
        ],
        "correct_answer": "Framework depends on business logic",
        "keywords": ["architecture", "clean code", "design"],
    })


def _coding_question(skill: str, role: str) -> Dict:
    return {
        "question_text": f"Write pseudocode or real code for a {role} task using {skill}: detect duplicates in a list and return both duplicate values and counts.",
        "options": [],
        "correct_answer": "use_hash_map_frequency",
        "keywords": [skill.lower(), "hash map", "frequency", "time complexity"],
    }


def _hr_question(skill: str, role: str) -> Dict:
    return {
        "question_text": f"Describe a situation where you used {skill} to unblock a delivery risk as a {role}.",
        "options": [],
        "correct_answer": "star_structured_answer",
        "keywords": ["situation", "action", "result", skill.lower()],
    }


def generate_quiz_questions(role: str, skills: List[str], num_questions: int) -> List[Dict]:
    if not skills:
        skills = ["python", "sql", "communication"]

    questions: List[Dict] = []
    categories = ["aptitude", "technical_mcq", "coding", "hr"]

    for i in range(max(1, num_questions)):
        category = categories[i % len(categories)]
        skill = skills[i % len(skills)]

        if category == "aptitude":
            base = random.choice(APTITUDE_TEMPLATES)
        elif category == "technical_mcq":
            base = _technical_mcq(skill, role)
        elif category == "coding":
            base = _coding_question(skill, role)
        else:
            base = _hr_question(skill, role)

        questions.append(
            {
                "question_id": f"q_{i+1}",
                "question_text": base["question_text"],
                "question_type": category,
                "options": base.get("options", []),
                "correct_answer": base["correct_answer"],
                "keywords": base.get("keywords", []),
            }
        )

    return questions
