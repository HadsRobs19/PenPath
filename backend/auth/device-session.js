// ============================================
// Device-Bound Authentication Sessions
// MS6-6: Auto-login for registered devices
// ============================================
//
// WHO: Students on registered devices (iPad, Raspberry Pi)
// WHAT: Device recognition and session management
// WHERE: Backend API endpoints
// WHEN: App startup for registered devices
// WHY: Zero-friction login for family tablets

const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ============================================
// POST /auth/device-login
// ============================================
// Auto-login from existing device session
// No PIN needed - device is recognized!
//
// Request body:
// {
//   device_id: "device123"
// }
//
// Response on success (200):
// {
//   success: true,
//   token: "eyJhbGc...",
//   student: { id, first_name, avatar_url },
//   session_expires_at: "2026-03-02T18:30:00Z"
// }
//
// Response on failure (401):
// {
//   success: false,
//   error: "No active session for this device",
//   reason: "session_not_found" or "session_expired"
// }

async function deviceLogin(req, res) {
  try {
    const { device_id } = req.body;

    // ============================================
    // INPUT VALIDATION
    // ============================================
    if (!device_id) {
      return res.status(400).json({
        error: 'Missing required field: device_id'
      });
    }

    // ============================================
    // FIND ACTIVE DEVICE SESSION
    // ============================================
    const now = new Date();
    const { data: session, error: sessionError } = await supabase
      .from('device_sessions')
      .select('*, users(first_name, last_name, avatar_url)')
      .eq('device_id', device_id)
      .eq('is_active', true)
      .gt('expires_at', now.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (sessionError || !session) {
      // Log failed device login attempt
      await logDeviceLoginAttempt({
        device_id: device_id,
        success: false,
        failure_reason: 'No active session',
        ip_address: req.ip
      });

      return res.status(401).json({
        success: false,
        error: 'No active session for this device',
        reason: 'session_not_found or expired'
      });
    }

    // ============================================
    // SESSION FOUND - CHECK EXPIRY
    // ============================================
    const expiresAt = new Date(session.expires_at);
    const timeRemaining = expiresAt - now;

    // If less than 1 minute remaining, request renewal
    if (timeRemaining < 60000) {
      return res.status(401).json({
        success: false,
        error: 'Session expired',
        reason: 'session_expired',
        message: 'Please login again'
      });
    }

    // ============================================
    // VALIDATE STORED SESSION TOKEN
    // ============================================
    // Verify the JWT in the session is still valid
    try {
      const decoded = jwt.verify(
        session.session_token,
        process.env.JWT_SECRET || 'your-secret-key'
      );

      // Ensure token matches device
      if (decoded.device_id !== device_id) {
        throw new Error('Device mismatch in token');
      }
    } catch (jwtError) {
      // Token invalid or expired
      await logDeviceLoginAttempt({
        device_id: device_id,
        success: false,
        failure_reason: 'Invalid or expired token',
        ip_address: req.ip
      });

      return res.status(401).json({
        success: false,
        error: 'Session invalid',
        reason: 'token_invalid'
      });
    }

    // ============================================
    // UPDATE LAST ACTIVITY
    // ============================================
    // Track that this device was used now
    await supabase
      .from('device_sessions')
      .update({
        last_activity: now
      })
      .eq('id', session.id);

    // ============================================
    // CREATE NEW JWT TOKEN
    // ============================================
    // Issue fresh token (extends session)
    const newToken = jwt.sign(
      {
        sub: session.student_id,
        user_type: 'student',
        student_name: session.users.first_name,
        device_id: device_id,
        session_id: session.id,
        iat: Math.floor(Date.now() / 1000),
        aud: 'penpath-app'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h', algorithm: 'HS256' }
    );

    // ============================================
    // UPDATE SESSION TOKEN
    // ============================================
    // Store new token in device_sessions
    const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await supabase
      .from('device_sessions')
      .update({
        session_token: newToken,
        expires_at: newExpiresAt
      })
      .eq('id', session.id);

    // ============================================
    // LOG SUCCESSFUL LOGIN
    // ============================================
    await logDeviceLoginAttempt({
      device_id: device_id,
      student_id: session.student_id,
      success: true,
      ip_address: req.ip
    });

    // ============================================
    // RESPONSE
    // ============================================
    return res.status(200).json({
      success: true,
      token: newToken,
      student: {
        id: session.student_id,
        first_name: session.users.first_name,
        last_name: session.users.last_name,
        avatar_url: session.users.avatar_url
      },
      session_expires_at: newExpiresAt,
      message: `Welcome ${session.users.first_name}! 🎉`
    });

  } catch (error) {
    console.error('Device login error:', error);
    return res.status(500).json({
      error: 'An error occurred during device authentication'
    });
  }
}

// ============================================
// POST /auth/register-device
// ============================================
// Parent registers device for auto-login
// Creates device session that allows zero-friction login
//
// Request body:
// {
//   parent_id: "660e8400-e29b-41d4-a716-446655440001",
//   device_id: "device123",
//   student_id: "550e8400-e29b-41d4-a716-446655440000",
//   device_name: "Vintage's iPad",
//   device_type: "tablet",
//   os_name: "iOS",
//   enable_auto_login: true
// }
//
// Response on success (201):
// {
//   success: true,
//   device: { id, name, student_name },
//   session_token: "eyJhbGc...",
//   auto_logout_after: 480,
//   message: "Device registered successfully"
// }

async function registerDevice(req, res) {
  try {
    const {
      parent_id,
      device_id,
      student_id,
      device_name,
      device_type,
      os_name,
      enable_auto_login
    } = req.body;

    // ============================================
    // VALIDATION
    // ============================================
    const requiredFields = ['parent_id', 'device_id', 'student_id'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          error: `Missing required field: ${field}`
        });
      }
    }

    // ============================================
    // VERIFY PARENT OWNS STUDENT
    // ============================================
    const { data: relation, error: relationError } = await supabase
      .from('user_teacher_relations')
      .select('id')
      .eq('teacher_parent_id', parent_id)
      .eq('student_id', student_id)
      .single();

    if (relationError || !relation) {
      return res.status(403).json({
        error: 'Parent does not have access to this student'
      });
    }

    // ============================================
    // GET STUDENT INFO
    // ============================================
    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('id', student_id)
      .single();

    if (studentError || !student) {
      return res.status(404).json({
        error: 'Student not found'
      });
    }

    // ============================================
    // REVOKE EXISTING SESSION (if any)
    // ============================================
    // Only one active session per device per student
    await supabase
      .from('device_sessions')
      .update({
        is_active: false,
        revoked_at: new Date(),
        revocation_reason: 'Replaced by new registration'
      })
      .match({
        device_id: device_id,
        student_id: student_id,
        is_active: true
      });

    // ============================================
    // CREATE JWT TOKEN
    // ============================================
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const sessionToken = jwt.sign(
      {
        sub: student_id,
        user_type: 'student',
        student_name: student.first_name,
        device_id: device_id,
        iat: Math.floor(Date.now() / 1000),
        aud: 'penpath-app'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h', algorithm: 'HS256' }
    );

    // ============================================
    // CREATE DEVICE SESSION
    // ============================================
    const { data: newSession, error: createError } = await supabase
      .from('device_sessions')
      .insert({
        device_id: device_id,
        student_id: student_id,
        session_token: sessionToken,
        expires_at: expiresAt,
        is_active: true,
        created_at: new Date(),
        created_by_parent_id: parent_id,
        device_name: device_name || 'Unknown Device',
        device_type: device_type || 'unknown',
        os_name: os_name || 'unknown',
        auto_logout_after_inactivity_minutes: enable_auto_login ? 480 : 60
      })
      .select();

    if (createError) {
      console.error('Device registration error:', createError);
      return res.status(500).json({
        error: 'Failed to register device'
      });
    }

    // ============================================
    // LOG DEVICE REGISTRATION
    // ============================================
    await supabase
      .from('auth_logs')
      .insert({
        student_id: student_id,
        parent_id: parent_id,
        auth_method: 'device_registration',
        device_id: device_id,
        success: true,
        created_at: new Date()
      });

    // ============================================
    // RESPONSE
    // ============================================
    return res.status(201).json({
      success: true,
      device: {
        id: newSession[0].id,
        name: device_name || 'Registered Device',
        student_name: student.first_name,
        device_type: device_type,
        os_name: os_name
      },
      session_token: sessionToken,
      session_expires_at: expiresAt,
      auto_logout_after: enable_auto_login ? 480 : 60, // minutes
      message: `Device "${device_name}" registered for ${student.first_name} 🎉`
    });

  } catch (error) {
    console.error('Register device error:', error);
    return res.status(500).json({
      error: 'An error occurred while registering device'
    });
  }
}

