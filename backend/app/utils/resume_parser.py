import PyPDF2
import docx
from typing import Optional, List, Dict, Any
import json
import re


def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF content."""
    try:
        pdf_reader = PyPDF2.PdfReader(file_content)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        raise ValueError(f"Error reading PDF: {str(e)}")


def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX content."""
    try:
        doc = docx.Document(file_content)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        raise ValueError(f"Error reading DOCX: {str(e)}")


def extract_resume_data(text: str) -> Dict[str, Any]:
    """Extract structured data from resume text."""
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
        doc = nlp(text)
        
        data = {
            "raw_text": text,
            "entities": [],
            "skills": [],
            "experience": [],
            "projects": [],
        }
        
        for ent in doc.ents:
            data["entities"].append({
                "text": ent.text,
                "label": ent.label_
            })

        data["experience"] = extract_experience_from_text(text)
        data["projects"] = extract_projects_from_text(text)
        
        return data
    except Exception as e:
        return {
            "raw_text": text,
            "error": str(e)
        }


def parse_skills_from_text(text: str) -> List[str]:
    """Extract skills from resume text."""
    common_skills = [
        "python", "javascript", "java", "c++", "c#", "go", "rust", "typescript",
        "react", "vue", "angular", "node.js", "fastapi", "django", "flask",
        "postgresql", "mongodb", "mysql", "redis", "docker", "kubernetes",
        "aws", "azure", "gcp", "machine learning", "deep learning", "nlp",
        "git", "linux", "sql", "html", "css", "rest api", "graphql"
    ]
    
    text_lower = text.lower()
    found_skills = []
    
    for skill in common_skills:
        if skill in text_lower:
            found_skills.append(skill)
    
    return list(set(found_skills))


def extract_projects_from_text(text: str) -> List[Dict[str, Any]]:
    """Heuristic extraction of project lines from resume text."""
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    projects: List[Dict[str, Any]] = []

    for line in lines:
        lower = line.lower()
        if any(keyword in lower for keyword in ["project", "developed", "built", "implemented"]):
            if len(line) > 25:
                projects.append({"summary": line[:500]})

    # Deduplicate by summary text.
    deduped = []
    seen = set()
    for p in projects:
        key = p["summary"]
        if key not in seen:
            seen.add(key)
            deduped.append(p)

    return deduped[:10]


def extract_experience_from_text(text: str) -> List[Dict[str, Any]]:
    """Heuristic extraction of experience snippets from resume text."""
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    experience: List[Dict[str, Any]] = []

    date_pattern = re.compile(r"(20\d{2}|19\d{2})")
    for line in lines:
        lower = line.lower()
        if any(word in lower for word in ["experience", "engineer", "developer", "intern", "analyst"]):
            if len(line) > 20 and date_pattern.search(line):
                experience.append({"summary": line[:500]})

    deduped = []
    seen = set()
    for item in experience:
        key = item["summary"]
        if key not in seen:
            seen.add(key)
            deduped.append(item)

    return deduped[:10]


def calculate_ats_score(
    text: str,
    skills: List[str],
    projects: List[Dict[str, Any]],
    experience: List[Dict[str, Any]],
) -> float:
    """Compute a lightweight ATS-style score (0-100)."""
    score = 0.0

    # Skill density (0-40)
    score += min(len(skills) * 4, 40)

    # Projects depth (0-20)
    score += min(len(projects) * 4, 20)

    # Experience depth (0-20)
    score += min(len(experience) * 4, 20)

    # Resume quality markers (0-20)
    lower = text.lower()
    quality_keywords = [
        "achieved", "improved", "reduced", "optimized", "built", "deployed", "scalable", "api", "cloud", "database"
    ]
    hits = sum(1 for kw in quality_keywords if kw in lower)
    score += min(hits * 2, 20)

    return round(min(score, 100.0), 2)
