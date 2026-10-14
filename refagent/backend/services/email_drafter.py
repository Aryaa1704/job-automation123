"""
AI Email Drafter Service
Uses Google Gemini API to draft personalized 150-word cold referral emails
"""

import os
import json
from typing import Dict, Any

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def draft_cold_email_gemini(
    candidate_name: str,
    candidate_summary: str,
    candidate_skills: str,
    recruiter_name: str,
    company_name: str,
    job_title: str,
    job_requirements: str
) -> Dict[str, str]:
    """
    Calls Google Gemini API to draft 150-word personalized cold referral email
    """
    if GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=GEMINI_API_KEY)

            prompt = f"""
Write a 150-word cold referral email from [{candidate_name}] to [{recruiter_name}] at [{company_name}] for [{job_title}].
Candidate background: [{candidate_summary}].
Candidate core skills: [{candidate_skills}].
Job requires: [{job_requirements}].
Tone: professional but warm. Subject line included.

Output format strictly JSON with keys "subject" and "body".
"""
            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=prompt,
                config={"response_mime_type": "application/json"}
            )
            if response.text:
                data = json.loads(response.text)
                return {
                    "subject": data.get("subject", f"Referral Request: {job_title} - {candidate_name}"),
                    "body": data.get("body", "")
                }
        except Exception as e:
            print(f"Gemini API error, falling back to local template: {e}")

    # Deterministic high-conversion 150-word fallback
    first_name = recruiter_name.split()[0] if recruiter_name else "there"
    subject = f"Application & Referral Request: {job_title} - {candidate_name}"
    body = f"""Hi {first_name},

I noticed you are on the team at {company_name}. I recently came across the {job_title} opening and would be very grateful if you would consider referring me internally.

A quick summary of my background:
• Focus: Full Stack & Backend Engineering with hands-on experience in React, Node.js, TypeScript, and PostgreSQL.
• Projects: Built high-throughput microservices, real-time sync systems, and scalable APIs.
• Availability: Immediate joiner (0 notice period).

My resume and LinkedIn profile provide full details on my recent engineering work. If you're open to submitting my profile through your internal referral portal, I would be honored to share any additional details.

Thank you so much for your time and help!

Best regards,
{candidate_name}"""

    return {"subject": subject, "body": body}
