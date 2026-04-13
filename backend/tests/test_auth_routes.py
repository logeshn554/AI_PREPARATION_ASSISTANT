from app.models import User


def test_register_login_and_me(client):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Alice",
            "email": "alice@example.com",
            "password": "Password123",
        },
    )
    assert register_response.status_code == 201
    register_body = register_response.json()
    assert register_body["token_type"] == "bearer"

    login_response = client.post(
        "/auth/login",
        json={
            "email": "alice@example.com",
            "password": "Password123",
        },
    )
    assert login_response.status_code == 200
    login_body = login_response.json()
    assert login_body["access_token"]

    me_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {login_body['access_token']}"},
    )
    assert me_response.status_code == 200
    me_body = me_response.json()
    assert me_body["email"] == "alice@example.com"


def test_google_auth_flow(client, db_session, monkeypatch):
    monkeypatch.setenv("GOOGLE_CLIENT_ID", "test-google-client-id")

    def fake_verify(id_token, request, client_id):
        assert id_token == "fake-google-id-token"
        assert client_id == "test-google-client-id"
        return {
            "email": "google.user@example.com",
            "sub": "google-sub-123",
            "name": "Google User",
        }

    monkeypatch.setattr("app.routes.auth.google_id_token.verify_oauth2_token", fake_verify)

    response = client.post(
        "/auth/google",
        json={"id_token": "fake-google-id-token"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["user"]["email"] == "google.user@example.com"
    assert body["user"]["auth_provider"] == "google"

    user_in_db = db_session.query(User).filter(User.email == "google.user@example.com").first()
    assert user_in_db is not None
    assert user_in_db.google_sub == "google-sub-123"
