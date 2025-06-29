from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from uuid import UUID
import redis
import os
import secrets
import pyotp
import qrcode
from io import BytesIO
import base64
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from . import schemas, crud, database

# Security configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token security
security = HTTPBearer()

# Redis connection for session management
redis_client = redis.Redis.from_url(
    os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    decode_responses=True
)

# OAuth2 providers configuration
OAUTH2_PROVIDERS = {
    "google": {
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "authorize_url": "https://accounts.google.com/o/oauth2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "userinfo_url": "https://www.googleapis.com/oauth2/v2/userinfo"
    },
    "github": {
        "client_id": os.getenv("GITHUB_CLIENT_ID"),
        "client_secret": os.getenv("GITHUB_CLIENT_SECRET"),
        "authorize_url": "https://github.com/login/oauth/authorize",
        "token_url": "https://github.com/login/oauth/access_token",
        "userinfo_url": "https://api.github.com/user"
    }
}

class AuthService:
    """Enhanced authentication and authorization service"""
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(data: dict) -> str:
        """Create a JWT refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None
    
    @staticmethod
    def is_token_blacklisted(token: str) -> bool:
        """Check if a token is blacklisted"""
        return redis_client.exists(f"blacklist:{token}")
    
    @staticmethod
    def blacklist_token(token: str, expires_in: int = 3600) -> None:
        """Add a token to the blacklist"""
        redis_client.setex(f"blacklist:{token}", expires_in, "1")
    
    @staticmethod
    def store_user_session(user_id: str, session_data: dict) -> None:
        """Store user session data in Redis"""
        redis_client.setex(
            f"session:{user_id}",
            ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            str(session_data)
        )
    
    @staticmethod
    def get_user_session(user_id: str) -> Optional[dict]:
        """Get user session data from Redis"""
        session_data = redis_client.get(f"session:{user_id}")
        return eval(session_data) if session_data else None
    
    @staticmethod
    def generate_mfa_secret() -> str:
        """Generate a new MFA secret"""
        return pyotp.random_base32()
    
    @staticmethod
    def verify_mfa_code(secret: str, code: str) -> bool:
        """Verify MFA code"""
        totp = pyotp.TOTP(secret)
        return totp.verify(code)
    
    @staticmethod
    def generate_mfa_qr_code(secret: str, email: str) -> str:
        """Generate QR code for MFA setup"""
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=email,
            issuer_name="GeoVision AI Miner"
        )
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
    
    @staticmethod
    def generate_backup_codes() -> List[str]:
        """Generate backup codes for MFA"""
        return [secrets.token_hex(4).upper() for _ in range(10)]
    
    @staticmethod
    def verify_backup_code(user_id: str, code: str) -> bool:
        """Verify backup code"""
        backup_codes = redis_client.smembers(f"backup_codes:{user_id}")
        if code in backup_codes:
            redis_client.srem(f"backup_codes:{user_id}", code)
            return True
        return False

class RoleBasedAccessControl:
    """Enhanced role-based access control system"""
    
    # Define role hierarchy
    ROLES = {
        "super_admin": 100,
        "admin": 90,
        "manager": 80,
        "senior_analyst": 70,
        "analyst": 60,
        "viewer": 40,
        "guest": 20
    }
    
    @staticmethod
    def has_role(user_roles: List[str], required_role: str) -> bool:
        """Check if user has the required role"""
        if not user_roles:
            return False
        
        user_max_level = max(RoleBasedAccessControl.ROLES.get(role, 0) for role in user_roles)
        required_level = RoleBasedAccessControl.ROLES.get(required_role, 0)
        
        return user_max_level >= required_level
    
    @staticmethod
    def has_permission(user_roles: List[str], permission: str) -> bool:
        """Check if user has specific permission"""
        # Define permission mappings
        permissions = {
            "read_projects": ["super_admin", "admin", "manager", "senior_analyst", "analyst", "viewer"],
            "write_projects": ["super_admin", "admin", "manager", "senior_analyst", "analyst"],
            "delete_projects": ["super_admin", "admin", "manager"],
            "manage_users": ["super_admin", "admin"],
            "manage_billing": ["super_admin", "admin", "manager"],
            "view_analytics": ["super_admin", "admin", "manager", "senior_analyst", "analyst"],
            "export_data": ["super_admin", "admin", "manager", "senior_analyst", "analyst"],
            "ai_analysis": ["super_admin", "admin", "manager", "senior_analyst", "analyst"],
            "real_time_collaboration": ["super_admin", "admin", "manager", "senior_analyst", "analyst", "viewer"],
            "system_admin": ["super_admin"],
            "data_export": ["super_admin", "admin", "manager", "senior_analyst"],
            "api_access": ["super_admin", "admin", "manager", "senior_analyst", "analyst"]
        }
        
        allowed_roles = permissions.get(permission, [])
        return any(role in user_roles for role in allowed_roles)

# Dependency functions
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(database.get_db)
) -> schemas.UserOut:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        
        # Check if token is blacklisted
        if AuthService.is_token_blacklisted(token):
            raise credentials_exception
        
        # Verify token
        payload = AuthService.verify_token(token)
        if payload is None:
            raise credentials_exception
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        # Get user from database
        user = await crud.get_user_by_id(db, UUID(user_id))
        if user is None:
            raise credentials_exception
        
        return schemas.UserOut(
            user_id=user.user_id,
            email=user.email,
            roles=user.roles,
            mfa_enabled=user.mfa_enabled,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
        
    except JWTError:
        raise credentials_exception

def get_current_active_user(
    current_user: schemas.UserOut = Depends(get_current_user)
) -> schemas.UserOut:
    """Get current active user"""
    return current_user

def require_roles(required_roles: List[str]):
    """Decorator to require specific roles"""
    def role_checker(current_user: schemas.UserOut = Depends(get_current_active_user)):
        if not any(role in current_user.roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker

def require_permission(permission: str):
    """Decorator to require specific permission"""
    def permission_checker(current_user: schemas.UserOut = Depends(get_current_active_user)):
        if not RoleBasedAccessControl.has_permission(current_user.roles, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission}' required"
            )
        return current_user
    return permission_checker

def require_admin(current_user: schemas.UserOut = Depends(get_current_active_user)) -> schemas.UserOut:
    """Require admin role"""
    if not RoleBasedAccessControl.has_role(current_user.roles, "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def require_manager_or_admin(current_user: schemas.UserOut = Depends(get_current_active_user)) -> schemas.UserOut:
    """Require manager or admin role"""
    if not RoleBasedAccessControl.has_role(current_user.roles, "manager"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager or admin access required"
        )
    return current_user

class RateLimiter:
    """Enhanced rate limiting with Redis"""
    
    @staticmethod
    def check_rate_limit(
        request: Request,
        key: str,
        max_requests: int = 100,
        window_seconds: int = 3600
    ) -> bool:
        """Check rate limit for a specific key"""
        client_ip = request.client.host
        rate_key = f"rate_limit:{key}:{client_ip}"
        
        # Get current count
        current_count = redis_client.get(rate_key)
        
        if current_count is None:
            # First request in window
            redis_client.setex(rate_key, window_seconds, 1)
            return True
        elif int(current_count) < max_requests:
            # Increment count
            redis_client.incr(rate_key)
            return True
        else:
            # Rate limit exceeded
            return False

def rate_limit(max_requests: int = 100, window_seconds: int = 3600):
    """Rate limiting decorator"""
    def rate_limiter(request: Request):
        if not RateLimiter.check_rate_limit(request, "api", max_requests, window_seconds):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded"
            )
    return rate_limiter

def get_user_session_data(user_id: UUID) -> Optional[Dict[str, Any]]:
    """Get user session data"""
    return AuthService.get_user_session(str(user_id))

def update_user_session(user_id: UUID, session_data: Dict[str, Any]) -> None:
    """Update user session data"""
    AuthService.store_user_session(str(user_id), session_data)

def sanitize_input(input_string: str) -> str:
    """Sanitize user input"""
    import html
    return html.escape(input_string.strip())

def validate_password_strength(password: str) -> bool:
    """Validate password strength"""
    if len(password) < 8:
        return False
    if not any(c.isupper() for c in password):
        return False
    if not any(c.islower() for c in password):
        return False
    if not any(c.isdigit() for c in password):
        return False
    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        return False
    return True

def generate_secure_token() -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(32)

def log_audit_event(
    user_id: UUID,
    action: str,
    resource: str,
    details: Optional[Dict[str, Any]] = None
) -> None:
    """Log audit event"""
    audit_data = {
        "user_id": str(user_id),
        "action": action,
        "resource": resource,
        "details": details or {},
        "timestamp": datetime.utcnow().isoformat(),
        "ip_address": "unknown"  # Would be set from request context
    }
    
    # Store in Redis for real-time access
    redis_client.lpush("audit_log", str(audit_data))
    redis_client.ltrim("audit_log", 0, 9999)  # Keep last 10000 events
    
    # Also log to file/database for persistence
    print(f"AUDIT: {audit_data}")

# Database dependency
async def get_db():
    async with database.get_db() as session:
        yield session

# Password utilities
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Router setup
router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=schemas.UserOut)
async def register(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user"""
    # Validate password strength
    if not validate_password_strength(user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password does not meet security requirements"
        )
    
    # Check if user already exists
    existing_user = await crud.get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    hashed_password = get_password_hash(user.password)
    user_data = user.dict()
    user_data["password"] = hashed_password
    user_data["roles"] = ["viewer"]  # Default role
    
    new_user = await crud.create_user(db, user_data)
    
    # Log audit event
    log_audit_event(new_user.user_id, "user_registered", "user", {"email": user.email})
    
    return new_user

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """Login user"""
    # Get user
    user = await crud.get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if MFA is required
    if user.mfa_enabled:
        # Return MFA challenge
        return {
            "requires_mfa": True,
            "user_id": str(user.user_id),
            "message": "MFA code required"
        }
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.user_id)})
    refresh_token = AuthService.create_refresh_token({"sub": str(user.user_id)})
    
    # Store session
    session_data = {
        "user_id": str(user.user_id),
        "email": user.email,
        "roles": user.roles,
        "login_time": datetime.utcnow().isoformat()
    }
    AuthService.store_user_session(str(user.user_id), session_data)
    
    # Log audit event
    log_audit_event(user.user_id, "user_login", "user", {"email": user.email})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": schemas.UserOut(
            user_id=user.user_id,
            email=user.email,
            roles=user.roles,
            mfa_enabled=user.mfa_enabled,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    }