// ============================================
// POST /auth/revoke-device-session
// ============================================
// Parent revokes device access
// Prevents auto-login, requires PIN again
//
// Request body:
// {
//   parent_id: "660e8400-e29b-41d4-a716-446655440001",
//   session_id: "session123",
//   reason: "Device lost" (optional)
// }

async function revokeDeviceSession(req, res) {
  try {
    const { parent_id, session_id, reason } = req.body;

    if (!parent_id || !session_id) {
      return res.status(400).json({
        error: 'Missing required fields: parent_id, session_id'
      });
    }

    // ============================================
    // VERIFY SESSION BELONGS TO PARENT
    // ============================================
    const { data: session, error: sessionError } = await supabase
      .from('device_sessions')
      .select('id, student_id')
      .eq('id', session_id)
      .eq('created_by_parent_id', parent_id)
      .single();

    if (sessionError || !session) {
      return res.status(403).json({
        error: 'Parent does not have access to this session'
      });
    }

    // ============================================
    // REVOKE SESSION
    // ============================================
    const { error: updateError } = await supabase
      .from('device_sessions')
      .update({
        is_active: false,
        revoked_at: new Date(),
        revoked_by_parent_id: parent_id,
        revocation_reason: reason || 'Revoked by parent'
      })
      .eq('id', session_id);

    if (updateError) {
      console.error('Revoke error:', updateError);
      return res.status(500).json({
        error: 'Failed to revoke device session'
      });
    }

    // ============================================
    // LOG REVOCATION
    // ============================================
    await supabase
      .from('auth_logs')
      .insert({
        student_id: session.student_id,
        parent_id: parent_id,
        auth_method: 'device_revocation',
        success: true,
        failure_reason: reason || 'Session revoked',
        created_at: new Date()
      });

    return res.status(200).json({
      success: true,
      message: 'Device session revoked. Device requires PIN login again.'
    });

  } catch (error) {
    console.error('Revoke device session error:', error);
    return res.status(500).json({
      error: 'An error occurred'
    });
  }
}

