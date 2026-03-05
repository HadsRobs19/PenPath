# Authentication Strategy for PenPath
## MS6-6: Configure Supabase Authentication for Kids + Devices

---

## Overview

**WHO:** Students (kids 3-12), Parents/Teachers, Devices (iPad, Raspberry Pi)

**WHAT:** A 3-tier authentication system that balances simplicity for kids with control for parents

**WHERE:** Supabase Auth (for parents), Custom PIN system (for students), Device sessions (for tablets)

**WHEN:** During app launch, daily login, device registration

**WHY:** Kids don't have emails/can't remember passwords, but need secure access. Parents need full control. Devices need auto-login convenience.

---

## The Challenge: Why Kids Are Different

### Traditional App (Adults)
```
Adult downloads app
  ↓
Adult enters email
  ↓
Adult enters password
  ↓
Adult verifies email
  ↓
Adult logged in ✅
```

### PenPath (Kids)
```
7-year-old Vintage opens app
  ├─ No email account ❌
  ├─ Can't remember complex password ❌
  ├─ Parent needs to control access ✅
  ├─ Uses shared iPad/Raspberry Pi ✅
  └─ Needs instant login ✅
```

---

## Solution: 3-Tier Authentication Model

### Tier 1: Student PIN Authentication (Kids)
```
LOGIN FLOW:
1. Vintage opens app
2. App asks: "What's your PIN?"
3. Vintage taps: 1, 2, 3, 4
4. Backend verifies PIN
5. JWT token issued
6. Vintage sees her lessons

CHARACTERISTICS:
├─ Simple (4-6 digit code)
├─ Memorable (kids can learn it)
├─ Fast (instant login)
├─ Parent-controlled (parent sets PIN)
└─ Works on all devices
```

### Tier 2: Parent/Teacher Email+Password (Adults)
```
LOGIN FLOW:
1. Parent/Teacher opens app
2. Enters: email@example.com
3. Enters: Password123!
4. Supabase Auth verifies
5. Email verification (if first time)
6. JWT token issued
7. Parent sees progress dashboard

CHARACTERISTICS:
├─ Standard (email + password)
├─ Secure (hashed passwords, Supabase managed)
├─ Professional (designed for adults)
├─ Full control (manage students, view data)
└─ Password recovery available
```

### Tier 3: Device-Bound Sessions (Tablets)
```
SETUP (Parent):
1. Parent: "This iPad is for Vintage"
2. Device registered in system
3. Option: "Remember this device"

DAILY LOGIN (Vintage):
1. Vintage opens app on iPad
2. App checks: "Do I know this device?"
3. YES → Restore session automatically
4. NO PIN NEEDED → "Welcome Vintage!"
5. Instant access ✅

CHARACTERISTICS:
├─ Zero-friction (no login needed)
├─ Device-specific (only works on registered device)
├─ Auto-logout after timeout (security)
├─ Parent can revoke access
└─ Perfect for Raspberry Pi kiosks
```

---

## Authentication Methods Evaluated

### Option 1: Email/Password for Kids ❌
```
PROBLEMS:
├─ Kids don't have email accounts
├─ Can't remember complex passwords
├─ Forgot password flows confusing for kids
├─ Email verification screens too complicated
├─ Not suitable for young children

VERDICT: Not appropriate for MVP or general use
```

### Option 2: PIN Code (SELECTED) ✅
```
ADVANTAGES:
├─ Simple (4-6 digits)
├─ Memorable (kids learn quickly)
├─ Fast login (tap tap tap tap Done!)
├─ Works on touchscreens perfectly
├─ Parent controls PIN setting
├─ No email needed
├─ Instant feedback (right/wrong)

DISADVANTAGES:
├─ Less secure than password (but OK for family device)
├─ Not suitable for public devices (but fine for home/classroom)
├─ Sibling could guess (parent's responsibility)

VERDICT: Perfect for MVP! Simple, works, secure enough.
```

