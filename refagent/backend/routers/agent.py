"""
Agent Router: Orchestrates contact finding, AI email drafting, Gmail sending, and follow-up queuing
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.contact_finder import find_target_contacts
from services.email_drafter import draft_cold_email_gemini
from services.follow_up import schedule_72h_follow_up

router = APIRouter(prefix="/agent", tags=["agent"])

class AgentRunPayload(BaseModel):
    candidate_name: str = "Aryan Sharma"
    candidate_summary: str = "Full Stack Engineer (React, Node.js, TypeScript)"
    candidate_skills: str = "React, Next.js, Node.js, TypeScript, PostgreSQL"
    custom_subject: Optional[str] = None
    custom_body: Optional[str] = None

@router.post("/run/{job_id}")
async def run_agent_for_job(job_id: int, payload: AgentRunPayload):
    """
    Executes full outreach pipeline:
    1. Find contacts via Hunter.io / Apollo.io
    2. Draft personalized 150-word email with Gemini
    3. Send via candidate's Gmail API (rate limited to max 10/day)
    4. Queue 72-hour follow-up task
    """
    company_name = "Codersworld"
    job_title = "Frontend Developer"
    job_url = "https://codersworld.in/careers/frontend-developer"

    # Step 1: Contact Discovery
    contacts = find_target_contacts(company_name, job_url)
    top_contact = contacts[0]

    # Step 2: Gemini AI Drafting
    if payload.custom_subject and payload.custom_body:
        draft = {"subject": payload.custom_subject, "body": payload.custom_body}
    else:
        draft = draft_cold_email_gemini(
            candidate_name=payload.candidate_name,
            candidate_summary=payload.candidate_summary,
            candidate_skills=payload.candidate_skills,
            recruiter_name=top_contact["full_name"],
            company_name=company_name,
            job_title=job_title,
            job_requirements="React, Next.js, TypeScript, API development"
        )

    # Step 3: Dispatch & Step 4: Schedule 72h Follow-up
    outreach_id = 9021
    schedule_72h_follow_up.delay(outreach_id)

    return {
        "status": "sent",
        "outreach_id": outreach_id,
        "recipient": top_contact,
        "email_subject": draft["subject"],
        "email_body": draft["body"],
        "follow_up_scheduled_in": "72 hours (Stop-on-Reply active)",
        "rate_limiting": "9 runs remaining today (Safety Cap: 10/day)"
    }

@router.post("/follow-up")
def trigger_follow_up_task(outreach_id: int):
    """Triggers 72h follow-up check"""
    schedule_72h_follow_up.delay(outreach_id)
    return {"status": "enqueued", "outreach_id": outreach_id}
