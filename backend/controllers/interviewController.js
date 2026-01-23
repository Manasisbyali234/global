const InterviewProcess = require('../models/InterviewProcess');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const { normalizeTimeFormat, formatTimeToAMPM } = require('../utils/timeUtils');

// Create or update interview process
const createOrUpdateInterviewProcess = async (req, res) => {
  try {
    const { applicationId } = req.params;
    let { stages, processStatus, finalDecision } = req.body;
    const employerId = req.user.id;

    // Normalize times in stages if they exist
    if (stages && Array.isArray(stages)) {
      stages = stages.map(stage => {
        if (stage.scheduledTime) {
          stage.scheduledTime = normalizeTimeFormat(stage.scheduledTime);
        }
        return stage;
      });
    }

    // Verify application belongs to employer
    const application = await Application.findById(applicationId)
      .populate('jobId')
      .populate('candidateId');
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.jobId.employerId.toString() !== employerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Find existing interview process or create new one
    let interviewProcess = await InterviewProcess.findOne({ applicationId });
    
    if (interviewProcess) {
      // Update existing process
      interviewProcess.stages = stages;
      interviewProcess.processStatus = processStatus || interviewProcess.processStatus;
      interviewProcess.finalDecision = finalDecision || interviewProcess.finalDecision;
      interviewProcess.updateProcessStatus();
    } else {
      // Create new process
      interviewProcess = new InterviewProcess({
        applicationId,
        jobId: application.jobId._id,
        candidateId: application.candidateId._id,
        employerId,
        stages,
        processStatus: processStatus || 'not_started',
        finalDecision: finalDecision || 'pending',
        processStartedAt: new Date()
      });
      interviewProcess.updateProcessStatus();
    }

    await interviewProcess.save();

    res.json({
      success: true,
      message: 'Interview process saved successfully',
      interviewProcess
    });
  } catch (error) {
    console.error('Error creating/updating interview process:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get interview process for application
const getInterviewProcess = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const employerId = req.user.id;

    // Verify application belongs to employer
    const application = await Application.findById(applicationId).populate('jobId');
    if (!application || application.jobId.employerId.toString() !== employerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const interviewProcess = await InterviewProcess.findOne({ applicationId })
      .populate('candidateId', 'name email phone')
      .populate('jobId', 'title')
      .populate('employerId', 'companyName');

    res.json({
      success: true,
      interviewProcess
    });
  } catch (error) {
    console.error('Error fetching interview process:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update stage status
const updateStageStatus = async (req, res) => {
  try {
    const { applicationId, stageIndex } = req.params;
    const { status, feedback, notes } = req.body;
    const employerId = req.user.id;

    const interviewProcess = await InterviewProcess.findOne({ applicationId });
    if (!interviewProcess) {
      return res.status(404).json({ success: false, message: 'Interview process not found' });
    }

    if (interviewProcess.employerId.toString() !== employerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Update stage
    const stage = interviewProcess.stages[stageIndex];
    if (!stage) {
      return res.status(404).json({ success: false, message: 'Stage not found' });
    }

    stage.status = status;
    if (feedback) stage.feedback = feedback;
    if (notes) stage.interviewerNotes = notes;

    // Update status history
    interviewProcess.updateStageStatus(stageIndex, status, notes, employerId, 'Employer');

    await interviewProcess.save();

    res.json({
      success: true,
      message: 'Stage status updated successfully',
      interviewProcess
    });
  } catch (error) {
    console.error('Error updating stage status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Schedule interview stage
const scheduleInterviewStage = async (req, res) => {
  try {
    const { applicationId, stageIndex } = req.params;
    const { 
      scheduledDate, 
      scheduledTime, 
      fromDate, 
      toDate, 
      location, 
      interviewerName, 
      interviewerEmail, 
      meetingLink,
      instructions 
    } = req.body;
    const employerId = req.user.id;

    const interviewProcess = await InterviewProcess.findOne({ applicationId });
    if (!interviewProcess) {
      return res.status(404).json({ success: false, message: 'Interview process not found' });
    }

    if (interviewProcess.employerId.toString() !== employerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const stage = interviewProcess.stages[stageIndex];
    if (!stage) {
      return res.status(404).json({ success: false, message: 'Stage not found' });
    }

    // Update stage scheduling details
    // Combine date and time into full datetime for proper timezone handling
    if (scheduledDate && scheduledTime) {
      const normalizedTime = normalizeTimeFormat(scheduledTime);
      const dateTimeString = `${scheduledDate}T${normalizedTime}`;
      stage.scheduledDate = new Date(dateTimeString);
      stage.scheduledTime = normalizedTime;
    } else if (scheduledDate) {
      stage.scheduledDate = new Date(scheduledDate);
    } else if (scheduledTime) {
      stage.scheduledTime = normalizeTimeFormat(scheduledTime);
    }
    
    if (fromDate) stage.fromDate = new Date(fromDate);
    if (toDate) stage.toDate = new Date(toDate);
    if (location) stage.location = location;
    if (interviewerName) stage.interviewerName = interviewerName;
    if (interviewerEmail) stage.interviewerEmail = interviewerEmail;
    if (meetingLink) stage.meetingLink = meetingLink;
    if (instructions) stage.instructions = instructions;

    // Update stage status to scheduled
    stage.status = 'scheduled';

    await interviewProcess.save();

    res.json({
      success: true,
      message: 'Interview stage scheduled successfully',
      interviewProcess,
      formattedMessage: (() => {
        const stageNames = {
          technical: 'Technical round',
          nonTechnical: 'Non-Technical round', 
          managerial: 'Managerial round',
          final: 'Final round',
          hr: 'HR round',
          assessment: 'Assessment'
        };
        
        const stageName = stageNames[stage.stageType] || stage.stageName || 'Interview round';
        let message = `${stageName} scheduled Successfully!!`;
        
        if (stage.fromDate && stage.toDate) {
          const formatDate = (date) => {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          };
          
          message += ` From: ${formatDate(stage.fromDate)} | To: ${formatDate(stage.toDate)}`;
        } else if (stage.scheduledDate) {
          const day = stage.scheduledDate.getDate().toString().padStart(2, '0');
          const month = (stage.scheduledDate.getMonth() + 1).toString().padStart(2, '0');
          const year = stage.scheduledDate.getFullYear();
          message += ` Date: ${day}/${month}/${year}`;
        }
        
        if (stage.scheduledTime) {
          message += ` | Time: ${formatTimeToAMPM(stage.scheduledTime)}`;
        }
        
        return message;
      })()
    });
  } catch (error) {
    console.error('Error scheduling interview stage:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createOrUpdateInterviewProcess,
  getInterviewProcess,
  updateStageStatus,
  scheduleInterviewStage
};