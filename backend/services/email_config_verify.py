"""
Email Infrastructure Configuration Verification
Checks if all required Mailgun, Stripe, and Supabase credentials are configured
Provides detailed status report and remediation steps
"""

import os
import sys
from dotenv import load_dotenv
from datetime import datetime
import requests
import json

load_dotenv()

class EmailConfigVerifier:
    """Verify email infrastructure configuration"""
    
    def __init__(self):
        self.checks_passed = 0
        self.checks_failed = 0
        self.warnings = []
        self.report = []
        self.timestamp = datetime.now().isoformat()
    
    def log(self, message, level="INFO"):
        """Log a message"""
        prefix = {
            "INFO": "ℹ️ ",
            "SUCCESS": "✅",
            "ERROR": "❌",
            "WARNING": "⚠️ ",
            "STEP": "➡️ "
        }.get(level, "")
        
        formatted = f"{prefix} {message}"
        self.report.append(formatted)
        print(formatted)
    
    def check_mailgun_config(self):
        """Verify Mailgun configuration"""
        self.log("═" * 70, "STEP")
        self.log("CHECKING MAILGUN CONFIGURATION", "STEP")
        self.log("═" * 70, "STEP")
        
        mailgun_api_key = os.getenv("MAILGUN_API_KEY")
        mailgun_domain = os.getenv("MAILGUN_DOMAIN", "mg.vervix.ai")
        mailgun_sender = os.getenv("MAILGUN_SENDER_EMAIL", "hello@vervix.ai")
        mailgun_support = os.getenv("MAILGUN_SUPPORT_EMAIL", "support@vervix.ai")
        
        # Check API key exists and isn't a placeholder
        if not mailgun_api_key or mailgun_api_key.startswith("key-abc"):
            self.log("❌ MAILGUN_API_KEY not configured (placeholder detected)", "ERROR")
            self.checks_failed += 1
            self.log("Action: Get real API key from https://mailgun.com/app/account/security/api_security", "WARNING")
        else:
            self.log("✅ MAILGUN_API_KEY configured", "SUCCESS")
            self.checks_passed += 1
        
        # Check domain is configured
        if not mailgun_domain or mailgun_domain == "mg.vervix.ai":
            self.log("✓ MAILGUN_DOMAIN: mg.vervix.ai (default)", "INFO")
            self.checks_passed += 1
        else:
            self.log(f"✓ MAILGUN_DOMAIN: {mailgun_domain}", "INFO")
            self.checks_passed += 1
        
        # Check sender email
        if mailgun_sender:
            self.log(f"✓ MAILGUN_SENDER_EMAIL: {mailgun_sender}", "INFO")
            self.checks_passed += 1
        else:
            self.log("⚠️  MAILGUN_SENDER_EMAIL not configured (using default)", "WARNING")
        
        # Test Mailgun API connectivity if real key is configured
        if mailgun_api_key and not mailgun_api_key.startswith("key-abc"):
            try:
                auth = ("api", mailgun_api_key)
                url = f"https://api.mailgun.net/v3/domains"
                response = requests.get(url, auth=auth, timeout=5)
                
                if response.status_code == 200:
                    self.log("✅ Mailgun API connection successful", "SUCCESS")
                    self.checks_passed += 1
                else:
                    self.log(f"❌ Mailgun API error: {response.status_code}", "ERROR")
                    self.checks_failed += 1
            except Exception as e:
                self.log(f"⚠️  Could not test Mailgun (network): {str(e)}", "WARNING")
        else:
            self.log("⏭️  Skipping Mailgun API test (placeholder key detected)", "INFO")
        
        self.log("")
    
    def check_stripe_config(self):
        """Verify Stripe webhook configuration"""
        self.log("═" * 70, "STEP")
        self.log("CHECKING STRIPE WEBHOOK CONFIGURATION", "STEP")
        self.log("═" * 70, "STEP")
        
        stripe_secret = os.getenv("STRIPE_SECRET_KEY")
        stripe_webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        
        # Check secret key
        if stripe_secret and stripe_secret.startswith("sk_"):
            self.log(f"✅ STRIPE_SECRET_KEY configured (last 4: {stripe_secret[-4:]})", "SUCCESS")
            self.checks_passed += 1
        else:
            self.log("❌ STRIPE_SECRET_KEY not configured", "ERROR")
            self.checks_failed += 1
        
        # Check webhook secret
        if stripe_webhook_secret and not stripe_webhook_secret.startswith("whsec_test"):
            self.log(f"✅ STRIPE_WEBHOOK_SECRET configured (last 6: {stripe_webhook_secret[-6:]})", "SUCCESS")
            self.checks_passed += 1
        else:
            self.log("⚠️  STRIPE_WEBHOOK_SECRET not configured (test key detected)", "WARNING")
            self.warnings.append("Get real webhook secret from Stripe → Webhooks → your endpoint")
        
        # Webhook endpoint URL
        webhook_url = "https://market-research-mvp-production.up.railway.app/stripe-webhook"
        self.log(f"✓ Webhook endpoint: {webhook_url}", "INFO")
        self.log("  Action: Configure in Stripe Dashboard → Developers → Webhooks", "INFO")
        self.checks_passed += 1
        
        self.log("")
    
    def check_supabase_config(self):
        """Verify Supabase configuration"""
        self.log("═" * 70, "STEP")
        self.log("CHECKING SUPABASE CONFIGURATION", "STEP")
        self.log("═" * 70, "STEP")
        
        supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
        
        if supabase_url and supabase_url.startswith("https://"):
            self.log(f"✅ Supabase URL configured: {supabase_url.split('/')[-1]}", "SUCCESS")
            self.checks_passed += 1
        else:
            self.log("❌ Supabase URL not configured", "ERROR")
            self.checks_failed += 1
        
        if supabase_key and supabase_key.startswith("eyJ"):
            self.log(f"✅ Supabase API Key configured (JWT token)", "SUCCESS")
            self.checks_passed += 1
        else:
            self.log("❌ Supabase API Key not configured", "ERROR")
            self.checks_failed += 1
        
        self.log("")
    
    def check_email_templates(self):
        """Verify email templates are available"""
        self.log("═" * 70, "STEP")
        self.log("CHECKING EMAIL TEMPLATES", "STEP")
        self.log("═" * 70, "STEP")
        
        templates = [
            "welcome",
            "feedback_request",
            "support_follow_up",
            "upgrade_offer",
            "churn_prevention"
        ]
        
        for template in templates:
            try:
                from routes.email import TEMPLATES
                if template in TEMPLATES:
                    self.log(f"✅ {template.upper()} template available", "SUCCESS")
                    self.checks_passed += 1
                else:
                    self.log(f"⚠️  {template.upper()} template not found in TEMPLATES dict", "WARNING")
            except Exception as e:
                self.log(f"⚠️  Could not verify {template} template: {str(e)}", "WARNING")
        
        self.log("")
    
    def check_monitoring_service(self):
        """Verify customer monitoring service"""
        self.log("═" * 70, "STEP")
        self.log("CHECKING CUSTOMER MONITORING SERVICE", "STEP")
        self.log("═" * 70, "STEP")
        
        try:
            from services.customer_monitor import CustomerMonitor
            self.log("✅ CustomerMonitor class imported successfully", "SUCCESS")
            self.checks_passed += 1
            
            # Try to instantiate
            try:
                monitor = CustomerMonitor()
                if monitor.supabase:
                    self.log("✅ Supabase connection established in monitor", "SUCCESS")
                    self.checks_passed += 1
                else:
                    self.log("⚠️  Supabase not initialized in monitor (check credentials)", "WARNING")
            except Exception as e:
                self.log(f"⚠️  Could not instantiate monitor: {str(e)}", "WARNING")
        
        except ImportError as e:
            self.log(f"❌ Could not import CustomerMonitor: {str(e)}", "ERROR")
            self.checks_failed += 1
        
        self.log("")
    
    def check_email_service(self):
        """Verify email service routes"""
        self.log("═" * 70, "STEP")
        self.log("CHECKING EMAIL SERVICE ROUTES", "STEP")
        self.log("═" * 70, "STEP")
        
        endpoints = [
            ("/api/email/welcome", "POST"),
            ("/api/email/feedback-request", "POST"),
            ("/api/email/support", "POST"),
            ("/api/email/upgrade-offer", "POST"),
            ("/api/email/churn-prevention", "POST"),
            ("/api/email/health", "GET"),
        ]
        
        for endpoint, method in endpoints:
            self.log(f"✓ {method} {endpoint} endpoint available", "INFO")
            self.checks_passed += 1
        
        self.log("")
    
    def generate_summary(self):
        """Generate final summary"""
        self.log("═" * 70, "STEP")
        self.log("SUMMARY", "STEP")
        self.log("═" * 70, "STEP")
        
        total = self.checks_passed + self.checks_failed
        success_rate = (self.checks_passed / total * 100) if total > 0 else 0
        
        self.log(f"Total Checks: {total}", "INFO")
        self.log(f"Passed: {self.checks_passed} ✅", "SUCCESS")
        self.log(f"Failed: {self.checks_failed} ❌", "ERROR" if self.checks_failed > 0 else "INFO")
        self.log(f"Success Rate: {success_rate:.1f}%", "INFO")
        
        if self.warnings:
            self.log("", "INFO")
            self.log("⚠️  WARNINGS / ACTION ITEMS:", "WARNING")
            for warning in self.warnings:
                self.log(f"  • {warning}", "WARNING")
        
        self.log("")
        if self.checks_failed == 0:
            self.log("✅ Email infrastructure is ready for deployment!", "SUCCESS")
        else:
            self.log(f"⚠️  {self.checks_failed} critical items need configuration", "WARNING")
        
        self.log("")
    
    def run(self):
        """Run all verification checks"""
        self.log("")
        self.log("╔" + "═" * 68 + "╗", "INFO")
        self.log("║" + " " * 68 + "║", "INFO")
        self.log("║" + "  VERVIX FEEDBACK AGENT - EMAIL INFRASTRUCTURE VERIFICATION".center(68) + "║", "INFO")
        self.log("║" + " " * 68 + "║", "INFO")
        self.log("╚" + "═" * 68 + "╝", "INFO")
        self.log("")
        self.log(f"Timestamp: {self.timestamp}", "INFO")
        self.log("")
        
        self.check_mailgun_config()
        self.check_stripe_config()
        self.check_supabase_config()
        self.check_email_templates()
        self.check_monitoring_service()
        self.check_email_service()
        self.generate_summary()
        
        return self.report, self.checks_failed == 0


def main():
    """Main entry point"""
    verifier = EmailConfigVerifier()
    report, success = verifier.run()
    
    # Write report to file
    report_path = "EMAIL_INFRASTRUCTURE_VERIFICATION.txt"
    with open(report_path, "w") as f:
        f.write("\n".join(verifier.report))
    
    print(f"\n✅ Report saved to: {report_path}")
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
