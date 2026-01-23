const Razorpay = require('razorpay');
const crypto = require('crypto');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');
const { sendJobApplicationConfirmationEmail } = require('../utils/emailService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const APPLICATION_FEE = 129; // Amount in INR

exports.getPublicKey = (req, res) => {
  res.json({ success: true, publicKey: process.env.RAZORPAY_KEY_ID });
};

exports.createOrder = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_your_key_id' || 
        !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET === 'your_key_secret') {
      return res.status(500).json({ 
        success: false, 
        message: 'Razorpay keys are not configured or are still using placeholders in .env file' 
      });
    }

    const { jobId, amount } = req.body;
    
    const finalAmount = amount || APPLICATION_FEE;

    const options = {
      amount: finalAmount * 100, // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${req.user._id.toString().slice(-6)}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      jobId,
      coverLetter
    } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment verified, now apply for the job
      const job = await Job.findById(jobId).populate('employerId', 'companyName');
      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      const existingApplication = await Application.findOne({
        jobId,
        candidateId: req.user._id
      });

      if (existingApplication) {
        return res.status(400).json({ success: false, message: 'Already applied to this job' });
      }

      const profile = await CandidateProfile.findOne({ candidateId: req.user._id });
      
      const applicationData = {
        jobId,
        candidateId: req.user._id,
        employerId: job.employerId,
        coverLetter,
        paymentStatus: 'paid',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        paymentAmount: APPLICATION_FEE
      };

      if (profile && profile.resume) {
        applicationData.resume = {
          data: profile.resume,
          originalName: profile.resumeFileName,
          mimetype: profile.resumeMimeType
        };
      }
      
      const application = await Application.create(applicationData);

      // Update job application count
      await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

      // Invalidate job cache
      const { cache } = require('../utils/cache');
      cache.delete(`job_${jobId}`);

      // Create notification for employer
      const candidate = await Candidate.findById(req.user._id);
      try {
        const { createNotification } = require('./notificationController');
        await createNotification({
          title: 'New Job Application (Paid)',
          message: `${candidate.name} has applied for ${job.title} position`,
          type: 'application_received',
          role: 'employer',
          relatedId: application._id,
          createdBy: req.user._id
        });
      } catch (notifError) {
        console.error('Employer notification creation failed:', notifError);
      }

      // Send job application confirmation email to candidate
      try {
        let includeAssessment = false;
        if (job.interviewRoundOrder && job.interviewRoundTypes) {
          includeAssessment = job.interviewRoundOrder.some(roundKey => 
            job.interviewRoundTypes[roundKey] === 'assessment'
          );
        }
        
        await sendJobApplicationConfirmationEmail(
          candidate.email,
          candidate.name,
          job.title,
          job.companyName || job.employerId?.companyName || 'Company',
          application.createdAt || new Date(),
          {
            assessmentId: includeAssessment ? job.assessmentId : null,
            assessmentEnabled: includeAssessment,
            assessmentStartDate: includeAssessment ? job.assessmentStartDate : null,
            assessmentEndDate: includeAssessment ? job.assessmentEndDate : null,
            assessmentStartTime: includeAssessment ? job.assessmentStartTime : null,
            assessmentEndTime: includeAssessment ? job.assessmentEndTime : null,
            interviewRoundOrder: job.interviewRoundOrder,
            interviewRoundTypes: job.interviewRoundTypes,
            interviewRoundDetails: job.interviewRoundDetails,
            interviewScheduled: job.interviewScheduled
          }
        );
        console.log(`Job application confirmation email sent to: ${candidate.email}`);
      } catch (emailError) {
        console.error('Failed to send job application confirmation email:', emailError);
      }

      res.json({ success: true, message: 'Payment verified and application submitted', application });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.applyWithCredits = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    const candidateId = req.user._id;

    // 1. Fetch candidate and check credits
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    if (candidate.registrationMethod !== 'placement' && !candidate.placementId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Credit-based applications are only available for candidates registered through Placement Officers' 
      });
    }

    if (candidate.credits <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient credits. Please contact your Placement Officer or pay using Razorpay.' 
      });
    }

    // 2. Fetch job
    const job = await Job.findById(jobId).populate('employerId', 'companyName');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // 3. Check for existing application
    const existingApplication = await Application.findOne({
      jobId,
      candidateId: candidateId
    });

    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'Already applied to this job' });
    }

    // 4. Deduct credit
    candidate.credits -= 1;
    await candidate.save();

    // 5. Create application
    const profile = await CandidateProfile.findOne({ candidateId });
    
    const applicationData = {
      jobId,
      candidateId,
      employerId: job.employerId,
      coverLetter,
      paymentStatus: 'paid',
      paymentId: `credit_${Date.now()}_${candidateId.toString().slice(-6)}`,
      orderId: `credit_order_${Date.now()}`,
      paymentAmount: 0, // Paid via credits
      paymentCurrency: 'CREDITS'
    };

    if (profile && profile.resume) {
      applicationData.resume = {
        data: profile.resume,
        originalName: profile.resumeFileName,
        mimetype: profile.resumeMimeType
      };
    }
    
    const application = await Application.create(applicationData);

    // 6. Update job application count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    // 7. Invalidate job cache
    const { cache } = require('../utils/cache');
    cache.delete(`job_${jobId}`);

    // 8. Create notification for employer
    try {
      const { createNotification } = require('./notificationController');
      await createNotification({
        title: 'New Job Application (Credits)',
        message: `${candidate.name} has applied for ${job.title} position using credits`,
        type: 'application_received',
        role: 'employer',
        relatedId: application._id,
        createdBy: candidateId
      });
    } catch (notifError) {
      console.error('Employer notification creation failed:', notifError);
    }

    // 9. Send confirmation email
    try {
      let includeAssessment = false;
      if (job.interviewRoundOrder && job.interviewRoundTypes) {
        includeAssessment = job.interviewRoundOrder.some(roundKey => 
          job.interviewRoundTypes[roundKey] === 'assessment'
        );
      }
      
      await sendJobApplicationConfirmationEmail(
        candidate.email,
        candidate.name,
        job.title,
        job.companyName || job.employerId?.companyName || 'Company',
        application.createdAt || new Date(),
        {
          assessmentId: includeAssessment ? job.assessmentId : null,
          assessmentEnabled: includeAssessment,
          assessmentStartDate: includeAssessment ? job.assessmentStartDate : null,
          assessmentEndDate: includeAssessment ? job.assessmentEndDate : null,
          assessmentStartTime: includeAssessment ? job.assessmentStartTime : null,
          assessmentEndTime: includeAssessment ? job.assessmentEndTime : null,
          interviewRoundOrder: job.interviewRoundOrder,
          interviewRoundTypes: job.interviewRoundTypes,
          interviewRoundDetails: job.interviewRoundDetails,
          interviewScheduled: job.interviewScheduled
        }
      );
    } catch (emailError) {
      console.error('Failed to send job application confirmation email:', emailError);
    }

    res.json({ 
      success: true, 
      message: 'Application submitted successfully using credits', 
      application,
      remainingCredits: candidate.credits
    });
  } catch (error) {
    console.error('Error applying with credits:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyCreditPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      credits
    } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment verified, update candidate credits
      const candidate = await Candidate.findByIdAndUpdate(
        req.user._id,
        { $inc: { credits: credits } },
        { new: true }
      );

      res.json({ 
        success: true, 
        message: `${credits} credits added successfully`, 
        credits: candidate.credits 
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying credit payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployerTransactions = async (req, res) => {
  try {
    const employerId = req.user._id;
    
    // Find all applications for this employer that have been paid
    const transactions = await Application.find({
      employerId,
      paymentStatus: 'paid'
    })
    .populate('candidateId', 'name email phone')
    .populate('jobId', 'title')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Error fetching employer transactions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCandidateTransactions = async (req, res) => {
  try {
    const candidateId = req.user._id;
    
    // Find all applications for this candidate that have been paid
    const transactions = await Application.find({
      candidateId,
      paymentStatus: 'paid'
    })
    .populate('jobId', 'title')
    .populate('employerId', 'companyName')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Error fetching candidate transactions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    // Find all applications that have been paid
    const transactions = await Application.find({
      paymentStatus: 'paid'
    })
    .populate('candidateId', 'name email phone')
    .populate('jobId', 'title')
    .populate('employerId', 'companyName email phone')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'Payment ID is required' });
    }

    const payment = await razorpay.payments.fetch(paymentId);
    
    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error fetching Razorpay payment details:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

