## 📌 Canonical System Overview (Source of Truth)
Last Updated: 2025-08-10  
Scope: Summarizes real architecture, current implementation status, validated design direction, and near-term development plan so any AI/engineer can onboard in <5 minutes.

---
### 1. Current Implementation Snapshot
Module | Status | Notes
-------|--------|------
Authentication (JWT) | COMPLETE (Prod) | Login, refresh, roles (SuperAdmin/Admin/User)
User Management | COMPLETE | CRUD + role assignment
HR – Employees | NOT STARTED (Planned) | Will extend `users` table (Phase 2A)
HR – Leave | NOT STARTED (Design Ready) | Minimal leave requests + approval (Phase 2B)
HR – Time Tracking | DEFERRED | Optional Phase 2C
Project / Inventory / Financial / Analytics | NOT STARTED | Large original scope parked

Environment: FastAPI + PostgreSQL (Railway) + React (Vite)  
Security: bcrypt hashing, JWT, CORS configured, deployment hardened.  
No Redis / Celery / Event Bus implemented yet (design doc mentions – treat as future).

---
### 2. Canonical Architectural Scope (Near-Term)
Keep a pragmatic monolith: FastAPI app grows with additional routers: `employees`, `leaves`. Avoid premature microservices. DB migrations incremental via Alembic.

Core Principles:
1. Preserve working auth; never refactor core until HR stable.
2. Add smallest useful vertical slice per phase.
3. Migrations additive & reversible (nullable first → tighten later).
4. Explicit status tracking (this file + progress log).

---
### 3. Data Model (Authoritative Minimal Phase 2)
Extend `users` table with OPTIONAL columns initially:
```
department VARCHAR(100) NULL
position   VARCHAR(100) NULL
employee_code VARCHAR(20) UNIQUE NULL
hire_date  DATE NULL
phone      VARCHAR(20) NULL
address    TEXT NULL
```
Leave Table (to be created):
```
leaves(
  id SERIAL PK,
  employee_id INT REFERENCES users(id),
  leave_type VARCHAR(20) NOT NULL,  -- sick|vacation|personal
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  days DECIMAL(3,1) NOT NULL,       -- auto calc
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending|approved|rejected
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_by INT REFERENCES users(id),
  approved_at TIMESTAMP,
  notes TEXT
)
Constraint roadmap:
 - Phase 2A: columns nullable (user extensions)
 - Phase 2B: leave table with basic check (end_date >= start_date)
 - Later: uniqueness on overlapping approved leaves.
```

---
### 4. API Surface (Committed Near-Term)
Endpoint | Phase | Roles
---------|-------|------
GET /api/employees | 2A | Admin/SuperAdmin (future HR_Manager)
POST /api/employees | 2A | Admin/SuperAdmin
GET /api/employees/{id} | 2A | Admin/SuperAdmin or self (limited)
PUT /api/employees/{id} | 2A | Admin/SuperAdmin
DELETE /api/employees/{id} (soft) | 2A | Admin/SuperAdmin
POST /api/leaves | 2B | Employee (any authenticated)
GET /api/leaves/mine | 2B | Employee (self)
GET /api/leaves/pending | 2B | Admin/SuperAdmin (later HR_Manager)
POST /api/leaves/{id}/approve | 2B | Admin/SuperAdmin
GET /api/leaves/{id} | 2B | Auth (self or approver)

Response Pattern: unified `{ success, data, message, error_code?, meta? }` (implement wrapper gradually; do not break existing auth routes yet).

---
### 5. Roles (Evolution Path)
Current: SuperAdmin, Admin, User  
Phase 2A: (Optionally rename User→Employee only in UI, keep DB value `user` for backward compat)  
Phase 2B+: Introduce HR_Manager if approval load grows.  
Do NOT implement full granular permission matrix now (archived in legacy design).

---
### 6. Migrations Plan (Authoritative)
Order | Revision Label | Purpose
------|----------------|--------
001_extend_users_employee_fields | Add nullable employee-related columns
002_create_leaves_table | Add leaves table + basic constraints
003_optional_indexes | Add search indexes (department, status) after data present

Migration Guidelines:
 - Never bundle unrelated domains.
 - Downgrade paths required (even if simple DROP COLUMN/TABLE).
 - Production: take schema-only snapshot before apply.

---
### 7. Testing Strategy (Minimal Must-Haves)
Category | Tests
---------|------
Auth Regression | login valid, login invalid
Employees | create, list filter dept, duplicate email/code (409), soft delete hides entry
Leaves | submit, approve, reject, overlap detection (later), unauthorized approve blocked

Target: Start with core happy paths → add edge cases once stable.

---
### 8. Progress Tracking Mapping
Artifact | Purpose | Canonical?
SME_Management_System_Complete_Design.md | Historical full vision | NO (legacy)
DESIGN_ANALYSIS_AND_ISSUES.md | Gap analysis & realism | PARTIAL (static reference)
DEVELOPMENT_PROGRESSION_AND_LEARNING.md | Ongoing log/journal | YES (log only)
DIY_DEVELOPMENT_PLAN.md | Initial actionable phase plan | MERGED (superseded by this file)
This CANONICAL_SYSTEM_OVERVIEW.md | Source of truth for scope & next steps | YES

Only update THIS file + Progression log; keep others read-only.

---
### 9. Open Decision Items
ID | Topic | Current Direction | Deadline
01 | Rename role `user` → `employee` in DB? | Defer; UI label only | After Phase 2B
02 | HR_Manager role introduction | Add if leave approvals > manageable | Monitor after 2B
03 | Leave balance policy | Simplified count only | Before reporting
04 | Overlap constraint | Add after initial usage feedback | Post 2B

---
### 10. Immediate Actions (Next Commit Set)
1. Create Alembic migration 001 (nullable columns).  
2. Update Pydantic schemas & user CRUD to expose employee fields.  
3. Employees router with list/search.  
4. Skeleton tests (auth + employee create).  
5. Prepare migration 002 draft (not applied yet).  

---
### 11. Canonical Change Log
Date | Change
2025-08-10 | Initial canonical consolidation created.

---
### 12. How To Contribute Safely
1. Read sections 1–5 here before coding.
2. Add new scope ONLY after updating Section 10 & 11.
3. Never edit legacy design docs except adding pointer banners.

---
End of Canonical Overview.
