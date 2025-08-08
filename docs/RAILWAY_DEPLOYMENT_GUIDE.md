# Railway Deployment Guide - SME Management System

## 🚀 Overview

This guide provides step-by-step instructions for deploying the SME Management System on Railway platform with PostgreSQL database.

**Architecture:**
- **Backend:** FastAPI (Python) on Railway
- **Frontend:** React on Railway  
- **Database:** PostgreSQL on Railway

## 📋 Prerequisites

- Railway account (https://railway.app)
- GitHub repository with SME Management System code
- Database already created on Railway

## 🗄️ Database Setup (Already Completed)

✅ **Database Information:**
- **URL:** `postgresql://postgres:SYUbfiDuzlUYeOzXRRWuherDJpiWkcAr@nozomi.proxy.rlwy.net:22599/railway`
- **Host:** nozomi.proxy.rlwy.net
- **Port:** 22599
- **Database:** railway
- **Username:** postgres
- **Password:** SYUbfiDuzlUYeOzXRRWuherDJpiWkcAr

## 🔧 Backend Deployment

### Step 1: Create Backend Service

1. **Login to Railway Dashboard**
   - Go to https://railway.app
   - Login to your account
   - Navigate to your project

2. **Add New Service**
   - Click "New Service"
   - Select "GitHub Repo"
   - Choose your `sme-management-system` repository
   - Set root directory to `/backend`

### Step 2: Configure Environment Variables

In Railway dashboard, go to your backend service → Variables tab and add:

```bash
# Database
DATABASE_URL=postgresql://postgres:SYUbfiDuzlUYeOzXRRWuherDJpiWkcAr@nozomi.proxy.rlwy.net:22599/railway

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production-$(openssl rand -hex 32)
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
APP_NAME=SME Management System
APP_VERSION=1.0.0
DEBUG=False
ENVIRONMENT=production

# CORS (Update with your frontend URL)
ALLOWED_ORIGINS=["https://your-frontend-domain.railway.app"]

# Security
RATE_LIMIT_ENABLED=True
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# Railway
PORT=8000
HOST=0.0.0.0

# SME Modules
ENABLE_HR_MODULE=True
ENABLE_PROJECT_MODULE=True
ENABLE_INVENTORY_MODULE=True
ENABLE_FINANCIAL_MODULE=True
```

### Step 3: Configure Build Settings

1. **Build Command:** (Leave empty - Railway auto-detects)
2. **Start Command:** 
   ```bash
   uvicorn main_sme:app --host 0.0.0.0 --port $PORT
   ```

### Step 4: Deploy Backend

1. **Trigger Deployment**
   - Push code to GitHub repository
   - Railway will automatically deploy
   - Monitor deployment logs

2. **Run Database Migrations**
   - After successful deployment, run migrations:
   ```bash
   # In Railway console or locally with production DATABASE_URL
   alembic upgrade head
   ```

3. **Verify Deployment**
   - Check deployment logs for errors
   - Test API endpoints:
     - `GET /health` - Health check
     - `GET /` - Root endpoint
     - `GET /docs` - API documentation (if DEBUG=True)

## 🌐 Frontend Deployment

### Step 1: Create Frontend Service

1. **Add New Service**
   - Click "New Service" in your Railway project
   - Select "GitHub Repo"
   - Choose your `sme-management-system` repository
   - Set root directory to `/frontend`

### Step 2: Configure Environment Variables

```bash
# API Configuration
REACT_APP_API_URL=https://your-backend-domain.railway.app
REACT_APP_API_VERSION=v1

# Application
REACT_APP_NAME=SME Management System
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production

# Features
REACT_APP_ENABLE_HR=true
REACT_APP_ENABLE_PROJECTS=true
REACT_APP_ENABLE_INVENTORY=true
REACT_APP_ENABLE_FINANCIAL=true
```

### Step 3: Configure Build Settings

1. **Build Command:**
   ```bash
   npm run build
   ```

2. **Start Command:**
   ```bash
   npm start
   ```

### Step 4: Deploy Frontend

1. **Trigger Deployment**
   - Push frontend code to repository
   - Railway will automatically build and deploy

2. **Update CORS Settings**
   - Get your frontend Railway URL
   - Update backend `ALLOWED_ORIGINS` environment variable

## 🔐 Security Configuration

### JWT Secret Key Generation

Generate a secure JWT secret key:

```bash
# Generate a secure random key
openssl rand -hex 32

# Or use Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### CORS Configuration

Update `ALLOWED_ORIGINS` in backend environment variables:

```bash
ALLOWED_ORIGINS=["https://your-frontend-domain.railway.app", "https://your-custom-domain.com"]
```

### Rate Limiting

Configure rate limiting in environment variables:

```bash
RATE_LIMIT_ENABLED=True
RATE_LIMIT_REQUESTS=100  # requests per period
RATE_LIMIT_PERIOD=60     # period in seconds
```

## 📊 Database Migration

### Initial Migration

```bash
# Connect to your Railway backend service console
# Or run locally with production DATABASE_URL

# Run migrations
alembic upgrade head

# Verify tables created
psql $DATABASE_URL -c "\dt"
```

### Create Admin User

```bash
# Connect to database
psql $DATABASE_URL

# Create admin user
INSERT INTO users (id, username, email, hashed_password, role, is_active, created_at)
VALUES (
    gen_random_uuid()::text,
    'admin',
    'admin@yourcompany.com',
    '$2b$12$your_hashed_password_here',
    'superadmin',
    true,
    NOW()
);
```

## 🔍 Monitoring & Logging

### Health Checks

Railway automatically monitors your services. Configure health check endpoints:

- **Backend:** `GET /health`
- **Frontend:** Default Railway health check

### Logging

View logs in Railway dashboard:

1. Go to your service
2. Click "Logs" tab
3. Monitor real-time logs

### Metrics

Monitor performance metrics:

- Response times
- Error rates
- Memory usage
- CPU usage

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check DATABASE_URL format
   # Verify database is running
   # Check network connectivity
   ```

2. **Migration Errors**
   ```bash
   # Check database permissions
   # Verify migration files
   # Run migrations manually
   ```

3. **CORS Errors**
   ```bash
   # Update ALLOWED_ORIGINS
   # Check frontend URL
   # Verify CORS middleware
   ```

4. **Environment Variables Not Loading**
   ```bash
   # Check variable names
   # Restart service
   # Verify Railway dashboard settings
   ```

### Debug Commands

```bash
# Check environment variables
env | grep -E "(DATABASE|JWT|APP)"

# Test database connection
python -c "
import psycopg2
conn = psycopg2.connect('$DATABASE_URL')
print('Database connection successful')
conn.close()
"

# Check API health
curl https://your-backend-domain.railway.app/health
```

## 📈 Performance Optimization

### Backend Optimization

1. **Database Connection Pooling**
   ```python
   # In database.py
   engine = create_engine(
       DATABASE_URL,
       pool_size=10,
       max_overflow=20,
       pool_pre_ping=True
   )
   ```

2. **Caching**
   ```python
   # Add Redis for caching (optional)
   # Configure response caching
   ```

### Frontend Optimization

1. **Build Optimization**
   ```bash
   # Enable production build optimizations
   npm run build
   ```

2. **Static Asset Caching**
   ```bash
   # Configure proper cache headers
   # Use CDN for static assets
   ```

## 🔄 CI/CD Pipeline

### Automatic Deployment

Railway automatically deploys when you push to GitHub:

1. **Push to main branch**
2. **Railway detects changes**
3. **Builds and deploys automatically**
4. **Health checks verify deployment**

### Manual Deployment

```bash
# Trigger manual deployment
railway up

# Deploy specific service
railway up --service backend
railway up --service frontend
```

## 📝 Post-Deployment Checklist

### Backend Verification

- [ ] Health check endpoint responds
- [ ] Database connection working
- [ ] Authentication endpoints working
- [ ] API documentation accessible
- [ ] Logs showing no errors

### Frontend Verification

- [ ] Application loads correctly
- [ ] Login functionality works
- [ ] API calls successful
- [ ] All modules accessible
- [ ] Responsive design working

### Security Verification

- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] JWT tokens working
- [ ] Security headers present

