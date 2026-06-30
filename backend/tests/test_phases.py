import pytest
from fastapi.testclient import TestClient
import io
import os
import asyncio
import json
from main import app

# Module level database setup fixture
@pytest.fixture(scope="module", autouse=True)
def setup_database():
    import app.utils.db
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
    
    # Override engine globally for tests
    test_db_file = "./test_resume_suite.db"
    if os.path.exists(test_db_file):
        try:
            os.remove(test_db_file)
        except Exception:
            pass
            
    test_engine = create_async_engine(f"sqlite+aiosqlite:///{test_db_file}", echo=False, future=True)
    app.utils.db.engine = test_engine
    app.utils.db.async_sessionmaker_instance = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    # Run schema compilation
    async def create_tables():
        async with test_engine.begin() as conn:
            await conn.run_sync(app.utils.db.Base.metadata.create_all)
            
    asyncio.run(create_tables())
    
    yield
    
    # Cleanup database files after tests finish
    if os.path.exists(test_db_file):
        try:
            os.remove(test_db_file)
        except Exception:
            pass

client = TestClient(app)

# Session configurations
active_resume_id = None
active_version_id = None

# --- Phase 5: Job Description Optimization ---
def test_03_optimize_resume():
    payload = {
        "resume_json": {
            "personal_info": {"name": "Test User", "email": "test@domain.com"},
            "summary": "Experienced python developer looking for full stack roles.",
            "skills": {"languages": ["Python", "C++"], "frameworks": ["Flask"], "tools": ["Git"]}
        },
        "jd_text": "Looking for a Python Developer experienced in React and Docker."
    }
    response = client.post("/api/optimize", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert "optimized_resume" in res_data
    assert "diff_summary" in res_data

def test_03_optimize_resume_empty_jd():
    payload = {
        "resume_json": {},
        "jd_text": ""
    }
    response = client.post("/api/optimize", json=payload)
    assert response.status_code == 400

# --- Phase 6: Layout Templates & Previews ---
def test_04_list_templates():
    response = client.get("/api/templates")
    assert response.status_code == 200
    templates = response.json()
    assert len(templates) > 0
    assert any(t["id"] == "modern" for t in templates)

def test_05_preview_resume():
    payload = {
        "template_id": "modern",
        "resume_json": {
            "personal_info": {"name": "Test User", "email": "test@domain.com"},
            "summary": "Profile summary text.",
            "skills": {"languages": ["Python"], "frameworks": [], "tools": []}
        },
        "config": {"accent_color": "#C8F135", "font_family": "Arial"}
    }
    response = client.post("/api/templates/preview", json=payload)
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]

# --- Phase 7: Resume DND Editor ---
def test_06_get_active_resume():
    global active_resume_id
    response = client.get("/api/resume/active")
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "resume_json" in data
    active_resume_id = data["id"]

def test_07_update_active_resume():
    payload = {
        "resume_json": {
            "personal_info": {"name": "Modified Name", "email": "test@domain.com"},
            "summary": "Updated summary details",
            "experience": [{"id": "exp_1", "company": "Tech Corp", "position": "Senior Dev", "period": "2020-2024", "bullets": ["A", "B"]}],
            "projects": [],
            "skills": {"languages": ["Python"], "frameworks": [], "tools": []},
            "education": [],
            "achievements": [],
            "section_order": ["summary", "skills", "experience"]
        }
    }
    response = client.put("/api/resume/active", json=payload)
    assert response.status_code == 200
    assert response.json()["resume_json"]["personal_info"]["name"] == "Modified Name"

def test_08_patch_resume_order():
    payload = {
        "resume_json": {
            "personal_info": {"name": "Modified Name", "email": "test@domain.com"},
            "summary": "Updated summary details",
            "experience": [],
            "projects": [],
            "skills": {"languages": ["Python"], "frameworks": [], "tools": []},
            "education": [],
            "achievements": [],
            "section_order": ["experience", "skills", "summary"]
        }
    }
    response = client.patch(f"/api/resume/{active_resume_id}/order", json=payload)
    assert response.status_code == 200
    assert response.json()["resume_json"]["section_order"] == ["experience", "skills", "summary"]

# --- Phase 8: Profile Imports ---
def test_09_import_resume_file():
    fake_docx = io.BytesIO(b"Fake DOCX Content")
    response = client.post(
        "/api/import/resume",
        files={"file": ("resume.docx", fake_docx, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    )
    assert response.status_code in [200, 400]

def test_10_import_github_profile():
    response = client.post("/api/import/github", json={"username": ""})
    assert response.status_code == 400

# --- Phase 9: Version Control Snapshots ---
def test_11_create_version():
    global active_version_id
    payload = {
        "name": "Check v1.0",
        "resume_json": {
            "personal_info": {"name": "Version Check", "email": "test@domain.com"},
            "summary": "Snapshot text"
        }
    }
    response = client.post("/api/resume/version", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert "id" in res_data
    active_version_id = res_data["id"]

def test_12_list_versions():
    response = client.get("/api/resume/versions")
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_13_get_version():
    response = client.get(f"/api/resume/version/{active_version_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Check v1.0"

def test_14_delete_version():
    response = client.delete(f"/api/resume/version/{active_version_id}")
    assert response.status_code == 200
    response2 = client.get(f"/api/resume/version/{active_version_id}")
    assert response2.status_code == 404

# --- Phase 10: PDF/DOCX/MD/JSON Exports ---
def test_15_export_formats():
    for fmt in ["json", "markdown", "docx", "pdf"]:
        payload = {
            "resume_json": {
                "personal_info": {"name": "Alex Export", "email": "alex@export.com"},
                "summary": "Experienced software architect."
            },
            "format": fmt,
            "config": {"accent_color": "#0078d4", "font_family": "Arial", "margin": "20px"}
        }
        response = client.post("/api/export", json=payload)
        assert response.status_code == 200
        assert len(response.content) > 0

def test_16_export_download_formats():
    # First, make sure there is an active resume in DB
    client.get("/api/resume/active")
    
    for fmt in ["json", "markdown", "docx", "pdf"]:
        response = client.get(f"/api/export/download?format={fmt}&font=Arial&color=%230078d4&margin=20px")
        assert response.status_code == 200
        assert len(response.content) > 0
        content_disposition = response.headers.get("content-disposition", "")
        assert "attachment" in content_disposition
        assert f".{fmt if fmt != 'markdown' else 'md'}" in content_disposition

def test_16_export_download_invalid_format():
    response = client.get("/api/export/download?format=invalid_fmt")
    assert response.status_code == 400

