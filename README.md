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

```

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

```

---

# Learning Analytics Pipeline

PenPath transforms raw lesson interactions into meaningful learning analytics through a structured backend pipeline.

```
Student Completes Lesson Step
│
│ (event stored locally if device is offline)
│
▼
Student Drawing Captured
│
│ SVG strokes recorded by WritingBox / TracingBox
│
▼
Drawing Export
│
│ PNG image generated from SVG
│ JSON stroke data generated for replay
│
▼
Supabase Storage
(user-drawings bucket)
│
│ Path format:
│ {student_uuid}/{lesson_uuid}/{step_uuid}/{attempt}.{ext}
│
▼
Drawing URL Generated
│
▼
POST /api/progress/(reading|writing)
│
│ ProgressController
│
▼
user_progress table
(Stores attempt data)
│
│ accuracy_percent
│ time_spent_seconds
│ attempt_number
│ completion status
│ drawing_url
│
▼
LetterMasteryService
│
│ Calculates mastery metrics
│
▼
letter_mastery table
│
│ perfect_attempts_count
│ average_accuracy_percent
│ total_time_spent_seconds
│ most_missed_step_id
│ is_mastered
│
▼
BadgeService
│
│ Evaluates badge criteria
│
▼
user_badges table
│
│ badge_id
│ earned_at
│ progress_count
│
▼
GET /api/progress
│
│ ProgressController
│
▼
Progress Summary Response
│
├── Lessons Completed
├── Letters Mastered
├── Letters Needing Work
├── Average Accuracy
│
▼
GET /api/badges
│
│ BadgeController
│
▼
Earned Badge List
│
├── Badge Name
├── Description
├── Icon
├── Badge Type
└── Earned Timestamp
│
▼
Frontend Dashboard
(Account Progress Page)
```
---

# Authentication Flow

1. User authenticates via **Supabase Auth** on the frontend.

2. Supabase returns a signed **access_token (JWT)**.

3. The frontend sends API requests with:


`Authorization: Bearer <access_token>`


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
- **go-playground/validator v10** (API request validation)

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
validation/    # Centralized request payload validation layer
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


`iss` (issuer)
`aud` (audience)
`exp`, `iat`, `nbf`


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

## Input Validation Layer

PenPath includes a centralized **input validation layer** that ensures all API request payloads contain valid and properly structured data before reaching controller logic.

The validation system is implemented using:

- **go-playground/validator v10**

This validator operates on **DTO structs** using validation tags that define rules such as:

- Required fields
- Numeric ranges
- UUID format validation
- Allowed enumerated values
- Email format validation

Example DTO validation:

```go
type ProgressSubmission struct {
	LessonStepID     string  `json:"lesson_step_id" validate:"required,uuid"`
	AccuracyPercent  float64 `json:"accuracy_percent" validate:"required,gte=0,lte=100"`
	TimeSpentSeconds int     `json:"time_spent_seconds" validate:"gte=0"`
	IsCompleted      bool    `json:"is_completed"`
	Notes            string  `json:"notes"`
	DeviceID         string  `json:"device_id" validate:"omitempty,uuid"`
}
```

### Validation Request Flow

```

Client Request
│
▼
Bind Request Body → DTO
│
▼
Validation Layer
│
▼
Controller Logic
│
▼
Service Layer
│
▼
Database

```

If validation fails, the API returns a standardized error response:

```json

{
  "status": "error",
  "message": "validation failed",
  "errors": "AccuracyPercent must be less than or equal to 100"
}

```
Benefits:

- Prevents invalid data from reaching the database

- Removes manual validation logic from controllers

- Ensures consistent validation behavior across endpoints

- Produces clear, standardized API error responses

- Improves maintainability of the backend codebase

- The validation layer is used by endpoints that accept request bodies, including:

`POST /api/devices/register`

`POST /api/progress/reading`

`POST /api/progress/writing`

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
- Supports **drawing submission URLs**
- Automatically triggers **letter mastery recalculation**

Whenever a student completes a lesson step:

1. Progress is stored in the `user_progress` table
2. Attempt numbers are automatically incremented
3. Performance metrics are recorded
4. The **Letter Mastery Service recalculates mastery status**

### Drawing Storage Column

The `user_progress` table includes an additional column used for linking stored drawings:

