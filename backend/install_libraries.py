import subprocess
import sys


def install_requirements():
    """Install backend dependencies for the PostgreSQL stack."""

    libraries = [
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "alembic",
        "psycopg2-binary",
        "pydantic[email]",
        "python-jose[cryptography]",
        "passlib[bcrypt]",
        "python-multipart",
        "PyPDF2",
        "python-docx",
        "spacy",
        "beautifulsoup4",
        "requests",
        "scikit-learn",
        "google-auth",
        "google-auth-oauthlib",
        "google-auth-httplib2",
        "matplotlib",
        "pandas",
        "pytest",
    ]

    print("Starting library installation...")

    for lib in libraries:
        print(f"Installing {lib}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", lib])
        except subprocess.CalledProcessError:
            print(f"Failed to install {lib}. Please check manually.")
            continue

    print("\nAll libraries install step completed.")
    print("---------------------------------------")
    print("Downloading NLP model...")
    try:
        subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
        print("Spacy model en_core_web_sm installed.")
    except Exception as e:
        print(f"Failed to download spacy model: {e}")


if __name__ == "__main__":
    install_requirements()
