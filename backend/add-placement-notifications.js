require('dotenv').config();
const { connectDB } = require('./config/database');
const Notification = require('./models/Notification');
const Placement = require('./models/Placement');
const mongoose = require('mongoose');

const addPlacementNotifications = async () => {
  try {
    await connectDB();
    
    const placements = await Placement.find().limit(1);
    
    if (placements.length === 0) {
      console.log('No placements found in database');
      process.exit(1);
    }
    
    const placementId = placements[0]._id;
    console.log('Adding notifications for placement:', placementId);
    
    const notifications = [
      {
        title: 'Welcome to Placement Portal',
        message: 'Your placement dashboard is ready for student data management',
        type: 'profile_approved',
        role: 'placement',
        placementId,
        createdBy: placementId,
        isRead: false
      },
      {
        title: 'Upload Ready',
        message: 'You can now upload student data files for processing',
        type: 'profile_submitted',
        role: 'placement',
        placementId,
        createdBy: placementId,
        isRead: false
      },
      {
        title: 'Profile Completion',
        message: 'Complete your profile information for better experience',
        type: 'profile_completion',
        role: 'placement',
        placementId,
        createdBy: placementId,
        isRead: false
      }
    ];
    
    const result = await Notification.insertMany(notifications);
    console.log('Created', result.length, 'notifications');
    console.log('IDs:', result.map(n => n._id));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addPlacementNotifications();
