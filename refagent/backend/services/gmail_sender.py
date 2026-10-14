"""
Gmail Sender Service
Uses Gmail API via google-auth and google-api-python-client
Dispatches authentic emails directly from the candidate's authorized inbox
"""

import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional

def create_mime_message(sender: str, to: str, subject: str, body_text: str, thread_id: Optional[str] = None) -> Dict[str, Any]:
    """Create a raw base64 encoded MIME email message"""
    message = MIMEMultipart("alternative")
    message["to"] = to
    message["from"] = sender
    message["subject"] = subject

    part = MIMEText(body_text, "plain")
    message.attach(part)

    raw = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
    payload = {"raw": raw}
    if thread_id:
        payload["threadId"] = thread_id
    return payload

def send_gmail_message(credentials, sender_email: str, recipient_email: str, subject: str, body: str, thread_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Sends email using Gmail API.
    Only requires `https://www.googleapis.com/auth/gmail.send` scope.
    """
    try:
        from googleapiclient.discovery import build
        service = build("gmail", "v1", credentials=credentials)

        message_payload = create_mime_message(sender_email, recipient_email, subject, body, thread_id)
        sent_message = service.users().messages().send(userId="me", body=message_payload).execute()

        return {
            "success": True,
            "message_id": sent_message.get("id"),
            "thread_id": sent_message.get("threadId")
        }
    except Exception as e:
        print(f"Error sending email via Gmail API: {e}")
        return {
            "success": False,
            "error": str(e)
        }
