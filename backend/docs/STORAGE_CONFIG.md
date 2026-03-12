# Supabase Storage Configuration Guide
## MS6-7: Setup Storage Buckets for PenPath

---

## Step-by-Step Setup

### Step 1: Create Storage Buckets

**Via Supabase Dashboard:**

1. Go to https://app.supabase.com
2. Select PenPath project
3. Click **Storage** in sidebar
4. Click **Create new bucket**

**For Each Environment (3 total):**

```
Local Development:
├─ Bucket: lesson-audio-local
│  ├─ Public: YES
│  ├─ File size limit: 50 MB
│  └─ Allowed MIME types: audio/mpeg, audio/wav, application/json
│
└─ Bucket: user-drawings-local
   ├─ Public: NO
   ├─ File size limit: 10 MB
   └─ Allowed MIME types: image/png, application/json

Staging:
├─ Bucket: lesson-audio-staging (public)
└─ Bucket: user-drawings-staging (private)

Production:
├─ Bucket: lesson-audio-production (public)
└─ Bucket: user-drawings-production (private)
```

---

### Step 2: Configure Public Buckets

**For lesson-audio-* buckets:**

1. Click bucket name
2. Click **Settings**
3. Toggle: **Make this bucket public** = ON
4. Save

**Result:** Files accessible without authentication
```
https://{project}.supabase.co/storage/v1/object/public/lesson-audio-{env}/{path}
```

---

### Step 3: Configure Private Buckets

**For user-drawings-* buckets:**

1. Click bucket name
2. Click **Settings**
3. Toggle: **Make this bucket public** = OFF
4. Save

**Result:** Files require authentication + RLS checks
```
https://{project}.supabase.co/storage/v1/object/authenticated/user-drawings-{env}/{path}
```

---

### Step 4: Set File Size Limits

**For lesson-audio-* buckets:**
1. Settings → File size limit
2. Set to: **52428800 bytes (50 MB)**
3. Save

**For user-drawings-* buckets:**
1. Settings → File size limit
2. Set to: **10485760 bytes (10 MB)**
3. Save

---

### Step 5: Configure Allowed MIME Types

**For lesson-audio-* buckets:**
```
Allowed MIME types:
├─ audio/mpeg
├─ audio/wav
└─ application/json
```

**For user-drawings-* buckets:**
```
Allowed MIME types:
├─ image/png
└─ application/json
```

**Setup:**
1. Click bucket
2. Settings → Allowed MIME types
3. Add each type
4. Save

---

### Step 6: Apply RLS Policies

**Copy and paste:** `storage/storage_rls_policies.sql`

1. Go to **SQL Editor**
2. Create **New Query**
3. Paste RLS policies
4. **Run**

**Policies Applied:**
```
✅ Students can upload own drawings
✅ Students can read own drawings
✅ Students can update own drawings
✅ Teachers can read students' drawings
✅ Users cannot delete drawings
```

---

### Step 7: Test Storage Setup

**Test Public Bucket (lesson-audio):**

```bash
# Upload test audio
curl -X POST \
  'https://{project}.supabase.co/storage/v1/object/lesson-audio-production/test.mp3' \
  -H 'authorization: Bearer {SERVICE_KEY}' \
  -H 'content-type: audio/mpeg' \
  --data-binary '@audio.mp3'

# Access via public URL (no auth needed)
curl 'https://{project}.supabase.co/storage/v1/object/public/lesson-audio-production/test.mp3'
# Result: ✅ Audio file downloaded
```

**Test Private Bucket (user-drawings):**

```bash
# Upload student drawing (authenticated)
curl -X POST \
  'https://{project}.supabase.co/storage/v1/object/user-drawings-production/550e8400.../lesson/step/1.png' \
  -H 'authorization: Bearer {STUDENT_JWT}' \
  -H 'content-type: image/png' \
  --data-binary '@drawing.png'
# Result: ✅ Upload succeeds (student owns path)

# Try to upload to other student's folder (should fail)
curl -X POST \
  'https://{project}.supabase.co/storage/v1/object/user-drawings-production/660e8400.../lesson/step/1.png' \
  -H 'authorization: Bearer {STUDENT_JWT}' \
  -H 'content-type: image/png' \
  --data-binary '@drawing.png'
# Result: ❌ RLS blocks (path doesn't match auth.uid())

# Teacher reads student's drawing (should succeed)
curl 'https://{project}.supabase.co/storage/v1/object/user-drawings-production/550e8400.../lesson/step/1.png?token={SIGNED_URL_TOKEN}'
# Result: ✅ Image displayed (teacher has access)
```

---

### Step 8: Generate Bucket Info

**Get Storage URL:**

```bash
# In Supabase dashboard:
Settings → API → Service Role Secret Key

# Environment variables:
SUPABASE_URL=https://{project}.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# Storage URLs:
STORAGE_PUBLIC=https://{project}.supabase.co/storage/v1/object/public
STORAGE_AUTHENTICATED=https://{project}.supabase.co/storage/v1/object/authenticated
```

---

## File Path Conventions

### Lesson Audio Paths

```
Format: lessons/{LETTER}/{CATEGORY}/{STEP_TYPE}.{EXT}

Examples:
├─ letters/A/Animals/tracing.mp3
├─ letters/A/Animals/listening.mp3
├─ letters/A/Shapes/listening.mp3
├─ letters/Z/Food/checkpoint.mp3
└─ letters/A/Animals/listening.json (metadata sidecar)

Benefits:
├─ Organized by lesson structure
├─ Easy to navigate
├─ Supports multi-language (future: letters/A/Animals/en/, /es/)
└─ CDN-friendly (prefix grouping)
```

