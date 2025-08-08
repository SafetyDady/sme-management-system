# Environment Variables Configuration - SME Management System

## 🔧 Overview

This document provides comprehensive configuration for environment variables needed for Railway deployment of the SME Management System.

## 🗄️ Database Configuration

### Railway PostgreSQL (Production)

```bash
# Primary database connection
DATABASE_URL=postgresql://postgres:SYUbfiDuzlUYeOzXRRWuherDJpiWkcAr@nozomi.proxy.rlwy.net:22599/railway

# Alternative format (if needed)
DB_HOST=nozomi.proxy.rlwy.net
DB_PORT=22599
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=SYUbfiDuzlUYeOzXRRWuherDJpiWkcAr
```

## 🔐 Security Configuration

### JWT Authentication

```bash
# Generate with: openssl rand -hex 32
JWT_SECRET_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Password Security

```bash
# Bcrypt configuration
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_SPECIAL=True
PASSWORD_REQUIRE_NUMBERS=True
PASSWORD_REQUIRE_UPPERCASE=True
```

### Rate Limiting

```bash
RATE_LIMIT_ENABLED=True
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60
RATE_LIMIT_AUTH_REQUESTS=5
RATE_LIMIT_AUTH_PERIOD=300
```

## 🌐 Application Configuration

### Basic Settings

```bash
APP_NAME=SME Management System
APP_VERSION=1.0.0
APP_DESCRIPTION=Complete SME Management System with HR, Projects, Inventory, and Financial modules
DEBUG=False
ENVIRONMENT=production
```

### Server Configuration

```bash
HOST=0.0.0.0
PORT=8000
WORKERS=4
RELOAD=False
LOG_LEVEL=INFO
LOG_FORMAT=json
```

### CORS Configuration

```bash
# Update with your actual frontend URLs
ALLOWED_ORIGINS=["https://your-frontend-domain.railway.app", "https://your-custom-domain.com"]
ALLOW_CREDENTIALS=True
ALLOWED_METHODS=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
ALLOWED_HEADERS=["*"]
```

## 📧 Email Configuration (Optional)

### SMTP Settings

```bash
# Gmail SMTP (recommended)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_USE_TLS=True
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=SME Management System

# Email templates
EMAIL_RESET_SUBJECT=Password Reset - SME Management System
EMAIL_WELCOME_SUBJECT=Welcome to SME Management System
```

### Email Features

```bash
EMAIL_ENABLED=True
EMAIL_VERIFICATION_REQUIRED=False
PASSWORD_RESET_ENABLED=True
PASSWORD_RESET_EXPIRE_MINUTES=30
```

## 🏢 SME Module Configuration

### Module Enablement

```bash
ENABLE_HR_MODULE=True
ENABLE_PROJECT_MODULE=True
ENABLE_INVENTORY_MODULE=True
ENABLE_FINANCIAL_MODULE=True
ENABLE_ANALYTICS_MODULE=True
```

### HR Module Settings

```bash
HR_DEFAULT_LEAVE_DAYS=20
HR_MAX_LEAVE_DAYS_PER_REQUEST=30
HR_REQUIRE_LEAVE_APPROVAL=True
HR_AUTO_APPROVE_SICK_LEAVE=False
HR_OVERTIME_RATE_1=1.5
HR_OVERTIME_RATE_2=2.0
HR_OVERTIME_RATE_3=3.0
```

### Project Module Settings

```bash
PROJECT_DEFAULT_STATUS=planning
PROJECT_AUTO_ASSIGN_CODE=True
PROJECT_CODE_PREFIX=PRJ
PROJECT_REQUIRE_CUSTOMER=True
PROJECT_TRACK_TIME=True
PROJECT_BUDGET_ALERTS=True
```

### Inventory Module Settings

```bash
INVENTORY_LOW_STOCK_THRESHOLD=10
INVENTORY_AUTO_REORDER=False
INVENTORY_TRACK_SERIAL_NUMBERS=True
INVENTORY_REQUIRE_APPROVAL=True
INVENTORY_BARCODE_ENABLED=True
```

### Financial Module Settings

```bash
FINANCIAL_DEFAULT_CURRENCY=THB
FINANCIAL_REQUIRE_APPROVAL=True
FINANCIAL_APPROVAL_LIMIT=10000
FINANCIAL_AUTO_BACKUP=True
FINANCIAL_TAX_RATE=7
FINANCIAL_FISCAL_YEAR_START=01-01
```

## 📁 File Upload Configuration

### Upload Settings

```bash
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_FOLDER=/tmp/uploads
ALLOWED_EXTENSIONS=["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png", "gif"]
UPLOAD_REQUIRE_AUTH=True
UPLOAD_VIRUS_SCAN=False
```

### Storage Configuration

```bash
# Local storage (Railway default)
STORAGE_TYPE=local
STORAGE_PATH=/tmp/uploads

