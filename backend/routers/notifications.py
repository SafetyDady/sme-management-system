"""
API Router for Notification Management
Handles in-app notifications and assignment summaries
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User
from app.schemas import NotificationRecord, NotificationUpdate, AssignmentSummary
from dependencies.auth import get_current_user, require_roles
from services.notification_service import NotificationService
from services.user_assignment_service import UserAssignmentService
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=List[NotificationRecord])
async def get_notifications(
    unread_only: bool = Query(False, description="Return only unread notifications"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of notifications to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get notifications for current user
    """
    try:
        notification_service = NotificationService(db)
        notifications = await notification_service.get_notifications(
            user_id=current_user.id,
            unread_only=unread_only
        )
        
        # Limit results
        limited_notifications = notifications[:limit]
        
        return [NotificationRecord.from_orm(notif) for notif in limited_notifications]
        
    except Exception as e:
        logger.error(f"Failed to get notifications for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notifications"
        )

@router.get("/count")
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get count of unread notifications for current user
    """
    try:
        notification_service = NotificationService(db)
        count = await notification_service.get_unread_count(current_user.id)
        
        return {"unread_count": count}
        
    except Exception as e:
        logger.error(f"Failed to get unread count for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get unread count"
        )

@router.patch("/{notification_id}", response_model=NotificationRecord)
async def update_notification(
    notification_id: int,
    notification_update: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update notification (mark as read/unread)
    """
    try:
        if notification_update.read is not None:
            notification_service = NotificationService(db)
            success = await notification_service.mark_notification_read(
                notification_id, 
                current_user.id
            )
            
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Notification not found or access denied"
                )
        
        # Return updated notification
        from app.models import Notification
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.recipient_user_id == current_user.id
        ).first()
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        return NotificationRecord.from_orm(notification)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update notification {notification_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification"
        )

@router.post("/mark-all-read")
async def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark all notifications as read for current user
    """
    try:
        from app.models import Notification
        
        # Update all unread notifications for current user
        updated_count = db.query(Notification).filter(
            Notification.recipient_user_id == current_user.id,
            Notification.read == False
        ).update({"read": True})
        
        db.commit()
        
        logger.info(f"Marked {updated_count} notifications as read for user {current_user.username}")
        
        return {"message": f"Marked {updated_count} notifications as read"}
        
    except Exception as e:
        logger.error(f"Failed to mark all notifications as read for user {current_user.id}: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notifications as read"
        )

@router.get("/assignment-summary", response_model=AssignmentSummary)
async def get_assignment_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["system_admin", "superadmin", "hr"]))
):
    """
    Get summary of user-employee assignments for dashboard
    """
    try:
        assignment_service = UserAssignmentService(db)
        summary = await assignment_service.get_assignment_summary()
        
        return summary
        
    except Exception as e:
        logger.error(f"Failed to get assignment summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get assignment summary"
        )

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete notification for current user
    """
    try:
        from app.models import Notification
        
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.recipient_user_id == current_user.id
        ).first()
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        db.delete(notification)
        db.commit()
        
        logger.info(f"Notification {notification_id} deleted by user {current_user.username}")
        
        return {"message": "Notification deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete notification {notification_id}: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete notification"
        )
