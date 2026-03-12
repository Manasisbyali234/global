const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Scheduler booking webhook
router.post('/scheduler/booking', webhookController.receiveSchedulerBooking);

module.exports = router;

