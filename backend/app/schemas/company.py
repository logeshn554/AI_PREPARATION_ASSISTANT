from pydantic import BaseModel


class CompanyPrepRequest(BaseModel):
    company_name: str
    role: str | None = None
    refresh: bool = False


class CompanyPrepResponse(BaseModel):
    company_name: str
    role: str | None = None
    interview_questions: list[str]
    hiring_process: list[str]
    preparation_tips: list[str]
    source_urls: list[str]
