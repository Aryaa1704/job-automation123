"""
Celery Worker Entrypoint
Run with: celery -A celery_worker.celery_app worker --loglevel=info
"""

from services.follow_up import celery_app

if __name__ == "__main__":
    celery_app.start()
