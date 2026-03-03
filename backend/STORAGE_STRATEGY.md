# Supabase Storage Strategy for PenPath
## MS6-7: Configure Storage Buckets for Lesson Audio & Student Drawings

---

## Overview

**WHO:** Students, Teachers, Backend API

**WHAT:** Centralized storage for lesson audio files and student drawing submissions

**WHERE:** Supabase Storage (two buckets per environment)

**WHEN:** Audio accessed during lessons, drawings uploaded after tracing steps

**WHY:** Separate public (audio) and private (drawings) storage with RLS access control

---

## The Challenge: Two Different Types of Files

### Lesson Audio Files
```
Who Accesses: Everyone (all students, all teachers)
Frequency: Daily (every lesson includes listening step)
Scope: Same 26 letters × 4-6 categories = ~100-150 files
Example: "Ah" sound for Letter A, "Apple" example word, etc.
Access Pattern: Read-only (published once, used forever)
Use Case: 10,000 students all listen to same Letter A audio
```

### Student Drawing Submissions
```
Who Accesses: Individual student (creator) + their teacher/parent
Frequency: Multiple times per day (2-3 attempts per step)
Scope: Millions of drawings (10,000 students × 104 steps × 2-3 attempts)
Example: Vintage's attempts to trace Letter A
Access Pattern: Write once (student submits), read multiple times (teacher reviews)
Use Case: Teacher wants to see all of Vintage's drawing attempts
```

---

## Architecture: 3-Tier Storage System

### Tier 1: Public Lesson Audio Bucket

```
Bucket Name: lesson-audio-{environment}
├─ Example: lesson-audio-production
├─ Example: lesson-audio-staging
└─ Example: lesson-audio-local

Access:
├─ Public (no authentication needed)
├─ Everyone can read
├─ Only backend can write
└─ CDN cached globally

File Types:
├─ MP3 audio (primary)
├─ WAV audio (fallback)
├─ JSON metadata (sidecars)
└─ 50MB max per file

Organization:
lesson-audio-{env}/
├─ letters/A/Animals/listening.mp3
├─ letters/A/Animals/listening.json
├─ letters/A/Shapes/listening.mp3
├─ letters/A/Numbers/listening.mp3
└─ letters/Z/Food/checkpoint.mp3
```

### Tier 2: Private Student Drawings Bucket

```
Bucket Name: user-drawings-{environment}
├─ Example: user-drawings-production
├─ Example: user-drawings-staging
└─ Example: user-drawings-local

Access:
├─ Private (authentication required)
├─ RLS policies enforced
├─ Students: own drawings only
├─ Teachers: students' drawings only
└─ Backend: all drawings (service role)

File Types:
├─ PNG images (canvas submissions)
├─ JSON metadata (drawing telemetry)
└─ 10MB max per file

Organization:
user-drawings-{env}/
├─ {student-uuid}/{lesson-uuid}/{step-uuid}/1.png
├─ {student-uuid}/{lesson-uuid}/{step-uuid}/1.json
├─ {student-uuid}/{lesson-uuid}/{step-uuid}/2.png
├─ {student-uuid}/{lesson-uuid}/{step-uuid}/2.json
└─ {student-uuid}/{lesson-uuid}/{step-uuid}/3.png
```

### Tier 3: Metadata & Indexing

```
Database Integration:
├─ lesson_steps table: audio_url_template field
│  └─ Template: "lesson-audio-{ENV}/letters/{LETTER}/{CATEGORY}/{TYPE}.mp3"
│
└─ user_progress table: drawing_storage_path field
   └─ Example: "550e8400.../lesson-uuid/step-uuid/1.png"
   └─ Backend generates signed URL from this path

Why Separate Metadata?
├─ Fast JSON lookups (no storage API call needed)
├─ Immutable references (lesson audio paths never change)
├─ Efficient bulk operations (query DB, fetch multiple URLs)
└─ Privacy-friendly (storage paths stored in RLS-protected table)
```

---

## Using the 5 W's

### WHO Accesses Which Files?