```
drawing_url TEXT
```

This column stores the Supabase Storage URL associated with a student's drawing submission.

### Drawing Submission Support

For tracing and listening activities that involve handwriting input, PenPath also stores student drawings.

When a student submits a drawing:

1. The frontend exports the drawing as a **PNG image**.
2. The image is uploaded to **Supabase Storage**.
3. The returned **drawing URL** is included in the progress submission payload.
4. The backend stores the URL in the `user_progress.drawing_url` column.

This allows the system to support:

- Student handwriting review
- Future stroke replay visualization
- Handwriting analytics

## Drawing Storage System

PenPath supports storing student handwriting drawings generated during tracing and listening lessons.

Student drawings are uploaded to **Supabase Storage**, which provides secure file storage with Row Level Security (RLS) policies.

### Storage Bucket

Student drawings are stored in the following bucket:

```
user-drawings-{environment}
```

Example:

```
user-drawings-production
```

### File Structure

Each drawing follows a deterministic path format:

```
{student_uuid}/{lesson_uuid}/{step_uuid}/{attempt}.{ext}
```

Example:

```
550e8400-e29b-41d4-a716-446655440000/animals/step1/1.png
```

This structure enables:

- Student data isolation
- Efficient file lookups
- Secure access control through storage policies

### Stored Drawing Formats

PenPath stores two types of drawing data:

|    Format            |                   Purpose                                      |
|----------------------|----------------------------------------------------------------|
| **PNG Image**        | Visual representation of the student drawing                   |
| **JSON Stroke Data** | Raw stroke data used for replay or handwriting analysis        |

### Storage Security

Supabase **Row Level Security (RLS)** policies ensure that:

- Students can only upload drawings to their own folder
- Students can only read their own drawings
- Teachers can read drawings from students assigned to them
- Deletion is restricted to backend service operations

These policies prevent unauthorized access to student-generated content.

### Integration with Progress Tracking

After a drawing is uploaded:

1. Supabase returns a storage URL
2. The frontend includes the URL in the progress submission payload
3. The backend stores the URL in the `user_progress.drawing_url` column

This links each drawing submission directly to the corresponding lesson step attempt.

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

## Progress Retrieval & Learning Dashboard System

PenPath provides a **progress retrieval endpoint** that aggregates a student's overall learning performance.

This endpoint powers the **student progress dashboard** used by the frontend account page.

Features include:

- Retrieval of **completed lesson counts**
- Aggregation of **overall accuracy performance**
- Listing of **mastered letters**
- Identification of **letters needing additional practice**
- Efficient query execution using **indexed database lookups**

Lesson completion is determined using a **step validation rule**:

A lesson is considered completed **only when all lesson steps for that lesson have been completed at least once**.

This prevents partial lesson attempts from being incorrectly marked as complete.

The endpoint aggregates information from multiple tables:

- `user_progress`
- `lesson_steps`
- `lessons`
- `letter_mastery`

This design enables the system to generate a **student learning summary** using a single efficient database query.

The progress summary powers the following frontend features:

- **Lessons Completed**
- **Letters Perfected**
- **Letters That Need Work**
- Overall **student accuracy metrics**

The endpoint is protected by **JWT authentication** and automatically scopes results using the authenticated `user_id`.

## Badge Reward System

PenPath includes an automated **badge awarding system** that rewards students when they complete lessons and achieve learning milestones.

The badge system operates automatically whenever lesson progress is submitted.

Features include:

- Automatic **badge eligibility evaluation**
- Prevention of **duplicate badge awards**
- Storage of **badge timestamps**
- Support for **future gamification mechanics**
- Designed for **extensible achievement systems**

Badge logic is implemented through the `BadgeService`, which evaluates badge criteria after each progress submission.

### Badge Evaluation Flow

When a student completes a lesson step:

1. Progress is saved in the `user_progress` table
2. The system checks whether the **entire lesson is completed**
3. If the lesson is complete, the backend searches for a badge with a matching unlock condition
4. If a badge is found and has not already been awarded:
   - The badge is inserted into the `user_badges` table
   - The `earned_at` timestamp is recorded

Duplicate awards are prevented using a **database uniqueness constraint**:
`UNIQUE(student_id, badge_id)`


Combined with the SQL safeguard:


