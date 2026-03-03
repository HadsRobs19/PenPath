// ============================================
// Parent/Teacher Email + Password Authentication
// MS6-6: Adult account management via Supabase Auth
// ============================================
//
// WHO: Parents, Teachers
// WHAT: Email/password authentication using Supabase Auth
// WHERE: Backend wrapper around Supabase Auth
// WHEN: Parent login
// WHY: Adults need standard email/password, not PIN

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ============================================
// POST /auth/parent-signup
// ============================================
// Create new parent/teacher account
//
// Request body:
// {
//   email: "parent@email.com",
//   password: "SecurePassword123!",
//   first_name: "Jane",
//   last_name: "Johnson",
//   role: "parent" or "teacher"
// }
//
// Response on success (201):
// {
//   success: true,
//   user_id: "660e8400-e29b-41d4-a716-446655440001",
//   email: "parent@email.com",
//   message: "Account created. Please verify email."
// }
//
// Response on failure (400/409):
// {
//   success: false,
//   error: "User already exists"
// }

async function parentSignup(req, res) {
  try {
    const { email, password, first_name, last_name, role } = req.body;

    // ============================================
    // INPUT VALIDATION
    // ============================================
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        error: 'Missing required fields: email, password, first_name, last_name'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters'
      });
    }

    // ============================================
    // CREATE AUTH ACCOUNT (Supabase Auth)
    // ============================================
    // Supabase Auth handles email verification, password hashing, etc.
    const { data: authData, error: authError } = await supabase.auth.admin
      .createUser({
        email: email.toLowerCase(),
        password: password,
        email_confirm: false // Require email verification
      });

    if (authError) {
      console.error('Auth signup error:', authError);

      // Handle duplicate email
      if (authError.message.includes('already exists')) {
        return res.status(409).json({
          error: 'Email already registered'
        });
      }

      return res.status(500).json({
        error: 'Failed to create account'
      });
    }

    // ============================================
    // CREATE PROFILE IN DATABASE
    // ============================================
    // Store parent/teacher info in teachers_parents table
    const { data: profile, error: profileError } = await supabase
      .from('teachers_parents')
      .insert({
        id: authData.user.id, // Use same ID as auth
        email: email.toLowerCase(),
        first_name: first_name,
        last_name: last_name,
        role: role || 'parent',
        is_active: true,
        created_at: new Date()
      })
      .select();

    if (profileError) {
      console.error('Profile creation error:', profileError);

      // If profile creation fails, delete the auth account
      await supabase.auth.admin.deleteUser(authData.user.id);

      return res.status(500).json({
        error: 'Failed to create profile'
      });
    }

    // ============================================
    // LOG SIGNUP
    // ============================================
    await supabase
      .from('auth_logs')
      .insert({
        parent_id: authData.user.id,
        auth_method: 'parent_signup',
        success: true,
        created_at: new Date()
      })
      .catch(err => console.error('Log signup error:', err));

    // ============================================
    // RESPONSE
    // ============================================
    return res.status(201).json({
      success: true,
      user_id: authData.user.id,
      email: email,
      first_name: first_name,
      message: 'Account created! Please check your email to verify your account.'
    });

  } catch (error) {
    console.error('Parent signup error:', error);
    return res.status(500).json({
      error: 'An error occurred during signup'
    });
  }
}

// ============================================
// POST /auth/parent-login
// ============================================
// Parent/Teacher login with email + password
//
// Request body:
// {
//   email: "parent@email.com",
//   password: "SecurePassword123!"
// }
//
// Response on success (200):
// {
//   success: true,
//   token: "eyJhbGc...",
//   user: {
//     id: "660e8400-e29b-41d4-a716-446655440001",
//     email: "parent@email.com",
//     first_name: "Jane",
//     role: "parent"
//   },
//   expires_in: 2592000,
//   message: "Welcome Jane!"
// }
//
// Response on failure (401):
// {
//   success: false,
//   error: "Invalid email or password"
// }

async function parentLogin(req, res) {
  try {
    const { email, password } = req.body;

    // ============================================
    // INPUT VALIDATION
    // ============================================
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: email, password'
      });
    }

    // ============================================
    // AUTHENTICATE WITH SUPABASE
    // ============================================
    // Supabase verifies password and issues JWT
    const { data: authData, error: authError } = await supabase.auth
      .signInWithPassword({
        email: email.toLowerCase(),
        password: password
      });

    if (authError) {
      console.error('Auth login error:', authError);

      // Log failed attempt
      await supabase
        .from('auth_logs')
        .insert({
          auth_method: 'parent_login',
          success: false,
          failure_reason: 'Invalid credentials',
          ip_address: req.ip,
          created_at: new Date()
        })
        .catch(err => console.error('Log login error:', err));

      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // ============================================
    // GET PROFILE INFO
    // ============================================
    const { data: profile, error: profileError } = await supabase
      .from('teachers_parents')
      .select('id, email, first_name, last_name, role, is_active')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({
        error: 'Failed to fetch profile'
      });
    }

    // ============================================
    // CHECK IF ACCOUNT IS ACTIVE
    // ============================================
    if (!profile.is_active) {
      return res.status(403).json({
        error: 'Account is disabled'
      });
    }

    // ============================================
    // UPDATE LAST LOGIN
    // ============================================
    await supabase
      .from('teachers_parents')
      .update({
        last_login: new Date()
      })
      .eq('id', authData.user.id)
      .catch(err => console.error('Update last_login error:', err));

    // ============================================
    // LOG SUCCESSFUL LOGIN
    // ============================================
    await supabase
      .from('auth_logs')
      .insert({
        parent_id: authData.user.id,
        auth_method: 'parent_login',
        success: true,
        ip_address: req.ip,
        created_at: new Date()
      })
      .catch(err => console.error('Log login error:', err));

    // ============================================
    // RESPONSE
    // ============================================
    return res.status(200).json({
      success: true,
      token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      user: {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role
      },
      expires_in: authData.session.expires_in,
      message: `Welcome ${profile.first_name}! 👋`
    });

  } catch (error) {
    console.error('Parent login error:', error);
    return res.status(500).json({
      error: 'An error occurred during login'
    });
  }
}

