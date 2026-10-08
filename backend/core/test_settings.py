"""Isolated tests: python manage.py test api --settings=core.test_settings.

Never creates test tables in the configured remote database.
"""
from .settings import *  # noqa: F403

DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
