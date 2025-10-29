// Middleware to check if user is authenticated (session-based)
const requireAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
};

module.exports = requireAuth;

