import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

app = Celery("backend")

# all celery-related configuration keys should have CELERY_ prefix.
app.config_from_object("django.conf:settings", namespace="CELERY")

app.autodiscover_tasks()