import secrets
import hashlib


def generate_api_key():

    raw_key = f"sk_live_{secrets.token_urlsafe(32)}"

    return raw_key


def hash_api_key(raw_key: str):

    return hashlib.sha256(raw_key.encode()).hexdigest()