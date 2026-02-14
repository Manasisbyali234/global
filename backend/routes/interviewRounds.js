const express = require('express');
const router = express.Router();
const interviewRoundController = require('../controllers/interviewRoundController');
const { auth } = require('../middlewares/auth');

// All routes require employer authentication
router.use(auth(['employer']));

// Create interview round
router.post('/', interviewRoundController.createInterviewRound);

// Get all interview rounds for a job
router.get('/job/:jobId', interviewRoundController.getInterviewRoundsByJob);

// Get single interview round
router.get('/:id', interviewRoundController.getInterviewRound);

// Update interview round
router.put('/:id', interviewRoundController.updateInterviewRound);

// Delete interview round
router.delete('/:id', interviewRoundController.deleteInterviewRound);

module.exports = router;
