const express = require('express');
const router = express.Router();
const User = require('../models/User');
const requireAuth = require('../middleware/auth');

// @route   GET /api/users/all
// @desc    Get all users (admin route)
// @access  Private
router.get('/users/all', requireAuth, async (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👥 FETCH ALL USERS REQUEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   • Requested by:', req.session.user.name);
  console.log('   • Email:', req.session.user.email);
  
  try {
    console.log('🔍 Fetching all users from database...');
    const users = await User.find().select('-googleId').sort({ createdAt: -1 });
    
    console.log(`✅ Found ${users.length} users`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.json({
      success: true,
      users: users,
      count: users.length
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/users/me', requireAuth, async (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 USER PROFILE REQUEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   • Requested by:', req.session.user.name);
  
  try {
    const user = await User.findById(req.session.user.id);
    console.log('✅ Profile fetched successfully');
    console.log('   • Name:', user.name);
    console.log('   • Email:', user.email);
    console.log('   • Last Login:', user.lastLogin);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Error fetching profile:', error.message);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
});

module.exports = router;

