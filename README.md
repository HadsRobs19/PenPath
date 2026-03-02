# PenPath Backend (Go + Fiber)

PenPath is a cursive learning platform (Web + Mobile) with a Go (Fiber v3) backend and a Supabase-hosted PostgreSQL database. This repository contains the backend API responsible for authentication, lesson delivery, and student progress tracking.

## Status

**In progress: Milestone 6: Backend Development.**

Completed so far:
- Fiber v3 server bootstrapped with global error handling and core middleware wiring
- Health endpoint scaffolding (`/health`)
- PostgreSQL connection pool manager (pgx/pgxpool) design + startup initialization work
- Supabase JWT verification middleware (JWKS / RS256) for protected routes (MS6-15)

---

## Tech Stack

- **Go** (API implementation)
- **Fiber v3** (HTTP framework)
- **pgx / pgxpool** (PostgreSQL connectivity)
- **Supabase** (Auth + hosted PostgreSQL + RLS policies managed by infra)
- **JWKS / RS256** (JWT signature verification)

---

## Folder Structure (high-level)

- `cmd/` – application entrypoints (server main)
- `internal/config/` – configuration structs + config loading
- `internal/controllers/` – HTTP handlers (business-facing endpoints)
- `internal/routes/` – route registration + grouping
- `internal/middleware/` – global middleware (logging, CORS, recovery) + auth middleware
- `internal/databases/` – database access layer (pgxpool manager and table-specific DB files)
- `internal/models/` – shared models / JWT claims structs

---

## Environment Variables

The backend expects environment variables for sensitive configuration (do not commit secrets).

Required for JWT verification:
- `JWKS_URL` – URL for the JWKS endpoint (public keys) used to verify RS256 Supabase JWTs  
  Example format:
  `https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`

Recommended:
- `DATABASE_URL` – PostgreSQL connection string used by pgxpool

> Note: Frontend `VITE_*` variables are for client builds. The backend should use its own variables (without `VITE_`) and should never rely on frontend env naming conventions.

---

## Authentication Model (Supabase and RLS)

PenPath uses **Supabase Auth** to issue JWTs to clients.

- Frontend authenticates via Supabase and receives an `access_token` (JWT).
- The client sends requests to this API with:
  `Authorization: Bearer <access_token>`
- The backend verifies:
  1. Token exists and is Bearer-formatted
  2. Signature is valid via JWKS (RS256)
  3. Issuer (`iss`) matches expected Supabase issuer
  4. Audience (`aud`) contains the expected audience
- The backend attaches identity to request context:
  - `user_id` (JWT `sub`)
  - `role` (Supabase role claim)

### How this maps to RLS
Supabase Row Level Security (RLS) protects data when using user-scoped queries (anon key + JWT).  
When the backend uses privileged access patterns (service role or direct DB access), RLS may be bypassed. So the backend must enforce authorization by scoping queries using the verified `user_id`.

---

## Current Endpoints (in progress)

- `GET /health`
  - Intended behavior:
    - Confirm API uptime
    - Confirm database connectivity (pgxpool ping)

More endpoints will be added for:
- Lessons (tracing/reading/listening)
- Progress saving and retrieval
- Letter mastery + badge logic
- Device registration and offline sync foundations

---

## Development Notes

### Middleware
Core middleware is registered globally:
- Recovery / panic handling
- Structured request logging
- CORS (React dev origins)
- Body/request size limits (configured through Fiber)

### JWT Middleware (MS6-15)
The JWT verifier is initialized once at startup by loading JWKS and storing a `jwt.Keyfunc` used for request-time verification.

Acceptance criteria met for MS6-15:
- JWT extracted from headers
- Token validated via JWKS signature verification
- User context attached to request
- Unauthorized requests blocked

---

## Next Steps

Planned work:
- Finalize MS6-14 health check to include DB ping from the DBManager cleanly
- Harden BE-004 with additional claim validation (expiration / signing algorithm enforcement)
- Add protected route groups (e.g., `/api/*`) that require auth middleware
- Implement database-backed endpoints for lessons, progress, mastery, and badges

---

## Team / Collaboration

- Do not commit `.env` files or secrets.
- Use `.env.example` as the shared template for configuration.
- PRs should include a short description of:
  - endpoint changes
  - config changes
  - schema assumptions

---

## References

- Fiber v3 Documentation
- golang-jwt/jwt v5 (claims + parsing)
- MicahParks/keyfunc v3 (JWKS handling)
- Supabase Auth + JWKS endpoint documentation
- Go pgxpool package