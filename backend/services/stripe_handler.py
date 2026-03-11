import stripe
import os
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from models import Subscription, User
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")

# Price IDs (set these in your Stripe dashboard)
STRIPE_PRICE_ID = os.getenv("STRIPE_PRICE_ID", "price_1234567890")  # $99/month
STRIPE_FREE_TRIAL_DAYS = 7

class StripeHandler:
    """
    Handle Stripe subscription operations.
    """
    
    @staticmethod
    def create_customer(user: User, db: Session) -> str:
        """Create a Stripe customer for the user."""
        try:
            customer = stripe.Customer.create(
                email=user.email,
                name=user.full_name or user.email,
                metadata={"user_id": user.id}
            )
            
            logger.info(f"Created Stripe customer {customer.id} for user {user.id}")
            return customer.id
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe customer creation error: {str(e)}")
            raise Exception(f"Failed to create customer: {str(e)}")
    
    @staticmethod
    def create_subscription(
        user: User,
        db: Session,
        trial_days: int = STRIPE_FREE_TRIAL_DAYS
    ) -> Dict[str, Any]:
        """
        Create a subscription for user with free trial.
        """
        try:
            # Get or create Stripe customer
            subscription = db.query(Subscription).filter(Subscription.user_id == user.id).first()
            
            if not subscription:
                subscription = Subscription(id=os.urandom(16).hex(), user_id=user.id)
                db.add(subscription)
                db.commit()
            
            if not subscription.stripe_customer_id:
                customer_id = StripeHandler.create_customer(user, db)
                subscription.stripe_customer_id = customer_id
                db.commit()
            else:
                customer_id = subscription.stripe_customer_id
            
            # Create subscription with free trial
            stripe_subscription = stripe.Subscription.create(
                customer=customer_id,
                items=[{"price": STRIPE_PRICE_ID}],
                trial_period_days=trial_days,
                payment_behavior="default_incomplete",
                expand=["latest_invoice.payment_intent"]
            )
            
            # Update subscription in database
            subscription.stripe_subscription_id = stripe_subscription.id
            subscription.status = "trial"
            subscription.current_period_start = datetime.fromtimestamp(
                stripe_subscription.current_period_start, tz=timezone.utc
            )
            subscription.current_period_end = datetime.fromtimestamp(
                stripe_subscription.current_period_end, tz=timezone.utc
            )
            subscription.trial_end = datetime.fromtimestamp(
                stripe_subscription.trial_end, tz=timezone.utc
            ) if stripe_subscription.trial_end else None
            
            db.commit()
            
            logger.info(f"Created Stripe subscription {stripe_subscription.id} for user {user.id}")
            
            return {
                "subscription_id": stripe_subscription.id,
                "status": "trial",
                "trial_end": stripe_subscription.trial_end,
                "current_period_end": stripe_subscription.current_period_end
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe subscription creation error: {str(e)}")
            raise Exception(f"Failed to create subscription: {str(e)}")
    
    @staticmethod
    def handle_webhook(event: Dict[str, Any], db: Session) -> bool:
        """
        Handle Stripe webhook events.
        """
        try:
            event_type = event.get("type")
            data = event.get("data", {}).get("object", {})
            
            if event_type == "customer.subscription.updated":
                StripeHandler._handle_subscription_updated(data, db)
            elif event_type == "customer.subscription.deleted":
                StripeHandler._handle_subscription_deleted(data, db)
            elif event_type == "invoice.paid":
                StripeHandler._handle_invoice_paid(data, db)
            elif event_type == "invoice.payment_failed":
                StripeHandler._handle_invoice_failed(data, db)
            
            logger.info(f"Handled Stripe event: {event_type}")
            return True
            
        except Exception as e:
            logger.error(f"Webhook handling error: {str(e)}")
            return False
    
    @staticmethod
    def _handle_subscription_updated(data: Dict[str, Any], db: Session):
        """Handle subscription.updated event."""
        subscription_id = data.get("id")
        status = data.get("status")  # active, past_due, cancelled, etc.
        
        subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_id
        ).first()
        
        if subscription:
            subscription.status = status
            subscription.current_period_start = datetime.fromtimestamp(
                data.get("current_period_start"), tz=timezone.utc
            )
            subscription.current_period_end = datetime.fromtimestamp(
                data.get("current_period_end"), tz=timezone.utc
            )
            db.commit()
    
    @staticmethod
    def _handle_subscription_deleted(data: Dict[str, Any], db: Session):
        """Handle subscription.deleted event."""
        subscription_id = data.get("id")
        
        subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_id
        ).first()
        
        if subscription:
            subscription.status = "cancelled"
            db.commit()
    
    @staticmethod
    def _handle_invoice_paid(data: Dict[str, Any], db: Session):
        """Handle invoice.paid event."""
        logger.info(f"Invoice paid: {data.get('id')}")
    
    @staticmethod
    def _handle_invoice_failed(data: Dict[str, Any], db: Session):
        """Handle invoice.payment_failed event."""
        logger.warning(f"Invoice payment failed: {data.get('id')}")
    
    @staticmethod
    def get_customer_portal_url(user_id: str, db: Session) -> Optional[str]:
        """Get Stripe customer portal URL for managing subscriptions."""
        try:
            subscription = db.query(Subscription).filter(
                Subscription.user_id == user_id
            ).first()
            
            if not subscription or not subscription.stripe_customer_id:
                return None
            
            session = stripe.billing_portal.Session.create(
                customer=subscription.stripe_customer_id,
                return_url=os.getenv("FRONTEND_URL", "http://localhost:3000") + "/settings"
            )
            
            return session.url
            
        except stripe.error.StripeError as e:
            logger.error(f"Customer portal error: {str(e)}")
            return None
    
    @staticmethod
    def verify_webhook_signature(payload: bytes, sig_header: str) -> bool:
        """Verify Stripe webhook signature."""
        try:
            webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
            stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
            return True
        except stripe.error.SignatureVerificationError:
            return False
        except Exception as e:
            logger.error(f"Webhook verification error: {str(e)}")
            return False
