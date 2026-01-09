const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Create notification
exports.createNotification = async (data) => {
  try {
    const notification = new Notification(data);
    await notification.save();
    console.log('Notification created:', notification);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Create notification route
exports.createNotificationRoute = async (req, res) => {
  try {
    const notification = await exports.createNotification(req.body);
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get notifications by role
exports.getNotificationsByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Build query - for general notifications by role or specific to user
    const userId = new mongoose.Types.ObjectId(req.user.id);
    let query;
    
    if (role === 'candidate') {
      query = {
        $or: [
          { role, candidateId: { $exists: false } }, // General notifications for all candidates
          { role, candidateId: userId } // Specific notifications for this candidate
        ]
      };
    } else if (role === 'admin') {
      // For admin, show all admin notifications
      query = { role: 'admin' };
    } else {
      query = {
        $or: [
          { role, relatedId: { $exists: false } }, // General notifications for role
          { role, relatedId: userId } // Specific notifications for user
        ]
      };
    }
    
    console.log('Notification query:', JSON.stringify(query));
    console.log('User ID:', req.user.id);
    console.log('User ID as ObjectId:', userId);
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    console.log('Found notifications:', notifications.length);
    
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });
    
    res.json({
      success: true,
      notifications,
      unreadCount,
      total: await Notification.countDocuments(query)
    });
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark all notifications as read for a role
exports.markAllAsRead = async (req, res) => {
  try {
    const { role } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    let query;
    
    if (role === 'candidate') {
      query = {
        $or: [
          { role, candidateId: { $exists: false }, isRead: false },
          { role, candidateId: userId, isRead: false }
        ]
      };
    } else if (role === 'admin') {
      // For admin, mark all admin notifications as read
      query = { role: 'admin', isRead: false };
    } else {
      query = {
        $or: [
          { role, relatedId: { $exists: false }, isRead: false },
          { role, relatedId: userId, isRead: false }
        ]
      };
    }
    
    await Notification.updateMany(query, { isRead: true });
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create profile completion notification
exports.createProfileCompletionNotification = async (candidateId, completionPercentage) => {
  try {
    let title, message, type;
    
    if (completionPercentage === 100) {
      title = '🎉 Profile Complete!';
      message = 'Congratulations! Your profile is now 100% complete. You\'re ready to apply for jobs!';
      type = 'profile_approved';
    } else if (completionPercentage >= 80) {
      title = '⭐ Almost There!';
      message = `Your profile is ${completionPercentage}% complete. Just a few more steps to go!`;
      type = 'profile_submitted';
    } else if (completionPercentage >= 50) {
      title = '📝 Keep Going!';
      message = `Your profile is ${completionPercentage}% complete. Add more details to increase your chances!`;
      type = 'profile_submitted';
    } else {
      title = '🚀 Start Building!';
      message = `Your profile is ${completionPercentage}% complete. Complete your profile to get noticed by employers!`;
      type = 'profile_submitted';
    }
    
    const notification = await exports.createNotification({
      title,
      message,
      type,
      role: 'candidate',
      candidateId: new mongoose.Types.ObjectId(candidateId),
      createdBy: new mongoose.Types.ObjectId(candidateId)
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating profile completion notification:', error);
    throw error;
  }
};

// Dismiss notification
exports.dismissNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.json({ success: true, message: 'Notification dismissed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Test notification creation
exports.testNotification = async (req, res) => {
  try {
    const notification = await exports.createNotification({
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'job_posted',
      role: 'candidate',
      createdBy: '507f1f77bcf86cd799439011' // dummy ObjectId
    });
    
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};