# 🚀 Vercel Deployment Guide

## 📋 Quick Deploy Steps

### 1. Connect to Vercel
```bash
# Connect to Vercel (if not connected)
npx vercel login
npx vercel link

# Deploy to production
npx vercel --prod
```

### 2. Automatic Deployment
- Push to `master` branch for automatic deployment
- Vercel detects changes and deploys automatically

## ⚙️ Configuration Files

### vercel.json
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install --legacy-peer-deps",
  "devCommand": "npm run dev"
}
```

### Environment Variables
Set in Vercel Dashboard:
- `VITE_API_URL`: `https://sme-management-system-production.up.railway.app`
- `VITE_ENV`: `production` 
- `NODE_VERSION`: `20`

## 🛠️ Build Optimization

### Current Bundle Sizes
- CSS: ~18 KB (gzipped)
- JS: ~173 KB (gzipped)
- Total: ~191 KB (gzipped)

### Performance Features
- ✅ Code splitting enabled
- ✅ Tree shaking
- ✅ Minification
- ✅ Gzip compression
- ✅ Asset optimization

## 🔧 Local Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Development with local backend
npm run dev:local

# Development with Railway backend  
npm run dev:railway

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Live URLs

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://sme-management-system-production.up.railway.app`
- **API Docs**: `https://sme-management-system-production.up.railway.app/docs`

## 🐛 Common Issues & Solutions

### Node.js Version
- Use Node.js 20 (defined in `.nvmrc`)
- Vercel automatically uses correct version

### Dependencies
- Use `--legacy-peer-deps` for compatibility
- All conflicts resolved in `package-lock.json`

### Bundle Size Warning
- Current: ~537 KB uncompressed
- Gzipped: ~173 KB (acceptable for production)
- Consider code splitting for larger apps

### CORS Issues
- Backend configured for frontend domain
- Environment variables set correctly

## 📊 Deployment Status

✅ **Ready for Production**
- All builds passing
- Dependencies resolved  
- Environment configured
- Routes working correctly
- API integration successful

## 🔄 CI/CD Pipeline

1. **Code Push** → GitHub
2. **Automatic Build** → Vercel  
3. **Deployment** → Production
4. **Health Check** → API endpoints

## 📝 Next Steps

1. **Custom Domain**: Configure in Vercel dashboard
2. **Analytics**: Enable Vercel Analytics
3. **Monitoring**: Set up error tracking
4. **Performance**: Monitor Core Web Vitals

---

**Last Updated**: August 7, 2025  
**Status**: ✅ Production Ready
