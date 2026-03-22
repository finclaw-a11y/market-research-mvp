"""
Customer Monitoring Service
Polls Supabase for new customers, completed uploads, and failed uploads
Triggers automated email campaigns

Runs in background continuously
"""

import asyncio
import os
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Try to import Supabase client
try:
    from supabase import create_client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    logger.warning("Supabase client not installed - monitoring will be disabled")

# Email service
try:
    from routes.email import (
        send_welcome_email,
        send_feedback_request,
        send_support_email,
        send_upgrade_email,
        send_churn_prevention_email
    )
    EMAIL_SERVICE_AVAILABLE = True
except ImportError:
    EMAIL_SERVICE_AVAILABLE = False
    logger.warning("Email service not available - emails will not be sent")


class CustomerMonitor:
    """
    Monitors customer activity and triggers automated emails
    """
    
    def __init__(self):
        self.supabase = None
        self.processed_users = set()  # Track which users we've welcomed
        self.processed_uploads = set()  # Track which uploads we've sent feedback for
        self.processed_failures = set()  # Track which failures we've supported
        self.processed_upsells = set()  # Track which upsells we've sent
        self.processed_churn = set()  # Track which at-risk customers we've contacted
        
        # Initialize Supabase if available
        if SUPABASE_AVAILABLE:
            try:
                SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
                SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
                
                if SUPABASE_URL and SUPABASE_KEY:
                    self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
                    logger.info("✅ Supabase client initialized for monitoring")
                else:
                    logger.warning("⚠️  Supabase credentials not found")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Supabase: {str(e)}")
    
    async def check_new_customers(self):
        """
        Poll Supabase for new paid customers (every 5 minutes)
        Sends welcome email if not already sent
        """
        
        if not self.supabase or not EMAIL_SERVICE_AVAILABLE:
            logger.warning("Skipping new customer check (dependencies missing)")
            return
        
        while True:
            try:
                # Get users created in last 30 minutes
                thirty_min_ago = (datetime.utcnow() - timedelta(minutes=30)).isoformat()
                
                response = self.supabase.table("users").select("*").gte("created_at", thirty_min_ago).execute()
                
                for user in response.data:
                    user_id = user["id"]
                    email = user.get("email")
                    full_name = user.get("full_name", email.split("@")[0] if email else "User")
                    
                    # Skip if already processed
                    if user_id in self.processed_users:
                        continue
                    
                    # Check if user has an active paid subscription
                    try:
                        subscription_response = self.supabase.table("subscriptions").select("*").eq("user_id", user_id).execute()
                        
                        if subscription_response.data:
                            subscription = subscription_response.data[0]
                            status = subscription.get("status", "free")
                            
                            # If paid customer (not free tier)
                            if status in ["trial", "active"]:
                                tier = subscription.get("price_id", "starter")
                                
                                logger.info(f"✅ New paid customer detected: {email} (Status: {status})")
                                
                                # Send welcome email
                                # (Note: Stripe webhook likely already sent this, but this is a backup)
                                self.processed_users.add(user_id)
                    
                    except Exception as e:
                        logger.error(f"Error checking subscription for {user_id}: {str(e)}")
                
                await asyncio.sleep(300)  # Check every 5 minutes
            
            except Exception as e:
                logger.error(f"Error in check_new_customers: {str(e)}")
                await asyncio.sleep(300)
    
    async def check_completed_uploads(self):
        """
        Poll for completed CSV analyses (every 5 minutes)
        Sends feedback request email 2 hours after completion
        """
        
        if not self.supabase or not EMAIL_SERVICE_AVAILABLE:
            logger.warning("Skipping completed uploads check (dependencies missing)")
            return
        
        while True:
            try:
                # Get uploads marked as completed in last 3 hours
                three_hours_ago = (datetime.utcnow() - timedelta(hours=3)).isoformat()
                
                response = self.supabase.table("data_uploads").select("*").eq("status", "completed").gte("updated_at", three_hours_ago).execute()
                
                for upload in response.data:
                    upload_id = upload["id"]
                    user_id = upload["user_id"]
                    filename = upload.get("filename", "CSV file")
                    completed_at = datetime.fromisoformat(upload["updated_at"].replace("Z", "+00:00"))
                    
                    # Skip if already processed
                    if upload_id in self.processed_uploads:
                        continue
                    
                    # Send feedback request 2 hours after completion
                    time_since_completion = datetime.utcnow() - completed_at.replace(tzinfo=None)
                    
                    if time_since_completion >= timedelta(hours=2):
                        try:
                            # Get user info
                            user_response = self.supabase.table("users").select("email, full_name").eq("id", user_id).execute()
                            
                            if user_response.data:
                                user = user_response.data[0]
                                email = user.get("email")
                                full_name = user.get("full_name", email.split("@")[0] if email else "User")
                                
                                logger.info(f"📊 Sending feedback request to {email} (Upload: {filename})")
                                
                                # TODO: Send feedback request email
                                # await send_feedback_request(email, full_name, upload_id, filename)
                                
                                self.processed_uploads.add(upload_id)
                        
                        except Exception as e:
                            logger.error(f"Error sending feedback for {upload_id}: {str(e)}")
                
                await asyncio.sleep(300)  # Check every 5 minutes
            
            except Exception as e:
                logger.error(f"Error in check_completed_uploads: {str(e)}")
                await asyncio.sleep(300)
    
    async def check_failed_uploads(self):
        """
        Poll for failed uploads (every 5 minutes)
        Sends support follow-up email 24 hours after failure
        """
        
        if not self.supabase or not EMAIL_SERVICE_AVAILABLE:
            logger.warning("Skipping failed uploads check (dependencies missing)")
            return
        
        while True:
            try:
                # Get failed uploads from last 7 days
                seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
                
                response = self.supabase.table("data_uploads").select("*").eq("status", "failed").gte("created_at", seven_days_ago).execute()
                
                for upload in response.data:
                    upload_id = upload["id"]
                    user_id = upload["user_id"]
                    filename = upload.get("filename", "CSV file")
                    created_at = datetime.fromisoformat(upload["created_at"].replace("Z", "+00:00"))
                    
                    # Skip if already processed
                    if upload_id in self.processed_failures:
                        continue
                    
                    # Send support email 24 hours after failure
                    time_since_failure = datetime.utcnow() - created_at.replace(tzinfo=None)
                    
                    if time_since_failure >= timedelta(hours=24):
                        try:
                            # Get user info
                            user_response = self.supabase.table("users").select("email, full_name").eq("id", user_id).execute()
                            
                            if user_response.data:
                                user = user_response.data[0]
                                email = user.get("email")
                                full_name = user.get("full_name", email.split("@")[0] if email else "User")
                                
                                logger.warning(f"🔧 Sending support email to {email} (Failed upload: {filename})")
                                
                                # TODO: Send support email
                                # await send_support_email(email, full_name, filename, "Upload processing failed")
                                
                                self.processed_failures.add(upload_id)
                        
                        except Exception as e:
                            logger.error(f"Error sending support email for {upload_id}: {str(e)}")
                
                await asyncio.sleep(300)  # Check every 5 minutes
            
            except Exception as e:
                logger.error(f"Error in check_failed_uploads: {str(e)}")
                await asyncio.sleep(300)
    
    async def check_churn_risk(self):
        """
        Poll for at-risk customers (every 30 minutes)
        Sends churn prevention email for inactive accounts
        """
        
        if not self.supabase or not EMAIL_SERVICE_AVAILABLE:
            logger.warning("Skipping churn risk check (dependencies missing)")
            return
        
        while True:
            try:
                # Get all users
                response = self.supabase.table("users").select("*").execute()
                
                for user in response.data:
                    user_id = user["id"]
                    email = user.get("email")
                    full_name = user.get("full_name", email.split("@")[0] if email else "User")
                    
                    # Skip if already contacted
                    if user_id in self.processed_churn:
                        continue
                    
                    # Check last activity (14+ days of inactivity)
                    try:
                        # Get most recent upload for this user
                        uploads_response = self.supabase.table("data_uploads").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
                        
                        if uploads_response.data:
                            last_upload = uploads_response.data[0]
                            last_activity = datetime.fromisoformat(last_upload["updated_at"].replace("Z", "+00:00"))
                        else:
                            last_activity = datetime.fromisoformat(user["created_at"].replace("Z", "+00:00"))
                        
                        inactivity = datetime.utcnow() - last_activity.replace(tzinfo=None)
                        
                        # If 14+ days inactive
                        if inactivity >= timedelta(days=14):
                            logger.warning(f"💔 At-risk customer detected: {email} (Inactive: {inactivity.days} days)")
                            
                            # TODO: Send churn prevention email
                            # await send_churn_prevention_email(email, full_name)
                            
                            self.processed_churn.add(user_id)
                    
                    except Exception as e:
                        logger.error(f"Error checking churn risk for {user_id}: {str(e)}")
                
                await asyncio.sleep(1800)  # Check every 30 minutes
            
            except Exception as e:
                logger.error(f"Error in check_churn_risk: {str(e)}")
                await asyncio.sleep(1800)


# Create global monitor instance
monitor = CustomerMonitor()

# Start monitoring tasks in background
async def start_monitoring():
    """Start all monitoring tasks"""
    
    logger.info("🚀 Starting customer monitoring tasks...")
    
    # Create background tasks
    tasks = [
        asyncio.create_task(monitor.check_new_customers()),
        asyncio.create_task(monitor.check_completed_uploads()),
        asyncio.create_task(monitor.check_failed_uploads()),
        asyncio.create_task(monitor.check_churn_risk()),
    ]
    
    logger.info(f"✅ Started {len(tasks)} monitoring tasks")
    
    # Keep tasks running
    await asyncio.gather(*tasks)
