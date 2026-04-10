import PyPDF2
import docx
from typing import Optional, List, Dict, Any
import json


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