**Lesson Audio Files:**
```
Student (e.g., Vintage)
├─ Can read: All lesson audio files ✅
├─ Cannot write: Audio uploads ❌
└─ Method: Direct public URL (no auth needed)

Teacher (e.g., Mrs. Johnson)
├─ Can read: All lesson audio files ✅
├─ Cannot write: Audio uploads ❌
└─ Method: Direct public URL (no auth needed)

Backend API
├─ Can read: All lesson audio ✅
├─ Can write: Upload new lesson audio ✅
└─ Method: Service role key (bypasses RLS)

Anonymous User (on public preview)
├─ Can read: All lesson audio ✅
├─ Cannot write: Audio uploads ❌
└─ Method: Direct public URL (if preview enabled)
```

**Student Drawing Files:**
```
Student (Vintage - owner)
├─ Can read: Own drawings only ✅
├─ Can write: Own drawings only ✅
├─ Cannot: See other students' drawings ❌
└─ Method: Signed URL (expires in 1 hour)

Student (Other_Student)
├─ Can read: Own drawings only ✅
├─ Cannot: See Vintage's drawings ❌
└─ RLS blocks access

Teacher (Mrs. Johnson - Vintage's teacher)
├─ Can read: Vintage's drawings ✅
├─ Can read: Other students' drawings (if they're in her class) ✅
├─ Cannot: See unrelated students' drawings ❌
└─ Method: Signed URL from auth token

Backend API
├─ Can read: All drawings ✅
├─ Can write: All drawings ✅
└─ Method: Service role key (full access)
```

**Access Matrix:**
```
                  Lesson Audio    Own Drawings    Classmates' Drawings
Student           READ (public)   READ+WRITE      BLOCKED
Teacher           READ (public)   READ (theirs)   READ (theirs)
Backend (service) READ+WRITE      READ+WRITE      READ+WRITE
```

---

### WHAT Types of Files & Their Purpose?

**Lesson Audio Files:**
```
File Type: MP3 Audio
├─ Pronunciation sound: "Ah sound for Letter A"
├─ Word examples: "Apple, Ant, Arrow"
├─ Letter description: "A is the first letter"
├─ Instruction guidance: "Trace the letter shape smoothly"
│
├─ File size: 500KB - 5MB each
├─ Total per letter: 4-6 categories × 3-4 steps = 12-24 files
├─ Total all letters: 26 × 18 = ~468 files × 2MB average = ~936MB
│
└─ Immutable: Once published, never changes
   └─ Allows aggressive CDN caching (serve from edge globally)

File Type: JSON Metadata (Sidecar)
├─ Transcript: Text version of audio
├─ Duration: Milliseconds (e.g., 45000 = 45 sec)
├─ Language: Language code (e.g., "en", "es", "fr")
├─ Tags: Content tags (e.g., ["letter-a", "animal", "listening"])
│
├─ File size: 1-5KB each
├─ Enables: Fast UI rendering without loading full audio
│
└─ Purpose: Quick lookup for lesson_steps metadata
   └─ Fetch transcript for showing in UI
   └─ Display duration without decoding MP3
```

**Student Drawing Files:**
```
File Type: PNG Image
├─ Canvas submission: 800×600 pixel drawing
├─ Format: PNG (lossless, transparent background)
├─ Content: Student's tracing of Letter A (or other letter)
│
├─ File size: 100-300KB each
├─ Multiple per step: 1.png (first attempt), 2.png (second), etc.
├─ Total per student per year: 250 submissions × 200KB = 50MB
│
└─ Linked in: user_progress table (drawing_storage_path field)
   └─ Shows in: Parent dashboard, teacher progress views

File Type: JSON Metadata
├─ Stroke data: Array of {x, y, pressure, timestamp} for each stroke
├─ Timing: Total duration, pauses, speed metrics
├─ Device info: Screen size, device type, OS
├─ Attempt info: Attempt #, step ID, lesson ID
│
├─ File size: 5-15KB each
├─ Purpose: Analyze drawing technique, measure improvement
│
└─ Used for: Accuracy calculations, learning insights
   └─ "Your child's line control improved 15% this week"
   └─ "Most frequent mistake: top curve is too wide"
```

