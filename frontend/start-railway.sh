#!/bin/bash
echo "Starting Auth System Frontend..."
echo "Using Railway Backend: https://sme-management-system-production.up.railway.app"

# Set environment variable and start dev server
export VITE_API_URL=https://sme-management-system-production.up.railway.app
pnpm dev
