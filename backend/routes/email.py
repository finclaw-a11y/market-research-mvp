"""
Email sending service for Vervix customer feedback automation
Handles welcome emails, feedback requests, support follow-ups via Mailgun
"""

import os
import requests
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

router = APIRouter()

MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY")
MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN", "mg.vervix.ai")
MAILGUN_URL = f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages"

def send_email(to_email: str, subject: str, html_body: str, text_body: str = None):
    """
    Send email via Mailgun API
    
    Args:
        to_email: Recipient email
        subject: Email subject
        html_body: HTML email body
        text_body: Plain text fallback (auto-generated if not provided)
    
    Returns:
        True if successful, False otherwise
    """
    
    if not MAILGUN_API_KEY or not MAILGUN_DOMAIN:
        print("⚠️  WARNING: Mailgun credentials not set in environment")
        print(f"  MAILGUN_API_KEY: {'SET' if MAILGUN_API_KEY else 'NOT SET'}")
        print(f"  MAILGUN_DOMAIN: {MAILGUN_DOMAIN}")
        return False
    
    data = {
        "from": "Vervix <hello@vervix.ai>",
        "to": to_email,
        "subject": subject,
        "html": html_body,
        "text": text_body or "See HTML version of this email",
        "o:tracking": "yes",  # Track opens and clicks
        "o:tracking-clicks": "yes"  # Track link clicks
    }
    
    try:
        response = requests.post(
            MAILGUN_URL,
            auth=("api", MAILGUN_API_KEY),
            data=data
        )
        
        if response.status_code == 200:
            print(f"✅ Email sent to {to_email}")
            print(f"   Subject: {subject}")
            print(f"   Mailgun ID: {response.json().get('id', 'N/A')}")
            return True
        else:
            print(f"❌ Email failed to send to {to_email}")
            print(f"   Status: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    
    except Exception as e:
        print(f"❌ Exception sending email to {to_email}: {str(e)}")
        return False


@router.post("/api/email/welcome")
async def send_welcome_email(
    user_email: str,
    user_name: str = "Vervix User",
    subscription_tier: str = "starter"
):
    """Send welcome email to new customer after first payment"""
    
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
            
            <p><strong>Key Features on Your {subscription_tier.upper()} Plan:</strong></p>
            <ul>
                <li>Automated competitive analysis</li>
                <li>Market trend identification</li>
                <li>Data-driven recommendations</li>
                <li>Real-time CSV processing</li>
            </ul>
            
            <p><strong>Need help?</strong> Here are your options:</p>
            <ul>
                <li>📚 <a href="https://vervix.ai/docs" style="color: #6366f1; text-decoration: none;">Read our docs</a></li>
                <li>💬 <a href="mailto:support@vervix.ai" style="color: #6366f1; text-decoration: none;">Reply to this email</a></li>
                <li>🎥 <a href="https://vervix.ai/onboarding" style="color: #6366f1; text-decoration: none;">Watch quick start video</a></li>
            </ul>
            
            <p style="margin-top: 30px;">
                <a href="https://vervix.ai/dashboard" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Go to Dashboard
                </a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px;">
                Looking forward to seeing what you discover!<br>
                <strong>— The Vervix Team</strong><br>
                <a href="https://vervix.ai" style="color: #6366f1; text-decoration: none;">vervix.ai</a>
            </p>
        </div>
    </body>
    </html>
    """
    
    success = send_email(
        user_email,
        "Welcome to Vervix – Your AI Market Research is Ready 🚀",
        html_body
    )
    
    return {
        "success": success,
        "email": user_email,
        "template": "welcome",
        "tier": subscription_tier
    }


@router.post("/api/email/feedback-request")
async def send_feedback_request(
    user_email: str,
    user_name: str = "Vervix User",
    upload_id: str = None,
    filename: str = "CSV file"
):
    """Send feedback request 2 hours after CSV upload completes"""
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">How was your analysis? 📊</h1>
            
            <p>Hi {user_name},</p>
            
            <p>We noticed you just completed a CSV analysis with Vervix. We'd love to know what you think!</p>
            
            <p><strong>Your feedback drives our roadmap.</strong> Take just 2 minutes to share your thoughts:</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Quick Questions:</strong></p>
                <ol style="margin: 0; padding-left: 20px;">
                    <li>Did the insights match your expectations?</li>
                    <li>What would make Vervix more useful for your next analysis?</li>
                    <li>Any missing features?</li>
                </ol>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="https://vervix.ai/feedback?upload_id={upload_id or ''}" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Share Your Feedback
                </a>
            </p>
            
            <p style="color: #666; font-size: 14px;">
                Or just reply to this email — we read every response and act on customer feedback immediately.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px;">
                Thanks for being part of the Vervix community!<br>
                <strong>— The Vervix Team</strong>
            </p>
        </div>
    </body>
    </html>
    """
    
    success = send_email(
        user_email,
        "How was your Vervix analysis? We'd love your feedback",
        html_body
    )
    
    return {
        "success": success,
        "email": user_email,
        "template": "feedback_request",
        "upload_id": upload_id
    }


@router.post("/api/email/support")
async def send_support_email(
    user_email: str,
    user_name: str = "Vervix User",
    filename: str = "your CSV file",
    error_message: str = "File processing failed"
):
    """Send support follow-up 24 hours after failed upload"""
    
    error_snippet = error_message[:150] if len(error_message) > 150 else error_message
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">We're here to help! 🔧</h1>
            
            <p>Hi {user_name},</p>
            
            <p>We noticed your upload of <strong>{filename}</strong> ran into an issue. We want to make sure you get it sorted!</p>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 13px;">
                    <strong>Error:</strong> {error_snippet}
                </p>
            </div>
            
            <p><strong>Here's how we can help:</strong></p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Option 1: Self-Service (5 min)</strong></p>
                <p>Check our <a href="https://vervix.ai/docs/csv-format" style="color: #6366f1; text-decoration: none;">CSV format guide</a> and <a href="https://vervix.ai/docs/errors" style="color: #6366f1; text-decoration: none;">troubleshooting docs</a></p>
                
                <p style="margin-top: 15px;"><strong>Option 2: We'll Help (response within 2 hours)</strong></p>
                <p>Reply to this email with:</p>
                <ul style="margin: 10px 0;">
                    <li>Your CSV file format (.csv, .xlsx, etc.)</li>
                    <li>Approximate file size</li>
                    <li>Any special characters in column names?</li>
                </ul>
                
                <p style="margin-top: 15px;"><strong>Option 3: Priority Support</strong></p>
                <p><a href="https://calendly.com/vervix/support" style="color: #6366f1; text-decoration: none;">Schedule a 1-on-1 with our team</a> (Pro/Enterprise customers get priority)</p>
            </div>
            
            <p><strong>We're committed to making Vervix work for you.</strong> Don't hesitate to reach out!</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px;">
                <strong>— Support Team</strong><br>
                Email: <a href="mailto:support@vervix.ai" style="color: #6366f1; text-decoration: none;">support@vervix.ai</a><br>
                <a href="https://vervix.ai" style="color: #6366f1; text-decoration: none;">vervix.ai</a>
            </p>
        </div>
    </body>
    </html>
    """
    
    success = send_email(
        user_email,
        "Any issues with Vervix? Let's fix it 🔧",
        html_body
    )
    
    return {
        "success": success,
        "email": user_email,
        "template": "support",
        "filename": filename
    }


@router.post("/api/email/upgrade-offer")
async def send_upgrade_email(
    user_email: str,
    user_name: str = "Vervix User",
    current_tier: str = "starter"
):
    """Send plan upgrade email (Pro) after 7 days of hitting limits"""
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">You're ready to level up! 🚀</h1>
            
            <p>Hi {user_name},</p>
            
            <p>You've been making great use of Vervix on your <strong>{current_tier.upper()}</strong> plan! We noticed you're approaching your market limit. Ready to go bigger?</p>
            
            <p><strong>Why Pro Makes Sense for You:</strong></p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #f3f4f6;">
                    <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">Feature</th>
                    <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">Starter</th>
                    <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">Pro</th>
                </tr>
                <tr>
                    <td style="border: 1px solid #d1d5db; padding: 12px;">Markets Analyzed</td>
                    <td style="border: 1px solid #d1d5db; padding: 12px;">1-2</td>
                    <td style="border: 1px solid #d1d5db; padding: 12px;"><strong style="color: #6366f1;">5-10 ✨</strong></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #d1d5db; padding: 12px;">Advanced Reports</td>
                    <td style="border: 1px solid #d1d5db; padding: 12px;">Basic</td>
                    <td style="border: 1px solid #d1d5db; padding: 12px;"><strong style="color: #6366f1;">Advanced 📈</strong></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #d1d5db; padding: 12px;">User Seats</td>
                    <td style="border: 1px solid #d1d5db; padding: 12px;">1</td>
                    <td style="border: 1px solid #d1d5db; padding: 12px;"><strong style="color: #6366f1;">3 👥</strong></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #d1d5db; padding: 12px;">API Access</td>
                    <td style="border: 1px solid #d1d5db; padding: 12px;">❌</td>
                    <td style="border: 1px solid #d1d5db; padding: 12px;"><strong style="color: #6366f1;">✅</strong></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #d1d5db; padding: 12px;">Priority Support</td>
                    <td style="border: 1px solid #d1d5db; padding: 12px;">❌</td>
                    <td style="border: 1px solid #d1d5db; padding: 12px;"><strong style="color: #6366f1;">✅</strong></td>
                </tr>
            </table>
            
            <div style="background: #dbeafe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #075985;">
                    <strong>Special Offer:</strong> Upgrade today and we'll include a free strategic consultation ($500 value) to help you get the most out of Pro features!
                </p>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="https://vervix.ai/upgrade/pro" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Upgrade to Pro Now
                </a>
            </p>
            
            <p>Or <a href="https://calendly.com/vervix/upgrade" style="color: #6366f1; text-decoration: none;">book a quick call</a> to discuss what makes sense for your needs.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px;">
                Let's keep pushing your competitive intelligence forward!<br>
                <strong>— The Vervix Team</strong>
            </p>
        </div>
    </body>
    </html>
    """
    
    success = send_email(
        user_email,
        "Unlock more markets with Vervix Pro 🚀",
        html_body
    )
    
    return {
        "success": success,
        "email": user_email,
        "template": "upgrade_offer",
        "current_tier": current_tier
    }


@router.post("/api/email/churn-prevention")
async def send_churn_prevention_email(
    user_email: str,
    user_name: str = "Vervix User"
):
    """Send 'we miss you' email after 14 days of inactivity"""
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">We want to hear what we're missing 💔</h1>
            
            <p>Hi {user_name},</p>
            
            <p>We noticed you haven't been using Vervix lately. We're curious — did something not work out?</p>
            
            <p><strong>We'd genuinely love to hear:</strong></p>
            <ul style="margin: 15px 0;">
                <li>😕 <strong>Was something broken or confusing?</strong></li>
                <li>🤔 <strong>Did the insights not match your needs?</strong></li>
                <li>💰 <strong>Was the pricing not right for your use case?</strong></li>
                <li>📅 <strong>Was it just not the right time?</strong></li>
            </ul>
            
            <p style="margin-top: 20px;"><strong>Your honest feedback helps us get better.</strong> Even if you decide not to continue, we want to understand why.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin-top: 0;"><strong>Let's chat:</strong></p>
                <p>
                    <a href="https://vervix.ai/feedback/churn" style="background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Share Your Feedback
                    </a>
                </p>
                <p style="margin: 15px 0 0 0; font-size: 13px; color: #666;">Or reply to this email. I read every response personally.</p>
            </div>
            
            <p><strong>If cost is the issue:</strong></p>
            <ul>
                <li>💬 We can discuss custom pricing for your use case</li>
                <li>🆓 Try our free tier (no card required)</li>
                <li>⏸️ Pause your subscription for 60 days (no cancellation)</li>
            </ul>
            
            <p><strong>If something broke:</strong></p>
            <ul>
                <li>🔧 Let us know and we'll fix it immediately</li>
                <li>📞 <a href="https://calendly.com/vervix/support" style="color: #6366f1; text-decoration: none;">Schedule a call with our support team</a></li>
            </ul>
            
            <p style="margin-top: 25px; font-size: 16px; color: #6366f1;"><strong>Vervix was built for teams like yours. Let's figure out how to make it work.</strong></p>
            
            <p style="text-align: center; margin: 20px 0;">
                <a href="https://vervix.ai/reactivate" style="color: #6366f1; text-decoration: underline; margin-right: 20px;">Interested in staying?</a>
                <a href="https://vervix.ai/pause" style="color: #6366f1; text-decoration: underline;">Want to pause instead?</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px;">
                Looking forward to hearing from you.<br>
                <strong>— The Vervix Team</strong>
            </p>
        </div>
    </body>
    </html>
    """
    
    success = send_email(
        user_email,
        "We want to hear what we're missing 💔",
        html_body
    )
    
    return {
        "success": success,
        "email": user_email,
        "template": "churn_prevention"
    }


# Health check endpoint
@router.get("/api/email/health")
async def email_health():
    """Check if email service is configured correctly"""
    
    mailgun_ready = bool(MAILGUN_API_KEY and MAILGUN_DOMAIN)
    
    return {
        "service": "Mailgun",
        "configured": mailgun_ready,
        "domain": MAILGUN_DOMAIN if mailgun_ready else "NOT SET",
        "api_key_last_4": MAILGUN_API_KEY[-4:] if MAILGUN_API_KEY else "NOT SET",
        "timestamp": datetime.utcnow().isoformat()
    }
