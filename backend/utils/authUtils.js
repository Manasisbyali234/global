const Candidate = require('../models/Candidate');
const Employer = require('../models/Employer');
const Placement = require('../models/Placement');
const Admin = require('../models/Admin');
const SubAdmin = require('../models/SubAdmin');

const normalizeEmailList = (emails = []) => (
  [...new Set(
    emails
      .map(email => String(email || '').trim().toLowerCase())
      .filter(Boolean)
  )]
);

const buildEmailLookupQueries = (emails = []) => (
  emails.map(email => ({
    email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
  }))
);

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

const findExistingEmails = async (emails = []) => {
  const normalizedEmails = normalizeEmailList(emails);
  if (normalizedEmails.length === 0) return [];

  const emailQueries = buildEmailLookupQueries(normalizedEmails);
  const models = [Candidate, Employer, Placement, Admin, SubAdmin];

  const matches = await Promise.all(
    models.map(Model => Model.find({ $or: emailQueries }).select('email').lean())
  );

  return normalizeEmailList(matches.flat().map(record => record?.email));
};

module.exports = {
  checkEmailExists,
  findExistingEmails
};
