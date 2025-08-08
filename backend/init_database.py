#!/usr/bin/env python3
"""
Database Initialization Script for SME Management System
This script initializes the database with required tables and creates an admin user
"""

import os
import sys
import asyncio
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Add the app directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, get_database_url
from app.models_all import *  # Import all models

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_admin_user(session, username: str = "admin", email: str = "admin@sme.local", password: str = "admin123"):
    """Create an admin user"""
    try:
        # Check if admin user already exists
        existing_user = session.query(User).filter(User.username == username).first()
        if existing_user:
            print(f"✅ Admin user '{username}' already exists")
            return existing_user
        
        # Create new admin user
        hashed_password = hash_password(password)
        admin_user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            role="superadmin",
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        session.add(admin_user)
        session.commit()
        session.refresh(admin_user)
        
        print(f"✅ Created admin user: {username} / {email}")
        print(f"🔑 Default password: {password}")
        print("⚠️  Please change the password after first login!")
        
        return admin_user
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        session.rollback()
        return None

def initialize_sample_data(session):
    """Initialize sample data for testing"""
    try:
        print("📊 Creating sample data...")
        
        # Create sample HR employee
        sample_employee = HREmployee(
            emp_code="EMP001",
            first_name="John",
            last_name="Doe",
            position="Software Developer",
            department="IT",
            employment_type="monthly",
            salary_monthly=50000.00,
            active_status=True
        )
        session.add(sample_employee)
        
        # Create sample customer
        sample_customer = Customer(
            customer_name="ABC Company Ltd.",
            contact_person="Jane Smith",
            contact_phone="02-123-4567",
            contact_email="jane@abc.com",
            customer_type="company",
            active_status=True
        )
        session.add(sample_customer)
        
        # Create sample inventory category
        sample_category = InventoryCategory(
            category_name="Office Supplies",
            category_code="OFF",
            description="General office supplies and materials",
            active_status=True
        )
        session.add(sample_category)
        
        # Create sample financial account
        sample_account = FinancialAccount(
            account_code="1000",
            account_name="Cash",
            account_type="asset",
            current_balance=100000.00,
            active_status=True
        )
        session.add(sample_account)
        
        session.commit()
        print("✅ Sample data created successfully")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        session.rollback()

def main():
    """Main initialization function"""
    print("🚀 Initializing SME Management System Database...")
    
    # Get database URL
    database_url = get_database_url()
    print(f"📍 Database URL: {database_url[:50]}...")
    
    try:
        # Create engine and session
        engine = create_engine(database_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Test database connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Database connection successful")
            print(f"📊 PostgreSQL version: {version}")
        
        # Create all tables
        print("🏗️  Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully")
        
        # Create session
        session = SessionLocal()
        
        try:
            # Create admin user
            print("\n👤 Creating admin user...")
            admin_user = create_admin_user(
                session,
                username="admin",
                email="admin@sme.local",
                password="admin123"
            )
            
            # Create sample data (optional)
            create_sample = input("\n❓ Create sample data for testing? (y/N): ").lower().strip()
            if create_sample == 'y':
                initialize_sample_data(session)
            
            print("\n🎉 Database initialization completed successfully!")
            print("\n📋 Next steps:")
            print("1. Deploy the backend to Railway")
            print("2. Update environment variables")
            print("3. Run database migrations: alembic upgrade head")
            print("4. Test the API endpoints")
            print("5. Change admin password")
            
        finally:
            session.close()
            
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

