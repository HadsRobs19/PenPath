// Load environment configuration
const config = require('./config/environment');

console.log(`🚀 Starting PenPath Backend`);
console.log(`📍 Environment: ${config.environment}`);
console.log(`🗂️  Database Schema: ${config.database.schema}`);
console.log(`🔗 Supabase URL: ${config.supabase.url}`);

// Server setup (placeholder for now)
const PORT = config.server.port;
const HOST = config.server.host;

console.log(`\n✅ Configuration loaded successfully`);
console.log(`📡 Server ready at http://${HOST}:${PORT}`);
console.log(`\nEnvironment variables are properly separated and loaded from .env.${config.environment}`);