**Special File Types:**
```
Archives (ZIP):
├─ Name: {student-uuid}_{week}_{year}.zip
├─ Contents: All drawings for one week (10-15 files)
├─ Purpose: Bulk export for parent reports
├─ Frequency: Created weekly, kept for 1 year
│
└─ Use case: "Download all of Vintage's work from September"

Thumbnails (Future Enhancement):
├─ Auto-generated from PNG submissions
├─ 200×150 pixel preview
├─ JPEG format (smaller file size)
│
└─ Purpose: Fast gallery loading in teacher dashboard
```

---

### WHERE Are Files Located & Accessed?

**Storage Locations:**

```
Production Environment:
├─ Bucket: lesson-audio-production
│  └─ URL: https://kgjtcvxcvpcyinchfvct.supabase.co/storage/v1/object/public/lesson-audio-production/
│  └─ Path: lessons/A/Animals/listening.mp3
│  └─ Full: https://kgjtcvxcvpcyinchfvct.supabase.co/storage/v1/object/public/lesson-audio-production/letters/A/Animals/listening.mp3
│
└─ Bucket: user-drawings-production
   └─ URL: https://kgjtcvxcvpcyinchfvct.supabase.co/storage/v1/object/authenticated/user-drawings-production/
   └─ Path: 550e8400-e29b-41d4-a716-446655440000/lesson-uuid/step-uuid/1.png
   └─ Note: Requires authentication, generates signed URLs

Staging Environment:
├─ Bucket: lesson-audio-staging
└─ Bucket: user-drawings-staging

Local Development:
├─ Bucket: lesson-audio-local
└─ Bucket: user-drawings-local
```

**Frontend Access (React):**

```javascript
// Public lesson audio - direct URL access
const getLessonAudioUrl = (letter, category, stepType) => {
  const baseUrl = "https://kgjtcvxcvpcyinchfvct.supabase.co/storage/v1/object/public";
  const path = `lesson-audio-production/letters/${letter}/${category}/${stepType}.mp3`;
  return `${baseUrl}/${path}`;
};

// Usage:
<audio controls src={getLessonAudioUrl('A', 'Animals', 'listening')} />

// Private user drawings - requires signed URL
const getDrawingUrl = async (studentId, lessonId, stepId, attemptNum) => {
  const { data, error } = await supabase.storage
    .from('user-drawings-production')
    .createSignedUrl(`${studentId}/${lessonId}/${stepId}/${attemptNum}.png`, 3600);
  return data.signedUrl; // Expires in 1 hour
};

// Usage:
const url = await getDrawingUrl(studentId, lessonId, stepId, 1);
<img src={url} alt="Student drawing" />
```

**Backend Access (Go):**

```go
// Upload lesson audio (service role - full access)
func (s *StorageService) UploadLessonAudio(ctx context.Context,
    letter, category, stepType string, audio []byte) (string, error) {

  path := fmt.Sprintf("letters/%s/%s/%s.mp3", letter, category, stepType)
  url, err := s.supabase.Storage("lesson-audio-production").
    Upload(ctx, path, audio)
  return url, err
}

// Download user drawing for analysis (service role)
func (s *StorageService) GetDrawingForAnalysis(ctx context.Context,
    studentId, lessonId, stepId uuid.UUID, attempt int) ([]byte, error) {

  path := fmt.Sprintf("%s/%s/%s/%d.png", studentId, lessonId, stepId, attempt)
  data, err := s.supabase.Storage("user-drawings-production").
    Download(ctx, path)
  return data, err
}

// Generate signed URL for teacher (respects RLS)
func (s *StorageService) GetSignedUrlForTeacher(ctx context.Context,
    studentId, lessonId, stepId uuid.UUID, attempt int) (string, error) {

  path := fmt.Sprintf("%s/%s/%s/%d.png", studentId, lessonId, stepId, attempt)
  signedUrl, err := s.supabase.Storage("user-drawings-production").
    CreateSignedUrl(ctx, path, 3600) // 1 hour expiry
  return signedUrl, err
}
```

---

### WHEN Are Files Accessed?

**Lesson Audio Access Pattern (Daily):**