@router.post("/mfa/verify")
async def verify_mfa(
    user_id: str,
    mfa_code: str,
    db: AsyncSession = Depends(get_db)
):
    """Verify MFA code and complete login"""
    user = await crud.get_user_by_id(db, UUID(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.mfa_enabled or not user.mfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA not enabled for this user"
        )
    
    # Verify MFA code
    if not AuthService.verify_mfa_code(user.mfa_secret, mfa_code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MFA code"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.user_id)})
    refresh_token = AuthService.create_refresh_token({"sub": str(user.user_id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": schemas.UserOut(
            user_id=user.user_id,
            email=user.email,
            roles=user.roles,
            mfa_enabled=user.mfa_enabled,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    }

@router.post("/mfa/setup")
async def setup_mfa(
    current_user: schemas.UserOut = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Setup MFA for user"""
    user = await crud.get_user_by_id(db, current_user.user_id)
    
    if user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA already enabled"
        )
    
    # Generate MFA secret
    mfa_secret = AuthService.generate_mfa_secret()
    
    # Generate QR code
    qr_code = AuthService.generate_mfa_qr_code(mfa_secret, user.email)
    
    # Generate backup codes
    backup_codes = AuthService.generate_backup_codes()
    
    # Store backup codes in Redis
    redis_client.sadd(f"backup_codes:{user.user_id}", *backup_codes)
    redis_client.expire(f"backup_codes:{user.user_id}", 86400)  # 24 hours
    
    return {
        "mfa_secret": mfa_secret,
        "qr_code": qr_code,
        "backup_codes": backup_codes,
        "message": "Scan QR code with your authenticator app"
    }

@router.post("/mfa/enable")
async def enable_mfa(
    mfa_code: str,
    current_user: schemas.UserOut = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Enable MFA after verification"""
    user = await crud.get_user_by_id(db, current_user.user_id)
    
    # Verify MFA code
    if not AuthService.verify_mfa_code(user.mfa_secret, mfa_code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MFA code"
        )
    
    # Enable MFA
    await crud.update_user_mfa(db, user.user_id, True)
    
    # Log audit event
    log_audit_event(user.user_id, "mfa_enabled", "user", {"email": user.email})
    
    return {"message": "MFA enabled successfully"}

@router.post("/refresh")
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db)
):
    """Refresh access token"""
    # Verify refresh token
    payload = AuthService.verify_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    user = await crud.get_user_by_id(db, UUID(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Create new access token
    access_token = create_access_token(data={"sub": str(user.user_id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout(
    current_user: schemas.UserOut = Depends(get_current_active_user),
    request: Request = None
):
    """Logout user and blacklist token"""
    if request:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            AuthService.blacklist_token(token)
    
    # Clear session
    AuthService.store_user_session(str(current_user.user_id), {})
    
    # Log audit event
    log_audit_event(current_user.user_id, "user_logout", "user", {"email": current_user.email})
    
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=schemas.UserOut)
async def get_current_user_info(
    current_user: schemas.UserOut = Depends(get_current_active_user)
):
    """Get current user information"""
    return current_user

@router.put("/me", response_model=schemas.UserOut)
async def update_current_user(
    user_update: schemas.UserUpdate,
    current_user: schemas.UserOut = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user information"""
    updated_user = await crud.update_user(db, current_user.user_id, user_update.dict(exclude_unset=True))
    
    # Log audit event
    log_audit_event(current_user.user_id, "user_updated", "user", {"email": current_user.email})
    
    return updated_user

@router.post("/password/change")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: schemas.UserOut = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Change user password"""
    user = await crud.get_user_by_id(db, current_user.user_id)
    
    # Verify current password
    if not verify_password(current_password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Validate new password
    if not validate_password_strength(new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password does not meet security requirements"
        )
    
    # Update password
    hashed_password = get_password_hash(new_password)
    await crud.update_user_password(db, current_user.user_id, hashed_password)
    
    # Log audit event
    log_audit_event(current_user.user_id, "password_changed", "user", {"email": current_user.email})
    
    return {"message": "Password changed successfully"}

# Export commonly used dependencies
__all__ = [
    "AuthService",
    "RoleBasedAccessControl",
    "get_current_user",
    "get_current_active_user",
    "require_roles",
    "require_permission",
    "require_admin",
    "require_manager_or_admin",
    "rate_limit",
    "get_user_session_data",
    "update_user_session",
    "sanitize_input",
    "validate_password_strength",
    "generate_secure_token",
    "log_audit_event"
] 