#!/usr/bin/env python3
"""
Create test HR employees for Employee Assignment testing
"""
import psycopg2
import random
from datetime import datetime, date

# Railway PostgreSQL connection
DATABASE_URL = 'postgresql://postgres:bBFdAzCdEeXNMrVWbEeXdOGTtAkTttkE@junction.proxy.rlwy.net:47334/railway'

def create_test_employees():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # First, check if hr_employees table exists and its structure
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'hr_employees'
            ORDER BY ordinal_position;
        """)
        columns = cursor.fetchall()
        print("HR Employees table structure:")
        for col in columns:
            print(f"  {col[0]} - {col[1]}")
        
        if not columns:
            print("Creating hr_employees table...")
            cursor.execute("""
                CREATE TABLE hr_employees (
                    employee_id SERIAL PRIMARY KEY,
                    employee_code VARCHAR(20) UNIQUE NOT NULL,
                    first_name VARCHAR(100) NOT NULL,
                    last_name VARCHAR(100) NOT NULL,
                    email VARCHAR(255),
                    phone VARCHAR(20),
                    department VARCHAR(100),
                    position VARCHAR(100),
                    hire_date DATE,
                    salary DECIMAL(10,2),
                    is_active BOOLEAN DEFAULT true,
                    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            print("HR Employees table created!")
        
        # Check existing employees
        cursor.execute("SELECT COUNT(*) FROM hr_employees;")
        count = cursor.fetchone()[0]
        print(f"Current employees count: {count}")
        
        if count == 0:
            # Create test employees
            test_employees = [
                ("EMP001", "สมชาย", "ใจดี", "somchai.jaidee@company.com", "081-234-5678", "IT", "Developer", "2023-01-15", 35000),
                ("EMP002", "สุดา", "รักดี", "suda.rakdee@company.com", "082-345-6789", "HR", "HR Specialist", "2023-02-01", 30000),
                ("EMP003", "วิชาย", "สร้างสรรค์", "wichai.sangsang@company.com", "083-456-7890", "Marketing", "Marketing Manager", "2023-03-01", 40000),
                ("EMP004", "นิดา", "ขยันดี", "nida.kayandee@company.com", "084-567-8901", "Finance", "Accountant", "2023-04-01", 32000),
                ("EMP005", "ประยุทธ", "มั่นคง", "prayuth.mankong@company.com", "085-678-9012", "Operations", "Operations Manager", "2023-05-01", 45000),
                ("EMP006", "อรุณ", "สว่างใจ", "arun.sawangjai@company.com", "086-789-0123", "IT", "System Admin", "2023-06-01", 38000),
                ("EMP007", "มาลี", "ดีใจ", "malee.deejai@company.com", "087-890-1234", "Sales", "Sales Executive", "2023-07-01", 28000),
                ("EMP008", "ธนา", "รุ่งเรือง", "thana.rungruang@company.com", "088-901-2345", "Purchasing", "Procurement Officer", "2023-08-01", 33000),
            ]
            
            for emp in test_employees:
                cursor.execute("""
                    INSERT INTO hr_employees 
                    (employee_code, first_name, last_name, email, phone, department, position, hire_date, salary)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, emp)
            
            conn.commit()
            print(f"Created {len(test_employees)} test employees!")
            
            # Display created employees
            cursor.execute("""
                SELECT employee_id, employee_code, first_name, last_name, department, position, user_id
                FROM hr_employees 
                ORDER BY employee_code;
            """)
            employees = cursor.fetchall()
            print("\nCreated employees:")
            for emp in employees:
                print(f"  ID: {emp[0]}, Code: {emp[1]}, Name: {emp[2]} {emp[3]}, Dept: {emp[4]}, Position: {emp[5]}, User ID: {emp[6]}")
        else:
            print("Employees already exist, skipping creation.")
            
        conn.close()
        print("\nDatabase operation completed successfully!")
        
    except Exception as e:
        print(f"Database error: {e}")
        return False
        
    return True

if __name__ == "__main__":
    create_test_employees()
