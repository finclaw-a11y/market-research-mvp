from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from models import User, Subscription
from services.stripe_handler import StripeHandler
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])

@router.post("/webhook")
async def handle_stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle incoming Stripe webhooks.
    Verify signature and process events.
    """
    try:
        # Get raw body and signature
        body = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        # Verify signature
        if not StripeHandler.verify_webhook_signature(body, sig_header):
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Parse event
        import json
        event = json.loads(body)
        
        # Handle event
        success = StripeHandler.handle_webhook(event, db)
        
        if success:
            return {"received": True}
        else:
            raise HTTPException(status_code=400, detail="Event handling failed")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/trial/{user_id}")
async def start_free_trial(user_id: str, db: Session = Depends(get_db)):
    """
    Start a free trial for a user.
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create subscription with trial
        result = StripeHandler.create_subscription(user, db, trial_days=7)
        
        return {
            "message": "Free trial started",
            "subscription": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Trial start error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{user_id}")
async def get_subscription_status(user_id: str, db: Session = Depends(get_db)):
    """
    Get subscription status for user.
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        subscription = db.query(Subscription).filter(
            Subscription.user_id == user_id
        ).first()
        
        if not subscription:
            return {
                "subscription_status": "free",
                "details": None
            }
        
        return {
            "subscription_status": subscription.status,
            "details": {
                "stripe_subscription_id": subscription.stripe_subscription_id,
                "current_period_start": subscription.current_period_start,
                "current_period_end": subscription.current_period_end,
                "trial_end": subscription.trial_end,
                "cancel_at": subscription.cancel_at
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Status check error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cancel/{user_id}")
async def cancel_subscription(user_id: str, db: Session = Depends(get_db)):
    """
    Cancel subscription for user.
    """
    try:
        subscription = db.query(Subscription).filter(
            Subscription.user_id == user_id
        ).first()
        
        if not subscription or not subscription.stripe_subscription_id:
            raise HTTPException(status_code=400, detail="No active subscription")
        
        # Cancel on Stripe
        import stripe
        import os
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        
        stripe.Subscription.delete(subscription.stripe_subscription_id)
        
        # Update local record
        subscription.status = "cancelled"
        db.commit()
        
        logger.info(f"Subscription cancelled: {user_id}")
        
        return {"message": "Subscription cancelled"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cancel subscription error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
