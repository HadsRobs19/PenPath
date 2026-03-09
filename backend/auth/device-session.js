// ============================================
// Device Session Authentication
// Allows a student to resume a session on a
// recognised device without re-entering a PIN.
// No parent or teacher involvement.
// ============================================

const jwt      = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ============================================
// POST /auth/device-login
// ============================================
// Auto-resume a student session from a saved device.
//
// Request body:
// {
//   device_id: "device123"
// }
//
// Response 200:
// {
//   success: true,
//   token: "eyJhbGc...",
//   student: { id, username, first_name },
//   session_expires_at: "..."
// }
// ============================================

async function deviceLogin(req, res) {
  try {
    const { device_id } = req.body;

    if (!device_id) {
      return res.status(400).json({ error: 'device_id is required' });
    }

    // ---- Find active session ----
    const { data: session, error: sessionError } = await supabase
      .from('device_sessions')
      .select('*, users(username, first_name, last_name)')
      .eq('device_id', device_id)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (sessionError || !session) {
      await logDeviceAttempt({ device_id, success: false, reason: 'No active session', ip: req.ip });
      return res.status(401).json({
        success: false,
        error:   'No active session for this device'
      });
    }

    // ---- Validate stored token ----
    try {
      const decoded = jwt.verify(session.session_token, process.env.JWT_SECRET);
      if (decoded.device_id !== device_id) {
        throw new Error('Device mismatch');
      }
    } catch {
      await logDeviceAttempt({ device_id, success: false, reason: 'Token invalid', ip: req.ip });
      return res.status(401).json({ success: false, error: 'Session invalid' });
    }

    // ---- Issue fresh token ----
    const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newToken = jwt.sign(
      {
        sub:       session.student_id,
        username:  session.users.username,
        user_type: 'student',
        device_id: device_id,
        aud:       'penpath-app'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h', algorithm: 'HS256' }
    );

    await supabase
      .from('device_sessions')
      .update({ session_token: newToken, expires_at: newExpiresAt, last_activity: new Date() })
      .eq('id', session.id);

    await logDeviceAttempt({ device_id, student_id: session.student_id, success: true, ip: req.ip });

    return res.status(200).json({
      success: true,
      token: newToken,
      student: {
        id:         session.student_id,
        username:   session.users.username,
        first_name: session.users.first_name
      },
      session_expires_at: newExpiresAt
    });

  } catch (err) {
    console.error('deviceLogin error:', err);
    return res.status(500).json({ error: 'An error occurred during device authentication' });
  }
}

// ============================================
// Internal helper
// ============================================

async function logDeviceAttempt({ device_id, student_id, success, reason, ip }) {
  try {
    await supabase.from('auth_logs').insert({
      student_id:     student_id || null,
      auth_method:    'device_bound',
      device_id:      device_id,
      success:        success,
      failure_reason: reason || null,
      ip_address:     ip,
      created_at:     new Date()
    });
  } catch (e) {
    console.error('logDeviceAttempt error:', e);
  }
}

module.exports = { deviceLogin };