### Student Drawing Paths

```
Format: {STUDENT_UUID}/{LESSON_UUID}/{STEP_UUID}/{ATTEMPT_NUMBER}.{EXT}

Examples:
├─ 550e8400-e29b-41d4-a716-446655440000/880e8400.../step-uuid/1.png
├─ 550e8400-e29b-41d4-a716-446655440000/880e8400.../step-uuid/1.json
├─ 550e8400-e29b-41d4-a716-446655440000/880e8400.../step-uuid/2.png
└─ 550e8400-e29b-41d4-a716-446655440000/880e8400.../step-uuid/3.png

Benefits:
├─ Student isolation (easy deletion if account deleted)
├─ RLS-friendly (path starts with student UUID)
├─ Query efficiency (list {studentId}/.../ directly)
├─ Numeric sequence shows progression
└─ Privacy (can check prefix matches auth.uid())
```

---

## URL Generation

### Public Lesson Audio

```javascript
// Direct URL - no auth needed, can be cached
function getLessonAudioUrl(env, letter, category, stepType) {
  const base = "https://kgjtcvxcvpcyinchfvct.supabase.co/storage/v1/object/public";
  const path = `lesson-audio-${env}/letters/${letter}/${category}/${stepType}.mp3`;
  return `${base}/${path}`;
}

// Usage
const audioUrl = getLessonAudioUrl('production', 'A', 'Animals', 'listening');
// Result: https://kgjtcvxcvpcyinchfvct.supabase.co/storage/v1/object/public/lesson-audio-production/letters/A/Animals/listening.mp3
```

### Signed URLs for Private Drawings

```bash
# Generate signed URL (backend)
curl -X POST \
  'https://{project}.supabase.co/storage/v1/object/sign/user-drawings-production/550e8400.../lesson/step/1.png' \
  -H 'authorization: Bearer {SERVICE_KEY}' \
  -H 'content-type: application/json' \
  -d '{"expiresIn": 3600}'

# Response:
{
  "name": "1.png",
  "id": "550e8400...",
  "updated_at": "2026-03-02T20:30:00Z",
  "created_at": "2026-03-02T20:30:00Z",
  "last_accessed_at": "2026-03-02T20:30:00Z",
  "metadata": {...},
  "buckets": {...},
  "signedURL": "https://...storage/v1/object/sign/user-drawings-production/550e8400.../lesson/step/1.png?token=eyJ...&expires=1741945200"
}

# Use signedURL in frontend
<img src={signedURL} alt="Student drawing" />
# URL expires in 1 hour (3600 seconds)
```

---

## Troubleshooting

### Issue: "Bucket not found"
**Solution:**
- Verify bucket name matches {env}
- Check spelling: `lesson-audio-production` (not `lesson_audio`)
- Make sure bucket is created in Supabase

### Issue: "Permission denied" on upload
**Solution:**
- Check file path matches student UUID (for user-drawings)
- Verify JWT token is valid and includes auth.uid()
- Check file size doesn't exceed limit
- Verify MIME type is allowed

### Issue: "Permission denied" on read
**Solution:**
- For public buckets: No auth needed
- For private buckets: Check RLS policies applied
- Verify student is in teacher's student list (for teachers)
- Use signed URLs for private access

### Issue: File size too large
**Solution:**
- Check actual file size
- Compress images (PNG optimizer)
- Reduce audio quality if needed
- lesson-audio limit: 50 MB
- user-drawings limit: 10 MB

### Issue: MIME type not allowed
**Solution:**
- lesson-audio: Only audio/mpeg, audio/wav, application/json
- user-drawings: Only image/png, application/json
- Don't upload JPG, WebM, or other formats
- Convert files to correct format first

---

## Security Checklist

```
✅ Lesson Audio (Public)
  ✅ Bucket is public
  ✅ File size limited to 50 MB
  ✅ Only MP3/WAV audio allowed
  ✅ No private data in audio

✅ User Drawings (Private)
  ✅ Bucket is private (not public)
  ✅ RLS policies applied
  ✅ File size limited to 10 MB
  ✅ Only PNG images allowed
  ✅ Service key stored securely (.env)
  ✅ Signed URLs have expiry
  ✅ No service key in frontend code
  ✅ Path ownership validated
```

---

## Environment Variables

**.env.local:**
```bash
SUPABASE_URL=https://kgjtcvxcvpcyinchfvct.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
STORAGE_BUCKET_LESSON_AUDIO=lesson-audio-local
STORAGE_BUCKET_USER_DRAWINGS=user-drawings-local
```

**.env.staging:**
```bash
SUPABASE_URL=https://kgjtcvxcvpcyinchfvct.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
STORAGE_BUCKET_LESSON_AUDIO=lesson-audio-staging
STORAGE_BUCKET_USER_DRAWINGS=user-drawings-staging
```

**.env.production:**
```bash
SUPABASE_URL=https://kgjtcvxcvpcyinchfvct.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
STORAGE_BUCKET_LESSON_AUDIO=lesson-audio-production
STORAGE_BUCKET_USER_DRAWINGS=user-drawings-production
```

---

## Next Steps

1. ✅ Create 6 buckets (3 environments × 2 types)
2. ✅ Configure public/private settings
3. ✅ Set file size limits
4. ✅ Configure allowed MIME types
5. ✅ Apply RLS policies
6. ✅ Test bucket access
7. ✅ Implement backend service
8. ✅ Build frontend components
9. ✅ Test end-to-end flows
10. ✅ Go live!

---

**Storage is ready to deploy!** 🚀