`ON CONFLICT (student_id, badge_id) DO NOTHING`


This guarantees that a student **cannot receive the same badge multiple times**.

### Example Badge Criteria

Badges are defined in the `badges` table and can represent:

- Lesson completion rewards
- Mastery milestones
- Accuracy achievements

Example badge conditions:

|     Badge     | Unlock Condition       |
|---------------|------------------------|
| Colors Badge  | Complete Colors lesson |
| Animals Badge | Complete Animals lesson|  
| Letter Master | Master 5 letters       |

This architecture allows new badges to be introduced **without modifying backend code**, simply by inserting new badge definitions into the database.

## Badge Retrieval System

PenPath exposes a dedicated endpoint that allows clients to retrieve the badges a student has earned.

This endpoint enables the frontend to display:

- Achievement badges
- Lesson completion rewards
- Gamification milestones
- Student accomplishment history

The system retrieves badge data from the following tables:

- `user_badges`
- `badges`

A join query combines badge metadata with the student's earned badge records.

Returned badge metadata includes:

- `Badge ID`
- `Badge name`
- `Description`
- `Icon URL`
- `Badge type`
- `Points value`
- `Earned timestamp`

Badges are returned **sorted by the time they were earned**, allowing the frontend to display the most recent achievements first.

The endpoint is designed to support multiple client platforms, including:

- Web browsers
- Raspberry Pi Learning Tablet

All badge retrieval requests are protected by **JWT authentication**, and results are automatically scoped to the authenticated `user_id`.

## Offline Sync Support (Foundational)

PenPath supports **offline-first learning environments**, allowing student devices to continue recording lesson progress even when an internet connection is unavailable.

This feature is designed primarily for **Raspberry Pi classroom tablets**, but also supports mobile and tablet devices.

### Offline Progress Strategy

When a device is offline:

1. Lesson progress events are stored locally on the device.
2. Each event is assigned a unique `client_event_id` (UUID).
3. The event also includes a `completed_at` timestamp indicating when the student finished the lesson step.
4. When connectivity is restored, the device submits the stored events to the backend using the standard progress endpoints.

### Idempotent Progress Processing

To ensure reliable synchronization, progress submissions are processed using **idempotent database operations**.

Each progress event includes:

- `client_event_id`
- `lesson_step_id`
- `completed_at`

The backend enforces uniqueness using a composite index:


`UNIQUE(student_id, client_event_id)`


If a device retries the same event multiple times, PostgreSQL resolves the conflict and prevents duplicate progress records.

Example SQL safeguard:


`ON CONFLICT (student_id, client_event_id) DO UPDATE`


This guarantees that:

- Duplicate events are ignored
- Retries are safe
- Offline submissions produce the same final database state

### Timestamp-Based Event Tracking

Each progress submission includes a client timestamp:


`completed_at`


This timestamp represents when the student actually completed the lesson step.

Because offline devices may reconnect later, the system preserves the **true learning timeline** rather than the server receipt time.

### Benefits

This architecture allows the system to tolerate:

- Unstable classroom WiFi
- Offline learning sessions
- Device retries
- Delayed progress submissions

It also prepares the platform for **future batch synchronization endpoints** and **device event queues**.

---

# Current Endpoints

### `GET /health`

Confirms:

- API uptime
- Database connectivity

### `GET /me`

Returns the authenticated user's profile:

```json

{
"first_name": "...",
"last_name": "...",
"age": ...
}
```

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

- `Student ID`
- `Lesson step`
- `Attempt number`
- `Accuracy percentage`
- `Time spent`
- `Completion status`
- `Optional notes`
- `Device identifier`
- `Completion timestamp`

Duplicate submissions are handled automatically by incrementing the attempt number.

### `POST /api/progress/writing`

Persists progress for a **writing lesson step**.

The same progress metrics are recorded as the reading endpoint.

Both endpoints allow multiple attempts per lesson step, enabling:

- Detailed progress analytics
- Automatic letter mastery evaluation
- Learning performance tracking

### Offline Submission Support

The progress endpoints support **offline-first client devices**.

Each progress submission includes a unique event identifier:


`client_event_id`


This identifier allows the backend to detect duplicate submissions when devices retry events after reconnecting.

Because the backend enforces:


`UNIQUE(student_id, client_event_id)`


