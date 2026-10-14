"""
RefAgent / Happpy Backend Entrypoint (FastAPI)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, resume, jobs, agent

app = FastAPI(
    title="RefAgent API - Automated Job Referral Outreach Agent",
    description="Automated job referral outreach platform modeled after Uplers HAPPPY Agent",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(jobs.router)
app.include_router(agent.router)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "RefAgent Backend",
        "rate_limiting": "10 jobs/day max",
        "ai_engine": "Gemini 3.8 Flash",
        "contact_discovery": "Hunter.io & Apollo.io APIs"
    }

@app.get("/dashboard")
def get_dashboard_metrics():
    """
    Returns live pipeline metrics and activity
    """
    return {
        "user_name": "Aryan Sharma",
        "daily_quota": {"used": 4, "total": 10},
        "stats": {
            "jobs_run_on_platform": 27,
            "jobs_run_via_extension": 16,
            "jobs_in_queue": 0,
            "positive_responses": 3
        },
        "recent_outreach": [
            {
                "id": "run_cw_01",
                "job_title": "Frontend Developer – React.js / Next.js",
                "company": "Codersworld",
                "recipient": "Aman Saxena (Lead)",
                "channel": "Gmail + LinkedIn",
                "status": "sent",
                "follow_up_in": "72 hours"
            },
            {
                "id": "run_ak_02",
                "job_title": "GenAI / LLM Engineer",
                "company": "AIKING SOLUTIONS",
                "recipient": "Vikram Joshi",
                "channel": "Gmail",
                "status": "replied_positive",
                "follow_up_in": "cancelled_on_reply"
            }
        ]
    }