# AWS S3 (optional)
# STORAGE_TYPE=s3
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
# AWS_BUCKET_NAME=your-bucket-name
# AWS_REGION=us-east-1
```

## 🔍 Monitoring & Logging

### Logging Configuration

```bash
LOG_LEVEL=INFO
LOG_FORMAT=json
LOG_FILE_ENABLED=False
LOG_FILE_PATH=/tmp/app.log
LOG_ROTATION_SIZE=10MB
LOG_RETENTION_DAYS=30
```

### Monitoring Settings

```bash
MONITORING_ENABLED=True
HEALTH_CHECK_INTERVAL=60
METRICS_ENABLED=True
PERFORMANCE_TRACKING=True
ERROR_TRACKING=True
```

### External Monitoring (Optional)

```bash
# Sentry for error tracking
# SENTRY_DSN=your-sentry-dsn
# SENTRY_ENVIRONMENT=production

# New Relic for performance monitoring
# NEW_RELIC_LICENSE_KEY=your-license-key
# NEW_RELIC_APP_NAME=SME Management System
```

## 🔄 Backup & Maintenance

### Backup Configuration

```bash
BACKUP_ENABLED=True
BACKUP_SCHEDULE=0 2 * * *  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30
BACKUP_COMPRESS=True
BACKUP_ENCRYPT=True
```

### Maintenance Settings

```bash
MAINTENANCE_MODE=False
MAINTENANCE_MESSAGE=System is under maintenance. Please try again later.
AUTO_UPDATE_ENABLED=False
UPDATE_CHECK_INTERVAL=24  # hours
```

## 🌍 Internationalization (Optional)

### Language Settings

```bash
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=["en", "th"]
TIMEZONE=Asia/Bangkok
DATE_FORMAT=DD/MM/YYYY
TIME_FORMAT=HH:mm:ss
CURRENCY_FORMAT=THB
```

## 🔒 Advanced Security

### Security Headers

```bash
SECURITY_HEADERS_ENABLED=True
HSTS_ENABLED=True
HSTS_MAX_AGE=31536000
CSP_ENABLED=True
XSS_PROTECTION=True
CONTENT_TYPE_NOSNIFF=True
```

### API Security

```bash
API_KEY_ENABLED=False
API_RATE_LIMIT_ENABLED=True
API_VERSIONING=True
API_DOCUMENTATION_ENABLED=False  # Disable in production
CORS_STRICT_MODE=True
```

## 📊 Analytics & Reporting

### Analytics Configuration

```bash
ANALYTICS_ENABLED=True
ANALYTICS_RETENTION_DAYS=365
USER_ACTIVITY_TRACKING=True
PERFORMANCE_METRICS=True
BUSINESS_METRICS=True
```

### Reporting Settings

```bash
REPORTS_ENABLED=True
REPORT_CACHE_ENABLED=True
REPORT_CACHE_TTL=3600  # 1 hour
REPORT_EXPORT_FORMATS=["pdf", "excel", "csv"]
SCHEDULED_REPORTS=True
```

## 🚀 Railway Specific Variables

### Railway Platform

```bash
# Automatically set by Railway
RAILWAY_ENVIRONMENT=production
RAILWAY_PROJECT_ID=0232cc8e-f0eb-4bca-a154-3cc08e873864
RAILWAY_SERVICE_ID=bc64010f-b150-4474-b4a0-c98c7bf30253

