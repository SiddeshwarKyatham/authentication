const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const app = express();

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║        MULTI-PROVIDER OAUTH SERVER STARTING          ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Middleware
console.log('⚙️  Configuring middleware...');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
console.log('   ✅ CORS enabled for http://localhost:3000');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('   ✅ JSON parsing enabled');

// Express session
console.log('⚙️  Configuring session...');
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true
    }
  })
);
console.log('   ✅ Session configured (24 hour lifetime)');

// Session-based authentication (no Passport needed)
console.log('⚙️  Using session-based authentication...');
console.log('   ✅ Multi-provider-oauth package ready');

// Routes
console.log('⚙️  Registering routes...');
app.use('/auth', require('./routes/auth-new'));
app.use('/api', require('./routes/users'));
console.log('   ✅ Routes registered');
console.log('      • /auth/* - Multi-provider OAuth routes');
console.log('      • /api/* - API routes\n');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/google-auth';
const databaseName = 'google-auth';

// Add database name to MongoDB URI if not present
const connectionString = mongodbUri.includes('google-auth') 
  ? mongodbUri 
  : mongodbUri.endsWith('/') 
    ? `${mongodbUri}${databaseName}`
    : `${mongodbUri}/${databaseName}`;

console.log('🔌 Connecting to MongoDB...');
console.log('   • URI:', connectionString.replace(/:[^:@]*@/, ':****@')); // Hide password

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('\n✅ Connected to MongoDB successfully!');
  console.log(`📁 Database: ${databaseName}`);
  
  app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║              SERVER IS RUNNING! 🚀                    ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║  🌐 Backend URL: http://localhost:${PORT}              ║`);
    console.log(`║  📊 Test DB: http://localhost:${PORT}/auth/test-db    ║`);
    console.log(`║  🔐 Google OAuth: http://localhost:${PORT}/auth/google  ║`);
    console.log('╚════════════════════════════════════════════════════════╝\n');
  });
})
.catch((err) => {
  console.error('\n❌ ❌ ❌ MongoDB CONNECTION FAILED ❌ ❌ ❌');
  console.error('Error:', err.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Check if MongoDB is running (or Atlas is accessible)');
  console.log('   2. Verify MONGODB_URI in .env file');
  console.log('   3. Ensure network access is enabled in Atlas');
  console.log('   4. Check IP whitelist in MongoDB Atlas dashboard');
  console.log('   5. Verify credentials are correct\n');
});

