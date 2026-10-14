"""
SQLAlchemy ORM Database Schema for RefAgent / Happpy Outreach Agent
Tables: users, resumes, jobs, contacts, outreach_logs, follow_ups
"""

from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
)
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    current_role = Column(String(255), nullable=True)
    experience_months = Column(Integer, default=0)
    notice_period = Column(String(100), default="Immediate")
    linkedin_url = Column(String(500), nullable=True)
    gmail_oauth_token = Column(Text, nullable=True) # AES-256 encrypted
    gmail_refresh_token = Column(Text, nullable=True)
    daily_quota_limit = Column(Integer, default=10) # Max 10 jobs/day
    created_at = Column(DateTime, default=datetime.utcnow)

    resumes = relationship("Resume", back_populates="user")
    outreach_logs = relationship("OutreachLog", back_populates="user")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    raw_text = Column(Text, nullable=False)
    parsed_skills = Column(Text, nullable=True) # JSON array string
    summary = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resumes")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False, index=True)
    company_domain = Column(String(255), nullable=True)
    url = Column(Text, nullable=False)
    source_board = Column(String(50), default="Direct URL") # LinkedIn, Indeed, Naukri, etc.
    description = Column(Text, nullable=True)
    extracted_requirements = Column(Text, nullable=True) # JSON array string
    first_seen_at = Column(DateTime, default=datetime.utcnow)

    contacts = relationship("Contact", back_populates="job")
    outreach_logs = relationship("OutreachLog", back_populates="job")

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    company_name = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role_title = Column(String(255), nullable=False)
    department = Column(String(100), default="Engineering") # Engineering, Talent / HR, Leadership
    work_email = Column(String(255), nullable=False, index=True)
    linkedin_url = Column(String(500), nullable=True)
    email_confidence = Column(Float, default=95.0)
    provider_source = Column(String(50), default="Hunter.io") # Hunter.io, Apollo.io, Lusha
    is_hiring_manager = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("Job", back_populates="contacts")
    outreach_logs = relationship("OutreachLog", back_populates="contact")

class OutreachLog(Base):
    __tablename__ = "outreach_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    channel = Column(String(50), default="gmail") # gmail, linkedin
    status = Column(String(50), default="sent") # drafted, sent, replied, failed
    email_subject = Column(String(500), nullable=True)
    email_body = Column(Text, nullable=True)
    gmail_message_id = Column(String(255), nullable=True)
    gmail_thread_id = Column(String(255), nullable=True)
    sent_at = Column(DateTime, default=datetime.utcnow)
    reply_detected_at = Column(DateTime, nullable=True)
    reply_snippet = Column(Text, nullable=True)

    user = relationship("User", back_populates="outreach_logs")
    job = relationship("Job", back_populates="outreach_logs")
    contact = relationship("Contact", back_populates="outreach_logs")
    follow_up = relationship("FollowUp", back_populates="outreach_log", uselist=False)

class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(Integer, primary_key=True, index=True)
    outreach_log_id = Column(Integer, ForeignKey("outreach_logs.id"), nullable=False)
    due_at = Column(DateTime, nullable=False) # exactly 72 hours after initial sent_at
    status = Column(String(50), default="scheduled") # scheduled, sent, cancelled_on_reply
    follow_up_subject = Column(String(500), nullable=True)
    follow_up_body = Column(Text, nullable=True)
    sent_at = Column(DateTime, nullable=True)

    outreach_log = relationship("OutreachLog", back_populates="follow_up")
