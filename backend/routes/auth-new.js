const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { UnifiedOAuth } = require('multi-provider-oauth');

// Ensure environment variables are loaded
require('dotenv').config();

// Debug: Check if environment variables are loaded
console.log('🔍 Environment variables check:');
console.log('   • GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Loaded' : '❌ Missing');
console.log('   • GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? '✅ Loaded' : '❌ Missing');
console.log('   • LINKEDIN_CLIENT_ID:', process.env.LINKEDIN_CLIENT_ID ? '✅ Loaded' : '❌ Missing');
console.log('   • Current working directory:', process.cwd());
console.log('   • .env file path:', require('path').join(process.cwd(), '.env'));

// Initialize OAuth with multiple providers
const oauth = new UnifiedOAuth({
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: 'http://localhost:5000/auth/google/callback'
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || 'your-github-client-id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your-github-client-secret',
    redirectUri: 'http://localhost:5000/auth/github/callback'
  },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID || 'your-facebook-client-id',
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'your-facebook-client-secret',
    redirectUri: 'http://localhost:5000/auth/facebook/callback'
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || 'your-linkedin-client-id',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'your-linkedin-client-secret',
    redirectUri: 'http://localhost:5000/auth/linkedin/callback'
  }
});

// @route   GET /auth/test-db
// @desc    Test MongoDB connection
router.get('/test-db', async (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 TESTING MONGODB CONNECTION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    console.log('🔍 Querying database...');
    const userCount = await User.countDocuments();
    const allUsers = await User.find().limit(5);
    
    console.log('✅ MongoDB is connected!');
    console.log('   • Total users:', userCount);
    console.log('   • Showing first 5 users:');
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.json({
      success: true,
      connected: true,
      message: 'MongoDB is connected!',
      data: {
        totalUsers: userCount,
        sampleUsers: allUsers.map(u => ({
          name: u.name,
          email: u.email,
          lastLogin: u.lastLogin
        }))
      }
    });
  } catch (error) {
    console.error('❌ MongoDB connection failed');
    console.error('   • Error:', error.message);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.status(500).json({
      success: false,
      connected: false,
      message: 'MongoDB connection failed',
      error: error.message
    });
  }
});

// @route   GET /auth/google
// @desc    Initiate Google OAuth login using multi-provider-oauth
router.get('/google', (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔵 GOOGLE OAUTH INITIATED (Multi-Provider)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Redirecting to Google...');
  console.log('   • Using: multi-provider-oauth package');
  console.log('   • Callback URL: /auth/google/callback');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const authUrl = oauth.getAuthorizationUrl('google');
    console.log('🔗 Generated auth URL:', authUrl);
    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ Error generating auth URL:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error initiating OAuth',
      error: error.message 
    });
  }
});

// @route   GET /auth/google/callback
// @desc    Google OAuth callback using multi-provider-oauth
router.get('/google/callback', async (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔵 GOOGLE OAUTH CALLBACK (Multi-Provider)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📥 Received callback from Google');
  console.log('   • Code:', req.query.code ? 'Present' : 'Missing');
  console.log('   • Error:', req.query.error || 'None');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const { code, error } = req.query;
    
    if (error) {
      console.error('❌ OAuth error:', error);
      return res.redirect('http://localhost:3000/login?error=' + error);
    }
    
    if (!code) {
      console.error('❌ No authorization code received');
      return res.redirect('http://localhost:3000/login?error=no_code');
    }
    
    console.log('🔄 Exchanging code for user info...');
    const userData = await oauth.signIn('google', code);
    
    console.log('📦 User data from Google:', {
      id: userData.id,
      name: userData.name,
      email: userData.email
    });
    
    // Find or create user in database
    console.log('🔍 Checking for existing user...');
    let user = await User.findOne({ 
      $or: [
        { googleId: userData.id },
        { email: userData.email }
      ]
    });
    
    if (user) {
      console.log('✅ Existing user found, updating Google ID and last login');
      user.googleId = userData.id;
      user.provider = 'google';
      user.lastLogin = new Date();
      await user.save();
      console.log('✅ User updated successfully');
    } else {
      console.log('📝 Creating new user...');
      user = await User.create({
        googleId: userData.id,
        name: userData.name,
        email: userData.email,
        profilePicture: userData.picture || '',
        provider: 'google',
        lastLogin: new Date()
      });
      console.log('✅ New user created successfully:', user.email);
    }
    
    // Create session
    req.session.userId = user._id;
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture
    };
    
    console.log('\n✅ ✅ ✅ AUTHENTICATION SUCCESSFUL ✅ ✅ ✅');
    console.log('🌐 Redirecting to dashboard...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.redirect('http://localhost:3000/dashboard');
    
  } catch (error) {
    console.error('❌ OAuth callback error:', error.message);
    console.error('   • Stack:', error.stack);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.redirect('http://localhost:3000/login?error=callback_failed');
  }
});

