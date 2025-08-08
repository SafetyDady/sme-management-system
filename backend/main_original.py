from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles  # Not needed for pure backend
# from fastapi.responses import FileResponse  # Not needed for pure backend
from sqlalchemy.orm import Session
from datetime import timedelta
import os

from app.database import get_db
from app.models import User
from app.schemas import UserLogin, Token, User as UserSchema
from app.auth import create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from app.users import authenticate_user

app = FastAPI(title="Auth System with Role Dashboard", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files - Commented out for pure backend deployment
# app.mount("/static", StaticFiles(directory="frontend"), name="static")

@app.get("/")
async def root():
    return {"message": "Auth System API", "docs": "/docs", "health": "/health"}

# @app.get("/login")
# async def login_page():
#     return FileResponse("frontend/login.html")

@app.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/auth/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# @app.get("/dashboard")
# async def dashboard(current_user: User = Depends(get_current_user)):
#     if current_user.role == "superadmin":
#         return FileResponse("frontend/superadmin_dashboard.html")
#     elif current_user.role in ["admin1", "admin2"]:
#         return FileResponse("frontend/admin_dashboard.html")
#     else:
#         raise HTTPException(status_code=403, detail="Access denied")

@app.get("/dashboard")
async def dashboard(current_user: User = Depends(get_current_user)):
    return {
        "message": f"Welcome {current_user.username}",
        "role": current_user.role,
        "access_level": "superadmin" if current_user.role == "superadmin" else "admin"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Auth system is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

