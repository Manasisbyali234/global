const jwt = require('jsonwebtoken');
const Candidate = require('../models/Candidate');
const Employer = require('../models/Employer');
const Admin = require('../models/Admin');
const SubAdmin = require('../models/SubAdmin');
const Placement = require('../models/Placement');

const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        // Removed auth debug line for security
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let user;

      // Removed auth debug line for security

      if (decoded.role === 'candidate') {
        user = await Candidate.findById(decoded.id);
        if (user && !user.password) {
          return res.status(401).json({ message: 'Please complete your registration by creating a password' });
        }
        if (user) {
          user.password = undefined;
        }
      } else if (decoded.role === 'employer') {
        user = await Employer.findById(decoded.id).select('-password');
      } else if (decoded.role === 'admin') {
        user = await Admin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'sub-admin') {
        user = await SubAdmin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'placement') {
        user = await Placement.findById(decoded.id).select('-password');
      }
      
      if (!user) {
        // Removed auth debug line for security
        return res.status(401).json({ message: 'User not found or account deactivated' });
      }

      // Check if placement officer is active
      if (decoded.role === 'placement' && user.status !== 'active') {
        // Removed auth debug line for security
        return res.status(403).json({ 
          message: 'Account pending admin approval. Please wait for admin to approve your account.',
          requiresApproval: true
        });
      }

      if (roles.length && !roles.includes(decoded.role)) {
        // Allow sub-admin to access admin routes
        if (decoded.role === 'sub-admin' && roles.includes('admin')) {
          // Sub-admin can access admin routes
        } else {
          // Removed auth debug line for security
          return res.status(403).json({ message: 'Access denied - insufficient permissions' });
        }
      }

      req.user = user;
      req.userRole = decoded.role;
      next();
    } catch (error) {
      // Removed auth debug line for security
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired, please login again' });
      }
      res.status(401).json({ message: 'Invalid token' });
    }
  };
};

module.exports = { auth };