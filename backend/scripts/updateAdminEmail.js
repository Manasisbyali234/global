const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const updateAdminEmail = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Admin.findOneAndUpdate(
      { email: 'admin@tale.com' },
      { email: 'manishree31999@gmail.com' },
      { new: true }
    );

    if (!result) {
      console.log('Admin with admin@tale.com not found. Checking existing admins...');
      const all = await Admin.find({}, 'email role');
      console.log('Existing admins:', all);
    } else {
      console.log('Admin email updated successfully!');
      console.log('New Email:', result.email);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error updating admin email:', error);
    process.exit(1);
  }
};

updateAdminEmail();
