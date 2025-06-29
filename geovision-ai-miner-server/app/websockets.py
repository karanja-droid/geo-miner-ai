from fastapi import WebSocket, WebSocketDisconnect, Depends, HTTPException
from typing import Dict, List, Set, Optional, Any
import json
import asyncio
import redis.asyncio as redis
from datetime import datetime
from uuid import UUID, uuid4
import logging
from . import schemas, crud, database
from .auth import AuthService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Redis connection for pub/sub
redis_client = redis.from_url("redis://localhost:6379/0", decode_responses=True)

class ConnectionManager:
    """Manages WebSocket connections and real-time collaboration"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_rooms: Dict[str, Set[str]] = {}  # user_id -> set of room_ids
        self.room_users: Dict[str, Set[str]] = {}  # room_id -> set of user_ids
        self.user_sessions: Dict[str, Dict[str, Any]] = {}  # user_id -> session_data
        
    async def connect(self, websocket: WebSocket, user_id: str, room_id: str):
        """Connect user to a room"""
        await websocket.accept()
        
        # Store connection
        self.active_connections[user_id] = websocket
        
        # Add user to room
        if user_id not in self.user_rooms:
            self.user_rooms[user_id] = set()
        self.user_rooms[user_id].add(room_id)
        
        if room_id not in self.room_users:
            self.room_users[room_id] = set()
        self.room_users[room_id].add(user_id)
        
        # Initialize user session
        self.user_sessions[user_id] = {
            "room_id": room_id,
            "connected_at": datetime.utcnow().isoformat(),
            "last_activity": datetime.utcnow().isoformat()
        }
        
        # Notify room about new user
        await self.broadcast_to_room(room_id, {
            "type": "user_joined",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }, exclude_user=user_id)
        
        # Send room info to new user
        await self.send_personal_message(user_id, {
            "type": "room_info",
            "room_id": room_id,
            "users": list(self.room_users[room_id]),
            "timestamp": datetime.utcnow().isoformat()
        })
        
        logger.info(f"User {user_id} connected to room {room_id}")
    
    async def disconnect(self, user_id: str):
        """Disconnect user from all rooms"""
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.close()
            del self.active_connections[user_id]
        
        # Remove user from all rooms
        if user_id in self.user_rooms:
            for room_id in self.user_rooms[user_id]:
                if room_id in self.room_users:
                    self.room_users[room_id].discard(user_id)
                    # Notify room about user leaving
                    await self.broadcast_to_room(room_id, {
                        "type": "user_left",
                        "user_id": user_id,
                        "timestamp": datetime.utcnow().isoformat()
                    })
            
            del self.user_rooms[user_id]
        
        # Clean up session
        if user_id in self.user_sessions:
            del self.user_sessions[user_id]
        
        logger.info(f"User {user_id} disconnected")
    
    async def send_personal_message(self, user_id: str, message: Dict[str, Any]):
        """Send message to specific user"""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to user {user_id}: {e}")
                await self.disconnect(user_id)
    
    async def broadcast_to_room(self, room_id: str, message: Dict[str, Any], exclude_user: Optional[str] = None):
        """Broadcast message to all users in a room"""
        if room_id in self.room_users:
            for user_id in self.room_users[room_id]:
                if user_id != exclude_user:
                    await self.send_personal_message(user_id, message)
    
    async def broadcast_to_all(self, message: Dict[str, Any]):
        """Broadcast message to all connected users"""
        for user_id in self.active_connections:
            await self.send_personal_message(user_id, message)
    
    def get_room_users(self, room_id: str) -> List[str]:
        """Get list of users in a room"""
        return list(self.room_users.get(room_id, set()))
    
    def get_user_rooms(self, user_id: str) -> List[str]:
        """Get list of rooms for a user"""
        return list(self.user_rooms.get(user_id, set()))

class CollaborationManager:
    """Manages real-time collaboration features"""
    
    def __init__(self, connection_manager: ConnectionManager):
        self.connection_manager = connection_manager
        self.collaboration_sessions: Dict[str, Dict[str, Any]] = {}
        self.cursor_positions: Dict[str, Dict[str, Dict[str, Any]]] = {}  # room_id -> user_id -> position
        self.document_versions: Dict[str, int] = {}  # room_id -> version
    
    async def start_collaboration_session(self, room_id: str, document_id: str, user_id: str):
        """Start a collaboration session"""
        session_key = f"{room_id}:{document_id}"
        
        if session_key not in self.collaboration_sessions:
            self.collaboration_sessions[session_key] = {
                "document_id": document_id,
                "room_id": room_id,
                "started_by": user_id,
                "started_at": datetime.utcnow().isoformat(),
                "participants": set(),
                "version": 0
            }
        
        self.collaboration_sessions[session_key]["participants"].add(user_id)
        
        # Initialize cursor tracking
        if room_id not in self.cursor_positions:
            self.cursor_positions[room_id] = {}
        
        await self.connection_manager.broadcast_to_room(room_id, {
            "type": "collaboration_started",
            "session_key": session_key,
            "document_id": document_id,
            "started_by": user_id,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        logger.info(f"Collaboration session started: {session_key}")
    
    async def update_cursor_position(self, room_id: str, user_id: str, position: Dict[str, Any]):
        """Update user's cursor position"""
        if room_id not in self.cursor_positions:
            self.cursor_positions[room_id] = {}
        
        self.cursor_positions[room_id][user_id] = {
            **position,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Broadcast cursor position to other users in room
        await self.connection_manager.broadcast_to_room(room_id, {
            "type": "cursor_update",
            "user_id": user_id,
            "position": position,
            "timestamp": datetime.utcnow().isoformat()
        }, exclude_user=user_id)
    
    async def handle_document_change(self, room_id: str, user_id: str, change: Dict[str, Any]):
        """Handle document change from user"""
        session_key = change.get("session_key")
        if not session_key or session_key not in self.collaboration_sessions:
            return
        
        # Increment document version
        self.collaboration_sessions[session_key]["version"] += 1
        
        # Add change metadata
        change_with_metadata = {
            **change,
            "user_id": user_id,
            "version": self.collaboration_sessions[session_key]["version"],
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Broadcast change to other users in room
        await self.connection_manager.broadcast_to_room(room_id, {
            "type": "document_change",
            "change": change_with_metadata
        }, exclude_user=user_id)
        
        # Store change in Redis for persistence
        await redis_client.lpush(f"document_changes:{session_key}", json.dumps(change_with_metadata))
        await redis_client.expire(f"document_changes:{session_key}", 86400)  # 24 hours
        
        logger.info(f"Document change applied: {session_key} v{change_with_metadata['version']}")
    
    async def end_collaboration_session(self, room_id: str, document_id: str, user_id: str):
        """End a collaboration session"""
        session_key = f"{room_id}:{document_id}"
        
        if session_key in self.collaboration_sessions:
            self.collaboration_sessions[session_key]["participants"].discard(user_id)
            
            # If no participants left, end session
            if not self.collaboration_sessions[session_key]["participants"]:
                del self.collaboration_sessions[session_key]
                
                await self.connection_manager.broadcast_to_room(room_id, {
                    "type": "collaboration_ended",
                    "session_key": session_key,
                    "document_id": document_id,
                    "ended_by": user_id,
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                logger.info(f"Collaboration session ended: {session_key}")

class ChatManager:
    """Manages real-time chat functionality"""
    
    def __init__(self, connection_manager: ConnectionManager):
        self.connection_manager = connection_manager
        self.chat_rooms: Dict[str, List[Dict[str, Any]]] = {}  # room_id -> messages
    
    async def send_message(self, room_id: str, user_id: str, message: str, message_type: str = "text"):
        """Send a chat message"""
        if room_id not in self.chat_rooms:
            self.chat_rooms[room_id] = []
        
        chat_message = {
            "id": str(uuid4()),
            "user_id": user_id,
            "message": message,
            "type": message_type,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        self.chat_rooms[room_id].append(chat_message)
        
        # Keep only last 100 messages
        if len(self.chat_rooms[room_id]) > 100:
            self.chat_rooms[room_id] = self.chat_rooms[room_id][-100:]
        
        # Broadcast message to room
        await self.connection_manager.broadcast_to_room(room_id, {
            "type": "chat_message",
            "message": chat_message
        })
        
        # Store in Redis for persistence
        await redis_client.lpush(f"chat_messages:{room_id}", json.dumps(chat_message))
        await redis_client.expire(f"chat_messages:{room_id}", 604800)  # 7 days
        
        logger.info(f"Chat message sent in room {room_id}: {user_id}")
    
    async def get_chat_history(self, room_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get chat history for a room"""
        if room_id in self.chat_rooms:
            return self.chat_rooms[room_id][-limit:]
        return []

# Global managers
connection_manager = ConnectionManager()
collaboration_manager = CollaborationManager(connection_manager)
chat_manager = ChatManager(connection_manager)

async def get_current_user_from_token(token: str, db) -> Optional[schemas.UserOut]:
    """Get current user from JWT token"""
    try:
        payload = AuthService.verify_token(token)
        if payload:
            user_id = payload.get("sub")
            if user_id:
                # Use get_user_by_email as a fallback since get_user_by_id might not exist
                # We'll need to get the user by email from the token payload
                user_email = payload.get("email")
                if user_email:
                    user = await crud.get_user_by_email(db, user_email)
                    if user:
                        return schemas.UserOut(
                            user_id=user.user_id,
                            email=user.email,
                            roles=user.roles,
                            mfa_enabled=user.mfa_enabled,
                            created_at=user.created_at,
                            updated_at=user.updated_at
                        )
    except Exception as e:
        logger.error(f"Error getting user from token: {e}")
    return None

async def websocket_endpoint(websocket: WebSocket, room_id: str, token: str):
    """Main WebSocket endpoint for real-time collaboration"""
    user = None
    
    try:
        # Get database session
        async with database.get_db() as db_session:
            # Authenticate user
            user = await get_current_user_from_token(token, db_session)
            if not user:
                await websocket.close(code=4001, reason="Authentication failed")
                return
            
            # Connect to room
            await connection_manager.connect(websocket, str(user.user_id), room_id)
            
            # Send initial data
            await websocket.send_text(json.dumps({
                "type": "connected",
                "user_id": str(user.user_id),
                "room_id": room_id,
                "timestamp": datetime.utcnow().isoformat()
            }))
            
            # Send chat history
            chat_history = await chat_manager.get_chat_history(room_id)
            await websocket.send_text(json.dumps({
                "type": "chat_history",
                "messages": chat_history
            }))
            
            # Main message loop
            while True:
                try:
                    data = await websocket.receive_text()
                    message = json.loads(data)
                    
                    # Update user activity
                    if str(user.user_id) in connection_manager.user_sessions:
                        connection_manager.user_sessions[str(user.user_id)]["last_activity"] = datetime.utcnow().isoformat()
                    
                    # Handle different message types
                    await handle_websocket_message(message, user, room_id)
                    
                except json.JSONDecodeError:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Invalid JSON format"
                    }))
                    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {user.user_id if user else 'unknown'}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        if user:
            await connection_manager.disconnect(str(user.user_id))

async def handle_websocket_message(message: Dict[str, Any], user: schemas.UserOut, room_id: str):
    """Handle incoming WebSocket messages"""
    message_type = message.get("type")
    
    if message_type == "chat_message":
        await chat_manager.send_message(
            room_id,
            str(user.user_id),
            message.get("message", ""),
            message.get("message_type", "text")
        )
    
    elif message_type == "cursor_update":
        await collaboration_manager.update_cursor_position(
            room_id,
            str(user.user_id),
            message.get("position", {})
        )
    
    elif message_type == "document_change":
        await collaboration_manager.handle_document_change(
            room_id,
            str(user.user_id),
            message
        )
    
    elif message_type == "start_collaboration":
        document_id = message.get("document_id")
        if document_id:
            await collaboration_manager.start_collaboration_session(
                room_id,
                document_id,
                str(user.user_id)
            )
    
    elif message_type == "end_collaboration":
        document_id = message.get("document_id")
        if document_id:
            await collaboration_manager.end_collaboration_session(
                room_id,
                document_id,
                str(user.user_id)
            )
    
    elif message_type == "ping":
        # Respond to ping with pong
        await connection_manager.send_personal_message(str(user.user_id), {
            "type": "pong",
            "timestamp": datetime.utcnow().isoformat()
        })
    
    else:
        logger.warning(f"Unknown message type: {message_type}")

# Background tasks for cleanup and monitoring
async def cleanup_inactive_sessions():
    """Clean up inactive sessions periodically"""
    while True:
        try:
            current_time = datetime.utcnow()
            inactive_users = []
            
            for user_id, session in connection_manager.user_sessions.items():
                last_activity = datetime.fromisoformat(session["last_activity"])
                if (current_time - last_activity).total_seconds() > 3600:  # 1 hour
                    inactive_users.append(user_id)
            
            for user_id in inactive_users:
                await connection_manager.disconnect(user_id)
                logger.info(f"Cleaned up inactive user: {user_id}")
            
        except Exception as e:
            logger.error(f"Error in cleanup task: {e}")
        
        await asyncio.sleep(300)  # Run every 5 minutes

async def monitor_connections():
    """Monitor active connections and log statistics"""
    while True:
        try:
            active_count = len(connection_manager.active_connections)
            total_rooms = len(connection_manager.room_users)
            
            logger.info(f"Active connections: {active_count}, Total rooms: {total_rooms}")
            
            # Store metrics in Redis
            await redis_client.hset("websocket_metrics", "active_connections", str(active_count))
            await redis_client.hset("websocket_metrics", "total_rooms", str(total_rooms))
            await redis_client.hset("websocket_metrics", "timestamp", datetime.utcnow().isoformat())
            
        except Exception as e:
            logger.error(f"Error in monitoring task: {e}")
        
        await asyncio.sleep(60)  # Run every minute

# Start background tasks
async def start_background_tasks():
    """Start background tasks for WebSocket management"""
    asyncio.create_task(cleanup_inactive_sessions())
    asyncio.create_task(monitor_connections()) 