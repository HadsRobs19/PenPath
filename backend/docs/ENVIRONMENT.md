# Environment Separation Strategy

This document outlines how PenPath backend manages different environments (Local, Staging, Production).

## Overview

We use environment-specific `.env` files to manage configuration across three environments:
- **Local**: Development on your machine
- **Staging**: Testing environment before production
- **Production**: Live environment for end users

All three environments use the **same Supabase project** but connect to **different schemas**.

---

## File Structure

```
backend/
├── .env.local              # Local development (DO NOT COMMIT)
├── .env.staging            # Staging environment (DO NOT COMMIT)
├── .env.production         # Production environment (DO NOT COMMIT)
├── .env.example            # Template documenting all variables (COMMIT THIS)
├── config/
│   └── environment.js      # Configuration loader
├── package.json
└── server.js
```

---

## Environment Variables

All environments use these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_ANON_KEY` | Public anonymous key | `eyJhbGc...` |
| `SUPABASE_SERVICE_KEY` | Service role key (admin access) | `eyJhbGc...` |
| `NODE_ENV` | Environment type | `local`, `staging`, or `production` |
| `DB_SCHEMA` | Schema name in Supabase | `public_local`, `public_staging`, `public_production` |
| `API_PORT` | Server port | `3000` |
| `API_HOST` | Server host | `localhost` |
| `LOG_LEVEL` | Logging verbosity | `debug`, `info`, `warn`, `error` |

---

## Setup Instructions

### 1. Get Supabase Credentials

From your Supabase dashboard:
1. Go to **Settings → API**
2. Copy `Project URL` → paste into `SUPABASE_URL`
3. Copy `anon public` → paste into `SUPABASE_ANON_KEY`
4. Copy `service_role secret` → paste into `SUPABASE_SERVICE_KEY`

**⚠️ WARNING**: Never commit the actual keys. Only `.env.example` should be in version control.

### 2. Create Environment Files

Copy `.env.example` to create each environment file:

```bash
cp .env.example .env.local
cp .env.example .env.staging
cp .env.example .env.production
```

Then edit each file with the appropriate values:

**`.env.local`** - Your development setup
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_KEY=your_actual_service_key
NODE_ENV=local
DB_SCHEMA=public_local
API_PORT=3000
API_HOST=localhost
LOG_LEVEL=debug
```

**`.env.staging`** - Staging environment
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_KEY=your_actual_service_key
NODE_ENV=staging
DB_SCHEMA=public_staging
API_PORT=3000
API_HOST=0.0.0.0
LOG_LEVEL=info
```

**`.env.production`** - Production environment
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_KEY=your_actual_service_key
NODE_ENV=production
DB_SCHEMA=public_production
API_PORT=3000
API_HOST=0.0.0.0
LOG_LEVEL=warn
```

### 3. Running the Server

```bash
# Local development (reads .env.local)
npm run dev

# Staging (reads .env.staging)
npm run staging

# Production (reads .env.production)
npm run prod

# Or manually specify environment
NODE_ENV=local npm start
```

---

## How It Works

The `config/environment.js` file:

1. **Detects** the current `NODE_ENV` value
2. **Loads** the corresponding `.env.{environment}` file
3. **Validates** that all required variables are set
4. **Exports** a configuration object your app can use

```javascript
// In your code:
const config = require('./config/environment');

console.log(config.supabase.url);      // Supabase URL
console.log(config.database.schema);   // Current schema
console.log(config.environment);       // 'local', 'staging', or 'production'
```

---

## Security Best Practices

✅ **DO:**
- Store sensitive keys in `.env.local`, `.env.staging`, `.env.production`
- Include `.env*` (except `.env.example`) in `.gitignore`
- Never commit actual environment files
- Use service keys only where needed (not in frontend)

❌ **DON'T:**
- Commit actual `.env` files with secrets
- Share `.env` files over email or chat
- Store passwords/keys in code or comments
- Use the same schema/database for all environments

---

## Supabase Schema Strategy

Since you're using **one Supabase project with different schemas**:

### Local Development Schema: `public_local`
- For testing locally
- Can reset without affecting others
- Fresh data for development

### Staging Schema: `public_staging`
- For testing before production
- Mirrors production structure
- Team testing environment

### Production Schema: `public_production`
- Live user data
- Most restrictive access
- Backup regularly

**To connect to different schemas**, in your queries:
```javascript
const { data, error } = await supabase
  .from(config.database.schema + '.users')  // e.g., 'public_local.users'
  .select('*');
```

---

## Troubleshooting

**"Missing required environment variables"**
- Check you created the `.env.{environment}` file
- Verify all required vars are present
- Restart the server after changing `.env` file

**"Cannot connect to Supabase"**
- Verify `SUPABASE_URL` is correct (no trailing slash)
- Verify `SUPABASE_ANON_KEY` is copied completely
- Check your Supabase project is active

**"Wrong database schema"**
- Check `DB_SCHEMA` matches your Supabase schema name
- Verify you're running the correct `npm run` command
- Confirm `NODE_ENV` is set to expected value

---

## Next Steps

1. ✅ Add environment files (.env.local, .env.staging, .env.production)
2. ✅ Populate with your Supabase credentials
3. ✅ Test with `npm run dev`
4. ✅ Add `.env*` files to `.gitignore` (except `.env.example`)
5. Share `.env.example` with team; each developer creates their own `.env.local`
