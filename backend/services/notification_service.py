"""
Notification service for User-Employee Assignment system
Handles email notifications and in-app notifications
"""
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import string
import structlog

from app.models import Notification, EmailLog, User, HREmployee
from app.schemas import NotificationCreate, EmailLogCreate

logger = structlog.get_logger()
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import string

from app.models import Notification, EmailLog, User, HREmployee
from app.schemas import NotificationCreate, EmailLogCreate
import structlog

logger = structlog.get_logger()

class NotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_username = os.getenv('SMTP_USERNAME', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.from_email = os.getenv('FROM_EMAIL', self.smtp_username)
        self.frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3001')
        
    def generate_temporary_password(self, length: int = 12) -> str:
        """Generate a secure temporary password"""
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        password = ''.join(secrets.choice(alphabet) for i in range(length))
        return password

    async def notify_employee_added(self, employee_id: int, hr_user_id: str) -> Dict[str, bool]:
        """
        Send notifications when HR adds a new employee
        Returns dict of notification success status
        """
        results = {}
        
        try:
            # Get employee details
            employee = self.db.query(HREmployee).filter(HREmployee.employee_id == employee_id).first()
            if not employee:
                logger.error(f"Employee not found: {employee_id}")
                return {"error": True, "message": "Employee not found"}
            
            # Get HR user details
            hr_user = self.db.query(User).filter(User.id == hr_user_id).first()
            hr_name = hr_user.username if hr_user else "HR Manager"
            
            # Get all system admins and superadmins
            system_admins = self.db.query(User).filter(
                User.role.in_(["system_admin", "superadmin"]),
                User.is_active == True
            ).all()
            
            # Send email notifications to system admins
            for admin in system_admins:
                email_sent = await self._send_system_admin_notification_email(
                    admin_email=admin.email,
                    employee=employee,
                    hr_manager_name=hr_name
                )
                results[f"email_to_{admin.username}"] = email_sent
                
                # Create in-app notification
                notification_created = await self._create_in_app_notification(
                    recipient_user_id=admin.id,
                    notification_type="employee_added",
                    title="🆕 New Employee Requires User Account",
                    message=f"Employee {employee.first_name} {employee.last_name} ({employee.position}, {employee.department}) needs a user account assignment.",
                    action_url=f"/system-admin/pending-assignments",
                    employee_id=employee_id
                )
                results[f"notification_to_{admin.username}"] = notification_created
            
            logger.info(f"Employee addition notifications sent for {employee.first_name} {employee.last_name}", 
                       employee_id=employee_id, results=results)
            
        except Exception as e:
            logger.error(f"Failed to send employee addition notifications: {str(e)}")
            results["error"] = True
            results["message"] = str(e)
            
        return results

    async def notify_user_assigned(self, employee_id: int, user_id: str, admin_user_id: str, 
                                  temporary_password: Optional[str] = None) -> Dict[str, bool]:
        """
        Send notifications when system admin assigns user to employee
        Returns dict of notification success status
        """
        results = {}
        
        try:
            # Get employee and user details
            employee = self.db.query(HREmployee).filter(HREmployee.employee_id == employee_id).first()
            user = self.db.query(User).filter(User.id == user_id).first()
            admin = self.db.query(User).filter(User.id == admin_user_id).first()
            
            if not all([employee, user, admin]):
                return {"error": True, "message": "Required records not found"}
            
            # Send welcome email to employee
            if employee.contact_phone or user.email:  # Use employee email if available, fallback to user email
                recipient_email = user.email  # For now, use user email
                email_sent = await self._send_employee_welcome_email(
                    employee=employee,
                    user=user,
                    recipient_email=recipient_email,
                    temporary_password=temporary_password
                )
                results["welcome_email_to_employee"] = email_sent
            
            # Send confirmation email to HR managers
            hr_managers = self.db.query(User).filter(
                User.role == "hr",
                User.is_active == True
            ).all()
            
            for hr_manager in hr_managers:
                email_sent = await self._send_hr_confirmation_email(
                    hr_email=hr_manager.email,
                    employee=employee,
                    user=user,
                    admin_name=admin.username
                )
                results[f"confirmation_email_to_{hr_manager.username}"] = email_sent
                
                # Create in-app notification for HR
                notification_created = await self._create_in_app_notification(
                    recipient_user_id=hr_manager.id,
                    notification_type="assignment_completed",
                    title="✅ User Account Assigned",
                    message=f"User account '{user.username}' has been assigned to {employee.first_name} {employee.last_name} with role '{user.role}'.",
                    action_url=f"/hr/employees/{employee_id}",
                    employee_id=employee_id,
                    user_id=user_id
                )
                results[f"notification_to_{hr_manager.username}"] = notification_created
            
            logger.info(f"User assignment notifications sent", 
                       employee_id=employee_id, user_id=user_id, results=results)
            
        except Exception as e:
            logger.error(f"Failed to send user assignment notifications: {str(e)}")
            results["error"] = True
            results["message"] = str(e)
            
        return results

    async def _send_system_admin_notification_email(self, admin_email: str, employee: HREmployee, 
                                                   hr_manager_name: str) -> bool:
        """Send email notification to system admin about new employee"""
        try:
            subject = "🆕 New Employee Requires User Account Assignment"
            
            body = f"""
            <html>
            <head><style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                .header {{ color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }}
                .employee-info {{ background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }}
                .action-button {{ display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }}
                .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }}
            </style></head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🆕 New Employee Added</h1>
                        <p>A new employee has been added to the system and requires a user account assignment.</p>
                    </div>
                    
                    <div class="employee-info">
                        <h3>Employee Details:</h3>
                        <ul>
                            <li><strong>Name:</strong> {employee.first_name} {employee.last_name}</li>
                            <li><strong>Position:</strong> {employee.position or 'Not specified'}</li>
                            <li><strong>Department:</strong> {employee.department or 'Not specified'}</li>
                            <li><strong>Employee Code:</strong> {employee.emp_code}</li>
                            <li><strong>Added by:</strong> {hr_manager_name}</li>
                            <li><strong>Date Added:</strong> {employee.created_at.strftime('%B %d, %Y at %H:%M')}</li>
                        </ul>
                    </div>
                    
                    <p><strong>Action Required:</strong></p>
                    <p>Please log in to the system to assign a user account and appropriate role to this employee.</p>
                    
                    <a href="{self.frontend_url}/system-admin/pending-assignments" class="action-button">
                        Assign User Account
                    </a>
                    
                    <div class="footer">
                        <p>Best regards,<br>SME Management System</p>
                        <p><em>This is an automated notification. Please do not reply to this email.</em></p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Send email
            success = await self._send_email(admin_email, subject, body, is_html=True)
            
            # Log email attempt
            await self._log_email(
                template_name="system_admin_notification",
                recipient_email=admin_email,
                subject=subject,
                status="sent" if success else "failed",
                employee_id=employee.employee_id
            )
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to send system admin notification email: {str(e)}")
            return False

    async def _send_employee_welcome_email(self, employee: HREmployee, user: User, 
                                         recipient_email: str, temporary_password: Optional[str]) -> bool:
        """Send welcome email to employee with login credentials"""
        try:
            subject = f"🎉 Welcome to SME Management System - Your Account is Ready!"
            
            password_info = ""
            if temporary_password:
                password_info = f"""
                    <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 15px 0;">
                        <p><strong>🔑 Your Login Credentials:</strong></p>
                        <ul>
                            <li><strong>Username:</strong> {user.username}</li>
                            <li><strong>Temporary Password:</strong> <code style="background-color: #374151; color: #f3f4f6; padding: 4px 8px; border-radius: 4px;">{temporary_password}</code></li>
                            <li><strong>Login URL:</strong> <a href="{self.frontend_url}/login">{self.frontend_url}/login</a></li>
                        </ul>
                        <p><strong>⚠️ Important:</strong> Please change your password immediately after your first login for security.</p>
                    </div>
                """
            
            body = f"""
            <html>
            <head><style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                .header {{ color: #059669; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }}
                .welcome-info {{ background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }}
                .next-steps {{ background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }}
                .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }}
            </style></head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to Our Organization!</h1>
                        <p>Dear {employee.first_name} {employee.last_name},</p>
                        <p>Your system account has been created and is ready to use.</p>
                    </div>
                    
                    <div class="welcome-info">
                        <h3>Account Information:</h3>
                        <ul>
                            <li><strong>Your Role:</strong> {self._get_role_display_name(user.role)}</li>
                            <li><strong>Department:</strong> {employee.department or 'Not specified'}</li>
                            <li><strong>Position:</strong> {employee.position or 'Not specified'}</li>
                        </ul>
                    </div>
                    
                    {password_info}
                    
                    <div class="next-steps">
                        <h3>📋 Next Steps:</h3>
                        <ol>
                            <li>Click the login link above</li>
                            <li>Enter your username and password</li>
                            <li>Change your password on first login</li>
                            <li>Complete your profile information</li>
                            <li>Explore the system features available to your role</li>
                        </ol>
                    </div>
                    
                    <p>If you need any assistance or have questions about using the system, please contact the IT support team.</p>
                    
                    <div class="footer">
                        <p>Welcome aboard!<br>
                        <strong>HR Department</strong></p>
                        <p><em>This is an automated notification. Please contact HR if you have any questions.</em></p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Send email
            success = await self._send_email(recipient_email, subject, body, is_html=True)
            
            # Log email attempt  
            await self._log_email(
                template_name="employee_welcome",
                recipient_email=recipient_email,
                subject=subject,
                status="sent" if success else "failed",
                employee_id=employee.employee_id,
                user_id=user.id
            )
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to send employee welcome email: {str(e)}")
            return False

    async def _send_hr_confirmation_email(self, hr_email: str, employee: HREmployee, 
                                        user: User, admin_name: str) -> bool:
        """Send confirmation email to HR about completed assignment"""
        try:
            subject = f"✅ User Account Assigned - {employee.first_name} {employee.last_name}"
            
            body = f"""
            <html>
            <head><style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                .header {{ color: #059669; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }}
                .assignment-info {{ background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }}
                .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }}
            </style></head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Assignment Completed</h1>
                        <p>The user account assignment has been successfully completed.</p>
                    </div>
                    
                    <div class="assignment-info">
                        <h3>Assignment Details:</h3>
                        <ul>
                            <li><strong>Employee:</strong> {employee.first_name} {employee.last_name}</li>
                            <li><strong>Employee Code:</strong> {employee.emp_code}</li>
                            <li><strong>Username:</strong> {user.username}</li>
                            <li><strong>Email:</strong> {user.email}</li>
                            <li><strong>Role Assigned:</strong> {self._get_role_display_name(user.role)}</li>
                            <li><strong>Assigned by:</strong> {admin_name}</li>
                            <li><strong>Date Completed:</strong> {datetime.now().strftime('%B %d, %Y at %H:%M')}</li>
                        </ul>
                    </div>
                    
                    <p>✉️ <strong>The employee has been notified via email with login instructions.</strong></p>
                    
                    <div class="footer">
                        <p>Best regards,<br>SME Management System</p>
                        <p><em>This is an automated notification. Please do not reply to this email.</em></p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Send email
            success = await self._send_email(hr_email, subject, body, is_html=True)
            
            # Log email attempt
            await self._log_email(
                template_name="hr_assignment_confirmation",
                recipient_email=hr_email,
                subject=subject,
                status="sent" if success else "failed",
                employee_id=employee.employee_id,
                user_id=user.id
            )
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to send HR confirmation email: {str(e)}")
            return False

    async def _create_in_app_notification(self, recipient_user_id: str, notification_type: str,
                                        title: str, message: str, action_url: Optional[str] = None,
                                        employee_id: Optional[int] = None, user_id: Optional[str] = None) -> bool:
        """Create in-app notification"""
        try:
            notification_data = NotificationCreate(
                type=notification_type,
                recipient_user_id=recipient_user_id,
                title=title,
                message=message,
                action_url=action_url,
                employee_id=employee_id,
                user_id=user_id
            )
            
            notification = Notification(**notification_data.dict())
            self.db.add(notification)
            self.db.commit()
            
            logger.info(f"In-app notification created", notification_id=notification.id, 
                       recipient=recipient_user_id, type=notification_type)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to create in-app notification: {str(e)}")
            self.db.rollback()
            return False

    async def _send_email(self, to_email: str, subject: str, body: str, is_html: bool = False) -> bool:
        """Send email using SMTP"""
        try:
            if not all([self.smtp_username, self.smtp_password]):
                logger.warning("SMTP credentials not configured - email not sent")
                return False
            
            msg = MimeMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            if is_html:
                msg.attach(MimeText(body, 'html'))
            else:
                msg.attach(MimeText(body, 'plain'))
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    async def _log_email(self, template_name: str, recipient_email: str, subject: str,
                        status: str, employee_id: Optional[int] = None, user_id: Optional[str] = None):
        """Log email attempt to database"""
        try:
            email_log_data = EmailLogCreate(
                template_name=template_name,
                recipient_email=recipient_email,
                subject=subject,
                status=status,
                employee_id=employee_id,
                user_id=user_id
            )
            
            email_log = EmailLog(**email_log_data.dict())
            self.db.add(email_log)
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Failed to log email: {str(e)}")
            self.db.rollback()

    def _get_role_display_name(self, role: str) -> str:
        """Get display name for role"""
        role_names = {
            'superadmin': 'Super Administrator',
            'system_admin': 'System Administrator', 
            'hr': 'HR Manager',
            'employee': 'Employee'
        }
        return role_names.get(role, role.title())

    async def get_notifications(self, user_id: str, unread_only: bool = False) -> List[Notification]:
        """Get notifications for a user"""
        query = self.db.query(Notification).filter(Notification.recipient_user_id == user_id)
        
        if unread_only:
            query = query.filter(Notification.read == False)
            
        return query.order_by(Notification.created_at.desc()).all()

    async def mark_notification_read(self, notification_id: int, user_id: str) -> bool:
        """Mark notification as read"""
        try:
            notification = self.db.query(Notification).filter(
                Notification.id == notification_id,
                Notification.recipient_user_id == user_id
            ).first()
            
            if notification:
                notification.read = True
                self.db.commit()
                return True
            return False
            
        except Exception as e:
            logger.error(f"Failed to mark notification as read: {str(e)}")
            self.db.rollback()
            return False

    async def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications"""
        return self.db.query(Notification).filter(
            Notification.recipient_user_id == user_id,
            Notification.read == False
        ).count()