## 🆘 Support & Maintenance

### Regular Maintenance

1. **Monitor logs daily**
2. **Check performance metrics**
3. **Update dependencies monthly**
4. **Backup database regularly**
5. **Review security settings**

### Emergency Procedures

1. **Service Down**
   - Check Railway status
   - Review recent deployments
   - Check logs for errors
   - Rollback if necessary

2. **Database Issues**
   - Check connection string
   - Verify database status
   - Contact Railway support

### Contact Information

- **Railway Support:** https://railway.app/help
- **Documentation:** https://docs.railway.app
- **Community:** https://discord.gg/railway

---

## 🎉 Deployment Complete!

Your SME Management System is now deployed on Railway with:

✅ **Backend API** - FastAPI with all SME modules
✅ **Frontend App** - React with responsive design  
✅ **Database** - PostgreSQL with all tables
✅ **Security** - JWT authentication, CORS, rate limiting
✅ **Monitoring** - Health checks and logging

**Next Steps:**
1. Create admin user account
2. Test all functionality
3. Configure custom domain (optional)
4. Set up monitoring alerts
5. Train users on the system

**Access URLs:**
- **Backend API:** https://your-backend-domain.railway.app
- **Frontend App:** https://your-frontend-domain.railway.app
- **API Docs:** https://your-backend-domain.railway.app/docs

