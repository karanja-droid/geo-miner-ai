from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from ... import schemas, crud, database
from ...auth import get_current_active_user, require_permission
from ...websockets import websocket_endpoint, connection_manager, collaboration_manager, chat_manager
from ...performance import PerformanceDecorator

router = APIRouter(prefix="/collaboration", tags=["collaboration"])

@router.websocket("/ws/{room_id}")
async def websocket_collaboration(
    websocket: WebSocket,
    room_id: str,
    token: str = Query(..., description="Authentication token")
):
    """WebSocket endpoint for real-time collaboration"""
    await websocket_endpoint(websocket, room_id, token)

@router.get("/rooms/{room_id}/users")
@PerformanceDecorator.monitor_performance("get_room_users")
async def get_room_users(
    room_id: str = Path(..., description="Room ID"),
    current_user: schemas.UserOut = Depends(require_permission("real_time_collaboration")),
    db: AsyncSession = Depends(database.get_db)
):
    """Get list of users in a collaboration room"""
    try:
        users = connection_manager.get_room_users(room_id)
        
        # Get user details for each user ID
        user_details = []
        for user_id in users:
            user = await crud.get_user_by_id(db, UUID(user_id))
            if user:
                user_details.append({
                    "user_id": str(user.user_id),
                    "email": user.email,
                    "roles": user.roles,
                    "connected_at": connection_manager.user_sessions.get(user_id, {}).get("connected_at")
                })
        
        return {
            "success": True,
            "data": {
                "room_id": room_id,
                "users": user_details,
                "total_users": len(user_details)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting room users: {str(e)}")

@router.get("/rooms/{room_id}/chat/history")
@PerformanceDecorator.monitor_performance("get_chat_history")
async def get_chat_history(
    room_id: str = Path(..., description="Room ID"),
    limit: int = Query(50, description="Number of messages to retrieve"),
    current_user: schemas.UserOut = Depends(require_permission("real_time_collaboration"))
):
    """Get chat history for a room"""
    try:
        history = await chat_manager.get_chat_history(room_id, limit)
        
        return {
            "success": True,
            "data": {
                "room_id": room_id,
                "messages": history,
                "total_messages": len(history)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting chat history: {str(e)}")

@router.post("/rooms/{room_id}/chat/message")
@PerformanceDecorator.monitor_performance("send_chat_message")
async def send_chat_message(
    room_id: str = Path(..., description="Room ID"),
    message_data: schemas.ChatMessage,
    current_user: schemas.UserOut = Depends(require_permission("real_time_collaboration"))
):
    """Send a chat message to a room"""
    try:
        await chat_manager.send_message(
            room_id,
            str(current_user.user_id),
            message_data.message,
            message_data.message_type
        )
        
        return {
            "success": True,
            "message": "Message sent successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")

@router.post("/sessions/start")
@PerformanceDecorator.monitor_performance("start_collaboration_session")
async def start_collaboration_session(
    session_data: schemas.CollaborationSessionStart,
    current_user: schemas.UserOut = Depends(require_permission("real_time_collaboration"))
):
    """Start a new collaboration session"""
    try:
        await collaboration_manager.start_collaboration_session(
            session_data.room_id,
            session_data.document_id,
            str(current_user.user_id)
        )
        
        return {
            "success": True,
            "data": {
                "session_key": f"{session_data.room_id}:{session_data.document_id}",
                "room_id": session_data.room_id,
                "document_id": session_data.document_id,
                "started_by": str(current_user.user_id),
                "started_at": datetime.utcnow().isoformat()
            },
            "message": "Collaboration session started successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting collaboration session: {str(e)}")

@router.post("/sessions/end")
@PerformanceDecorator.monitor_performance("end_collaboration_session")
async def end_collaboration_session(
    session_data: schemas.CollaborationSessionEnd,
    current_user: schemas.UserOut = Depends(require_permission("real_time_collaboration"))
):
    """End a collaboration session"""
    try:
        await collaboration_manager.end_collaboration_session(
            session_data.room_id,
            session_data.document_id,
            str(current_user.user_id)
        )
        
        return {
            "success": True,
            "message": "Collaboration session ended successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ending collaboration session: {str(e)}")

@router.get("/sessions/active")
@PerformanceDecorator.monitor_performance("get_active_sessions")
async def get_active_sessions(
    current_user: schemas.UserOut = Depends(require_permission("real_time_collaboration"))
):
    """Get active collaboration sessions"""
    try:
        active_sessions = []
        
        for session_key, session_data in collaboration_manager.collaboration_sessions.items():
            if str(current_user.user_id) in session_data["participants"]:
                active_sessions.append({
                    "session_key": session_key,
                    "room_id": session_data["room_id"],
                    "document_id": session_data["document_id"],
                    "started_by": session_data["started_by"],
                    "started_at": session_data["started_at"],
                    "participants": list(session_data["participants"]),
                    "version": session_data["version"]
                })
        
        return {
            "success": True,
            "data": {
                "active_sessions": active_sessions,
                "total_sessions": len(active_sessions)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting active sessions: {str(e)}")

@router.get("/cursor-positions/{room_id}")
@PerformanceDecorator.monitor_performance("get_cursor_positions")
async def get_cursor_positions(
    room_id: str = Path(..., description="Room ID"),
    current_user: schemas.UserOut = Depends(require_permission("real_time_collaboration"))
):
    """Get current cursor positions for all users in a room"""
    try:
        positions = collaboration_manager.cursor_positions.get(room_id, {})
        
        # Filter out current user's position
        other_positions = {
            user_id: position 
            for user_id, position in positions.items() 
            if user_id != str(current_user.user_id)
        }
        
        return {
            "success": True,
            "data": {
                "room_id": room_id,
                "cursor_positions": other_positions,
                "total_users": len(other_positions)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting cursor positions: {str(e)}")

@router.post("/document-changes")
@PerformanceDecorator.monitor_performance("apply_document_change")
async def apply_document_change(
    change_data: schemas.DocumentChange,
    current_user: schemas.UserOut = Depends(require_permission("real_time_collaboration"))
):
    """Apply a document change in collaboration"""
    try:
        await collaboration_manager.handle_document_change(
            change_data.room_id,
            str(current_user.user_id),
            change_data.dict()
        )
        
        return {
            "success": True,
            "message": "Document change applied successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error applying document change: {str(e)}")

@router.get("/document-changes/{session_key}")
@PerformanceDecorator.monitor_performance("get_document_changes")
async def get_document_changes(
    session_key: str = Path(..., description="Session key"),
    limit: int = Query(100, description="Number of changes to retrieve"),
    current_user: schemas.UserOut = Depends(require_permission("real_time_collaboration"))
):
    """Get document changes for a collaboration session"""
    try:
        # Get changes from Redis
        import redis.asyncio as redis
        redis_client = redis.from_url("redis://localhost:6379/0", decode_responses=True)
        
        changes = await redis_client.lrange(f"document_changes:{session_key}", 0, limit - 1)
        parsed_changes = [json.loads(change) for change in changes]
        
        return {
            "success": True,
            "data": {
                "session_key": session_key,
                "changes": parsed_changes,
                "total_changes": len(parsed_changes)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting document changes: {str(e)}")

@router.get("/presence/{room_id}")
@PerformanceDecorator.monitor_performance("get_user_presence")
async def get_user_presence(
    room_id: str = Path(..., description="Room ID"),
    current_user: schemas.UserOut = Depends(require_permission("real_time_collaboration"))
):
    """Get user presence information for a room"""
    try:
        users = connection_manager.get_room_users(room_id)
        
        presence_data = []
        for user_id in users:
            session_data = connection_manager.user_sessions.get(user_id, {})
            presence_data.append({
                "user_id": user_id,
                "status": "online",
                "last_activity": session_data.get("last_activity"),
                "connected_at": session_data.get("connected_at")
            })
        
        return {
            "success": True,
            "data": {
                "room_id": room_id,
                "users": presence_data,
                "total_online": len(presence_data)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting user presence: {str(e)}")

@router.post("/rooms/{room_id}/invite")
@PerformanceDecorator.monitor_performance("invite_user_to_room")
async def invite_user_to_room(
    room_id: str = Path(..., description="Room ID"),
    invite_data: schemas.RoomInvite,
    current_user: schemas.UserOut = Depends(require_permission("real_time_collaboration")),
    db: AsyncSession = Depends(database.get_db)
):
    """Invite a user to a collaboration room"""
    try:
        # Check if user exists
        invited_user = await crud.get_user_by_email(db, invite_data.email)
        if not invited_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # This would typically send an email or notification
        # For now, we'll just return success
        
        return {
            "success": True,
            "data": {
                "room_id": room_id,
                "invited_user": {
                    "user_id": str(invited_user.user_id),
                    "email": invited_user.email
                },
                "invited_by": str(current_user.user_id),
                "invited_at": datetime.utcnow().isoformat()
            },
            "message": "User invited successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inviting user: {str(e)}")

@router.get("/statistics")
@PerformanceDecorator.monitor_performance("get_collaboration_statistics")
async def get_collaboration_statistics(
    current_user: schemas.UserOut = Depends(require_permission("real_time_collaboration"))
):
    """Get collaboration statistics"""
    try:
        # Get user's collaboration statistics
        user_rooms = connection_manager.get_user_rooms(str(current_user.user_id))
        active_sessions = [
            session for session in collaboration_manager.collaboration_sessions.values()
            if str(current_user.user_id) in session["participants"]
        ]
        
        statistics = {
            "user_id": str(current_user.user_id),
            "active_rooms": len(user_rooms),
            "active_sessions": len(active_sessions),
            "total_connections": len(connection_manager.active_connections),
            "total_rooms": len(connection_manager.room_users),
            "total_sessions": len(collaboration_manager.collaboration_sessions)
        }
        
        return {
            "success": True,
            "data": statistics,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting collaboration statistics: {str(e)}")

# Import json for document changes endpoint
import json 