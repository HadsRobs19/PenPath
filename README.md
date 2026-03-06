# PenPath
## Full-Stack Cursive Learning Platform

PenPath is a full-stack literacy learning platform built with **React** and a **Go (Fiber v3) backend** connected to a **Supabase-hosted PostgreSQL database**.

The backend API is responsible for:

- Authentication validation
- Lesson delivery
- User profile management
- Student progress tracking

---

# Architecture Overview


React Frontend
│
│ Supabase Auth
│ access_token (JWT)
▼
Go Backend (Fiber v3 API)
│
│ JWT Verification (JWKS / RS256)
│ Authorization Enforcement
│
▼
PostgreSQL (Supabase Hosted)


---

# Authentication Flow

1. User authenticates via **Supabase Auth** on the frontend.

2. Supabase returns a signed **access_token (JWT)**.

3. The frontend sends API requests with:


Authorization: Bearer <access_token>


## Backend Responsibilities

The backend then:

- Verifies the **JWT signature using JWKS (RS256)**
- Validates:
  - `iss` (issuer)
  - `aud` (audience)
  - `exp`, `iat`, `nbf`
- Extracts the authenticated user identity (`sub`)

### Context attached to request

- `user_id` ← JWT `sub`
- `role` ← Supabase role claim

Protected routes execute using this verified identity.

Database queries are scoped using `user_id`.

---

# Tech Stack

## Backend

- **Go**
- **Fiber v3**
- **pgx / pgxpool**
- **Supabase (PostgreSQL + Auth)**
- **JWKS / RS256 JWT verification**

## Frontend

- **React**
- **Supabase JS Client**
- **SVG-based tracing components**
- **Modular lesson architecture**

---

# Backend Structure


cmd/
internal/
config/ # Configuration structs + loading
controllers/ # HTTP handlers
routes/ # Route registration
middleware/ # Recovery, logging, CORS, JWT verification
databases/ # pgxpool manager and DB access layer
models/ # Shared models / JWT claim structs


The frontend communicates with this API via HTTP.

---

# Authentication & Security Model

PenPath uses **Supabase Auth** for identity and JWT issuance.

The backend:

- Verifies tokens using Supabase's **JWKS endpoint**
- Enforces **RS256 signature validation**
- Validates:


iss (issuer)
aud (audience)
exp, iat, nbf


- Rejects unauthorized requests
- Attaches user identity to request context

Controllers use this context to scope database queries and enforce authorization.

---

# RLS & Authorization Strategy

Supabase provides **Row Level Security (RLS)** when queries are performed using Supabase client keys.

However, this backend uses **direct pgx PostgreSQL connections**, meaning RLS may not apply automatically.

Therefore the backend enforces authorization by:

- Never trusting client-supplied IDs
- Scoping queries using the verified `user_id`
- Returning **only non-sensitive fields**
- Preventing over-fetching at the query level

---

# Implemented Features

## Core Infrastructure

- Fiber server bootstrapped with global error handling
- Structured request logging middleware
- Panic recovery middleware
- CORS configuration for development
- Request size limits

## Database Layer

- pgxpool connection manager
- Startup DB connectivity verification
- Separation between DB layer and controllers

## JWT Middleware (RS256 + JWKS)

- JWKS loaded once at startup
- Token extracted from `Authorization` header
- Signature verified using public key (`kid`)
- Claims validated
- User context attached to request
- Unauthorized requests blocked

---

# Current Endpoints

### `GET /health`

Confirms:

- API uptime
- Database connectivity

### `GET /me`

Returns the authenticated user's profile:


{
"first_name": "...",
"last_name": "...",
"age": ...
}


Sensitive fields are never returned.
---

# API Usage Examples

## Get Authenticated User Profile

Retrieves the profile of the currently authenticated user.

End Point:
### `GET /me`

Headers:
Authorization: Bearer <access_token>

The `access_token` is issued by Supabase Auth when the user logs in on the frontend.

## Example Request (cURL)
```

curl http://localhost:3000/me \
  -H "Authorization: Bearer <access_token>"

```

## Example Response

```

{
  "status": "ok",
  "message": "User info retrieved",
  "data": {
    "first_name": "Vintage",
    "last_name": "Jones",
    "age": 8
  }
}

```

## Example Error Response
Unauthorized (Missing or Invalid Token):

```

{
  "status": "error",
  "message": "missing or invalid auth context"
}

```

Profile Not Found:

```

{
  "status": "error",
  "message": "user profile not found"
}

```

## Frontend Example (React Fetch)

```

const response = await fetch("http://localhost:3000/me", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${session.access_token}`
  }
});

const data = await response.json();
console.log(data);

```

# How Authentication Works

1. User logs in through Supabase Auth on the frontend.

2. Supabase returns an access_token (JWT).

3. The frontend includes that token in API requests.

4. The backend middleware:

  - Verifies the JWT signature using JWKS

  - Validates claims (`iss`, `aud`, `exp`, `iat`, `nbf`)

  - Extracts the authenticated user ID (sub)

  - Attaches the user identity to the request context.

5. Controllers use that identity to safely query the database.

# Security Guidance

The endpoint:

  - Requires a valid JWT
  - Only returns non-sensitive user fields
  - Scopes database queries using the authenticated user id
  - Rejects requests with invalid or missing tokens


---

# Planned API Endpoints

- Lesson retrieval endpoints
- Progress save and retrieval
- Letter mastery tracking
- Badge unlock logic
- Device registration
- Offline sync foundations

---

# Environment Variables

Sensitive values **must never be committed**.

Required:


JWKS_URL=https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
DATABASE_URL=postgres://...


Frontend `VITE_*` variables are **not used by the backend**.

---

# Development Principles

- Single source of truth for configuration
- Middleware handles cross-cutting concerns
- Controllers remain thin
- Database logic isolated in `internal/databases`
- JWT verified once per request
- No sensitive fields exposed in responses
- Explicit authorization enforcement

---

# Upcoming Enhancements

- Harden JWT verification (algorithm enforcement)
- Protected route groups (`/api/*`)
- Lesson persistence
- Progress analytics
- Badge and mastery system logic

---

# References

- [Fiber v3 Documentation](https://docs.gofiber.io/)
- [golang-jwt/jwt v5](https://pkg.go.dev/github.com/golang-jwt/jwt/v5)
- [MicahParks/keyfunc v3 (JWKS)](https://github.com/MicahParks/keyfunc)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [pgxpool Documentation](https://pkg.go.dev/github.com/jackc/pgx/v5/pgxpool)

---

# About PenPath

PenPath is designed as a scalable cursive and literacy learning system that combines:

- Interactive SVG tracing
- Modular lesson flows
- Gamified progress tracking
- Secure backend architecture

The system is built with **long-term extensibility and production readiness in mind**.