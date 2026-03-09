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

```

internal/
config/        # Configuration structs + loading
controllers/   # HTTP request handlers
routes/        # Route registration
middleware/    # Recovery, logging, CORS, JWT verification
services/      # Business logic and analytics layer
databases/     # pgxpool manager and DB access layer
models/        # Shared models / JWT claim structs
dto/           # Data transfer objects for API requests/responses

```

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

## Device Registration System

- Secure device registration endpoint (`POST /devices/register`)
- Device lookup using `device_identifier`
- Automatic device creation if device does not exist
- User-device association via `user_devices` table
- Idempotent device linking using `ON CONFLICT` safeguards
- Metadata captured for hardware, OS, browser, and offline capabilities
- Designed to support **Raspberry Pi classroom devices and future offline synchronization**

## Lesson Retrieval System

Lesson retrieval endpoints expose structured lesson content to authenticated clients.

Features include:

- Lessons returned in deterministic order
- Step sequences returned in correct progression order
- Rich metadata included for UI rendering
- Compatible with **web, tablet, and Raspberry Pi clients**
- Designed for **modular lesson delivery**

Lesson data includes:

- Lesson metadata
- Difficulty level
- Estimated duration
- Cover imagery
- Ordered step sequences

Each lesson step may contain:

- Step type (`tracing`, `reading`, `listening`, `checkpoint`)
- Instruction text
- Optional audio assets
- Optional image assets
- Sequence order

The backend performs **separate queries for lessons and lesson steps** and assembles the final response structure.

## Progress Persistence System

Student performance data is stored using the **user_progress table**.

Features include:

- Supports **multiple attempts per lesson step**
- Tracks **accuracy and time spent**
- Automatically increments **attempt numbers**
- Records **completion timestamps**
- Supports optional **device tracking and notes**
- Automatically triggers **letter mastery recalculation**

Whenever a student completes a lesson step:

1. Progress is stored in the `user_progress` table
2. Attempt numbers are automatically incremented
3. Performance metrics are recorded
4. The **Letter Mastery Service recalculates mastery status**

This design allows the system to support:

- Detailed progress tracking
- Mastery analytics
- Student learning dashboards
- Adaptive learning insights

## Letter Mastery Analytics System

PenPath automatically calculates **letter mastery metrics** based on student lesson performance.

This system transforms raw lesson progress into meaningful learning analytics.

Features include:

- Automatic **letter mastery detection**
- **Perfect attempt tracking** (100% accuracy)
- Aggregated performance statistics across all attempts
- **Average accuracy calculations**
- **Total time spent per letter**
- Detection of **most missed lesson step**
- Automatic mastery updates whenever progress is saved

Mastery criteria:

- A letter is considered **mastered** when the student achieves **3 perfect attempts** on steps associated with that letter.

When mastery is achieved:

- `is_mastered` is set to `true`
- `mastery_date` is recorded
- Letter statistics are updated for dashboard analytics

The system uses a dedicated **service layer (`LetterMasteryService`)** to calculate and update mastery records.

This ensures the mastery logic is:

- Reusable across endpoints
- Automatically executed after progress submissions
- Consistent across reading and writing lesson types

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

### `POST /api/devices/register`

Registers a client device and associates it with the authenticated user.

This endpoint is primarily designed for **Raspberry Pi classroom devices**, but also supports mobile, tablet, and desktop clients.

The backend performs the following:

- Validates the authenticated user via JWT middleware
- Validates the request payload
- Looks up the device by `device_identifier`
- Creates the device if it does not already exist
- Links the device to the authenticated user via `user_devices`

Device registrations are **idempotent** — registering the same device again will update its usage metadata rather than creating duplicate rows.

Supported device types:

- `mobile`
- `tablet`
- `raspberry_pi`
- `desktop`

### `GET /api/lessons/reading`

Returns all **reading lessons** with their ordered lesson steps.

Lessons are filtered by category and returned alphabetically by letter.

### `GET /api/lessons/writing`

Returns all **writing lessons** with their ordered lesson steps.

Lessons are filtered by category and returned alphabetically by letter.

Sensitive fields are never returned.

### `POST /api/progress/reading`

Persists progress for a **reading lesson step**.

Each submission records:

- Student ID
- Lesson step
- Attempt number
- Accuracy percentage
- Time spent
- Completion status
- Optional notes
- Device identifier
- Completion timestamp

