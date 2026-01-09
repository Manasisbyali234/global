const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middlewares/auth');

// Create notification
router.post('/', auth(['admin']), notificationController.createNotificationRoute);

// Get notifications by role
router.get('/:role', auth(['admin', 'employer', 'candidate']), notificationController.getNotificationsByRole);

// Mark notification as read
router.patch('/:id/read', auth(['admin', 'employer', 'candidate']), notificationController.markAsRead);

// Mark all notifications as read for a role
router.patch('/:role/read-all', auth(['admin', 'employer', 'candidate']), notificationController.markAllAsRead);

// Dismiss notification
router.put('/:id/dismiss', auth(['admin', 'employer', 'candidate']), notificationController.dismissNotification);

// Test notification creation
router.post('/test', notificationController.testNotification);

module.exports = router;