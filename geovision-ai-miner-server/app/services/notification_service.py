"""
Notification service for sending various types of notifications.
"""

import asyncio
import aiohttp
import smtplib
import logging
import uuid
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
from typing import Dict, List, Optional, Any
from datetime import datetime
import json

from app.core.config import settings
from app.models.ai_analysis import NotificationLog
from app.models.user import User
from app.core.database import get_db

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for sending notifications via various channels."""
    
    def __init__(self):
        self.email_config = {
            "smtp_server": settings.SMTP_SERVER,
            "smtp_port": settings.SMTP_PORT,
            "smtp_username": settings.SMTP_USERNAME,
            "smtp_password": settings.SMTP_PASSWORD,
            "from_email": settings.FROM_EMAIL
        }
        
        self.slack_config = {
            "webhook_url": settings.SLACK_WEBHOOK_URL,
            "channel": settings.SLACK_CHANNEL
        }
        
        self.sms_config = {
            "provider": settings.SMS_PROVIDER,
            "api_key": settings.SMS_API_KEY,
            "api_secret": settings.SMS_API_SECRET
        }
    
    async def send_notification(
        self,
        user_id: str,
        notification_type: str,
        recipient: str,
        subject: Optional[str],
        message: str,
        analysis_job_id: Optional[str] = None
    ) -> bool:
        """Send a notification and log it to the database."""
        
        # Create notification log entry
        notification_log = NotificationLog(
            id=str(uuid.uuid4()),
            user_id=user_id,
            analysis_job_id=analysis_job_id,
            notification_type=notification_type,
            recipient=recipient,
            subject=subject,
            message=message,
            status="pending"
        )
        
        try:
            # Send notification based on type
            success = False
            if notification_type == "email":
                success = await self._send_email(recipient, subject, message)
            elif notification_type == "slack":
                success = await self._send_slack(recipient, subject, message)
            elif notification_type == "sms":
                success = await self._send_sms(recipient, message)
            elif notification_type == "webhook":
                success = await self._send_webhook(recipient, message)
            else:
                logger.error(f"Unknown notification type: {notification_type}")
                return False
            
            # Update notification log
            notification_log.status = "sent" if success else "failed"
            notification_log.sent_at = datetime.utcnow() if success else None
            
            # Save to database
            db = next(get_db())
            db.add(notification_log)
            db.commit()
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to send notification: {e}")
            notification_log.status = "failed"
            db = next(get_db())
            db.add(notification_log)
            db.commit()
            return False
    
    async def _send_email(self, recipient: str, subject: str, message: str) -> bool:
        """Send email notification."""
        try:
            msg = MimeMultipart()
            msg['From'] = self.email_config["from_email"]
            msg['To'] = recipient
            msg['Subject'] = subject
            
            msg.attach(MimeText(message, 'html'))
            
            # Send email (in production, use async email service)
            with smtplib.SMTP(self.email_config["smtp_server"], self.email_config["smtp_port"]) as server:
                server.starttls()
                server.login(self.email_config["smtp_username"], self.email_config["smtp_password"])
                server.send_message(msg)
            
            logger.info(f"Email sent to {recipient}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False
    
    async def _send_slack(self, channel: str, subject: str, message: str) -> bool:
        """Send Slack notification."""
        try:
            payload = {
                "channel": channel or self.slack_config["channel"],
                "text": f"*{subject}*\n{message}",
                "username": "GeoVision AI",
                "icon_emoji": ":rocket:"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.slack_config["webhook_url"],
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        logger.info(f"Slack notification sent to {channel}")
                        return True
                    else:
                        logger.error(f"Slack notification failed: {response.status}")
                        return False
                        
        except Exception as e:
            logger.error(f"Failed to send Slack notification: {e}")
            return False
    
    async def _send_sms(self, phone_number: str, message: str) -> bool:
        """Send SMS notification."""
        try:
            # Example using Twilio (you can adapt for other providers)
            if self.sms_config["provider"] == "twilio":
                from twilio.rest import Client
                
                client = Client(self.sms_config["api_key"], self.sms_config["api_secret"])
                message = client.messages.create(
                    body=message,
                    from_=settings.TWILIO_PHONE_NUMBER,
                    to=phone_number
                )
                
                logger.info(f"SMS sent to {phone_number}")
                return True
            else:
                logger.error(f"Unsupported SMS provider: {self.sms_config['provider']}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send SMS: {e}")
            return False
    
    async def _send_webhook(self, webhook_url: str, payload: str) -> bool:
        """Send webhook notification."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    webhook_url,
                    json=json.loads(payload),
                    headers={"Content-Type": "application/json"},
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status in [200, 201, 202]:
                        logger.info(f"Webhook sent to {webhook_url}")
                        return True
                    else:
                        logger.error(f"Webhook failed: {response.status}")
                        return False
                        
        except Exception as e:
            logger.error(f"Failed to send webhook: {e}")
            return False
    
    async def send_analysis_completion_notification(
        self,
        user_id: str,
        analysis_job_id: str,
        analysis_type: str,
        status: str,
        result_summary: str
    ):
        """Send notification when AI analysis completes."""
        
        subject = f"AI Analysis Complete - {analysis_type.title()}"
        message = f"""
        <h2>AI Analysis Complete</h2>
        <p><strong>Analysis Type:</strong> {analysis_type}</p>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Summary:</strong> {result_summary}</p>
        <p>View detailed results in your GeoVision AI dashboard.</p>
        """
        
        # Get user's notification preferences
        db = next(get_db())
        user = db.query(User).filter(User.id == user_id).first()
        
        if user.email_notifications:
            await self.send_notification(
                user_id=user_id,
                notification_type="email",
                recipient=user.email,
                subject=subject,
                message=message,
                analysis_job_id=analysis_job_id
            )
        
        if user.slack_notifications and user.slack_webhook:
            await self.send_notification(
                user_id=user_id,
                notification_type="slack",
                recipient=user.slack_channel,
                subject=subject,
                message=result_summary,
                analysis_job_id=analysis_job_id
            )
    
    async def send_batch_notifications(
        self,
        notifications: List[Dict[str, Any]]
    ) -> Dict[str, int]:
        """Send multiple notifications in batch."""
        
        results = {"success": 0, "failed": 0}
        
        # Process notifications concurrently
        tasks = []
        for notification in notifications:
            task = self.send_notification(
                user_id=notification["user_id"],
                notification_type=notification["type"],
                recipient=notification["recipient"],
                subject=notification.get("subject"),
                message=notification["message"],
                analysis_job_id=notification.get("analysis_job_id")
            )
            tasks.append(task)
        
        # Wait for all notifications to complete
        results_list = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in results_list:
            if isinstance(result, Exception):
                results["failed"] += 1
            elif result:
                results["success"] += 1
            else:
                results["failed"] += 1
        
        return results


# Global notification service instance
notification_service = NotificationService() 