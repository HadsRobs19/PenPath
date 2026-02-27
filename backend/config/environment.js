require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'local'}`
});

// List of required environment variables
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'NODE_ENV',
  'DB_SCHEMA'
];

// Validate that all required variables are set
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}\n` +
    `Make sure you have a .env.${process.env.NODE_ENV || 'local'} file with these variables.`
  );
}

// Export configuration object
module.exports = {
  // Environment
  environment: process.env.NODE_ENV,
  nodeEnv: process.env.NODE_ENV,
  isDevelopment: process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'development',
  isStaging: process.env.NODE_ENV === 'staging',
  isProduction: process.env.NODE_ENV === 'production',

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY
  },

  // Database
  database: {
    schema: process.env.DB_SCHEMA
  },

  // API Server
  server: {
    port: parseInt(process.env.API_PORT, 10) || 3000,
    host: process.env.API_HOST || 'localhost'
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};