the API guarantees **idempotent progress processing**.

This means that submitting the same event multiple times will always produce the same database result.

This behavior is essential for supporting:

- Offline lesson completion
- Device retry logic
- Network interruptions
- Classroom tablet environments

### `GET /api/progress`

Returns a summary of the authenticated student's learning progress.

This endpoint aggregates data across lessons, lesson steps, and mastery records to produce a **learning progress overview**.

Returned metrics include:

- Total **completed lessons**
- Overall **average accuracy**
- Letters that have been **mastered**
- Letters that **require additional practice**
- Badges are retrieved separately via /api/badges

The endpoint is optimized for performance by using **indexed lookups and SQL aggregation functions**.

This endpoint powers the **frontend progress dashboard** displayed in the student account page.

### `GET /api/badges`

Returns all badges earned by the authenticated student.

The endpoint includes full badge metadata along with the timestamp when the badge was earned.

Returned badge fields include:

- `Badge ID`
- `Name`
- `Description`
- `Icon URL`
- `Badge type`
- `Points value`
- `Earned timestamp`

Badges are sorted by `earned_at` in **descending order**, ensuring the most recent achievements appear first.

This endpoint powers the **student achievements display** used by the frontend dashboard and badge reward screens.

Authentication is required and results are scoped using the verified `user_id`.
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

`Authorization: Bearer <access_token>`

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

Example Request:

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

Example Response:

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
`Authorization: Bearer <access_token>`

Example Request:

```

curl http://localhost:3000/api/lessons/writing \
  -H "Authorization: Bearer <access_token>"

```

## Retrieve Reading Lessons

Endpoint:
### GET /api/lessons/reading

Headers:
`Authorization: Bearer <access_token>`

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

`Authorization: Bearer <access_token>`

Request Body:

```json
{
  "lesson_step_id": "uuid",
  "accuracy_percent": 92.5,
  "time_spent_seconds": 18,
  "is_completed": true,
  "notes": "Improved letter shape",
  "device_id": "uuid",
  "client_event_id": "uuid",
  "completed_at": "2026-02-04T15:22:10Z",
  "drawing_url": "https://project.supabase.co/storage/v1/object/..."
}
```

Example Request:

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

## Retrieve Progress Summary

Returns a summary of the authenticated student's learning progress.

Endpoint:

### `GET /api/progress`

Headers:

`Authorization: Bearer <access_token>`

Example Request:

```

curl http://localhost:3000/api/progress

-H "Authorization: Bearer <access_token>"

```

Example Response:

```json
{
  "status": "ok",
  "data": {
    "lessons_completed": 6,
    "average_accuracy": 91.4,
    "letters_mastered": ["A","B","C"],
    "letters_needing_work": ["D","F"]
  }
}

```

## Retrieve Earned Badges

Returns all badges earned by the authenticated student.

Endpoint:

### `GET /api/badges`

Headers:

`Authorization: Bearer <access_token>`

Example Request:

```

curl http://localhost:3000/api/badges

-H "Authorization: Bearer <access_token>"

```

Example Response:

```json
{
  "status": "ok",
  "data": [
    {
      "id": "uuid",
      "name": "Colors Badge",
      "description": "Completed the Colors lesson",
      "icon_url": "/assets/rainbow-pen.png",
      "badge_type": "achievement",
      "points": 50,
      "earned_at": "2026-02-04T15:23:19Z"
    },
    {
      "id": "uuid",
      "name": "Animals Badge",
      "description": "Completed the Animals lesson",
      "icon_url": "/assets/animal-pen.png",
      "badge_type": "achievement",
      "points": 50,
      "earned_at": "2026-02-04T15:30:02Z"
    }
  ]
}

```

---


# How Authentication Works

1. User logs in through Supabase Auth on the frontend.

2. Supabase returns an access_token (JWT).

3. The frontend includes that token in API requests.

4. The backend middleware:

  - Verifies the JWT signature using JWKS

  - Validates claims (`iss`, `aud`, `exp`, `iat`, `nbf`)

  - Extracts the authenticated user ID (`sub`)

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

- Device heartbeat / sync endpoint
- Offline lesson data synchronization
- Device usage analytics
---

# Environment Variables

Sensitive values **must never be committed**.

Required:


>JWKS_URL=https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
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