# 🚀 Frontend Deployment Guide

## 📋 Deployment Overview
**Frontend Framework**: React + Vite  
**Target Platform**: Vercel (Recommended)  
**Backend API**: https://sme-management-system-production.up.railway.app  
**Production Build**: ✅ Ready

---

## 🎯 Vercel Deployment (Recommended)

### **Step 1: Connect to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Import project from GitHub: `SafetyDady/sme-management-system`
4. Select `frontend` directory as root

### **Step 2: Configure Build Settings**
```yaml
Framework Preset: Vite
Build Command: npm run build:prod
Output Directory: dist
Install Command: npm install
Node.js Version: 18.x
```

### **Step 3: Environment Variables**
Add these in Vercel dashboard:
```env
VITE_API_URL=https://sme-management-system-production.up.railway.app
VITE_ENV=production
```

### **Step 4: Deploy**
- Click "Deploy" button
- Wait for deployment to complete
- Get production URL (e.g., `https://sme-management-frontend.vercel.app`)

---

## 🔧 Alternative: Netlify Deployment

### **Step 1: Build Configuration**
Create `netlify.toml` (already exists):
```toml
[build]
  command = "npm run build:prod"
  publish = "dist"

[build.environment]
  VITE_API_URL = "https://sme-management-system-production.up.railway.app"
  VITE_ENV = "production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### **Step 2: Deploy**
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Select `frontend` folder
4. Deploy automatically

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
    "https://your-vercel-url.vercel.app",  # Add your deployment URL
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
Frontend (Vercel): https://sme-management-frontend.vercel.app
Frontend (Netlify): https://sme-management-frontend.netlify.app
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
# Check browser console for API endpoint errors
```

### **Build Failures**
```bash
# Check Node.js version (use 18.x)
# Clear node_modules and reinstall if needed
```

---

## 🎉 Success Criteria

✅ Frontend accessible from public URL  
✅ Login works with admin/admin123  
✅ All HR features functional  
✅ No CORS errors  
✅ Fast loading times  

---

*Ready to deploy? Just follow the Vercel steps above!*