Duplicate submissions are handled automatically by incrementing the attempt number.

---

### `POST /api/progress/writing`

Persists progress for a **writing lesson step**.

The same progress metrics are recorded as the reading endpoint.

Both endpoints allow multiple attempts per lesson step, enabling:

- Detailed progress analytics
- Automatic letter mastery evaluation
- Learning performance tracking
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

```json

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

```json

{
  "status": "error",
  "message": "missing or invalid auth context"
}

```

Profile Not Found:

```json

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

## Register Device

Registers a device and links it to the authenticated user account.

Endpoint:

### `POST /api/devices/register`

Headers:

Authorization: Bearer <access_token>

Request Body:

```json
{
  "device_identifier": "raspi-001",
  "device_type": "raspberry_pi",
  "device_nickname": "Vintage's Pi Tablet",
  "os_name": "Raspberry Pi OS",
  "os_version": "Bookworm",
  "browser_name": "Chromium",
  "browser_version": "119",
  "processor_info": "Raspberry Pi 4 Model B",
  "supports_wifi": true,
  "supports_offline": true
}
```

Example Request (cURL)

```

curl -X POST http://localhost:3000/devices/register \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "device_identifier": "raspi-001",
    "device_type": "raspberry_pi",
    "device_nickname": "Vintage Pi Tablet",
    "os_name": "Raspberry Pi OS",
    "os_version": "Bookworm",
    "browser_name": "Chromium",
    "browser_version": "119",
    "processor_info": "Raspberry Pi 4 Model B",
    "supports_wifi": true,
    "supports_offline": true
  }'

```

Example Response

```json
{
  "status": "ok",
  "message": "device registered successfully",
  "data": {
    "user_id": "uuid",
    "device_id": "uuid",
    "device_identifier": "raspi-001",
    "device_type": "raspberry_pi",
    "device_nickname": "Vintage Pi Tablet",
    "os_name": "Raspberry Pi OS",
    "os_version": "Bookworm",
    "browser_name": "Chromium",
    "browser_version": "119",
    "processor_info": "Raspberry Pi 4 Model B",
    "supports_wifi": true,
    "supports_offline": true
  }
}

```

## Retrieve Writing Lessons

Endpoint:
### GET /api/lessons/writing

Headers:
Authorization: Bearer <access_token>

Example Request:

```

curl http://localhost:3000/api/lessons/writing \
  -H "Authorization: Bearer <access_token>"

```

## Retrieve Reading Lessons

Endpoint:
### GET /api/lessons/reading

Headers:
Authorization: Bearer <access_token>

Example Request:

```

curl http://localhost:3000/api/lessons/reading \
  -H "Authorization: Bearer <access_token>"

```

### Example Lesson Response

```json
{
  "status": "ok",
  "lessons": [
    {
      "lesson_id": "uuid",
      "letter": "C",
      "title": "Cursive Letter C",
      "description": "Trace the cursive C",
      "difficulty_level": 1,
      "estimated_duration_minutes": 3,
      "cover_image_url": "...",
      "steps": [
        {
          "step_type": "tracing",
          "sequence_order": 1,
          "title": "Trace the Letter",
          "instruction_text": "Follow the flow of the cursive letter.",
          "audio_url": null,
          "image_url": null
        }
      ]
    }
  ]
}

```

## Save Lesson Progress

Stores the result of a student completing a lesson step.

Endpoint:

### `POST /api/progress/writing`

Headers:

Authorization: Bearer <access_token>

Request Body:

```json
{
  "lesson_step_id": "uuid",
  "accuracy_percent": 92.5,
  "time_spent_seconds": 18,
  "is_completed": true,
  "notes": "Improved letter shape",
  "device_id": "uuid"
}

```

Example Request (cURL):

```

curl -X POST http://localhost:3000/api/progress/writing \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "lesson_step_id": "uuid",
    "accuracy_percent": 92.5,
    "time_spent_seconds": 18,
    "is_completed": true,
    "notes": "Improved letter shape",
    "device_id": "uuid"
  }'

```

Example Response:

```json

{
  "status": "ok",
  "data": {
    "lesson_step_id": "uuid",
    "attempt_number": 3
  }
}

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

- Badge unlock logic
- Device heartbeat / sync endpoint
- Offline lesson data synchronization
- Device usage analytics
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