// @route   GET /auth/github
// @desc    Initiate GitHub OAuth login
router.get('/github', (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🐙 GITHUB OAUTH INITIATED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Redirecting to GitHub...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const authUrl = oauth.getAuthorizationUrl('github');
    console.log('🔗 Generated GitHub auth URL:', authUrl);
    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ Error generating GitHub auth URL:', error.message);
    console.log('💡 This might be because GitHub credentials are not configured');
    res.status(500).json({ 
      success: false, 
      message: 'GitHub OAuth not configured. Please add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to .env file',
      error: error.message 
    });
  }
});

// @route   GET /auth/github/callback
// @desc    GitHub OAuth callback
router.get('/github/callback', async (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🐙 GITHUB OAUTH CALLBACK');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📥 Received callback from GitHub');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const { code, error } = req.query;
    
    if (error) {
      console.error('❌ GitHub OAuth error:', error);
      return res.redirect('http://localhost:3000/login?error=' + error);
    }
    
    if (!code) {
      console.error('❌ No authorization code received');
      return res.redirect('http://localhost:3000/login?error=no_code');
    }
    
    console.log('🔄 Exchanging GitHub code for user info...');
    const userData = await oauth.signIn('github', code);
    
    console.log('📦 User data from GitHub:', {
      id: userData.id,
      name: userData.name,
      email: userData.email
    });
    
    // Find or create user in database
    console.log('🔍 Checking for existing user...');
    let user = await User.findOne({ 
      $or: [
        { githubId: userData.id },
        { email: userData.email }
      ]
    });
    
    if (user) {
      console.log('✅ Existing user found, updating GitHub ID and last login');
      user.githubId = userData.id;
      user.provider = 'github';
      user.lastLogin = new Date();
      await user.save();
      console.log('✅ User updated successfully');
    } else {
      console.log('📝 Creating new user...');
      user = await User.create({
        githubId: userData.id,
        name: userData.name,
        email: userData.email,
        profilePicture: userData.avatar_url || '',
        provider: 'github',
        lastLogin: new Date()
      });
      console.log('✅ New user created successfully:', user.email);
    }
    
    // Create session
    req.session.userId = user._id;
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture
    };
    
    console.log('\n✅ ✅ ✅ GITHUB AUTHENTICATION SUCCESSFUL ✅ ✅ ✅');
    console.log('🌐 Redirecting to dashboard...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.redirect('http://localhost:3000/dashboard');
    
  } catch (error) {
    console.error('❌ GitHub OAuth callback error:', error.message);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.redirect('http://localhost:3000/login?error=callback_failed');
  }
});

// @route   GET /auth/facebook
// @desc    Initiate Facebook OAuth login
router.get('/facebook', (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📘 FACEBOOK OAUTH INITIATED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Redirecting to Facebook...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const authUrl = oauth.getAuthorizationUrl('facebook');
    console.log('🔗 Generated Facebook auth URL:', authUrl);
    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ Error generating Facebook auth URL:', error.message);
    console.log('💡 This might be because Facebook credentials are not configured');
    res.status(500).json({ 
      success: false, 
      message: 'Facebook OAuth not configured. Please add FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET to .env file',
      error: error.message 
    });
  }
});

// @route   GET /auth/facebook/callback
// @desc    Facebook OAuth callback
router.get('/facebook/callback', async (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📘 FACEBOOK OAUTH CALLBACK');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📥 Received callback from Facebook');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const { code, error } = req.query;
    
    if (error) {
      console.error('❌ Facebook OAuth error:', error);
      return res.redirect('http://localhost:3000/login?error=' + error);
    }
    
    if (!code) {
      console.error('❌ No authorization code received');
      return res.redirect('http://localhost:3000/login?error=no_code');
    }
    
    console.log('🔄 Exchanging Facebook code for user info...');
    const userData = await oauth.signIn('facebook', code);
    
    console.log('📦 User data from Facebook:', {
      id: userData.id,
      name: userData.name,
      email: userData.email
    });
    
    // Find or create user in database
    console.log('🔍 Checking for existing user...');
    let user = await User.findOne({ googleId: userData.id });
    
    if (user) {
      console.log('✅ Existing user found, updating last login');
      user.lastLogin = new Date();
      await user.save();
      console.log('✅ User updated successfully');
    } else {
      console.log('📝 Creating new user...');
      user = await User.create({
        googleId: userData.id,
        name: userData.name,
        email: userData.email,
        profilePicture: userData.picture?.data?.url || '',
        lastLogin: new Date()
      });
      console.log('✅ New user created successfully:', user.email);
    }
    
    // Create session
    req.session.userId = user._id;
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture
    };
    
    console.log('\n✅ ✅ ✅ FACEBOOK AUTHENTICATION SUCCESSFUL ✅ ✅ ✅');
    console.log('🌐 Redirecting to dashboard...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.redirect('http://localhost:3000/dashboard');
    
  } catch (error) {
    console.error('❌ Facebook OAuth callback error:', error.message);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.redirect('http://localhost:3000/login?error=callback_failed');
  }
});

