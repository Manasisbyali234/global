const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'info@taleglobal.net';
    const existingAdmin = await Admin.findByEmail(adminEmail);
    if (existingAdmin) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    const admin = await Admin.create({
      name: 'Tale Admin',
      email: adminEmail,
      password: 'admin123456',
      role: 'super-admin',
      permissions: ['all']
    });

    console.log('Admin created successfully!');
    console.log(`Email: ${admin.email}`);
    console.log('Password: admin123456');
    console.log('Please change password after first login');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
