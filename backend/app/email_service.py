"""
Email service for sending password reset emails
"""
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from datetime import datetime
from app.logging_config import get_logger

logger = get_logger("email_service")

class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username)
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5174")
        
        # Check if email is configured
        self.is_configured = bool(self.smtp_username and self.smtp_password)
        
        if not self.is_configured:
            logger.warning("Email service not configured - SMTP credentials missing")
    
    def create_reset_email_html(self, username: str, reset_token: str) -> str:
        """Create HTML email content for password reset"""
        reset_link = f"{self.frontend_url}/reset-password?token={reset_token}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                    font-weight: bold;
                }}
                .button:hover {{
                    opacity: 0.9;
                }}
                .footer {{
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    font-size: 12px;
                    color: #666;
                }}
                .warning {{
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🔐 Reset Your Password</h1>
                <p>Auth System</p>
            </div>
            
            <div class="content">
                <h2>Hi {username},</h2>
                
                <p>You requested to reset your password for your Auth System account. Click the button below to reset your password:</p>
                
                <div style="text-align: center;">
                    <a href="{reset_link}" class="button">Reset Password</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
                    {reset_link}
                </p>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong>
                    <ul>
                        <li>This link will expire in <strong>30 minutes</strong></li>
                        <li>You can only use this link once</li>
                        <li>If you didn't request this, please ignore this email</li>
                    </ul>
                </div>
                
                <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
                
                <p>Best regards,<br>
                <strong>Auth System Team</strong></p>
            </div>
            
            <div class="footer">
                <p>This email was sent to you because a password reset was requested for your account.</p>
                <p>If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>
                <p>© 2025 Auth System. All rights reserved.</p>
            </div>
        </body>
        </html>
        """
        return html_content
    
    def create_reset_email_text(self, username: str, reset_token: str) -> str:
        """Create plain text email content for password reset"""
        reset_link = f"{self.frontend_url}/reset-password?token={reset_token}"
        
        text_content = f"""
Reset Your Password - Auth System

Hi {username},

You requested to reset your password for your Auth System account.

Click the link below to reset your password:
{reset_link}

IMPORTANT:
- This link will expire in 30 minutes
- You can only use this link once
- If you didn't request this, please ignore this email

If you're having trouble with the link, copy and paste it into your web browser.

Best regards,
Auth System Team

---
This email was sent because a password reset was requested for your account.
If you did not request this, please ignore this email or contact support.

© 2025 Auth System. All rights reserved.
        """
        return text_content.strip()
    
    async def send_reset_email(self, email: str, username: str, reset_token: str) -> bool:
        """
        Send password reset email
        Returns True if sent successfully, False otherwise
        """
        if not self.is_configured:
            logger.error("Cannot send email - SMTP not configured")
            # For development, log the reset link
            reset_link = f"{self.frontend_url}/reset-password?token={reset_token}"
            logger.info(f"Password reset link for {email}: {reset_link}")
            return False
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = "Reset Your Password - Auth System"
            msg['From'] = self.from_email
            msg['To'] = email
            msg['Date'] = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S +0000')
            
            # Create text and HTML versions
            text_content = self.create_reset_email_text(username, reset_token)
            html_content = self.create_reset_email_html(username, reset_token)
            
            # Attach parts
            text_part = MIMEText(text_content, 'plain', 'utf-8')
            html_part = MIMEText(html_content, 'html', 'utf-8')
            
            msg.attach(text_part)
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Password reset email sent successfully to {email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send password reset email to {email}: {e}")
            # For development, still log the reset link
            reset_link = f"{self.frontend_url}/reset-password?token={reset_token}"
            logger.info(f"Password reset link for {email}: {reset_link}")
            return False
    
    def test_connection(self) -> bool:
        """Test SMTP connection"""
        if not self.is_configured:
            return False
        
        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
            logger.info("SMTP connection test successful")
            return True
        except Exception as e:
            logger.error(f"SMTP connection test failed: {e}")
            return False

# Global email service instance
email_service = EmailService()

async def send_password_reset_email(email: str, username: str, reset_token: str) -> bool:
    """
    Convenience function to send password reset email
    """
    return await email_service.send_reset_email(email, username, reset_token)

