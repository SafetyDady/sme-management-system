# Deployment Checklist (Automated Migrations Enabled)

This project now auto-applies Alembic migrations on startup via `run.sh`.

## What Happens on Start
1. `alembic upgrade head` runs (fails fast if migration error)
2. `uvicorn` launches the FastAPI app
3. Startup logs show current Alembic revision (if readable)

## One-Time Setup (Railway)
- Ensure environment variables:
  - `DATABASE_URL` (PostgreSQL)  
  - `SECRET_KEY`  
  - `ALGORITHM` (default: HS256)  
  - `ACCESS_TOKEN_EXPIRE_MINUTES` (e.g., 60)  
  - `ENVIRONMENT=production`

## Post-Deploy Smoke Test
```
GET   /health                 -> 200 { status: healthy }
POST  /auth/login             -> 200 { access_token }
GET   /auth/me (Bearer)       -> 200
GET   /admin/db-revision      -> 200 { revision }
GET   /api/employees          -> 200 []
```

## If Something Fails
- Migration failure: container exits → check logs → fix migration → redeploy.
- Missing table/column: confirm `alembic_version` table row; if absent DB was reset.
- Wrong revision: run manually inside container: `alembic current`.

## Rollback
If latest deploy breaks:
1. Revert to previous Git commit
2. Redeploy (migrations are additive; no destructive changes introduced in current chain)
3. (Optional) `alembic downgrade -1` if you must remove the last revision (only if safe)

## Current Revision Chain
```
76b8075b9d86  create users
ea0be61f2816  add password reset tokens
f3a53b79e3bd  create hr_employees (lean)
1a2b3c4d5e66  extend users with employee fields
2b4c6d7e8f90  add employment_type & salary_base
```

## Notes
- Users table still contains employee_* transitional fields; can be deprecated after frontend migration.
- Employees feature requires admin/superadmin token.
- Logs show DB revision at startup for verification.
