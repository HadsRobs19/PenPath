// ============================================
// Student PIN Authentication
// Students log in with a username and a PIN.
// No parent or teacher accounts are used here.
// ============================================

const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ============================================
// POST /auth/login
// ============================================
// Authenticate a student with username + PIN.
//
// Request body:
// {
//   username: "vintage42",   // alphanumeric, 3-20 chars
//   pin: "1234"              // 4-6 digit string
// }
//
// Response 200:
// {
//   success: true,
//   token: "eyJhbGc...",
//   student: { id, username, first_name },
//   expires_in: 86400
// }
//
// Response 401:
// {
//   error: "Invalid username or PIN",
//   attempts_remaining: 2
// }
// ============================================

async function studentLogin(req, res) {
  try {
    const { username, pin } = req.body;

    // ---- Input validation ----
    if (!username || !pin) {
      return res.status(400).json({
        error: 'username and pin are required'
      });
    }

    // Username: letters and numbers only, 3-20 characters
    if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
      return res.status(400).json({
        error: 'Username must be 3-20 alphanumeric characters'
      });
    }

    if (typeof pin !== 'string' || pin.length < 4 || pin.length > 6) {
      return res.status(400).json({
        error: 'PIN must be 4-6 digits'
      });
    }

    // ---- Look up student by username ----
    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('id, username, first_name, last_name, is_active')
      .eq('username', username.toLowerCase())
      .single();

    if (studentError || !student) {
      await logAttempt({ username, success: false, reason: 'Username not found', ip: req.ip });
      return res.status(401).json({ error: 'Invalid username or PIN' });
    }

    if (!student.is_active) {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // ---- Fetch PIN record ----
    const { data: pinRecord, error: pinError } = await supabase
      .from('student_pins')
      .select('pin_hash, failed_attempts, locked_until')
      .eq('student_id', student.id)
      .single();

    if (pinError || !pinRecord) {
      return res.status(401).json({ error: 'Invalid username or PIN' });
    }

    // ---- Check if account is locked ----
    if (pinRecord.locked_until && new Date() < new Date(pinRecord.locked_until)) {
      const minutesLeft = Math.ceil(
        (new Date(pinRecord.locked_until) - new Date()) / 60000
      );
      return res.status(401).json({
        error: `Account locked. Try again in ${minutesLeft} minute(s).`,
        locked_until: pinRecord.locked_until
      });
    }

    // ---- Verify PIN ----
    const pinValid = await bcrypt.compare(pin.trim(), pinRecord.pin_hash);

    if (!pinValid) {
      const failCount = (pinRecord.failed_attempts || 0) + 1;
      const remaining = Math.max(0, 3 - failCount);
      const lockedUntil = failCount >= 3
        ? new Date(Date.now() + 15 * 60 * 1000)
        : null;

      await supabase
        .from('student_pins')
        .update({
          failed_attempts: failCount,
          last_failed_attempt: new Date(),
          locked_until: lockedUntil
        })
        .eq('student_id', student.id);

      await logAttempt({ username, student_id: student.id, success: false, reason: 'Wrong PIN', ip: req.ip });

      return res.status(401).json({
        error: 'Invalid username or PIN',
        attempts_remaining: remaining,
        ...(remaining === 0 && { message: 'Account locked for 15 minutes' })
      });
    }

    // ---- Reset failed attempts on success ----
    await supabase
      .from('student_pins')
      .update({ failed_attempts: 0, locked_until: null })
      .eq('student_id', student.id);

    // ---- Issue JWT ----
    const token = jwt.sign(
      {
        sub:       student.id,
        username:  student.username,
        user_type: 'student',
        aud:       'penpath-app'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h', algorithm: 'HS256' }
    );

    // ---- Update last login ----
    await supabase
      .from('users')
      .update({ last_login: new Date() })
      .eq('id', student.id);

    await logAttempt({ username, student_id: student.id, success: true, ip: req.ip });

    return res.status(200).json({
      success:    true,
      token:      token,
      student: {
        id:         student.id,
        username:   student.username,
        first_name: student.first_name
      },
      expires_in: 86400
    });

  } catch (err) {
    console.error('studentLogin error:', err);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
}

// ============================================
// Internal helper: log auth attempts
// ============================================

async function logAttempt({ username, student_id, success, reason, ip }) {
  try {
    await supabase.from('auth_logs').insert({
      student_id:     student_id || null,
      username_tried: username,
      auth_method:    'pin',
      success:        success,
      failure_reason: reason || null,
      ip_address:     ip,
      created_at:     new Date()
    });
  } catch (e) {
    console.error('logAttempt error:', e);
  }
}

module.exports = { studentLogin };
