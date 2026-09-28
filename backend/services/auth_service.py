"""
Aqua Intellect & Marine AI - Authentication Service
Handles:
- Bcrypt password hashing and verification
- JWT Token signing, verification, and revocation
- FastAPI Dependency for current authenticated user extraction
"""

import os
import re
import uuid
import datetime
from typing import Optional, Dict, Any, Tuple
import bcrypt
from jose import jwt, JWTError
from fastapi import Request, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from database import get_db_connection

# JWT Configuration
JWT_SECRET = os.environ.get("JWT_SECRET", "marine-ai-production-super-secret-key-2026-v2")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

bearer_scheme = HTTPBearer(auto_error=False)

def hash_password(plain_password: str) -> str:
    """Hashes password with bcrypt and salt."""
    return bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against stored bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def validate_password_strength(password: str) -> Tuple[bool, str]:
    """Validates minimum password security requirements."""
    if len(password) < 6:
        return False, "Password must be at least 6 characters long."
    if not any(c.isalpha() for c in password):
        return False, "Password must contain at least one letter."
    if not any(c.isdigit() or not c.isalnum() for c in password):
        return False, "Password must contain at least one number or special character."
    return True, ""

def validate_email(email: str) -> bool:
    """Validates standard email format."""
    email_regex = r"^[\w\.-]+@[\w\.-]+\.\w{2,}$"
    return bool(re.match(email_regex, email.strip().lower()))

def create_access_token(user_id: str, email: str, role: str = "fisher") -> Tuple[str, str]:
    """
    Creates a signed JWT access token with JTI for revocation tracking.
    Returns (token_string, jti).
    """
    jti = f"tok_{uuid.uuid4().hex}"
    expires_delta = datetime.timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    expire = datetime.datetime.utcnow() + expires_delta
    
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "jti": jti,
        "exp": expire,
        "iat": datetime.datetime.utcnow()
    }
    
    encoded_jwt = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt, jti

def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates JWT token.
    Checks signature, expiry, and revocation table.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        jti = payload.get("jti")
        if jti:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT token_jti FROM revoked_tokens WHERE token_jti = ?", (jti,))
            revoked = cursor.fetchone()
            conn.close()
            if revoked:
                raise HTTPException(status_code=401, detail="Session has been revoked/logged out")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token")

def sanitize_user(user_row) -> Dict[str, Any]:
    """Strips password hash and returns safe user profile dict."""
    u = dict(user_row)
    u.pop("password_hash", None)
    return u

def extract_token_from_request(
    request: Request,
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
) -> Optional[str]:
    """Extracts bearer token from Authorization header or cookie."""
    if auth_header and auth_header.credentials:
        return auth_header.credentials
    
    # Check Cookie fallback
    cookie_token = request.cookies.get("marine_ai_session")
    if cookie_token:
        return cookie_token
        
    return None

async def get_current_user(
    request: Request,
    token: Optional[str] = Depends(extract_token_from_request)
) -> Dict[str, Any]:
    """
    FastAPI dependency that enforces authentication.
    Returns authenticated user record or raises HTTP 401.
    """
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please log in to access this resource."
        )
    
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Malformed session token")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=401, detail="User account not found or has been removed")
        
    return sanitize_user(user)

async def get_optional_current_user(
    request: Request,
    token: Optional[str] = Depends(extract_token_from_request)
) -> Optional[Dict[str, Any]]:
    """
    FastAPI dependency for endpoints that work for both public and authenticated users.
    Returns user dict if valid token is provided, else None.
    """
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        conn.close()
        return sanitize_user(user) if user else None
    except Exception:
        return None

async def require_authority_user(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    FastAPI dependency enforcing that the authenticated user possesses an Authority / Coast Guard / Admin role.
    Raises HTTP 403 Forbidden if user is a standard fisher or unauthorized role.
    """
    user_role = (current_user.get("role") or "").lower()
    allowed_roles = ["authority", "admin", "coast_guard", "disaster_management", "incois_officer", "harbor_master"]
    if user_role not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail="Access Denied: Maritime Authority credentials required. Your current role is not authorized for the Emergency Command Center."
        )
    return current_user