# Custom Railway settings
RAILWAY_STATIC_URL=https://your-backend-domain.railway.app
RAILWAY_HEALTH_CHECK_PATH=/health
RAILWAY_RESTART_POLICY=always
```

## 📝 Environment Files

### .env.railway (Production)

```bash
# Copy this to Railway environment variables
DATABASE_URL=postgresql://postgres:SYUbfiDuzlUYeOzXRRWuherDJpiWkcAr@nozomi.proxy.rlwy.net:22599/railway
JWT_SECRET_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
APP_NAME=SME Management System
APP_VERSION=1.0.0
DEBUG=False
ENVIRONMENT=production
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=INFO
LOG_FORMAT=json
ALLOWED_ORIGINS=["https://your-frontend-domain.railway.app"]
RATE_LIMIT_ENABLED=True
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60
ENABLE_HR_MODULE=True
ENABLE_PROJECT_MODULE=True
ENABLE_INVENTORY_MODULE=True
ENABLE_FINANCIAL_MODULE=True
```

### .env.development (Local)

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/sme_dev
JWT_SECRET_KEY=dev-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
APP_NAME=SME Management System (Dev)
APP_VERSION=1.0.0-dev
DEBUG=True
ENVIRONMENT=development
HOST=127.0.0.1
PORT=8000
LOG_LEVEL=DEBUG
LOG_FORMAT=text
ALLOWED_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]
RATE_LIMIT_ENABLED=False
ENABLE_HR_MODULE=True
ENABLE_PROJECT_MODULE=True
ENABLE_INVENTORY_MODULE=True
ENABLE_FINANCIAL_MODULE=True
```

## 🔧 Configuration Validation

### Required Variables Checklist

**Essential (Must Have):**
- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET_KEY`
- [ ] `APP_NAME`
- [ ] `ENVIRONMENT`
- [ ] `HOST`
- [ ] `PORT`

**Security (Recommended):**
- [ ] `ALLOWED_ORIGINS`
- [ ] `RATE_LIMIT_ENABLED`
- [ ] `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`
- [ ] `DEBUG=False` (production)

**SME Modules (Feature Control):**
- [ ] `ENABLE_HR_MODULE`
- [ ] `ENABLE_PROJECT_MODULE`
- [ ] `ENABLE_INVENTORY_MODULE`
- [ ] `ENABLE_FINANCIAL_MODULE`

### Validation Script

```python
# validate_env.py
import os
from typing import List, Dict

def validate_environment() -> Dict[str, List[str]]:
    """Validate environment variables"""
    required = [
        'DATABASE_URL',
        'JWT_SECRET_KEY',
        'APP_NAME',
        'ENVIRONMENT',
        'HOST',
        'PORT'
    ]
    
    missing = []
    invalid = []
    
    for var in required:
        if not os.getenv(var):
            missing.append(var)
    
    # Validate specific formats
    if os.getenv('JWT_SECRET_KEY') and len(os.getenv('JWT_SECRET_KEY')) < 32:
        invalid.append('JWT_SECRET_KEY (too short)')
    
    if os.getenv('DATABASE_URL') and not os.getenv('DATABASE_URL').startswith('postgresql://'):
        invalid.append('DATABASE_URL (invalid format)')
    
    return {
        'missing': missing,
        'invalid': invalid,
        'valid': len(missing) == 0 and len(invalid) == 0
    }

if __name__ == "__main__":
    result = validate_environment()
    if result['valid']:
        print("✅ All environment variables are valid")
    else:
        if result['missing']:
            print(f"❌ Missing variables: {', '.join(result['missing'])}")
        if result['invalid']:
            print(f"⚠️ Invalid variables: {', '.join(result['invalid'])}")
```

## 🆘 Troubleshooting

### Common Issues

1. **JWT_SECRET_KEY too short**
   ```bash
   # Generate secure key
   openssl rand -hex 32
   ```

2. **Database connection failed**
   ```bash
   # Check DATABASE_URL format
   # Verify database is accessible
   ```

3. **CORS errors**
   ```bash
   # Update ALLOWED_ORIGINS
   # Include all frontend URLs
   ```

4. **Module not loading**
   ```bash
   # Check ENABLE_*_MODULE variables
   # Verify module dependencies
   ```

---

## 📋 Quick Setup Checklist

1. **Copy environment variables to Railway**
2. **Generate secure JWT_SECRET_KEY**
3. **Update ALLOWED_ORIGINS with frontend URL**
4. **Verify DATABASE_URL is correct**
5. **Enable required SME modules**
6. **Test deployment**
7. **Run database migrations**
8. **Create admin user**
9. **Verify all endpoints**
10. **Monitor logs for errors**

**Ready for deployment!** 🚀