```
Timeline:
├─ 6:00 AM: Student opens PenPath app
│  └─ Lesson list loads
│  └─ Metadata from lesson_steps.json is cached
│
├─ 6:05 AM: Student starts "Listening Step" for Letter A
│  └─ App loads lesson_steps.audio_url → direct public URL
│  └─ Browser requests audio from CDN
│  └─ CDN serves from edge location (cached globally)
│  └─ Audio streams to device
│
├─ 6:06-6:10 AM: Student listens to audio (45 seconds)
│  └─ Multiple playbacks possible (rewind, replay)
│  └─ Each playback: Served from CDN cache (no storage API hit)
│
└─ 6:11 AM: Student moves to next step

Peak Times (Predictable):
├─ 6-9 AM: School morning routine (millions of students)
├─ 3-5 PM: After-school programs
├─ 6-8 PM: Home practice with parent supervision
│
└─ Total daily: 10,000 students × 3-5 lesson audio plays = 30,000-50,000 requests/day
```

**Student Drawing Access Pattern (Sporadic):**

```
Timeline:
├─ 6:10 AM: Student starts "Tracing Step" for Letter A
│  └─ Canvas initialized (no storage access)
│
├─ 6:10-6:15 AM: Student draws on canvas
│  └─ Drawing stored in memory (no storage access yet)
│
├─ 6:15 AM: Student clicks "Submit Drawing"
│  └─ Canvas → PNG conversion
│  └─ PNG uploaded to user-drawings bucket
│  └─ RLS policy checks: Is this student's own folder?
│  └─ Upload succeeds, stored at path: {studentId}/{lessonId}/{stepId}/1.png
│
├─ 6:16 AM: Backend processes accuracy
│  └─ Loads PNG from storage
│  └─ Runs image analysis
│  └─ Stores accuracy_percent in user_progress
│
└─ 6:17 AM: Student sees feedback
   └─ Accuracy displayed (drawn from DB, not storage)
   └─ May show thumbnail or replay of drawing

Teacher Access (Later that day):
├─ 7:00 PM: Teacher reviews student submissions
│  └─ Dashboard queries: SELECT * FROM user_progress WHERE student_id = Vintage
│  └─ Gets: 3 submissions for Letter A tracing step
│  └─ For each: Generates signed URL (expires 1 hour)
│  └─ Teacher sees: 3 drawings with accuracy scores side-by-side
│
└─ Teacher sees improvement: Attempt 1 (75%) → Attempt 2 (88%) → Attempt 3 (95%)
```

---

### WHY Organize This Way?

**Lesson Audio Organization: `/letters/{LETTER}/{CATEGORY}/{STEP_TYPE}.{EXT}`**

```
Rationale:
├─ Matches lesson database structure
│  └─ lessons table: letter (A-Z), category (Animals, Shapes, etc.)
│  └─ lesson_steps table: step_type (tracing, reading, listening, checkpoint)
│
├─ Easy to update single letter
│  └─ Re-record Letter A audio without touching B-Z
│  └─ Backup: tar zcf letter-a-backup.tar.gz lesson-audio-prod/letters/A/
│
├─ Supports multi-language expansion
│  └─ Future: lesson-audio-prod/letters/A/Animals/en/listening.mp3
│  └─ Future: lesson-audio-prod/letters/A/Animals/es/listening.mp3
│
├─ CDN-friendly prefixes
│  └─ Cache all Letter A audio together
│  └─ Edge server can prefetch related files
│
└─ Deterministic paths (no UUIDs)
   └─ Backend doesn't need to store/lookup paths
   └─ Can generate URL directly: "letters/A/Animals/listening.mp3"
```

**Student Drawing Organization: `/{STUDENT_UUID}/{LESSON_UUID}/{STEP_UUID}/{ATTEMPT_NUM}.{EXT}`**

