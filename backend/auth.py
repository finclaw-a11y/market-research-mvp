from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from models import User
from datetime import datetime, timezone
import uuid

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# In production, verify JWT tokens from Supabase
# This is a simplified version that extracts user info from the token
def verify_token(credentials: HTTPAuthCredentials = Depends(HTTPBearer(auto_error=False))) -> dict:
    """
    Verify JWT token from Supabase.
    In production, use supabase-py or jwt library to verify the signature.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    token = credentials.credentials
    
    # Simplified verification - in production use proper JWT verification
    # For now, we assume the token is valid if it's present
    # TODO: Implement proper JWT verification with Supabase public key
    
    return {"token": token}

async def get_current_user(
    credentials: HTTPAuthCredentials = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(None)
) -> User:
    """
    Get current authenticated user from database.
    This endpoint requires a valid Supabase JWT token.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    # In production, decode the JWT and extract user info
    # For now, we'll use a placeholder
    # Implementation would use:
    # import jwt
    # decoded = jwt.decode(token, SUPABASE_PUBLIC_KEY, algorithms=["HS256"])
    # user_id = decoded.get("sub")
    
    # This is a stub - implement proper JWT decoding
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token verification not fully implemented",
    )

def create_or_get_user(db: Session, user_id: str, email: str, full_name: str = None) -> User:
    """
    Create a new user or get existing user from database.
    Called when user signs up or logs in via Supabase.
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        user = User(
            id=user_id,
            email=email,
            full_name=full_name,
            subscription_status="free"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user
