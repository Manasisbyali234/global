const Candidate = require('../models/Candidate');
const Employer = require('../models/Employer');
const Placement = require('../models/Placement');
const Admin = require('../models/Admin');
const SubAdmin = require('../models/SubAdmin');

/**
 * Checks if an email exists in any user role
 * @param {string} email - The email to check
 * @returns {Promise<Object|null>} - Returns the user object and role if found, otherwise null
 */
const checkEmailExists = async (email) => {
  if (!email) return null;
  
  const normalizedEmail = email.trim().toLowerCase();

  // Check Candidate
  const candidate = await Candidate.findByEmail(normalizedEmail);
  if (candidate) return { user: candidate, role: 'candidate' };

  // Check Employer
  const employer = await Employer.findByEmail(normalizedEmail);
  if (employer) return { user: employer, role: 'employer' };

  // Check Placement
  const placement = await Placement.findByEmail(normalizedEmail);
  if (placement) return { user: placement, role: 'placement' };

  // Check Admin
  const admin = await Admin.findByEmail(normalizedEmail);
  if (admin) return { user: admin, role: 'admin' };

  // Check SubAdmin
  const subAdmin = await SubAdmin.findByEmail(normalizedEmail);
  if (subAdmin) return { user: subAdmin, role: 'subadmin' };

  return null;
};

module.exports = {
  checkEmailExists
};