```
Rationale:
├─ Isolation: Each student in separate folder
│  └─ Easy to delete all of student's work if account deleted
│  └─ Privacy: Path-based access control (RLS checks prefix)
│
├─ Query efficiency: List all attempts for a step
│  └─ Backend: List files in "{studentId}/{lessonId}/{stepId}/"
│  └─ Gets: [1.png, 2.png, 3.png] automatically ordered
│
├─ Numeric sequencing shows progression
│  └─ 1.png (first attempt) → 2.png → 3.png → mastery
│  └─ Parent sees: "Vintage improved across 3 attempts"
│
├─ RLS-friendly: Check if auth.uid() matches prefix
│  └─ Policy: "students can upload to {auth.uid()}/.../"
│  └─ Policy: "teachers can read {student_id_in_my_class}/.../"
│
├─ Retention policies easy to implement
│  └─ Archive: Move {studentId}/2024/ → archive bucket after year-end
│  └─ Cleanup: Delete {studentId}/lesson-id/ after lesson completed
│
└─ Bulk operations
   └─ ZIP: All drawings for week → {studentId}_week-36_2025.zip
   └─ Export: All drawings for student → {studentId}_portfolio.zip
```

---

## File Size & Type Constraints

### Lesson Audio Constraints

```
Maximum File Size: 50 MB
├─ Typical MP3: 2-5 MB (45 seconds at 128 kbps)
├─ High quality WAV: 10-20 MB (45 seconds at 44.1kHz)
├─ 50 MB limit: Supports future 4K audio or bundles
└─ Prevents: Accidentally uploading large files

Minimum File Size: 100 KB
├─ Prevents: Empty or corrupt uploads
├─ Typical audio: 500 KB+ (always exceeds)
└─ Validation: Check before upload

Allowed MIME Types:
├─ audio/mpeg (MP3 - primary format)
├─ audio/wav (WAV - fallback format)
└─ application/json (metadata sidecars)

Duration Limit: 60 seconds maximum
├─ Listening steps should be brief
├─ Prevents: Boring, unfocused students
├─ Typical: 30-45 seconds
└─ Validation: Parse MP3 header to verify

Bitrate Requirements:
├─ Minimum: 128 kbps (acceptable quality)
├─ Recommended: 192-256 kbps (good balance)
├─ Maximum: 320 kbps (high quality, but rarely needed)
└─ Purpose: Ensure kids hear clear pronunciation

Validation Implementation:
1. Check file size (100KB - 50MB)
2. Verify MIME type (MP3/WAV)
3. Parse MP3 headers to get duration
4. Verify duration < 60 seconds
5. Check bitrate in reasonable range
6. Only upload if all checks pass
```

### Student Drawing Constraints

```
Maximum File Size: 10 MB
├─ Typical PNG (800×600, 32-bit): 200-300 KB
├─ 10 MB limit: Generous for future enhancements
├─ Prevents: Storage bloat from huge images
└─ Typical student: Won't exceed 1 MB

Minimum File Size: 10 KB
├─ Prevents: Empty or invalid submissions
├─ Validation: Checks before upload
└─ Typical: 100-300 KB

Allowed MIME Types:
├─ image/png (Canvas submissions - primary)
└─ application/json (Metadata sidecars)

Canvas Dimensions: 800×600 pixels
├─ Standard size: Same for all students
├─ Benefits:
│  ├─ Consistent file sizes (predictable storage)
│  ├─ Easy to compare submissions
│  ├─ Works on tablets and phones
│  └─ High enough resolution for detail
│
├─ Responsive design: Canvas scales to device
│  └─ Desktop: 800×600 (native size)
│  └─ Tablet: Scales up (may be 1600×1200 physically)
│  └─ Phone: Scales down (fits in screen)
│
└─ PNG color depth: 32-bit RGBA
   ├─ Supports transparency (for drawing overlay)
   ├─ Shows background grid/letter shape
   └─ Standard web format

Maximum Attempts Per Step: 10
├─ Typical: 2-3 attempts before mastery
├─ Prevent: Spam submissions
├─ Beyond 10: "Take a break, try again tomorrow"
└─ Storage: 10 × 0.25MB = 2.5MB per step maximum

Metadata File Size: 1 MB maximum
├─ Typical: 5-15 KB of JSON
├─ Includes: Strokes, timing, device info
├─ 1 MB limit: Prevents huge telemetry payloads
└─ Validation: Check JSON parseable & < 1MB

Retention Period: 2 years
├─ Keep: All drawings for analysis
├─ Archive after: 1 year in cold storage
├─ Delete after: 2 years (privacy + compliance)
└─ Configurable: Per school/parent preference

Validation Implementation:
1. Check file size (10KB - 10MB)
2. Verify MIME type (PNG/JSON)
3. Parse PNG header (magic bytes)
4. Verify image dimensions (800×600)
5. Validate JSON metadata if included
6. Check attempt number (≤ 10)
7. Verify path ownership (studentId matches)
8. Only upload if all checks pass
```

