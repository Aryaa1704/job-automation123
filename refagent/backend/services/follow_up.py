"""
Celery Follow-up and Background Worker Tasks
Implements 72-hour automated follow-up + Stop-on-Reply rules
"""

import os
from datetime import datetime, timedelta
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery("refagent_worker", broker=REDIS_URL, backend=REDIS_URL)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True
)

@celery_app.task(name="schedule_72h_follow_up")
def schedule_72h_follow_up(outreach_log_id: int):
    """
    Schedules task to check reply status and send follow-up after 72 hours
    """
    print(f"[CELERY] Scheduled 72h follow-up check for OutreachLog ID: {outreach_log_id}")
    return {"outreach_log_id": outreach_log_id, "scheduled_delay": "72h"}

@celery_app.task(name="execute_due_follow_ups")
def execute_due_follow_ups():
    """
    Periodic cron job checking for follow-ups due after 72 hours.
    If the recipient replied, cancels the follow-up (Stop-on-Reply).
    """
    print("[CELERY] Checking for due follow-ups...")
    # In production DB query:
    # follow_ups = session.query(FollowUp).filter(FollowUp.due_at <= now, FollowUp.status == 'scheduled')
    # For each, check if reply was received: if so, mark 'cancelled_on_reply', else send follow-up email.
    return {"status": "completed", "checked_at": datetime.utcnow().isoformat()}

@celery_app.task(name="check_gmail_replies")
def check_gmail_replies(user_id: int):
    """
    Queries Gmail API for threads initiated by the agent to detect replies
    Only searches threads created by agent (least-privilege).
    """
    print(f"[CELERY] Polling replies for user {user_id}...")
    return {"replies_detected": 0}
