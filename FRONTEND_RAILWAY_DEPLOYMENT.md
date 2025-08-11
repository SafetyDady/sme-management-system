# 🚀 Frontend Railway Deployment Guide
*Date: August 9, 2025*
*Purpose: Deploy React frontend to Railway for complete production setup*

---

## 📋 Pre-deployment Checklist

### ✅ Current Status:
- **Backend**: Deployed and working at `https://sme-management-system-production.up.railway.app`
- **Database**: PostgreSQL on Railway (working)
- **Frontend**: Local development only (needs deployment)

---

## 🔧 Railway Frontend Setup

### Step 1: Create Dockerfile for Frontend

Create `/home/safety/sme-management/frontend/Dockerfile`:

```dockerfile
# Multi-stage build for React frontend
FROM node:18-alpine as build-stage

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app for production
RUN npm run build

# Production stage with Express server
FROM node:18-alpine as production-stage

# Set working directory
WORKDIR /app

# Copy built app and server
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/server.js ./
COPY --from=build-stage /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Expose port
EXPOSE $PORT

# Start the server
CMD ["npm", "start"]
```

### Step 2: Update server.js for Railway

The current `server.js` looks good, but let's verify the backend URL:

```javascript
// Current proxy target in server.js
target: 'https://sme-management-system-production.up.railway.app'
```

### Step 3: Railway Configuration

Create `/home/safety/sme-management/frontend/railway.toml`:

```toml
[build]
builder = "dockerfile"

[deploy]
healthcheckPath = "/"
healthcheckTimeout = 300
restartPolicyType = "on_failure"  
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
PORT = "3000"
```

---

## 🌍 Environment Variables for Railway

### Required Variables for Frontend Service:

#### **1. Basic Configuration**
```bash
NODE_ENV=production
PORT=3000
```

#### **2. API Backend URL (if needed for build-time)**
```bash
VITE_API_URL=https://sme-management-system-production.up.railway.app
VITE_BACKEND_URL=https://sme-management-system-production.up.railway.app
```

#### **3. Optional Build Variables**
```bash
VITE_APP_NAME=SME Management System
VITE_APP_VERSION=1.0.0
```

---

## 📋 Railway Deployment Steps

### Method 1: GitHub Integration (Recommended)

1. **Push frontend changes to GitHub:**
   ```bash
   git add .
   git commit -m "🚀 Prepare frontend for Railway deployment"
   git push
   ```

2. **Create new Railway service:**
   - Go to Railway Dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select "frontend" folder as root directory

3. **Configure Service Settings:**
   - **Name**: `sme-frontend` or `sme-management-frontend`
   - **Root Directory**: `/frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

4. **Set Environment Variables:**
   ```
   NODE_ENV = production
   PORT = 3000
   VITE_BACKEND_URL = https://sme-management-system-production.up.railway.app
   ```

### Method 2: Railway CLI (Alternative)

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize in frontend directory:**
   ```bash
   cd frontend
   railway init
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

---

## 🔧 Required File Updates

### 1. Update package.json scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node server.js",
    "build:railway": "NODE_ENV=production vite build && cp server.js dist/"
  }
}
```

### 2. Update vite.config.js for production API URL:

```javascript
// In vite.config.js, update proxy target
proxy: {
  '/api': {
    target: process.env.VITE_BACKEND_URL || 'https://sme-management-system-production.up.railway.app',
    changeOrigin: true,
    secure: true,
  }
}
```

### 3. Update API configuration in frontend:

In `/src/lib/api.js`, make sure it uses the correct base URL:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                    (window.location.origin.includes('railway.app') 
                      ? '/api' 
                      : 'http://localhost:3000/api');
```

---

## 🔗 Expected URLs After Deployment

### Backend (Current):
- **API URL**: `https://sme-management-system-production.up.railway.app`
- **Health Check**: `https://sme-management-system-production.up.railway.app/health`
- **Login API**: `https://sme-management-system-production.up.railway.app/api/login`

### Frontend (After Deployment):
- **App URL**: `https://[your-frontend-service].up.railway.app`
- **Health Check**: `https://[your-frontend-service].up.railway.app/`
- **API Proxy**: `https://[your-frontend-service].up.railway.app/api/*`

---

## 🧪 Testing Plan

### Before Deployment:
1. **Test local build:**
   ```bash
   cd frontend
   npm run build
   npm start
   ```

2. **Verify API connectivity:**
   - Login functionality
   - User management
   - Profile management

### After Deployment:
1. **Test production app:**
   - Access frontend URL
   - Login with test accounts
   - Verify all features work
   - Check API proxy functionality

---

## 🚨 Important Notes

### **Current Backend API Endpoint:**
- The backend is at: `https://sme-management-system-production.up.railway.app`
- Frontend will proxy `/api/*` to this URL
- No changes needed to backend

### **DNS/URL Structure:**
- Backend: `sme-management-system-production.up.railway.app`
- Frontend: `[new-service-name].up.railway.app` (to be created)

### **Security Considerations:**
- CORS is already configured in backend
- Frontend will proxy API calls (no direct API calls)
- JWT tokens handled securely

---

## ✅ Action Items

1. **Create required files:**
   - [ ] `frontend/Dockerfile`
   - [ ] `frontend/railway.toml`

2. **Update configuration:**
   - [ ] Verify `server.js` backend URL
   - [ ] Update `package.json` scripts if needed
   - [ ] Ensure `vite.config.js` is production-ready

3. **Deploy to Railway:**
   - [ ] Push changes to GitHub
   - [ ] Create new Railway service
   - [ ] Configure environment variables
   - [ ] Test deployment

4. **Verify production:**
   - [ ] Test login functionality
   - [ ] Test user management
   - [ ] Verify API connectivity
   - [ ] Check all existing features

---

**Ready to proceed with deployment?** 

Let me know when you want me to create the necessary files and start the deployment process!
