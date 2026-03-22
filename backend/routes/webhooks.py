"""
Webhook handlers for Stripe payment events
Triggers customer welcome emails and subscription tracking
"""

import os
import json
import stripe
from fastapi import APIRouter, Request, HTTPException
from dotenv import load_dotenv
from datetime import datetime
import logging

load_dotenv()

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Stripe configuration
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# Import email service
try:
    from routes.email import (
        send_email,
        send_welcome_email,
        send_feedback_request,
        send_support_email
    )
except ImportError:
    logger.warning("Could not import email service - emails will not be sent")
    send_welcome_email = None


@router.post("/stripe-webhook")
async def handle_stripe_webhook(request: Request):
    """
    Handle Stripe webhooks for payment events
    
    Listens for:
    - charge.succeeded: Payment completed → send welcome email
    - charge.failed: Payment failed → log for follow-up
    - customer.subscription.created: New subscription
    - customer.subscription.updated: Subscription changes
    """
    
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    # Verify webhook signature
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        logger.error(f"Invalid payload: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    logger.info(f"Stripe webhook received: {event['type']}")
    
    # Handle charge.succeeded (payment completed)
    if event["type"] == "charge.succeeded":
        return await handle_charge_succeeded(event)
    
    # Handle charge.failed (payment failed)
    elif event["type"] == "charge.failed":
        return await handle_charge_failed(event)
    
    # Handle customer.subscription.created (new subscription)
    elif event["type"] == "customer.subscription.created":
        return await handle_subscription_created(event)
    
    # Handle customer.subscription.deleted (subscription cancelled)
    elif event["type"] == "customer.subscription.deleted":
        return await handle_subscription_deleted(event)
    
    else:
        logger.info(f"Unhandled event type: {event['type']}")
        return {"status": "received", "event_type": event["type"]}


async def handle_charge_succeeded(event):
    """
    Handle successful payment
    Sends welcome email to new customer
    """
    
    charge = event["data"]["object"]
    customer_id = charge.get("customer")
    email = charge.get("receipt_email")
    amount = charge.get("amount", 0) / 100  # Convert cents to dollars
    currency = charge.get("currency", "usd").upper()
    charge_id = charge.get("id")
    
    logger.info(f"✅ Payment succeeded: {email}, Amount: ${amount} {currency}")
    
    if not email:
        logger.warning(f"No email found for charge {charge_id}")
        return {"status": "success", "warning": "No email found"}
    
    try:
        # Get customer details from Stripe
        customer = stripe.Customer.retrieve(customer_id)
        user_name = customer.metadata.get("user_name", email.split("@")[0])
        subscription_tier = customer.metadata.get("plan", "starter")
        
        logger.info(f"Customer metadata: name={user_name}, tier={subscription_tier}")
        
        # Send welcome email if email service is available
        if send_welcome_email:
            from routes.email import send_email as email_send_func
            
            html_body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #6366f1;">Welcome to Vervix! 🎉</h1>
                    
                    <p>Hi {user_name},</p>
                    
                    <p>We're thrilled to have you on board with the <strong style="color: #6366f1;">{subscription_tier.upper()}</strong> plan!</p>
                    
                    <p><strong>Here's what you can do right now:</strong></p>
                    
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <ol style="margin: 0; padding-left: 20px;">
                            <li>Go to your <a href="https://vervix.ai/dashboard" style="color: #6366f1; text-decoration: none;"><strong>Dashboard</strong></a></li>
                            <li>Click <strong>"Upload CSV"</strong></li>
                            <li>Select your market data file</li>
                            <li>Click <strong>"Analyze"</strong> and watch the magic happen ✨</li>
                        </ol>
                    </div>
                    
                    <p><strong>Need help?</strong> Reply to this email or check our <a href="https://vervix.ai/docs" style="color: #6366f1; text-decoration: none;">documentation</a>.</p>
                    
                    <p>Welcome aboard!</p>
                    
                    <p>— The Vervix Team<br>
                    <a href="https://vervix.ai" style="color: #6366f1; text-decoration: none;">vervix.ai</a></p>
                </div>
            </body>
            </html>
            """
            
            email_success = email_send_func(
                to_email=email,
                subject="Welcome to Vervix – Your AI Market Research is Ready 🚀",
                html_body=html_body
            )
            
            if email_success:
                logger.info(f"✅ Welcome email sent to {email}")
            else:
                logger.error(f"❌ Failed to send welcome email to {email}")
        
        return {
            "status": "success",
            "event_type": "charge.succeeded",
            "email_sent": True if send_welcome_email else False,
            "customer_email": email,
            "amount": f"${amount} {currency}",
            "charge_id": charge_id
        }
    
    except Exception as e:
        logger.error(f"Error processing charge: {str(e)}")
        return {
            "status": "error",
            "event_type": "charge.succeeded",
            "error": str(e)
        }


async def handle_charge_failed(event):
    """
    Handle failed payment
    Logs for manual follow-up
    """
    
    charge = event["data"]["object"]
    email = charge.get("receipt_email")
    amount = charge.get("amount", 0) / 100
    reason = charge.get("failure_reason", "Unknown")
    
    logger.warning(f"❌ Payment failed: {email}, Amount: ${amount}, Reason: {reason}")
    
    return {
        "status": "logged",
        "event_type": "charge.failed",
        "email": email,
        "reason": reason
    }


async def handle_subscription_created(event):
    """
    Handle new subscription
    """
    
    subscription = event["data"]["object"]
    customer_id = subscription.get("customer")
    status = subscription.get("status")
    
    logger.info(f"✅ New subscription created: customer_id={customer_id}, status={status}")
    
    try:
        customer = stripe.Customer.retrieve(customer_id)
        email = customer.email
        
        logger.info(f"Subscription created for: {email}")
        
        return {
            "status": "logged",
            "event_type": "customer.subscription.created",
            "customer_email": email,
            "subscription_status": status
        }
    
    except Exception as e:
        logger.error(f"Error handling subscription creation: {str(e)}")
        return {
            "status": "error",
            "event_type": "customer.subscription.created",
            "error": str(e)
        }


async def handle_subscription_deleted(event):
    """
    Handle subscription cancellation
    """
    
    subscription = event["data"]["object"]
    customer_id = subscription.get("customer")
    
    logger.warning(f"⚠️  Subscription cancelled: customer_id={customer_id}")
    
    try:
        customer = stripe.Customer.retrieve(customer_id)
        email = customer.email
        
        logger.warning(f"Subscription cancelled for: {email}")
        
        return {
            "status": "logged",
            "event_type": "customer.subscription.deleted",
            "customer_email": email
        }
    
    except Exception as e:
        logger.error(f"Error handling subscription deletion: {str(e)}")
        return {
            "status": "error",
            "event_type": "customer.subscription.deleted",
            "error": str(e)
        }


@router.get("/stripe-webhook-health")
async def webhook_health():
    """Check if Stripe webhook is configured"""
    
    webhook_configured = bool(STRIPE_WEBHOOK_SECRET)
    
    return {
        "service": "Stripe Webhooks",
        "configured": webhook_configured,
        "secret_last_6": STRIPE_WEBHOOK_SECRET[-6:] if STRIPE_WEBHOOK_SECRET else "NOT SET",
        "timestamp": datetime.utcnow().isoformat()
    }
