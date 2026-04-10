from typing import Dict, Tuple, List
from difflib import SequenceMatcher


def calculate_relevance_score(answer: str, keywords: List[str]) -> float:
    """
    Calculate relevance score based on keyword matching.
    
    Args:
        answer: User's answer text
        keywords: Keywords to match against
    
    Returns:
        Relevance score (0-1)
    """
    if not keywords:
        return 0.5
    
    answer_lower = answer.lower()
    matched_keywords = sum(1 for keyword in keywords if keyword.lower() in answer_lower)
    
    return min(matched_keywords / len(keywords), 1.0)


def calculate_length_score(answer: str) -> float:
    """
    Score based on answer length (penalize very short or very long answers).
    
    Returns:
        Length score (0-1)
    """
    word_count = len(answer.split())
    
    if word_count < 10:
        return 0.3
    elif word_count < 30:
        return 0.7
    elif word_count < 200:
        return 1.0
    else:
        return 0.8


def calculate_semantic_similarity(answer: str, keywords: List[str]) -> float:
    """
    Basic semantic similarity check.
    
    Returns:
        Similarity score (0-1)
    """
    if not keywords or not answer:
        return 0.0
    
    answer_words = set(answer.lower().split())
    keyword_words = set()
    
    for keyword in keywords:
        keyword_words.update(keyword.lower().split())
    
    if not keyword_words:
        return 0.0
    
    intersection = len(answer_words.intersection(keyword_words))
    union = len(answer_words.union(keyword_words))
    
    return intersection / union if union > 0 else 0.0


def evaluate_answer(
    answer: str,
    keywords: str = None,
    question_type: str = "technical"
) -> Dict[str, any]:
    """
    Evaluate an answer and return score with feedback.
    
    Args:
        answer: User's answer text
        keywords: Keywords from the question
        question_type: Type of question (technical/behavioral)
    
    Returns:
        Dict with score, feedback, and suggestions
    """
    if not answer.strip():
        return {
            "score": 0.0,
            "feedback": "Answer cannot be empty.",
            "improvement_suggestions": "Please provide a detailed answer to the question.",
        }
    
    keywords_list = keywords.split(",") if keywords else []
    keywords_list = [k.strip() for k in keywords_list if k.strip()]
    
    relevance_score = calculate_relevance_score(answer, keywords_list)
    length_score = calculate_length_score(answer)
    similarity_score = calculate_semantic_similarity(answer, keywords_list)
    
    final_score = (relevance_score * 0.4 + length_score * 0.3 + similarity_score * 0.3) * 100
    
    feedback = generate_feedback(
        final_score,
        relevance_score,
        length_score,
        similarity_score,
        question_type
    )
    
    suggestions = generate_suggestions(
        answer,
        relevance_score,
        length_score,
        question_type
    )
    
    return {
        "score": round(final_score, 2),
        "feedback": feedback,
        "improvement_suggestions": suggestions,
    }


def generate_feedback(
    score: float,
    relevance: float,
    length: float,
    similarity: float,
    question_type: str
) -> str:
    """Generate appropriate feedback based on scores."""
    if score >= 80:
        return f"Excellent answer! You demonstrated strong understanding with relevant details and examples."
    elif score >= 60:
        return f"Good answer. You covered the main points, but could add more specific examples or depth."
    elif score >= 40:
        return f"Fair answer. You're on the right track, but need to provide more relevant details and examples."
    else:
        return f"Your answer needs improvement. Try to include more specific examples and relevant information."


def generate_suggestions(
    answer: str,
    relevance: float,
    length: float,
    question_type: str
) -> str:
    """Generate improvement suggestions based on weakness areas."""
    suggestions = []
    
    if relevance < 0.5:
        if question_type == "technical":
            suggestions.append("Include specific technical examples and implementation details.")
        else:
            suggestions.append("Structure your answer using STAR method (Situation, Task, Action, Result).")
    
    if length < 0.7:
        suggestions.append("Provide a more detailed answer with concrete examples and specific details.")
    
    if not suggestions:
        suggestions.append("Great job! Continue to practice and refine your answers for even better responses.")
    
    return " ".join(suggestions)