// @route   GET /auth/linkedin
// @desc    Initiate LinkedIn OAuth login
router.get('/linkedin', (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💼 LINKEDIN OAUTH INITIATED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Redirecting to LinkedIn...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const authUrl = oauth.getAuthorizationUrl('linkedin');
    console.log('🔗 Generated LinkedIn auth URL:', authUrl);
    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ Error generating LinkedIn auth URL:', error.message);
    console.log('💡 This might be because LinkedIn credentials are not configured');
    res.status(500).json({ 
      success: false, 
      message: 'LinkedIn OAuth not configured. Please add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to .env file',
      error: error.message 
    });
  }
});

// @route   GET /auth/linkedin/callback
// @desc    LinkedIn OAuth callback
router.get('/linkedin/callback', async (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💼 LINKEDIN OAUTH CALLBACK');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📥 Received callback from LinkedIn');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const { code, error } = req.query;
    
    if (error) {
      console.error('❌ LinkedIn OAuth error:', error);
      return res.redirect('http://localhost:3000/login?error=' + error);
    }
    
    if (!code) {
      console.error('❌ No authorization code received');
      return res.redirect('http://localhost:3000/login?error=no_code');
    }
    
    console.log('🔄 Exchanging LinkedIn code for user info...');
    const userData = await oauth.signIn('linkedin', code);
    
    console.log('📦 User data from LinkedIn:', {
      id: userData.id,
      name: userData.name,
      email: userData.email
    });
    
    // Find or create user in database
    console.log('🔍 Checking for existing user...');
    let user = await User.findOne({ 
      $or: [
        { linkedinId: userData.id },
        { email: userData.email }
      ]
    });
    
    if (user) {
      console.log('✅ Existing user found, updating LinkedIn ID and last login');
      user.linkedinId = userData.id;
      user.provider = 'linkedin';
      user.lastLogin = new Date();
      await user.save();
      console.log('✅ User updated successfully');
    } else {
      console.log('📝 Creating new user...');
      user = await User.create({
        linkedinId: userData.id,
        name: userData.name,
        email: userData.email,
        profilePicture: userData.picture || '',
        provider: 'linkedin',
        lastLogin: new Date()
      });
      console.log('✅ New user created successfully:', user.email);
    }
    
    // Create session
    req.session.userId = user._id;
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture
    };
    
    console.log('\n✅ ✅ ✅ LINKEDIN AUTHENTICATION SUCCESSFUL ✅ ✅ ✅');
    console.log('🌐 Redirecting to dashboard...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.redirect('http://localhost:3000/dashboard');
    
  } catch (error) {
    console.error('❌ LinkedIn OAuth callback error:', error.message);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.redirect('http://localhost:3000/login?error=callback_failed');
  }
});

// @route   GET /auth/providers
// @desc    Get available OAuth providers
router.get('/providers', (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 AVAILABLE OAUTH PROVIDERS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Manually define available providers
  const providers = ['google', 'github', 'facebook', 'linkedin'];
  console.log('📋 Configured providers:', providers);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  res.json({
    success: true,
    providers: providers,
    endpoints: {
      google: '/auth/google',
      github: '/auth/github',
      facebook: '/auth/facebook',
      linkedin: '/auth/linkedin'
    }
  });
});

// @route   GET /auth/user
// @desc    Get current user
router.get('/user', (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 USER DATA REQUEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (req.session.user) {
    console.log('✅ Authenticated user found');
    console.log('   • User ID:', req.session.user.id);
    console.log('   • Name:', req.session.user.name);
    console.log('   • Email:', req.session.user.email);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.json({
      success: true,
      user: req.session.user
    });
  } else {
    console.log('❌ No authenticated user');
    console.log('   • Session:', req.session);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
});

// @route   GET /auth/logout
// @desc    Logout user
router.get('/logout', (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚪 LOGOUT REQUEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (req.session.user) {
    console.log('👤 Logging out user:', req.session.user.name);
  } else {
    console.log('⚠️  No user to log out');
  }
  
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Session destroy error:', err.message);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return res.status(500).json({ success: false, message: 'Error destroying session' });
    }
    
    res.clearCookie('connect.sid');
    console.log('✅ Logged out successfully');
    console.log('   • Session destroyed');
    console.log('   • Cookie cleared');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

module.exports = router;