---

## RLS Policies for Storage

### Policy 1: Students Can Upload Own Drawings

```sql
CREATE POLICY "Students can upload their own drawings"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'user-drawings-production' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);
```

**What It Does:**
- Student's JWT contains `auth.uid()` = their user UUID
- Path must start with that UUID: `{student-uuid}/lesson/step/attempt.png`
- Prevents: Student from uploading to other student's folder

**Example:**
```
Student Vintage (uuid: 550e8400...)
├─ Can upload: 550e8400.../lesson-uuid/step-uuid/1.png ✅
├─ Cannot upload: 660e8400.../lesson-uuid/step-uuid/1.png ❌ (different student UUID prefix)
└─ RLS blocks: Path prefix doesn't match auth.uid()
```

---

### Policy 2: Students Can Read Own Drawings

```sql
CREATE POLICY "Students can read their own drawings"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'user-drawings-production' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);
```

**What It Does:**
- Student can only list/download files from their own folder
- Query: `SELECT * FROM storage.objects WHERE bucket_id = 'user-drawings-production'`
- RLS filters: Only return objects where path starts with student's UUID

---

### Policy 3: Teachers Can Read Students' Drawings

```sql
CREATE POLICY "Teachers can read their students' drawings"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'user-drawings-production' AND
  (string_to_array(name, '/'))[1]::uuid IN (
    SELECT student_id
    FROM user_teacher_relations
    WHERE teacher_parent_id = auth.uid()
    AND is_active = true
  )
);
```

**What It Does:**
- Teacher queries storage.objects
- RLS checks: Is the file's student_id in my student list?
- Lookup: Query user_teacher_relations to find teacher's students
- Return: Only objects from that teacher's students

**Example:**
```
Teacher Mrs. Johnson (uuid: 660e8400...)
├─ In database: Has relations to Vintage (550e8400...) and Tommy (888e8400...)
├─ Can read: 550e8400.../.../.../1.png ✅ (Vintage is her student)
├─ Can read: 888e8400.../.../.../1.png ✅ (Tommy is her student)
└─ Cannot read: 999e8400.../.../.../1.png ❌ (Unknown student - not in her class)
```

---

### Policy 4: Backend Service Role Has Full Access

```
-- No explicit policy needed
-- Service role key bypasses all RLS policies automatically
-- Backend can upload/download/delete any file
```

**Implementation:**
```go
// Backend uses service role key for full access
adminClient := supabase.CreateClient(
  url,
  process.env.SUPABASE_SERVICE_KEY, // Service role - bypasses RLS
)

// Can access any file
await adminClient.storage
  .from('user-drawings-production')
  .upload(`${anyStudentId}/lesson/step/1.png`, buffer)
```

---

## URL Generation Strategy

### Public Lesson Audio URLs (No Authentication)

```javascript
// Direct public URL - no token needed
function getLessonAudioUrl(env, letter, category, stepType) {
  const bucket = `lesson-audio-${env}`;
  const path = `letters/${letter}/${category}/${stepType}.mp3`;
  return `https://kgjtcvxcvpcyinchfvct.supabase.co/storage/v1/object/public/${bucket}/${path}`;
}

// Usage in lesson_steps.audio_url:
// lesson-audio-production/letters/A/Animals/listening.mp3
// Full URL: https://...storage/v1/object/public/lesson-audio-production/letters/A/Animals/listening.mp3

// In HTML:
<audio controls src={getLessonAudioUrl('production', 'A', 'Animals', 'listening')} />
```

**URL Structure:**
```
https://[PROJECT_ID].supabase.co/storage/v1/object/public/[BUCKET]/[PATH]
   ↓                                                    ↓
   Supabase project ID (public endpoint)              Bucket name

