from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone
from database import get_db
from models import User, Subscription
from services.stripe_handler import StripeHandler
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/users", tags=["users"])

class UserSignupRequest(BaseModel):
    user_id: str
    email: EmailStr
    full_name: str = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    subscription_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/signup", response_model=UserResponse)
async def signup(request: UserSignupRequest, db: Session = Depends(get_db)):
    """
    Create a new user after Supabase signup.
    This endpoint is called after user signs up via Supabase Auth.
    """
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.id == request.user_id).first()
        if existing_user:
            return existing_user
        
        # Create new user
        user = User(
            id=request.user_id,
            email=request.email,
            full_name=request.full_name,
            subscription_status="free"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        logger.info(f"New user created: {user.id}")
        
        return user
        
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/profile/{user_id}", response_model=UserResponse)
async def get_profile(user_id: str, db: Session = Depends(get_db)):
    """Get user profile information."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.put("/profile/{user_id}")
async def update_profile(
    user_id: str,
    full_name: str = None,
    db: Session = Depends(get_db)
):
    """Update user profile."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        if full_name:
            user.full_name = full_name
        user.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(user)
        
        return {"message": "Profile updated", "user": user}
        
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/subscription/create/{user_id}")
async def create_subscription(user_id: str, db: Session = Depends(get_db)):
    """
    Create a subscription with free trial for user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        result = StripeHandler.create_subscription(user, db)
        
        # Update user subscription status
        user.subscription_status = "trial"
        db.commit()
        
        return {
            "message": "Subscription created with 7-day free trial",
            "subscription": result
        }
        
    except Exception as e:
        logger.error(f"Subscription creation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/subscription/{user_id}")
async def get_subscription(user_id: str, db: Session = Depends(get_db)):
    """Get subscription status for user."""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == user_id
    ).first()
    
    if not subscription:
        return {
            "status": "free",
            "subscription_id": None,
            "trial_end": None
        }
    
    return {
        "status": subscription.status,
        "subscription_id": subscription.stripe_subscription_id,
        "trial_end": subscription.trial_end,
        "current_period_end": subscription.current_period_end,
        "cancel_at": subscription.cancel_at
    }

@router.get("/billing-portal/{user_id}")
async def get_billing_portal(user_id: str, db: Session = Depends(get_db)):
    """Get Stripe customer portal URL."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        url = StripeHandler.get_customer_portal_url(user_id, db)
        
        if not url:
            raise HTTPException(status_code=400, detail="No active subscription")
        
        return {"portal_url": url}
        
    except Exception as e:
        logger.error(f"Billing portal error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
