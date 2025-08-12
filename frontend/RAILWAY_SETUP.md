# Railway Service Configuration Guide
# Copy these settings to your Railway service

[Environment Variables]
VITE_API_URL=https://sme-management-system-production.up.railway.app
VITE_ENV=production
NODE_VERSION=20
PORT=3000
NODE_ENV=production
NPM_CONFIG_LEGACY_PEER_DEPS=true

[Service Settings]
Name=auth-frontend
Region=us-east1
Runtime=Docker

[Networking]
Public=true
Generate Domain=true

[Build Configuration] 
# Railway auto-detects from Dockerfile
Dockerfile=./Dockerfile
Build Context=.

[Expected Build Flow]
1. npm install --legacy-peer-deps
2. npm run build (vite build) 
3. serve -s dist -l 3000
4. Health check passed
5. Deploy successful

[Monitoring]
Health Check Endpoint=/
Expected Response=200
Service Port=3000