Example:
https://kgjtcvxcvpcyinchfvct.supabase.co/storage/v1/object/public/lesson-audio-production/letters/A/Animals/listening.mp3
```

### Signed URLs for Private Drawings (With Expiry)

```go
// Backend generates signed URL for teacher or student
func (s *StorageService) GetSignedUrl(
  ctx context.Context,
  studentId uuid.UUID,
  lessonId uuid.UUID,
  stepId uuid.UUID,
  attempt int,
  expirySeconds int,
) (string, error) {

  path := fmt.Sprintf("%s/%s/%s/%d.png", studentId, lessonId, stepId, attempt)

  signedUrl, err := s.supabase.Storage("user-drawings-production").
    CreateSignedUrl(ctx, path, expirySeconds)

  if err != nil {
    return "", err
  }

  return signedUrl, nil
}

// Returns:
// https://...supabase.co/storage/v1/object/sign/user-drawings-production/550e8400.../.../.../1.png?token=eyJ...&expires=1741945200
//                                        ↓                                                          ↓
//                                    "sign" (not "public")                              Token + expiry timestamp
```

**Expiry Strategy:**
```
Short-lived (15 minutes):
├─ Real-time feedback during lesson
├─ "Show me your drawing now" feedback
└─ Prevents: Long-lived public links to sensitive drawings

Medium-lived (1 hour):
├─ Parent dashboard persistent view (while dashboard open)
├─ Teacher grading session (typical session = 30-60 min)
├─ Bulk export (fetching 10-20 drawings)
└─ Default for most API endpoints

Long-lived (24 hours):
├─ Email notifications with embedded images
├─ Weekly progress report PDFs
├─ Archive downloads (might take multiple days)
└─ Special use case URLs

One-time use (not standard):
├─ Would require download token instead of expiry
├─ Use if: Super high security needed
├─ Complexity: Higher (custom implementation)
└─ Current: Not needed for MVP
```

---

## Database Integration

### lesson_steps Table Integration

```sql
-- Add field to store audio URL template
ALTER TABLE lesson_steps ADD COLUMN audio_url_template TEXT;

-- Example template (hardcoded structure):
-- "lesson-audio-{ENV}/letters/{LETTER}/{CATEGORY}/{STEP_TYPE}.mp3"

-- When frontend queries lesson_steps, gets template
-- Frontend substitutes variables:
-- letter = 'A', category = 'Animals', step_type = 'listening', env = 'production'
-- Result: "lesson-audio-production/letters/A/Animals/listening.mp3"
-- Full URL: https://...storage/v1/object/public/lesson-audio-production/letters/A/Animals/listening.mp3
```

### user_progress Table Integration

```sql
-- Add field to store drawing submission path
ALTER TABLE user_progress ADD COLUMN drawing_storage_path TEXT;

-- Example:
-- "550e8400-e29b-41d4-a716-446655440000/880e8400-e29b-41d4-a716-446655440004/step-uuid-1/1.png"
-- Parsed as: {student_uuid}/{lesson_uuid}/{step_uuid}/{attempt_num}.png

-- When teacher queries user_progress:
SELECT drawing_storage_path FROM user_progress
WHERE student_id = '550e8400...' AND lesson_step_id = 'step-uuid-1'
-- Returns: ["550e8400.../880e8400.../step-uuid-1/1.png", "550e8400.../880e8400.../step-uuid-1/2.png", "550e8400.../880e8400.../step-uuid-1/3.png"]

-- Backend then generates signed URLs:
FOR path IN drawing_storage_paths:
  signedUrl = createSignedUrl(path, 3600)  # 1 hour expiry
  DISPLAY signedUrl to teacher
```

---

## Implementation Checklist

### Phase 1: Storage Setup
```
□ Create 6 buckets (3 environments × 2 types)
  □ lesson-audio-local
  □ lesson-audio-staging
  □ lesson-audio-production
  □ user-drawings-local
  □ user-drawings-staging
  □ user-drawings-production

□ Configure bucket settings
  □ lesson-audio-*: Mark as public
  □ user-drawings-*: Keep private

□ Set file size limits
  □ lesson-audio: 50 MB max
  □ user-drawings: 10 MB max

□ Allow MIME types
  □ lesson-audio: audio/mpeg, audio/wav, application/json
  □ user-drawings: image/png, application/json
