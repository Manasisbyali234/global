const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const SOURCE_ADMIN_EMAIL = 'admin@tale.com';
const TARGET_ADMIN_EMAIL = 'info@taleglobal.net';

const updateAdminEmail = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const targetAdmin = await Admin.findByEmail(TARGET_ADMIN_EMAIL);
    if (targetAdmin) {
      console.log(`Admin email is already set to ${TARGET_ADMIN_EMAIL}`);
      process.exit(0);
    }

    const sourceAdmin = await Admin.findByEmail(SOURCE_ADMIN_EMAIL);
    if (!sourceAdmin) {
      console.log(`No admin found with email ${SOURCE_ADMIN_EMAIL}`);
      process.exit(0);
    }

    sourceAdmin.email = TARGET_ADMIN_EMAIL;
    await sourceAdmin.save();

    console.log(`Admin email updated from ${SOURCE_ADMIN_EMAIL} to ${TARGET_ADMIN_EMAIL}`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin email:', error);
    process.exit(1);
  }
};

updateAdminEmail();
