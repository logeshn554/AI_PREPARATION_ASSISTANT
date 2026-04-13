import re
import requests
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

from app.models import CompanyInsight


class CompanyService:
    """Scrape and cache company-specific interview preparation data."""

    @staticmethod
    def _extract_lines_from_html(html: str) -> tuple[list[str], list[str], list[str]]:
        soup = BeautifulSoup(html, "html.parser")
        text = soup.get_text("\n", strip=True)
        lines = [line.strip() for line in text.splitlines() if len(line.strip()) > 30]

        questions = []
        process = []
        tips = []

        for line in lines:
            lower = line.lower()
            if "?" in line and len(questions) < 12:
                cleaned = re.sub(r"\s+", " ", line)
                if cleaned not in questions:
                    questions.append(cleaned)
            if any(k in lower for k in ["round", "hiring process", "onsite", "online assessment", "interview process"]):
                process.append(re.sub(r"\s+", " ", line))
            if any(k in lower for k in ["tip", "prepare", "focus", "practice", "advice"]):
                tips.append(re.sub(r"\s+", " ", line))

        return questions[:10], process[:8], tips[:8]

    @staticmethod
    def _fallback_content(company_name: str, role: str | None = None) -> dict:
        role_text = role or "software engineering"
        return {
            "interview_questions": [
                f"Why do you want to join {company_name}?",
                f"Describe a project relevant to {role_text} and your impact.",
                "Explain a time you handled production failure and what you learned.",
                "How do you prioritize quality, delivery speed, and stakeholder communication?",
            ],
            "hiring_process": [
                "Resume screening",
                "Online assessment / take-home",
                "Technical interviews",
                "Behavioral or hiring manager round",
            ],
            "preparation_tips": [
                "Revise role-specific fundamentals and system design basics.",
                "Practice mock interviews with time-boxed answers.",
                "Prepare STAR stories with measurable outcomes.",
                "Review the company product, culture, and recent news.",
            ],
            "source_urls": [],
        }

    @staticmethod
    def _scrape_company_data(company_name: str) -> dict:
        query = f"{company_name} interview questions hiring process tips"
        search_url = "https://duckduckgo.com/html/"
        source_urls: list[str] = []
        all_questions: list[str] = []
        all_process: list[str] = []
        all_tips: list[str] = []

        try:
            search_response = requests.get(search_url, params={"q": query}, timeout=8)
            search_response.raise_for_status()
            soup = BeautifulSoup(search_response.text, "html.parser")
            links = [a.get("href") for a in soup.select("a.result__a") if a.get("href")]
        except Exception:
            links = []

        for link in links[:3]:
            try:
                page = requests.get(link, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
                page.raise_for_status()
                questions, process, tips = CompanyService._extract_lines_from_html(page.text)
                source_urls.append(link)
                all_questions.extend(questions)
                all_process.extend(process)
                all_tips.extend(tips)
            except Exception:
                continue

        # Deduplicate while preserving order
        def uniq(items: list[str]) -> list[str]:
            seen = set()
            out = []
            for item in items:
                if item not in seen:
                    seen.add(item)
                    out.append(item)
            return out

        return {
            "interview_questions": uniq(all_questions)[:10],
            "hiring_process": uniq(all_process)[:8],
            "preparation_tips": uniq(all_tips)[:8],
            "source_urls": uniq(source_urls),
        }

    @staticmethod
    def get_or_create_company_insight(
        db: Session,
        company_name: str,
        role: str | None = None,
        refresh: bool = False,
    ) -> CompanyInsight:
        normalized = company_name.strip().lower()
        existing = db.query(CompanyInsight).filter(CompanyInsight.company_name == normalized).first()

        if existing and not refresh:
            return existing

        scraped = CompanyService._scrape_company_data(company_name)
        if not scraped["interview_questions"]:
            scraped = CompanyService._fallback_content(company_name, role)

        if existing:
            existing.role = role
            existing.source_urls = scraped["source_urls"]
            existing.interview_questions = scraped["interview_questions"]
            existing.hiring_process = "\n".join(scraped["hiring_process"])
            existing.preparation_tips = "\n".join(scraped["preparation_tips"])
            db.commit()
            db.refresh(existing)
            return existing

        insight = CompanyInsight(
            company_name=normalized,
            role=role,
            source_urls=scraped["source_urls"],
            interview_questions=scraped["interview_questions"],
            hiring_process="\n".join(scraped["hiring_process"]),
            preparation_tips="\n".join(scraped["preparation_tips"]),
        )
        db.add(insight)
        db.commit()
        db.refresh(insight)
        return insight

    @staticmethod
    def get_company_insight(db: Session, company_name: str) -> CompanyInsight | None:
        return db.query(CompanyInsight).filter(CompanyInsight.company_name == company_name.strip().lower()).first()
