// ============================================
// PIN-Based Student Authentication
// MS6-6: Student login with PIN codes
// ============================================
//
// WHO: Students (kids)
// WHAT: PIN verification and JWT token generation
// WHERE: Backend API endpoints
// WHEN: During student login
// WHY: Kids can't manage email/password, PIN is simple

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase (service role - bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ============================================
// POST /auth/verify-pin
// ============================================
// Verify student's PIN and issue JWT token
//
// Request body:
// {
//   student_id: "550e8400-e29b-41d4-a716-446655440000",
//   pin_code: "1234",
//   device_id: "device123" (optional)
// }
//
// Response on success (200):
// {
//   success: true,
//   token: "eyJhbGc...",
//   student: { id, first_name, avatar_url },
//   expires_in: 86400,
//   message: "Welcome Vintage!"
// }
//
// Response on failure (401):
// {
//   success: false,
//   error: "Invalid PIN",
//   attempts_remaining: 2
// }

async function verifyPin(req, res) {
  try {
    const { student_id, pin_code, device_id } = req.body;

    // ============================================
    // INPUT VALIDATION
    // ============================================
    if (!student_id || !pin_code) {
      return res.status(400).json({
        error: 'Missing required fields: student_id, pin_code'
      });
    }

    if (typeof pin_code !== 'string') {
      return res.status(400).json({
        error: 'PIN must be a string'
      });
    }

    // Trim whitespace
    const trimmedPin = pin_code.trim();

    if (trimmedPin.length < 4 || trimmedPin.length > 6) {
      return res.status(400).json({
        error: 'PIN must be 4-6 digits'
      });
    }

    // ============================================
    // CHECK IF ACCOUNT LOCKED
    // ============================================
    // After 3 failed attempts, lock for 15 minutes
    const { data: pinRecord, error: pinError } = await supabase
      .from('student_pins')
      .select('id, pin_hash, failed_attempts, locked_until')
      .eq('student_id', student_id)
      .single();

    if (pinError || !pinRecord) {
      console.error('PIN lookup error:', pinError);

      // Log failed attempt
      await logAuthAttempt({
        student_id: student_id,
        auth_method: 'pin',
        device_id: device_id,
        success: false,
        failure_reason: 'Student not found',
        ip_address: req.ip
      });

      return res.status(401).json({
        error: 'Student not found or PIN not set'
      });
    }

    // Check if account locked
    if (pinRecord.locked_until) {
      const lockExpiresAt = new Date(pinRecord.locked_until);
      const now = new Date();

      if (now < lockExpiresAt) {
        const minutesRemaining = Math.ceil(
          (lockExpiresAt - now) / (1000 * 60)
        );

        // Log locked account attempt
        await logAuthAttempt({
          student_id: student_id,
          auth_method: 'pin',
          device_id: device_id,
          success: false,
          failure_reason: `Account locked (${minutesRemaining} minutes remaining)`,
          ip_address: req.ip
        });

        return res.status(401).json({
          error: `Account locked. Try again in ${minutesRemaining} minutes.`,
          locked_until: lockExpiresAt
        });
      }
    }

    // ============================================
    // VERIFY PIN
    // ============================================
    // Compare provided PIN with stored hash
    const pinValid = await bcrypt.compare(trimmedPin, pinRecord.pin_hash);

    if (!pinValid) {
      // Increment failed attempts
      const newFailedAttempts = (pinRecord.failed_attempts || 0) + 1;
      const attemptsRemaining = Math.max(0, 3 - newFailedAttempts);

      // Lock account after 3 failed attempts
      let lockUntil = null;
      if (newFailedAttempts >= 3) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minute lock
      }

      // Update failed attempts
      await supabase
        .from('student_pins')
        .update({
          failed_attempts: newFailedAttempts,
          last_failed_attempt: new Date(),
          locked_until: lockUntil
        })
        .eq('student_id', student_id);

      // Log failed attempt
      await logAuthAttempt({
        student_id: student_id,
        auth_method: 'pin',
        device_id: device_id,
        success: false,
        failure_reason: 'Invalid PIN',
        attempt_number: newFailedAttempts,
        ip_address: req.ip
      });

      return res.status(401).json({
        error: 'Invalid PIN',
        attempts_remaining: attemptsRemaining,
        message: attemptsRemaining === 0
          ? 'Too many attempts. Account locked for 15 minutes.'
          : `${attemptsRemaining} attempt(s) remaining`
      });
    }

    // ============================================
    // PIN VERIFIED - GET STUDENT INFO
    // ============================================
    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('id, first_name, last_name, age, avatar_url')
      .eq('id', student_id)
      .single();

    if (studentError || !student) {
      console.error('Student lookup error:', studentError);
      return res.status(500).json({
        error: 'Failed to retrieve student information'
      });
    }

    // ============================================
    // RESET FAILED ATTEMPTS (on success)
    // ============================================
    await supabase
      .from('student_pins')
      .update({
        failed_attempts: 0,
        locked_until: null
      })
      .eq('student_id', student_id);

    // ============================================
    // CREATE JWT TOKEN
    // ============================================
    const token = jwt.sign(
      {
        sub: student_id, // Subject (user ID)
        user_type: 'student',
        student_name: student.first_name,
        device_id: device_id || null,
        iat: Math.floor(Date.now() / 1000), // Issued at
        aud: 'penpath-app' // Audience
      },
      process.env.JWT_SECRET || 'your-secret-key', // Use env variable!
      {
        expiresIn: '24h', // Expires in 24 hours
        algorithm: 'HS256'
      }
    );

    // ============================================
    // LOG SUCCESSFUL LOGIN
    // ============================================
    await logAuthAttempt({
      student_id: student_id,
      auth_method: 'pin',
      device_id: device_id,
      success: true,
      ip_address: req.ip
    });

    // ============================================
    // UPDATE LAST LOGIN
    // ============================================
    await supabase
      .from('users')
      .update({
        last_login: new Date()
      })
      .eq('id', student_id);

    // ============================================
    // RESPONSE
    // ============================================
    return res.status(200).json({
      success: true,
      token: token,
      student: {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        age: student.age,
        avatar_url: student.avatar_url
      },
      expires_in: 86400, // 24 hours in seconds
      message: `Welcome ${student.first_name}! 🎉`
    });

  } catch (error) {
    console.error('PIN verification error:', error);
    return res.status(500).json({
      error: 'An error occurred during authentication'
    });
  }
}

