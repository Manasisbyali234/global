const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    // If user is a regular admin, allow access
    if (req.userRole === 'admin') {
      return next();
    }
    
    // If user is a sub-admin, check permissions
    if (req.userRole === 'sub-admin') {
      if (!req.user.permissions || !req.user.permissions.includes(requiredPermission)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to access this resource' 
        });
      }
      return next();
    }
    
    // If neither admin nor sub-admin, deny access
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied' 
    });
  };
};

module.exports = { checkPermission };