#!/bin/bash
echo "Starting Auth System Frontend..."
echo "Using Railway Backend: https://web-production-5b6ab.up.railway.app"

# Set environment variable and start dev server
export VITE_API_URL=https://web-production-5b6ab.up.railway.app
pnpm dev
