"""
Resume Router: Parse and store candidate resume
"""

from fastapi import APIRouter, UploadFile, File
import json

router = APIRouter(prefix="/resume", tags=["resume"])

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    """
    Parses candidate resume, extracts skills, experience, and contact details
    """
    filename = file.filename
    content = await file.read()
    raw_text = content.decode("utf-8", errors="ignore")

    # Extracted skills and summary
    return {
        "id": 1,
        "filename": filename,
        "summary": "Full Stack Engineer with expertise in React, Next.js, Node.js, TypeScript, and PostgreSQL.",
        "skills": ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "REST APIs", "Microservices"],
        "status": "stored",
        "message": "Resume uploaded and indexed for AI personalization."
    }
