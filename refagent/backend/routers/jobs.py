"""
Jobs Router: Scrapes and lists jobs
"""

from fastapi import APIRouter
from pydantic import BaseModel
from services.job_parser import scrape_job_from_url_playwright

router = APIRouter(prefix="/jobs", tags=["jobs"])

class AddUrlPayload(BaseModel):
    url: str

@router.post("/add-url")
async def add_job_url(payload: AddUrlPayload):
    """
    Parses live job from any URL (LinkedIn, Naukri, Indeed, or Career Page)
    """
    job_data = await scrape_job_from_url_playwright(payload.url)
    return {
        "id": 101,
        "status": "parsed",
        "job": job_data
    }

@router.get("/matches")
def get_matched_jobs():
    """
    Lists matched jobs for the candidate
    """
    return [
        {
            "id": 1,
            "title": "Frontend Developer – React.js / Next.js",
            "company_name": "Codersworld",
            "location": "Remote",
            "url": "https://codersworld.in/careers/frontend-developer",
            "posted_time": "12m ago"
        },
        {
            "id": 2,
            "title": "Full Stack Engineer (React + Node.js)",
            "company_name": "Sell Front",
            "location": "Bengaluru (Hybrid)",
            "url": "https://sellfront.com/careers/fullstack",
            "posted_time": "1h ago"
        }
    ]