// ============================================
// POST /auth/parent-logout
// ============================================
// Parent/Teacher logout
//
// Request body:
// {
//   refresh_token: "..." (optional)
// }

async function parentLogout(req, res) {
  try {
    const { refresh_token } = req.body;

    // ============================================
    // SIGN OUT WITH SUPABASE
    // ============================================
    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      console.error('Logout error:', logoutError);
      // Don't fail if logout has error - user is getting logged out anyway
    }

    // ============================================
    // RESPONSE
    // ============================================
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Parent logout error:', error);
    return res.status(500).json({
      error: 'An error occurred during logout'
    });
  }
}

// ============================================
// POST /auth/parent-password-reset
// ============================================
// Request password reset email
//
// Request body:
// {
//   email: "parent@email.com"
// }
//
// Response on success (200):
// {
//   success: true,
//   message: "Password reset email sent"
// }

async function parentPasswordReset(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email field'
      });
    }

    // ============================================
    // REQUEST PASSWORD RESET
    // ============================================
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase(),
      {
        redirectTo: `${process.env.APP_URL}/reset-password`
      }
    );

    if (resetError) {
      console.error('Password reset error:', resetError);
      // Don't reveal if email exists (security)
    }

    // ============================================
    // LOG RESET REQUEST
    // ============================================
    await supabase
      .from('auth_logs')
      .insert({
        auth_method: 'password_reset',
        success: true,
        failure_reason: 'Password reset requested',
        created_at: new Date()
      })
      .catch(err => console.error('Log reset error:', err));

    // ============================================
    // RESPONSE
    // ============================================
    // Always return success (don't reveal if email exists)
    return res.status(200).json({
      success: true,
      message: 'If email exists, password reset link sent'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      error: 'An error occurred'
    });
  }
}

// ============================================
// POST /auth/parent-update-password
// ============================================
// Change password (authenticated user)
//
// Request body:
// {
//   new_password: "NewPassword123!"
// }
// Headers:
// Authorization: Bearer {token}

async function parentUpdatePassword(req, res) {
  try {
    const { new_password } = req.body;
    const authHeader = req.headers.authorization;

    if (!new_password) {
      return res.status(400).json({
        error: 'Missing new_password field'
      });
    }

    if (!authHeader) {
      return res.status(401).json({
        error: 'Missing authorization header'
      });
    }

    // ============================================
    // UPDATE PASSWORD IN SUPABASE
    // ============================================
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(500).json({
        error: 'Failed to update password'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({
      error: 'An error occurred'
    });
  }
}

// ============================================
// GET /auth/parent-profile
// ============================================
// Get parent profile info (authenticated)
//
// Headers:
// Authorization: Bearer {token}

async function getParentProfile(req, res) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Missing authorization header'
      });
    }

    // ============================================
    // GET AUTHENTICATED USER
    // ============================================
    const { data: authUser, error: authError } = await supabase.auth
      .getUser(authHeader.replace('Bearer ', ''));

    if (authError || !authUser) {
      return res.status(401).json({
        error: 'Unauthorized'
      });
    }

    // ============================================
    // GET PROFILE
    // ============================================
    const { data: profile, error: profileError } = await supabase
      .from('teachers_parents')
      .select('id, email, first_name, last_name, role, school_name, class_name, is_active, created_at')
      .eq('id', authUser.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        error: 'Profile not found'
      });
    }

    // ============================================
    // GET STUDENTS
    // ============================================
    const { data: students, error: studentsError } = await supabase
      .from('user_teacher_relations')
      .select('student_id, relationship_type, is_active, users(first_name, last_name, age)')
      .eq('teacher_parent_id', authUser.user.id)
      .eq('is_active', true);

    if (studentsError) {
      console.error('Students fetch error:', studentsError);
    }

    // ============================================
    // RESPONSE
    // ============================================
    return res.status(200).json({
      success: true,
      profile: profile,
      students: students || [],
      student_count: (students || []).length
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      error: 'An error occurred'
    });
  }
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  parentSignup,
  parentLogin,
  parentLogout,
  parentPasswordReset,
  parentUpdatePassword,
  getParentProfile
};

// ============================================
// USAGE IN EXPRESS APP
// ============================================
//
// const parentAuth = require('./auth/parent-auth.js');
//
// app.post('/auth/parent-signup', parentAuth.parentSignup);
// app.post('/auth/parent-login', parentAuth.parentLogin);
// app.post('/auth/parent-logout', parentAuth.parentLogout);
// app.post('/auth/parent-password-reset', parentAuth.parentPasswordReset);
// app.post('/auth/parent-update-password', parentAuth.parentUpdatePassword);
// app.get('/auth/parent-profile', parentAuth.getParentProfile);
