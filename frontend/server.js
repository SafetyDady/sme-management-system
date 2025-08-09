// Railway Proxy Server for Frontend
// This runs alongside the static frontend and proxies API calls

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// API Proxy to Backend - Handle both /api and /auth routes
app.use('/api', createProxyMiddleware({
  target: 'https://sme-management-system-production.up.railway.app',
  changeOrigin: true,
  pathRewrite: {
    '^/api/login': '/auth/login',     // Map login to auth endpoint
    '^/api/auth': '/auth',           // Map auth routes
    '^/api': '/api',                 // Keep other API routes as-is
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying:', req.method, req.url, '->', proxyReq.path);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

// Auth Proxy to Backend - Direct auth routes  
app.use('/auth', createProxyMiddleware({
  target: 'https://sme-management-system-production.up.railway.app',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log('Auth Proxying:', req.method, req.url, '->', proxyReq.path);
  },
  onError: (err, req, res) => {
    console.error('Auth Proxy error:', err);
    res.status(500).json({ error: 'Auth Proxy error', message: err.message });
  }
}));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend server running on port ${PORT}`);
  console.log(`📡 API proxy: /api/* -> https://sme-management-system-production.up.railway.app/*`);
});

export default app;
