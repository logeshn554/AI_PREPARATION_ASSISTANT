from app.models import Resume
from app.services.company_service import CompanyService


def test_quiz_routes(client, auth_user):
    user_id = auth_user["user_id"]

    create_response = client.post(
        f"/quiz/generate?user_id={user_id}",
        json={
            "role": "Backend Developer",
            "skills": ["python", "sql"],
            "num_questions": 4,
        },
    )
    assert create_response.status_code == 201
    create_body = create_response.json()
    assert create_body["total_questions"] == 4

    session_id = create_body["session_id"]
    questions = create_body["questions"]
    answers = []
    for question in questions:
        if question.get("options"):
            answer_text = question["options"][0]
        else:
            answer_text = "I would use a structured, production-ready approach with metrics."
        answers.append(
            {
                "question_id": question["question_id"],
                "answer": answer_text,
                "time_spent_seconds": 5,
            }
        )

    submit_response = client.post(
        f"/quiz/{session_id}/submit",
        json={"answers": answers, "total_time_seconds": 20},
    )
    assert submit_response.status_code == 200
    submit_body = submit_response.json()
    assert submit_body["total_questions"] == 4

    get_response = client.get(f"/quiz/{session_id}")
    assert get_response.status_code == 200
    assert get_response.json()["status"] == "completed"


def test_company_routes(client, monkeypatch):
    def fake_scrape(_company_name):
        return {
            "interview_questions": ["What is your biggest technical challenge?"],
            "hiring_process": ["Resume screening", "Technical round"],
            "preparation_tips": ["Practice system design"],
            "source_urls": ["https://example.com/company-interviews"],
        }

    monkeypatch.setattr(CompanyService, "_scrape_company_data", staticmethod(fake_scrape))

    prepare_response = client.post(
        "/company/prepare",
        json={
            "company_name": "Google",
            "role": "Software Engineer",
            "refresh": True,
        },
    )
    assert prepare_response.status_code == 200
    prepare_body = prepare_response.json()
    assert prepare_body["company_name"] == "google"
    assert len(prepare_body["interview_questions"]) > 0

    get_response = client.get("/company/google")
    assert get_response.status_code == 200
    assert get_response.json()["company_name"] == "google"


def test_mock_test_routes(client, auth_user):
    user_id = auth_user["user_id"]

    create_response = client.post(
        f"/mock-tests/create?user_id={user_id}",
        json={
            "company_name": "Amazon",
            "role": "SDE",
            "skills": ["python", "system design"],
            "num_questions": 5,
            "duration_minutes": 30,
        },
    )
    assert create_response.status_code == 201
    create_body = create_response.json()
    test_id = create_body["test_id"]

    answers = []
    for question in create_body["questions"]:
        if question.get("options"):
            answer_text = question["options"][0]
        else:
            answer_text = "I would implement and validate with logs and tests."
        answers.append(
            {
                "question_id": question["question_id"],
                "answer": answer_text,
                "time_spent_seconds": 6,
            }
        )

    submit_response = client.post(
        f"/mock-tests/{test_id}/submit",
        json={"answers": answers, "total_time_seconds": 30},
    )
    assert submit_response.status_code == 200
    assert submit_response.json()["test_id"] == test_id

    get_response = client.get(f"/mock-tests/{test_id}")
    assert get_response.status_code == 200
    assert get_response.json()["status"] == "completed"


def test_analytics_route(client, auth_user):
    user_id = auth_user["user_id"]

    quiz_response = client.post(
        f"/quiz/generate?user_id={user_id}",
        json={
            "role": "Data Scientist",
            "skills": ["python", "nlp"],
            "num_questions": 2,
        },
    )
    assert quiz_response.status_code == 201
    session_id = quiz_response.json()["session_id"]

    questions = quiz_response.json()["questions"]
    answers = [
        {
            "question_id": q["question_id"],
            "answer": q["options"][0] if q.get("options") else "Detailed answer",
            "time_spent_seconds": 4,
        }
        for q in questions
    ]

    submit_response = client.post(
        f"/quiz/{session_id}/submit",
        json={"answers": answers, "total_time_seconds": 8},
    )
    assert submit_response.status_code == 200

    analytics_response = client.get(f"/analytics/{user_id}")
    assert analytics_response.status_code == 200
    analytics_body = analytics_response.json()
    assert analytics_body["user_id"] == user_id
    assert "overall_accuracy" in analytics_body
    assert "progress_scores" in analytics_body


def test_ai_interviewer_route(client, auth_user):
    user_id = auth_user["user_id"]

    start_response = client.post(
        "/ai-interviewer/chat",
        json={
            "user_id": user_id,
            "role": "ML Engineer",
            "skills": ["python", "nlp"],
            "answer": None,
            "previous_question": None,
        },
    )
    assert start_response.status_code == 200
    start_body = start_response.json()
    assert start_body["question"]

    answer_response = client.post(
        "/ai-interviewer/chat",
        json={
            "user_id": user_id,
            "role": "ML Engineer",
            "skills": ["python", "nlp"],
            "answer": "I built an NLP pipeline with measurable latency and quality improvements.",
            "previous_question": start_body["question"],
        },
    )
    assert answer_response.status_code == 200
    answer_body = answer_response.json()
    assert answer_body["score"] is not None
    assert answer_body["feedback"]


def test_challenge_and_leaderboard_routes(client, auth_user):
    user_id = auth_user["user_id"]

    challenge_response = client.get("/challenges/today")
    assert challenge_response.status_code == 200
    challenge = challenge_response.json()

    submit_response = client.post(
        f"/challenges/submit?user_id={user_id}",
        json={
            "challenge_id": challenge["id"],
            "answer_text": "I would monitor metrics, isolate regression, rollback safely, and communicate impact.",
        },
    )
    assert submit_response.status_code == 200
    submit_body = submit_response.json()
    assert submit_body["user_id"] == user_id

    leaderboard_response = client.get("/leaderboard?limit=10")
    assert leaderboard_response.status_code == 200
    rows = leaderboard_response.json()["rows"]
    assert any(row["user_id"] == user_id for row in rows)


def test_dashboard_route_with_resume_insights(client, auth_user, db_session):
    user_id = auth_user["user_id"]

    resume = Resume(
        user_id=user_id,
        file_name="profile.pdf",
        parsed_data={"raw_text": "sample"},
        skills=["python", "react", "sql"],
        experience=[{"summary": "Backend Developer 2022-2024"}],
        projects=[{"summary": "Built interview preparation platform"}],
        ats_score=84.5,
    )
    db_session.add(resume)
    db_session.commit()

    response = client.get(f"/dashboard/{user_id}")
    assert response.status_code == 200
    body = response.json()
    assert body["user_id"] == user_id
    assert "extracted_skills" in body["stats"]
    assert "skill_gaps" in body["stats"]
    assert body["stats"]["latest_ats_score"] == 84.5
