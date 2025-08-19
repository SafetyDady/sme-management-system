// Local Development Server for Frontend
// This runs the frontend with local backend proxy

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// API Proxy to Local Backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log('🔧 LOCAL DEV - Proxying:', req.method, req.url, '->', proxyReq.path);
  },
  onError: (err, req, res) => {
    console.error('❌ Local proxy error:', err);
    res.status(500).json({ error: 'Local proxy error', message: err.message });
  }
}));

// Auth Proxy to Local Backend
app.use('/auth', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log('🔧 LOCAL DEV - Auth Proxying:', req.method, req.url, '->', proxyReq.path);
  },
  onError: (err, req, res) => {
    console.error('❌ Local auth proxy error:', err);
    res.status(500).json({ error: 'Local auth proxy error', message: err.message });
  }
}));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Local Development Frontend server running on port ${PORT}`);
  console.log(`📡 API proxy: /api/* -> http://localhost:8000/*`);
  console.log(`📡 Auth proxy: /auth/* -> http://localhost:8000/auth/*`);
});