### Option 3: Device-Bound (Supplementary) ✅
```
ADVANTAGES:
├─ Zero login friction
├─ Great for dedicated tablets (Raspberry Pi)
├─ Auto-login convenience
├─ Device tracking built-in
├─ Perfect for classrooms

DISADVANTAGES:
├─ Device-specific (won't work elsewhere)
├─ Requires device setup first
├─ Can't use on new device without parent

VERDICT: Excellent supplement to PIN. Use on family devices.
```

### Option 4: QR Code / NFC ❌
```
PROBLEMS:
├─ Requires extra hardware (NFC reader)
├─ Complicated for MVP
├─ Kids might lose NFC card
├─ Not needed with PIN solution

VERDICT: Future enhancement, not MVP
```

### Option 5: Anonymous Login ❌
```
PROBLEMS:
├─ Can't track individual students
├─ Parent can't see which child
├─ Data isolation breaks down
├─ Not suitable for multi-kid homes

VERDICT: Rejected - need to identify students
```

---

## Recommended Architecture

### Authentication Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    PENPATH AUTHENTICATION                    │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FIRST TIME: Parent Creates Account                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Parent downloads app                                    │
│  2. Clicks "Create Parent Account"                          │
│  3. Enters email (verified via Supabase)                    │
│  4. Enters password (hashed by Supabase)                    │
│  5. Account created in Supabase Auth ✅                     │
│  6. Parent sees "Add Student" button                        │
│  7. Parent enters: Vintage, Age: 7                          │
│  8. Parent sets PIN: 1234                                   │
│  9. Student account created in users table ✅              │
│  10. PIN stored in student_pins table ✅                   │
│  11. Parent adds device: "iPad Air"                         │
│  12. Device registered in user_devices table ✅             │
│  13. Optionally enables device-bound login                 │
│                                                              │
│  RESULT: Everything ready for Vintage to login!             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ DAILY: Student Login with PIN                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Vintage opens app                                       │
│  2. App detects device: "Is this device registered?"       │
│     - If YES → Show "Welcome Vintage!" + PIN prompt        │
│     - If NO → Show "Select Student" dropdown              │
│  3. Vintage taps: 1, 2, 3, 4                               │
│  4. Frontend sends: POST /auth/verify-pin                  │
│     Body: { student_id: Vintage, pin: "1234", device: ... }│
│  5. Backend:                                                │
│     - Query student_pins table                             │
│     - Match PIN ✅                                          │
│     - Create JWT token with Vintage's ID                   │
│     - Log auth attempt in auth_logs                        │
│     - Return JWT ✅                                         │
│  6. Frontend stores JWT securely                           │
│  7. All future requests include JWT                        │
│  8. RLS policies check: "Is this Vintage's data?"          │
│  9. Vintage sees ONLY her lessons ✅                        │
│                                                              │
│  RESULT: Vintage logged in, learning!                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TABLET: Device-Bound Auto-Login                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SETUP (Parent, one-time):                                 │
│  1. Parent clicks "Register Device"                        │
│  2. Parent selects device: "Classroom iPad"                │
│  3. Parent selects student: "Vintage"                      │
│  4. Parent enables: "Auto-login on this device"            │
│  5. Device session created in device_sessions table ✅     │
│  6. Session token (JWT) stored on device ✅                │
│                                                              │
│  DAILY (Vintage opens app):                                │
│  1. App launches on iPad                                   │
│  2. App checks device_sessions table                       │
│  3. Found valid session for this device? YES ✅             │
│  4. Session not expired? YES ✅                             │
│  5. Restore JWT from local storage                         │
│  6. Auto-login (NO PIN NEEDED!)                            │
│  7. "Welcome Vintage!" instant access                      │
│  8. Session timeout: 8 hours                               │
│  9. After 8 hours: Logout + require PIN again              │
│                                                              │
│  SECURITY:                                                  │
│  - Session expires after timeout                           │
│  - Parent can revoke device access anytime                │
│  - Logout button always available                          │
│  - All logins tracked in auth_logs                         │
│  - Device can only auto-login as assigned student          │
│                                                              │
│  RESULT: Zero-friction login on family device!             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PARENT/TEACHER: Email + Password Login                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Parent/Teacher opens app                               │
│  2. Enters email: parent@email.com                         │
│  3. Enters password: SecurePassword123!                    │
│  4. Frontend sends to Supabase Auth                        │
│  5. Supabase verifies credentials                          │
│  6. Password correct? YES ✅                                │
│  7. Supabase returns JWT token                             │
│  8. Frontend stores JWT                                    │
│  9. Parent sees dashboard:                                 │
│     - List of their students                              │
│     - Each student's progress                             │
│     - Can manage settings                                 │
│  10. Session lasts 30 days (remember device)               │
│  11. Can manually logout anytime                           │
│                                                              │
│  RESULT: Parent has full access!                           │
└─────────────────────────────────────────────────────────────┘
```

---

## API Endpoints You'll Build

### Student PIN Authentication
```
POST /auth/verify-pin
├─ Purpose: Verify PIN and issue JWT
├─ Body: {
│   student_id: "550e8400...",
│   pin_code: "1234",
│   device_id: "device123" (optional)
├─ Returns: {
│   success: true,
│   token: "eyJhbGc...",
│   student: { id, name, age, avatar_url },
│   expires_in: 86400
├─ Error: { success: false, message: "Invalid PIN" }
└─ Status: 401 if PIN wrong
```

### Device Session Auto-Login
```
POST /auth/device-login
├─ Purpose: Auto-login from device session
├─ Body: {
│   device_id: "device123"
├─ Returns: {
│   success: true,
│   token: "eyJhbGc...",
│   student: { id, name },
│   session_expires_at: "2026-03-02T18:30:00Z"
├─ Error: { success: false, message: "No active session" }
└─ Status: 401 if session expired
```

### Register Device Session
```
POST /auth/register-device
├─ Purpose: Parent registers device for auto-login
├─ Body: {
│   parent_id: "660e8400...",
│   device_id: "device123",
│   student_id: "550e8400...",
│   device_name: "Vintage's iPad",
│   enable_auto_login: true
├─ Returns: {
│   success: true,
│   device: { id, name, student_name },
│   session_token: "eyJhbGc...",
│   expires_in: 28800
└─ Status: 201 created
```

### Get Auth Status
```
GET /auth/status
├─ Purpose: Check if user is authenticated
├─ Headers: Authorization: Bearer {token}
├─ Returns: {
│   authenticated: true,
│   user_id: "550e8400...",
│   user_type: "student" or "parent",
│   student_name: "Vintage",
│   expires_at: "2026-03-02T18:30:00Z"
└─ Status: 401 if not authenticated
```

### Logout
```
POST /auth/logout
├─ Purpose: Logout and invalidate session
├─ Headers: Authorization: Bearer {token}
├─ Body: { device_id: "device123" (optional) }
├─ Returns: { success: true }
└─ Status: 200 ok
```

### Change PIN
```
POST /auth/change-pin
├─ Purpose: Parent changes student's PIN
├─ Headers: Authorization: Bearer {parent_token}
├─ Body: {
│   student_id: "550e8400...",
│   new_pin: "5678"
├─ Returns: {
│   success: true,
│   message: "PIN changed successfully"
└─ Status: 200 ok
```

---

## Database Schema Changes

See: `auth_schema_additions.sql`

New tables:
- `student_pins` - Stores PIN codes for students
- `device_sessions` - Stores device-bound sessions
- `auth_logs` - Tracks all authentication attempts

Modified tables:
- `users` - May remove password_hash (use student_pins instead)
- `teachers_parents` - Keep email + password (Supabase Auth)

---

## Security Architecture

### JWT Token Contents
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",  // User ID
  "user_type": "student",                          // student or parent
  "email": "student@penpath.local",                // Optional for students
  "name": "Vintage",
  "device_id": "device123",                        // If device-bound
  "iat": 1741959661,                               // Issued at
  "exp": 1742046061                                // Expires at (24 hours)
}
```

### RLS Policy Integration
```
When student makes request with JWT:
├─ RLS sees: auth.uid() = "550e8400..."
├─ Checks: "Is this row owned by this student?"
├─ YES → Return data ✅
├─ NO → Block query ❌

When parent makes request with JWT:
├─ RLS sees: auth.uid() = "660e8400..."
├─ Checks: "Is this user their student?"
├─ Query user_teacher_relations table
├─ YES → Return data ✅
├─ NO → Block query ❌
```

### PIN Security
```
STORAGE:
├─ PIN hashed before storing (bcrypt or similar)
├─ Never stored in plain text
├─ Only parent can set/change PIN

VERIFICATION:
├─ Frontend sends PIN to backend
├─ Backend hashes received PIN
├─ Compare with stored hash
├─ Never transmit PIN in plain text (use HTTPS)

BRUTE FORCE PROTECTION:
├─ After 3 failed attempts: Lock for 15 minutes
├─ Log all failed attempts
├─ Parent notified of login failures
├─ Parent can see auth_logs dashboard
```

### Device Session Security
```
SESSION LIFETIME:
├─ Classroom device: 8 hours
├─ Home iPad: 24 hours
├─ Configurable by parent

AUTO-LOGOUT:
├─ Timeout after inactivity
├─ User action resets timer
├─ Always can logout manually

REVOCATION:
├─ Parent can revoke device session anytime
├─ Removes device_sessions entry
├─ Requires PIN login again
├─ All devices tracked in auth_logs
```

---

## Implementation Steps

### Step 1: Database Setup
```bash
# 1. Review auth_schema_additions.sql
# 2. Copy to Supabase SQL Editor
# 3. Run each migration:
#    - student_pins table
#    - device_sessions table
#    - auth_logs table
# 4. Create indexes for performance
```

### Step 2: Supabase Auth Configuration
```bash
# 1. Go to Supabase Dashboard
# 2. Settings → Authentication
# 3. Enable: Email / Password
# 4. Configure email templates
# 5. Set password requirements
# 6. Enable JWT refresh tokens
# See: SUPABASE_AUTH_CONFIG.md
```

### Step 3: Backend API Endpoints
```bash
# 1. Create: backend/auth/pin-auth.js
#    - POST /auth/verify-pin
#    - POST /auth/change-pin
# 2. Create: backend/auth/device-session.js
#    - POST /auth/device-login
#    - POST /auth/register-device
# 3. Create: backend/auth/parent-auth.js
#    - Wrap Supabase Auth methods
# 4. Create: backend/auth/middleware.js
#    - Verify JWT token
#    - Check auth.uid()
```

### Step 4: Frontend Integration
```bash
# 1. Login screens:
#    - Student PIN entry (big buttons)
#    - Parent email/password (standard)
#    - Device selector (if multiple devices)
# 2. Store JWT securely:
#    - localStorage (web)
#    - AsyncStorage (React Native)
# 3. Include JWT in all requests:
#    - Authorization: Bearer {token}
# 4. Handle token expiry:
#    - Refresh token before expiry
#    - Logout on expiry
```

### Step 5: Testing
```bash
# 1. Test student PIN login
# 2. Test parent email/password login
# 3. Test device-bound auto-login
# 4. Test PIN change by parent
# 5. Test device revocation
# 6. Test brute force protection
# 7. Test RLS with JWT
# 8. Test multiple devices
# 9. Test session timeout
# 10. Test logout
```

---

## Best Practices

### DO ✅
- ✅ Store PIN hashed (never plain text)
- ✅ Use HTTPS for all requests
- ✅ Verify JWT on backend
- ✅ Implement brute force protection
- ✅ Log all authentication attempts
- ✅ Session timeout on tablets
- ✅ Parent control PIN changes
- ✅ Device tracking for oversight
- ✅ Clear logout button
- ✅ Test RLS with JWT integration

### DON'T ❌
- ❌ Store PIN in plain text
- ❌ Transmit PIN over HTTP
- ❌ Allow unlimited login attempts
- ❌ Store JWT in localStorage (web) without HTTPS
- ❌ Accept PIN via URL parameter
- ❌ Allow student to change their own PIN
- ❌ Forget to logout after timeout
- ❌ Use same PIN for multiple students
- ❌ Expose service role key in auth code
- ❌ Skip JWT verification on backend

---

## Migration from Current Schema

### Current State
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,       ← Not ideal for kids
  password_hash VARCHAR(255),      ← Kids can't remember
  ...
);
```

### New State
```sql
-- users table: Simpler for kids
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255),              ← Optional (can be null for kids)
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  age INT,
  parent_id UUID REFERENCES teachers_parents(id),
  created_at TIMESTAMP,
  -- NO password_hash (use student_pins instead)
);

-- New table for PINs
CREATE TABLE student_pins (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES users(id),
  pin_hash VARCHAR(255),           ← Hashed PIN
  created_at TIMESTAMP,
  last_changed TIMESTAMP,
  created_by_parent_id UUID REFERENCES teachers_parents(id),
  UNIQUE(student_id)
);
```

### Migration Steps
```bash
# 1. Create new tables (student_pins, device_sessions, auth_logs)
# 2. Data migration (if existing users):
#    - For each user with email: Keep email
#    - For each user without email: Create email like "student_550e8400@penpath.local"
#    - Generate random PIN for existing users
#    - Notify parent of their student's PIN
# 3. Update RLS policies to work with new auth
# 4. Test thoroughly before deploying
```

---

## Examples

### Example 1: Parent Creates Account

```javascript
// Frontend (React)
async function createParentAccount(email, password, name) {
  // Step 1: Create auth account via Supabase
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password
  });

  if (error) return { error: error.message };

  // Step 2: Create profile in teachers_parents table
  const { data: profile, error: profileError } = await supabase
    .from('teachers_parents')
    .insert({
      id: data.user.id,
      email: email,
      first_name: name.split(' ')[0],
      last_name: name.split(' ')[1] || '',
      role: 'parent',
      is_active: true
    });

  return { success: true, user_id: data.user.id };
}
```

### Example 2: Parent Adds Student with PIN

```javascript
// Backend (Node.js)
async function createStudentWithPin(parentId, studentName, studentAge, pinCode) {
  // Step 1: Hash the PIN
  const pinHash = await bcrypt.hash(pinCode, 10);

  // Step 2: Create user account
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      first_name: studentName,
      last_name: '',
      age: studentAge,
      is_active: true
    })
    .select();

  if (userError) return { error: userError.message };

  // Step 3: Create PIN entry
  const { data: pin, error: pinError } = await supabase
    .from('student_pins')
    .insert({
      student_id: user[0].id,
      pin_hash: pinHash,
      created_by_parent_id: parentId
    });

  if (pinError) return { error: pinError.message };

  return {
    success: true,
    student_id: user[0].id,
    message: `${studentName} added! PIN: ${pinCode}`
  };
}
```

### Example 3: Student Logs In with PIN

```javascript
// Backend (Node.js) - Endpoint
app.post('/auth/verify-pin', async (req, res) => {
  const { student_id, pin_code, device_id } = req.body;

  // Step 1: Get stored PIN hash
  const { data: pinRecord, error: pinError } = await supabase
    .from('student_pins')
    .select('pin_hash')
    .eq('student_id', student_id)
    .single();

  if (pinError || !pinRecord) {
    return res.status(401).json({ error: 'Student not found' });
  }

  // Step 2: Compare PIN
  const pinValid = await bcrypt.compare(pin_code, pinRecord.pin_hash);

  if (!pinValid) {
    // Log failed attempt
    await supabase.from('auth_logs').insert({
      student_id: student_id,
      auth_method: 'pin',
      device_id: device_id,
      success: false
    });

    return res.status(401).json({ error: 'Invalid PIN' });
  }

  // Step 3: Create JWT token
  const token = jwt.sign(
    {
      sub: student_id,
      user_type: 'student',
      device_id: device_id
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Step 4: Log successful attempt
  await supabase.from('auth_logs').insert({
    student_id: student_id,
    auth_method: 'pin',
    device_id: device_id,
    success: true
  });

  // Step 5: If device-bound, create session
  if (device_id) {
    await supabase.from('device_sessions').insert({
      device_id: device_id,
      student_id: student_id,
      session_token: token,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
  }

  return res.json({
    success: true,
    token: token,
    expires_in: 86400
  });
});
```

### Example 4: Device Auto-Login

```javascript
// Frontend (React Native) - Auto-login on app startup
async function autoLoginFromDevice() {
  // Step 1: Get device ID from storage
  const deviceId = await AsyncStorage.getItem('device_id');

  if (!deviceId) {
    // No device registered, show login
    return { autoLogin: false };
  }

  // Step 2: Call backend to auto-login
  try {
    const response = await fetch('https://api.penpath.com/auth/device-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: deviceId })
    });

    const data = await response.json();

    if (response.ok) {
      // Step 3: Store token
      await AsyncStorage.setItem('auth_token', data.token);

      // Step 4: Restore app state
      return {
        autoLogin: true,
        token: data.token,
        studentName: data.student.name
      };
    } else {
      // Session expired, require PIN login
      return { autoLogin: false };
    }
  } catch (error) {
    console.error('Auto-login failed:', error);
    return { autoLogin: false };
  }
}
```

---

## Troubleshooting

### Issue: "Invalid PIN" even with correct PIN
**Solution:**
- Check PIN was hashed before storage
- Verify bcrypt compare works correctly
- Check pin_code format (string, trimmed)
- Verify student_id exists in student_pins table

### Issue: Device-bound login not working
**Solution:**
- Check device_sessions table has valid entry
- Verify session not expired
- Check device_id matches
- Verify JWT token is valid

### Issue: Parent can't login
**Solution:**
- Verify email in teachers_parents table
- Check Supabase Auth has email/password enabled
- Verify password hashing works
- Check Supabase Auth email verification completed

### Issue: RLS blocking after login
**Solution:**
- Verify JWT contains correct sub (user ID)
- Check RLS policies use auth.uid() correctly
- Verify users table has same ID as teachers_parents
- Test RLS with direct JWT token

---

## Rollout Plan

### Phase 1: Backend Setup (Week 1)
- [ ] Create database tables
- [ ] Configure Supabase Auth
- [ ] Build API endpoints
- [ ] Write comprehensive tests

### Phase 2: Frontend Integration (Week 2)
- [ ] Build PIN entry screen
- [ ] Build parent login screen
- [ ] Integrate JWT storage
- [ ] Test with real devices

### Phase 3: Testing (Week 3)
- [ ] Test all login flows
- [ ] Test RLS integration
- [ ] Test device sessions
- [ ] Load testing (multiple concurrent logins)

### Phase 4: Deployment (Week 4)
- [ ] Deploy to staging
- [ ] Final QA testing
- [ ] Deploy to production
- [ ] Monitor auth_logs for issues

---

## Next Steps

1. **Review** this strategy document
2. **Approve** the 3-tier model
3. **Create** database tables (auth_schema_additions.sql)
4. **Configure** Supabase Auth (SUPABASE_AUTH_CONFIG.md)
5. **Build** API endpoints (pin-auth.js, device-session.js)
6. **Test** thoroughly
7. **Commit** to GitHub
8. **Deploy** to staging
9. **Monitor** auth_logs
10. **Go live!** ✨
