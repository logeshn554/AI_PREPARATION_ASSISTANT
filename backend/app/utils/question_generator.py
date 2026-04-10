from typing import List, Dict, Tuple
import json


QUESTION_TEMPLATES = {
    "technical": [
        "Explain how you would implement a {skill} solution for {role}",
        "Describe your experience with {skill} in production environments",
        "Walk through a {skill} project you've built",
        "How would you approach a {skill} problem in {role}?",
        "What are the key challenges you've faced with {skill}?",
    ],
    "behavioral": [
        "Tell me about a time you had to learn {skill} quickly for a {role}",
        "Describe how you've used {skill} to solve a real-world problem",
        "How do you stay updated with the latest trends in {skill}?",
        "Tell me about a challenging project where you used {skill}",
        "How have you applied {skill} to improve team productivity?",
    ]
}


def generate_questions(
    role: str,
    skills: List[str],
    num_questions: int = 10
) -> List[Dict[str, str]]:
    """
    Generate interview questions based on role and skills.
    
    Args:
        role: Job role (e.g., "Senior Python Developer")
        skills: List of skills extracted from resume
        num_questions: Number of questions to generate
    
    Returns:
        List of generated questions with type
    """
    if not skills:
        skills = ["general programming"]
    
    questions = []
    question_index = 0
    
    while len(questions) < num_questions:
        q_type = "technical" if len(questions) % 2 == 0 else "behavioral"
        templates = QUESTION_TEMPLATES[q_type]
        
        template = templates[question_index % len(templates)]
        skill = skills[question_index % len(skills)]
        
        question_text = template.format(skill=skill.title(), role=role)
        
        questions.append({
            "question_text": question_text,
            "question_type": q_type,
            "keywords": skill,
        })
        
        question_index += 1
    
    return questions[:num_questions]


def extract_keywords_from_question(question: str) -> List[str]:
    """Extract potential keywords from a question."""
    keywords = []
    
    question_lower = question.lower()
    common_keywords = {
        "experience": ["experience", "worked", "built", "developed"],
        "challenge": ["challenge", "problem", "difficult", "issue"],
        "solution": ["solution", "approach", "methodology", "method"],
        "learning": ["learn", "learned", "understand", "knew"],
    }
    
    for category, words in common_keywords.items():
        for word in words:
            if word in question_lower:
                keywords.append(category)
                break
    
    return keywords
