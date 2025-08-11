# 🚀 Frontend Deployment Guide - Railway Only

## 📋 Deployment Overview
**Frontend Framework**: React + Vite  
**Target Platform**: Railway (Recommended)  
**Backend API**: https://sme-management-system-production.up.railway.app  
**Production Build**: ✅ Ready

---

## 🚄 Railway Frontend Deployment

### **Step 1: Railway Setup**
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub account
3. Create new project and connect repository: `SafetyDady/sme-management-system`
4. Select `frontend` directory as root

### **Step 2: Configure Build Settings**
```yaml
Build Command: npm run build:prod
Start Command: npm start
Root Directory: frontend
Node.js Version: 18.x
Port: 3000
```

### **Step 3: Environment Variables**
Add these in Railway dashboard:
```env
VITE_API_URL=https://sme-management-system-production.up.railway.app
VITE_ENV=production
NODE_ENV=production
```

### **Step 4: Deploy**
- Railway will auto-deploy from main branch
- Monitor deployment logs
- Get production URL from Railway dashboard

---

## 🔧 Alternative: Local Development

### **Step 1: Build Configuration**
```bash
cd frontend
npm install
npm run build:prod
npm start
```

### **Step 2: Environment Setup**
```env
# .env.production
VITE_API_URL=https://sme-management-system-production.up.railway.app
VITE_ENV=production
```

---

## ✅ Post-Deployment Checklist

### **1. Test Production Login**
```bash
# Access your deployed frontend URL
# Test admin login: admin/admin123
# Verify API connectivity
```

### **2. Update CORS Settings (if needed)**
If you get CORS errors, update backend CORS origins:
```python
# In backend/main.py
origins = [
    "http://localhost:3001",
    "https://your-railway-frontend.railway.app",  # Add your Railway frontend URL
    # ... other origins
]
```

### **3. Test All Features**
- [x] Login/Logout
- [x] User Management (admin only)
- [x] HR Employee CRUD operations
- [x] Search and filter functions

---

## 🌐 Expected Production URLs

```yaml
Backend API: https://sme-management-system-production.up.railway.app
Frontend (Railway): https://sme-management-frontend.railway.app
```

---

## 🚨 Troubleshooting

### **CORS Issues**
```bash
# Add your frontend URL to backend CORS origins
# Redeploy backend after changes
```

### **Environment Variables**
```bash
# Make sure VITE_API_URL is set correctly
# Check Railway environment configuration
```

### **Build Failures**
```bash
# Check Node.js version in Railway (use 18.x)
# Clear node_modules and reinstall if needed
# Check Railway build logs
```

---

## 🎉 Success Criteria

✅ Frontend accessible from public URL  
✅ Login works with admin/admin123  
✅ All HR features functional  
✅ No CORS errors  
✅ Fast loading times  

---

*Ready to deploy? Follow the Railway steps above for seamless deployment!*