// ============================================
// POST /auth/change-pin
// ============================================
// Parent changes student's PIN
//
// Request body:
// {
//   parent_id: "660e8400-e29b-41d4-a716-446655440001",
//   student_id: "550e8400-e29b-41d4-a716-446655440000",
//   new_pin: "5678"
// }
//
// Response on success (200):
// {
//   success: true,
//   message: "PIN changed successfully"
// }

async function changePin(req, res) {
  try {
    const { parent_id, student_id, new_pin } = req.body;

    // ============================================
    // VALIDATION
    // ============================================
    if (!parent_id || !student_id || !new_pin) {
      return res.status(400).json({
        error: 'Missing required fields: parent_id, student_id, new_pin'
      });
    }

    if (typeof new_pin !== 'string') {
      return res.status(400).json({
        error: 'PIN must be a string'
      });
    }

    const trimmedPin = new_pin.trim();

    if (trimmedPin.length < 4 || trimmedPin.length > 6) {
      return res.status(400).json({
        error: 'PIN must be 4-6 digits'
      });
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
    // HASH NEW PIN
    // ============================================
    const newPinHash = await bcrypt.hash(trimmedPin, 10);

    // ============================================
    // UPDATE PIN IN DATABASE
    // ============================================
    const { error: updateError } = await supabase
      .from('student_pins')
      .update({
        pin_hash: newPinHash,
        last_changed: new Date(),
        updated_by_parent_id: parent_id,
        failed_attempts: 0, // Reset brute force counter
        locked_until: null // Unlock account
      })
      .eq('student_id', student_id);

    if (updateError) {
      console.error('PIN update error:', updateError);
      return res.status(500).json({
        error: 'Failed to update PIN'
      });
    }

    // ============================================
    // LOG PIN CHANGE
    // ============================================
    await logAuthAttempt({
      student_id: student_id,
      auth_method: 'pin_change',
      success: true,
      failure_reason: `PIN changed by parent ${parent_id}`,
      ip_address: req.ip
    });

    // ============================================
    // RESPONSE
    // ============================================
    return res.status(200).json({
      success: true,
      message: 'PIN changed successfully'
    });

  } catch (error) {
    console.error('Change PIN error:', error);
    return res.status(500).json({
      error: 'An error occurred while changing PIN'
    });
  }
}

// ============================================
// POST /auth/reset-pin-lock
// ============================================
// Parent unlocks locked student account
//
// Request body:
// {
//   parent_id: "660e8400-e29b-41d4-a716-446655440001",
//   student_id: "550e8400-e29b-41d4-a716-446655440000"
// }

async function resetPinLock(req, res) {
  try {
    const { parent_id, student_id } = req.body;

    if (!parent_id || !student_id) {
      return res.status(400).json({
        error: 'Missing required fields: parent_id, student_id'
      });
    }

    // Verify parent owns student
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

    // Unlock account
    const { error: updateError } = await supabase
      .from('student_pins')
      .update({
        failed_attempts: 0,
        locked_until: null,
        last_failed_attempt: null
      })
      .eq('student_id', student_id);

    if (updateError) {
      console.error('Unlock error:', updateError);
      return res.status(500).json({
        error: 'Failed to unlock account'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Account unlocked successfully'
    });

  } catch (error) {
    console.error('Reset PIN lock error:', error);
    return res.status(500).json({
      error: 'An error occurred'
    });
  }
}

// ============================================
// GET /auth/login-attempts/:student_id
// ============================================
// Get login history for a student (parent view)

async function getLoginAttempts(req, res) {
  try {
    const { student_id } = req.params;
    const { parent_id } = req.query;

    if (!parent_id) {
      return res.status(400).json({
        error: 'Missing parent_id query parameter'
      });
    }

    // Verify parent owns student
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

    // Get login attempts (last 50)
    const { data: attempts, error: attemptsError } = await supabase
      .from('auth_logs')
      .select('*')
      .eq('student_id', student_id)
      .eq('auth_method', 'pin')
      .order('created_at', { ascending: false })
      .limit(50);

    if (attemptsError) {
      console.error('Login attempts error:', attemptsError);
      return res.status(500).json({
        error: 'Failed to retrieve login attempts'
      });
    }

    return res.status(200).json({
      success: true,
      attempts: attempts,
      total: attempts.length
    });

  } catch (error) {
    console.error('Get login attempts error:', error);
    return res.status(500).json({
      error: 'An error occurred'
    });
  }
}

// ============================================
// HELPER: Log Authentication Attempt
// ============================================
// Internal helper to log auth attempts in auth_logs table

async function logAuthAttempt({
  student_id,
  parent_id,
  auth_method,
  device_id,
  success,
  failure_reason,
  attempt_number,
  ip_address
}) {
  try {
    await supabase
      .from('auth_logs')
      .insert({
        student_id: student_id,
        parent_id: parent_id,
        auth_method: auth_method,
        device_id: device_id,
        success: success,
        failure_reason: failure_reason,
        attempt_number: attempt_number,
        ip_address: ip_address,
        created_at: new Date()
      });
  } catch (error) {
    console.error('Error logging auth attempt:', error);
    // Don't throw - logging failure shouldn't block authentication
  }
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  verifyPin,
  changePin,
  resetPinLock,
  getLoginAttempts
};

// ============================================
// USAGE IN EXPRESS APP
// ============================================
//
// const pinAuth = require('./auth/pin-auth.js');
//
// app.post('/auth/verify-pin', pinAuth.verifyPin);
// app.post('/auth/change-pin', pinAuth.changePin);
// app.post('/auth/reset-pin-lock', pinAuth.resetPinLock);
// app.get('/auth/login-attempts/:student_id', pinAuth.getLoginAttempts);
