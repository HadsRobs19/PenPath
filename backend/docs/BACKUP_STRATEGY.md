# PenPath Database Backup and Recovery Strategy

## Overview

This document defines how PenPath manages database backups, what protections are
currently in place, what the limitations are, and what steps to take in a recovery
scenario. It is written to reflect the actual current state of the project, not
an ideal state.

---

## Current Setup

| Item                  | Value                                      |
|-----------------------|--------------------------------------------|
| Database provider     | Supabase (Postgres)                        |
| Project ref           | kgjtcvxcvpcyinchfvct                       |
| Current plan          | Free                                       |
| Automatic backups     | None — not available on the free plan      |
| Point-in-Time Recovery| Not available on the free plan             |
| Backup retention      | Not applicable                             |

---

## What the Free Plan Means for Backups

Supabase does not provide automatic backups on the free tier. This means:

- If data is accidentally deleted, there is no snapshot to restore from
- If the project is paused or deleted by Supabase, data cannot be recovered
- There is no rollback capability built into the platform at this tier

This is acceptable during early development when the database contains only
test and seed data. It becomes unacceptable once real user data exists.

---

## Manual Backup Strategy (Current)

Until PenPath upgrades to a paid plan, backups must be taken manually.

### How to take a manual backup

Run the following from the Supabase SQL editor or using the Supabase CLI:

```bash
pg_dump \
  --host=db.kgjtcvxcvpcyinchfvct.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --no-password \
  --format=custom \
  --file=penpath_backup_$(date +%Y%m%d).dump
```

You will be prompted for the database password (DB_PASSWORD from your .env.local).

Store the resulting `.dump` file somewhere safe and off the Supabase server, such as:
- A local encrypted drive
- A private cloud storage bucket (not the same Supabase project)

### When to take a manual backup

- Before running any migration
- Before making schema changes
- Before seeding or wiping data
- At the end of each significant development sprint

---

## Recovery Steps

### Scenario 1 — Accidental data deletion (table rows)

If rows were deleted by mistake and no backup exists, they cannot be recovered
on the free plan. Prevention is the only option:

- Use RLS policies to restrict who can delete rows
- Test destructive queries in the local schema first (public_local)
- Never run DELETE without a WHERE clause

### Scenario 2 — Schema corruption or dropped table

If a table is dropped or schema is corrupted:

1. Check if a manual backup `.dump` file exists
2. If yes, restore it:

```bash
pg_restore \
  --host=db.kgjtcvxcvpcyinchfvct.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --no-password \
  penpath_backup_YYYYMMDD.dump
```

3. If no backup exists, rebuild the schema from the migration files in
   `backend/migrations/` and reseed from `backend/example_data.sql`

### Scenario 3 — Supabase project becomes inaccessible

If the Supabase project is paused (free plan projects pause after 1 week of
inactivity) or deleted:

1. Log into the Supabase dashboard at https://app.supabase.com
2. If paused, click Restore Project — data is preserved during a pause
3. If deleted, data cannot be recovered — rebuild from migrations and seed files
4. Update all environment variables if a new project is created

---

## Backup Limitations Summary

| Limitation                          | Impact                              | Mitigation                          |
|-------------------------------------|-------------------------------------|-------------------------------------|
| No automatic backups on free plan   | No recovery point if data is lost   | Manual pg_dump before major changes |
| No PITR on free plan                | Cannot rewind to a specific time    | Upgrade to Pro when live users exist|
| Free projects pause after inactivity| App goes offline, data preserved    | Keep project active or upgrade      |
| No backup of Supabase Storage files | Uploaded files have no backup       | Store originals elsewhere for now   |

---

## Upgrade Path

When PenPath moves to production with real users, upgrade to the Supabase Pro plan.

Pro plan provides:
- Daily automatic backups
- 7-day backup retention
- One-click restore from the dashboard
- Option to add PITR (Point-in-Time Recovery) as an add-on

The upgrade is done in the Supabase dashboard under Settings > Billing.

---

## Schema Recovery Reference

If the database needs to be rebuilt from scratch, apply files in this order:

1. `backend/migrations/000001_initial_schema.up.sql` — base schema
2. `backend/rls/001_enable_rls.sql` through `007_policies_relations.sql` — RLS policies
3. `backend/storage/storage_rls_policies.sql` — storage policies
4. `backend/example_data.sql` — seed data for development

---

## Responsibility

During development, the engineer running migrations or schema changes is
responsible for taking a manual backup beforehand. There is no automated
safety net on the current plan.
