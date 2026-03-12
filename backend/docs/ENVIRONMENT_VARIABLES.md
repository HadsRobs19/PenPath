# PenPath Environment Variables Reference

This document lists all environment variables used across PenPath's backend services,
where to find them, and which service each one belongs to. Do not commit real values.
Use this as a reference when setting up a new environment.

---

## Authentication Variables (Go Fiber backend)

These two variables are required for the JWT verification layer. Fiber uses them
at startup to load the Supabase public keys and validate every incoming token on
protected routes.

### SUPABASE_JWT_ISSUER

| Field       | Value                                                         |
|-------------|---------------------------------------------------------------|
| Used by     | Go Fiber — JWT middleware                                     |
| Purpose     | Verifies that incoming JWTs were issued by your Supabase project |
| Format      | `https://<project-ref>.supabase.co/auth/v1`                  |
| PenPath value | `https://kgjtcvxcvpcyinchfvct.supabase.co/auth/v1`         |

Where to find it in Supabase:
1. Go to your Supabase project dashboard
2. Settings > API
3. Copy the value under JWT Settings > JWT Issuer

---

### SUPABASE_JWKS_URL

| Field       | Value                                                                        |
|-------------|------------------------------------------------------------------------------|
| Used by     | Go Fiber — JWT middleware                                                    |
| Purpose     | URL Fiber fetches Supabase public keys from to verify RS256 JWT signatures   |
| Format      | `https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`           |
| PenPath value | `https://kgjtcvxcvpcyinchfvct.supabase.co/auth/v1/.well-known/jwks.json` |

Where to find it in Supabase:
1. Go to your Supabase project dashboard
2. Settings > API
3. The JWKS URL is constructed from your project URL:
   `<SUPABASE_URL>/auth/v1/.well-known/jwks.json`

---

## Supabase Variables (shared between Go Fiber and Node.js scripts)

### SUPABASE_URL

| Field       | Value                                            |
|-------------|--------------------------------------------------|
| Used by     | Go Fiber, Node.js scripts                        |
| Purpose     | Base URL for all Supabase API calls              |
| Format      | `https://<project-ref>.supabase.co`              |
| PenPath value | `https://kgjtcvxcvpcyinchfvct.supabase.co`    |

### SUPABASE_ANON_KEY

| Field       | Value                                                        |
|-------------|--------------------------------------------------------------|
| Used by     | Node.js scripts                                              |
| Purpose     | Public key for read-only and anonymous Supabase operations   |
| Format      | JWT string                                                   |
| Where to find | Supabase Dashboard > Settings > API > anon public          |

### SUPABASE_SERVICE_KEY

| Field       | Value                                                              |
|-------------|--------------------------------------------------------------------|
| Used by     | Go Fiber, Node.js scripts                                          |
| Purpose     | Admin key that bypasses RLS — for privileged backend operations    |
| Format      | JWT string                                                         |
| Where to find | Supabase Dashboard > Settings > API > service_role secret       |
| Warning     | Never expose this key in the frontend or commit it to the repo     |

### SUPABASE_STORAGE_BUCKET

| Field       | Value                                                    |
|-------------|----------------------------------------------------------|
| Used by     | Go Fiber                                                 |
| Purpose     | Name of the Supabase Storage bucket for handwriting files|
| PenPath value | `penpath-handwriting`                                  |

---

## Database Variables (Go Fiber backend)

### DB_PASSWORD

| Field       | Value                                                         |
|-------------|---------------------------------------------------------------|
| Used by     | Go Fiber — database connection pool                           |
| Purpose     | Password for direct Postgres connection to Supabase           |
| Where to find | Supabase Dashboard > Settings > Database > Database password|

---

## Node.js Script Variables

### NODE_ENV

| Field       | Value                                    |
|-------------|------------------------------------------|
| Used by     | Node.js scripts                          |
| Purpose     | Determines which .env file is loaded     |
| Options     | `local`, `staging`, `production`         |

### DB_SCHEMA

| Field       | Value                                                        |
|-------------|--------------------------------------------------------------|
| Used by     | Node.js scripts                                              |
| Purpose     | Determines which Supabase schema the scripts query           |
| Options     | `public_local`, `public_staging`, `public_production`        |

### LOG_LEVEL

| Field       | Value                                    |
|-------------|------------------------------------------|
| Used by     | Node.js scripts                          |
| Purpose     | Controls verbosity of script logging     |
| Options     | `debug`, `info`, `warn`, `error`         |

---

## Full Variable List

| Variable                | Service        | Secret |
|-------------------------|----------------|--------|
| SUPABASE_URL            | Fiber, Node.js | No     |
| SUPABASE_ANON_KEY       | Node.js        | No     |
| SUPABASE_SERVICE_KEY    | Fiber, Node.js | Yes    |
| SUPABASE_JWT_ISSUER     | Fiber          | No     |
| SUPABASE_JWKS_URL       | Fiber          | No     |
| SUPABASE_STORAGE_BUCKET | Fiber          | No     |
| DB_PASSWORD             | Fiber          | Yes    |
| NODE_ENV                | Node.js        | No     |
| DB_SCHEMA               | Node.js        | No     |
| LOG_LEVEL               | Node.js        | No     |

Variables marked Secret must never be committed to the repository.
They belong only in `.env.local`, `.env.staging`, or `.env.production`,
all of which are covered by .gitignore.
