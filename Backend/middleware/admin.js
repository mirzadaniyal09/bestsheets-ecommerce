const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({
      message: 'Access denied. Admin rights required.',
      error: 'ADMIN_ACCESS_REQUIRED'
    });
  }
};

// Middleware to check if user is super admin (for critical operations)
const superAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin && req.user.isSuperAdmin) {
    next();
  } else {
    res.status(403).json({
      message: 'Access denied. Super admin rights required.',
      error: 'SUPER_ADMIN_ACCESS_REQUIRED'
    });
  }
};

module.exports = {
  admin,
  superAdmin,
};