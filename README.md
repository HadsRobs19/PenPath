# PenPath
## Full-Stack Cursive Learning Platform 

PenPath is a full-stack literacy learning platform built with React and a Go (Fiber v3) backend connected to a Supabase-hosted PostgreSQL database.

The backend API is responsible for authentication validation, lesson delivery, user profile management, and student progress tracking.

# Architecture Overview
React / React Native Frontend
│
│  (Supabase Auth)
│  access_token (JWT)
▼
Go Backend (Fiber v3 API)
│
│  JWT Verification (JWKS / RS256)
│  Authorization Enforcement
│
▼
PostgreSQL (Supabase Hosted)
# Authentication Flow

1. User authenticates via Supabase Auth on the frontend.

2. Supabase returns a signed access_token (JWT).

3. Frontend sends API requests with:


`Authorization: Bearer <access_token>`

<ins>Backend:</ins>

- Verifies JWT signature via JWKS (RS256)

- Validates issuer and audience

- Validates required time-based claims

- Extracts user identity (sub)

<ins>Backend attaches:</ins>

- user_id

- role

- Protected routes execute with verified identity.

- Database queries are scoped using user_id.

# Tech Stack Backend

- Go

- Fiber v3

- pgx / pgxpool

- Supabase (PostgreSQL + Auth)

- JWKS / RS256 JWT Verification

# Structured middleware architecture

- Frontend

- React (Web and Raspberry Pi Tablet)

- Supabase JS Client

- SVG-based interactive tracing components

- Modular lesson architecture

*** Backend Structure ***
cmd/
internal/
  config/         # Config structs + loading
  controllers/    # HTTP handlers
  routes/         # Route registration + grouping
  middleware/     # Recovery, logging, CORS, JWT verification
  databases/      # pgxpool manager + table DB access files
  models/         # Shared models / JWT claim structs

Frontend is maintained separately and communicates with this API over HTTP.

# Authentication & Security Model

PenPath uses Supabase Auth for identity and JWT issuance.

<ins>The backend:</ins>

- Verifies tokens using Supabase's JWKS endpoint

- Enforces RS256 signature validation

- Validates:

  -  iss (issuer)

  - aud (audience)

  - exp, iat, nbf

- Rejects unauthorized requests

- Attaches user identity to request context

<ins>Context Attachment</ins>

After verification:

- user_id ← JWT sub

- role ← Supabase role claim

Controllers use this context to scope queries and enforce authorization.

# RLS & Authorization Strategy

*** Supabase Row Level Security (RLS) protects data when using user-scoped queries with anon keys. ***

*However*:

- When using direct pgx connections

- When using privileged roles

RLS may not apply automatically.

<ins>Therefore, this backend enforces authorization explicitly by:</ins>

- Never trusting client-supplied IDs

- Scoping queries using verified user_id

- Returning only non-sensitive fields

- Preventing over-fetching at query level

# Implemented Features
## Core Infrastructure

- Fiber server bootstrapped with global error handling

- Structured logging middleware

- Panic recovery middleware

- CORS configured for React dev origins

- Request size limits

## Database Layer

- pgxpool connection manager

- Startup DB connectivity verification

- Clean separation between DB layer and controllers

## JWT Middleware (RS256 + JWKS)

- JWKS loaded once at startup

- Token extracted from Authorization header

- Signature verified via public key selection (kid)

- Claims validated

- User context attached

- Unauthorized requests blocked

# Current Endpoints
***GET /health***

<ins>Confirms:</ins>

- API uptime

- Database connectivity

# Planned API Endpoints

- GET /me – Authenticated user profile

- Lesson retrieval endpoints

- Progress save/retrieve endpoints

- Letter mastery tracking

- Badge unlock logic

- Device registration and offline sync foundations

# Environment Variables

***Sensitive values must not be committed.***

**Required**
>JWKS_URL=https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
>DATABASE_URL=postgres://...

**Frontend VITE_* variables are for client builds only and must not be reused in backend configuration.**

# Development Principles

- Single source of truth for configuration

- Middleware handles cross-cutting concerns

- Controllers remain thin

- Database logic isolated in internal/databases

- JWT verified once per request

- No sensitive fields exposed in responses

- Explicit authorization enforcement

# Upcoming Enhancements

- Harden JWT verification (algorithm enforcement)

- Protected route groups (/api/*)

- User profile endpoint (age derived from birthday)

- Lesson data persistence

- Progress analytics

- Badge & mastery system logic

# References

[Fiber v3 Documentation](https://docs.gofiber.io/)

[golang-jwt/jwt v5](https://pkg.go.dev/github.com/golang-jwt/jwt/v5#Parser.ParseWithClaims)

[MicahParks/keyfunc v3 (JWKS)](https://github.com/MicahParks/keyfunc)

[Supabase Auth](https://supabase.com/docs/guides/auth/signing-keys) + [JWKS docs](https://www.rfc-editor.org/rfc/rfc7517.html)

[pgxpool Documentation](https://pkg.go.dev/github.com/jackc/pgx/v5/pgxpool)

# About PenPath

***PenPath is designed as a scalable cursive and literacy learning system that blends:***

- Interactive SVG tracing

- Modular lesson flows

- Gamified progress tracking

- Secure backend architecture

Built with long-term extensibility and production readiness in mind.