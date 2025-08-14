from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Try multiple environment variable names for database URL
DATABASE_URL = (
    os.getenv("DATABASE_URL") or 
    os.getenv("POSTGRES_URL") or 
    os.getenv("DB_URL")
)

# Check if DATABASE_URL contains Railway template variables (not resolved)
if DATABASE_URL and DATABASE_URL.startswith("${"):
    print(f"Warning: DATABASE_URL contains template variable: {DATABASE_URL}")
    DATABASE_URL = None

# Enhanced fallback with multiple options
if not DATABASE_URL:
    print("Warning: DATABASE_URL not found or invalid in environment variables")
    
    # Try Railway specific environment variables
    db_host = os.getenv("POSTGRES_HOST") or os.getenv("DB_HOST")
    db_port = os.getenv("POSTGRES_PORT") or os.getenv("DB_PORT") or "5432"
    db_name = os.getenv("POSTGRES_DB") or os.getenv("DATABASE_NAME") or "railway"
    db_user = os.getenv("POSTGRES_USER") or os.getenv("DB_USER") or "postgres"
    db_password = os.getenv("POSTGRES_PASSWORD") or os.getenv("DB_PASSWORD")
    
    if db_host and db_password:
        DATABASE_URL = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        print(f"Built DATABASE_URL from individual components: postgresql://{db_user}:***@{db_host}:{db_port}/{db_name}")
    else:
        # Final fallback for local development
        DATABASE_URL = "postgresql://postgres:smepass123@localhost:5432/sme_management_dev"
        print(f"Using local development DATABASE_URL")

print(f"Final Database URL: {DATABASE_URL}")

# Validate URL format
if not (DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("sqlite:///")):
    raise ValueError(f"Invalid DATABASE_URL format: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

