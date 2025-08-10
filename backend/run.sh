#!/usr/bin/env bash
set -euo pipefail

echo "[startup] Applying Alembic migrations..." 
alembic upgrade head || { echo "[startup] Migration failed"; exit 1; }

echo "[startup] Launching app..." 
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