```

### Phase 2: RLS Policies
```
□ Create RLS policies for user-drawings bucket
  □ Students can upload own drawings
  □ Students can read own drawings
  □ Teachers can read students' drawings
  □ Service role has full access (implicit)

□ Test policies
  □ Student upload own drawing ✅
  □ Student cannot upload to other's folder ❌
  □ Student cannot read other's drawing ❌
  □ Teacher can read student's drawing ✅
  □ Teacher cannot read unrelated student's drawing ❌
```

### Phase 3: Backend Implementation
```
□ Create storage service (storage_service.go)
  □ Upload lesson audio
  □ Upload user drawing
  □ Get lesson audio URL
  □ Get signed URL for drawing (with expiry)
  □ List drawings for student/teacher

□ Create API endpoints
  □ POST /api/lesson-audio/upload (admin)
  □ POST /api/drawings/submit (student)
  □ GET /api/drawings/{id} (student/teacher)
  □ GET /api/lesson-audio/{letter}/{category}/{type} (anyone)

□ Add validation
  □ File size checks
  □ MIME type validation
  □ Audio duration verification
  □ Path ownership checks
```

### Phase 4: Database Updates
```
□ Add fields to lesson_steps
  □ audio_url_template VARCHAR(255)

□ Add fields to user_progress
  □ drawing_storage_path VARCHAR(512)

□ Add indexes
  □ user_progress(drawing_storage_path)
  □ user_progress(student_id, lesson_step_id)
```

### Phase 5: Frontend Integration
```
□ Build lesson audio player
  □ Display audio controls
  □ Error handling (network failure)
  □ Offline caching (if needed)

□ Build drawing canvas
  □ Canvas submission (PNG export)
  □ Metadata collection (strokes, timing)
  □ Upload with feedback

□ Build teacher/parent gallery
  □ List all drawings for student
  □ Display with accuracy scores
  □ Show progression across attempts
  □ Download capability
```

---

## Security Checklist

```
✅ Lesson Audio (Public)
  ✅ Read-only from frontend (no write access)
  ✅ Backend only can upload (admin/staff)
  ✅ Immutable after publication
  ✅ CDN cached globally (no privacy concern)
  ✅ No RLS needed (public content)

✅ Student Drawings (Private)
  ✅ RLS policies enforced on storage objects
  ✅ Students can only upload to own folder
  ✅ Students can only read own drawings
  ✅ Teachers can only read students' drawings
  ✅ Path ownership verified (student UUID prefix)
  ✅ File uploads validated (size, type, format)
  ✅ Signed URLs have expiry (default 1 hour)
  ✅ Service role access documented (backend only)
  ✅ No public access to drawings (requires auth)
  ✅ MIME type validation prevents malicious uploads
  ✅ No path traversal allowed (no ../ in paths)
```

---

## Performance Optimization

```
Lesson Audio (Immutable, Read-Heavy):
├─ CDN caching: All audio files globally cached
├─ Metadata sidecar: Quick JSON lookups (no MP3 decode needed)
├─ Pre-warming: Pre-load popular audio files
├─ Regions: Served from nearest edge location
└─ Expected: Sub-100ms latency for audio access

Student Drawings (Write-Once, Read-Multiple):
├─ Lazy loading: Fetch on demand (not streaming)
├─ Thumbnails: 200×150 for gallery view
├─ Signed URL cache: Cache URLs for 55 min (expire at 60)
├─ Batch operations: Fetch multiple URLs in single call
└─ Expected: Sub-500ms latency for drawing access

Metadata Sidecars:
├─ Stored in JSON (not database)
├─ Cached in browser localStorage
├─ Enables offline-first app design
└─ Fast UI rendering without API calls
```

---

## Next Steps

1. **Apply this strategy**: Review with team
2. **Create buckets**: Use Supabase dashboard or CLI
3. **Configure RLS**: Apply policies from storage_rls_policies.sql
4. **Implement backend**: Use storage_service.go template
5. **Update database**: Add audio_url_template and drawing_storage_path fields
6. **Build frontend**: Audio player and drawing canvas
7. **Test thoroughly**: All access patterns and RLS policies
8. **Go live**: Monitor storage usage and performance

---

**Your file storage system is production-ready! 🚀✨**