// ============================================
// GET /auth/device-sessions/:student_id
// ============================================
// List all registered devices for a student (parent view)

async function getDeviceSessions(req, res) {
  try {
    const { student_id } = req.params;
    const { parent_id } = req.query;

    if (!parent_id) {
      return res.status(400).json({
        error: 'Missing parent_id query parameter'
      });
    }

    // ============================================
    // VERIFY ACCESS
    // ============================================
    const { data: relation, error: relationError } = await supabase
      .from('user_teacher_relations')
      .select('id')
      .eq('teacher_parent_id', parent_id)
      .eq('student_id', student_id)
      .single();

    if (relationError || !relation) {
      return res.status(403).json({
        error: 'Parent does not have access to this student'
      });
    }

    // ============================================
    // GET DEVICE SESSIONS
    // ============================================
    const { data: sessions, error: sessionsError } = await supabase
      .from('device_sessions')
      .select('id, device_id, device_name, device_type, os_name, is_active, created_at, expires_at, last_activity')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false });

    if (sessionsError) {
      console.error('Get sessions error:', sessionsError);
      return res.status(500).json({
        error: 'Failed to retrieve device sessions'
      });
    }

    // ============================================
    // RESPONSE
    // ============================================
    return res.status(200).json({
      success: true,
      sessions: sessions,
      total: sessions.length,
      active_count: sessions.filter(s => s.is_active).length
    });

  } catch (error) {
    console.error('Get device sessions error:', error);
    return res.status(500).json({
      error: 'An error occurred'
    });
  }
}

// ============================================
// HELPER: Log Device Login Attempt
// ============================================

async function logDeviceLoginAttempt({
  device_id,
  student_id,
  success,
  failure_reason,
  ip_address
}) {
  try {
    await supabase
      .from('auth_logs')
      .insert({
        student_id: student_id,
        auth_method: 'device_bound',
        device_id: device_id,
        success: success,
        failure_reason: failure_reason,
        ip_address: ip_address,
        created_at: new Date()
      });
  } catch (error) {
    console.error('Error logging device login attempt:', error);
  }
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  deviceLogin,
  registerDevice,
  revokeDeviceSession,
  getDeviceSessions
};

// ============================================
// USAGE IN EXPRESS APP
// ============================================
//
// const deviceSession = require('./auth/device-session.js');
//
// app.post('/auth/device-login', deviceSession.deviceLogin);
// app.post('/auth/register-device', deviceSession.registerDevice);
// app.post('/auth/revoke-device-session', deviceSession.revokeDeviceSession);
// app.get('/auth/device-sessions/:student_id', deviceSession.getDeviceSessions);
