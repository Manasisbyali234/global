const Razorpay = require('razorpay');
const crypto = require('crypto');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Counter = require('../models/Counter');
const CandidateProfile = require('../models/CandidateProfile');
const PlacementCandidate = require('../models/PlacementCandidate');
const { sendJobApplicationConfirmationEmail } = require('../utils/emailService');
const { emitCreditUpdate } = require('../utils/websocket');

// Initialize Razorpay only when needed
let razorpay = null;
const getRazorpay = () => {
  if (!razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

const APPLICATION_FEE = 129; // Amount in INR
const CREDIT_ROW_FIELDS = [
  'Credits Assigned',
  'credits assigned',
  'CREDITS ASSIGNED',
  'Credits',
  'credits',
  'CREDITS',
  'Credit',
  'credit'
];

const buildPlacementCandidateCreditUpdate = (credits = 0) => {
  const creditValue = Number.isFinite(Number(credits)) ? Number(credits) : 0;
  const update = { creditsAssigned: creditValue };

  CREDIT_ROW_FIELDS.forEach((key) => {
    update[`originalRowData.${key}`] = creditValue;
  });

  return update;
};

const syncPlacementCandidateCreditsForCandidate = async (candidate = null, credits = 0) => {
  if (!candidate?._id || !candidate?.placementId) {
    return { matchedCount: 0, modifiedCount: 0 };
  }

  const filters = [
    { candidateId: candidate._id, placementId: candidate.placementId }
  ];

  if (candidate.fileId) {
    filters.push({
      candidateId: candidate._id,
      placementId: candidate.placementId,
      fileId: candidate.fileId
    });
  }

  return PlacementCandidate.updateMany(
    { $or: filters, status: 'approved' },
    { $set: buildPlacementCandidateCreditUpdate(credits) }
  );
};

const emitCandidateCreditState = (candidate = null) => {
  if (!candidate?._id) return;
  emitCreditUpdate(candidate._id.toString(), Number(candidate.credits) || 0);
};

const getNextReceiptSerial = async () => {
  const counter = await Counter.findOneAndUpdate(
    { key: 'receipt_serial' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

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

    const razorpayInstance = getRazorpay();
    if (!razorpayInstance) {
      return res.status(500).json({ 
        success: false, 
        message: 'Razorpay is not properly configured' 
      });
    }

    const { jobId, amount } = req.body;
    
    const finalAmount = amount || APPLICATION_FEE;

    const options = {
      amount: finalAmount * 100, // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${req.user._id.toString().slice(-6)}`,
    };

    const order = await razorpayInstance.orders.create(options);
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

      const existingPaidApplication = await Application.findOne({
        jobId,
        candidateId: req.user._id,
        paymentStatus: 'paid'
      });

      if (existingPaidApplication) {
        return res.status(400).json({ success: false, message: 'Already applied to this job' });
      }

      const existingUnpaidApplication = await Application.findOne({
        jobId,
        candidateId: req.user._id,
        paymentStatus: { $ne: 'paid' }
      });

      const profile = await CandidateProfile.findOne({ candidateId: req.user._id });
      
      const receiptSerial = existingUnpaidApplication?.receiptSerial || await getNextReceiptSerial();
      const applicationData = {
        jobId,
        candidateId: req.user._id,
        employerId: job.employerId,
        coverLetter,
        paymentStatus: 'paid',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        paymentAmount: APPLICATION_FEE,
        receiptSerial
      };

      if (profile && profile.resume) {
        applicationData.resume = {
          data: profile.resume,
          originalName: profile.resumeFileName,
          mimetype: profile.resumeMimeType
        };
      }
      
      let application;
      if (existingUnpaidApplication) {
        Object.assign(existingUnpaidApplication, applicationData);
        application = await existingUnpaidApplication.save();
      } else {
        application = await Application.create(applicationData);
        // Update job application count only for brand new application
        await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });
      }

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
  let candidate = null;
  let applicationPersisted = false;

  try {
    const { jobId, coverLetter } = req.body;
    const candidateId = req.user._id;

    // 1. Ensure candidate exists before continuing
    const existingCandidate = await Candidate.findById(candidateId).select('_id');
    if (!existingCandidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // 2. Fetch job
    const job = await Job.findById(jobId).populate('employerId', 'companyName');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // 3. Check for existing application
    const existingPaidApplication = await Application.findOne({
      jobId,
      candidateId: candidateId,
      paymentStatus: 'paid'
    });

    if (existingPaidApplication) {
      return res.status(400).json({ success: false, message: 'Already applied to this job' });
    }

    const existingUnpaidApplication = await Application.findOne({
      jobId,
      candidateId: candidateId,
      paymentStatus: { $ne: 'paid' }
    });

    // 4. Deduct one credit atomically so concurrent applies cannot overspend
    candidate = await Candidate.findOneAndUpdate(
      { _id: candidateId, credits: { $gt: 0 } },
      { $inc: { credits: -1 } },
      { new: true }
    );

    if (!candidate) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient credits. Please contact your Placement Dean or pay using Razorpay.'
      });
    }

    // 5. Create application
    const profile = await CandidateProfile.findOne({ candidateId });
    
    const receiptSerial = existingUnpaidApplication?.receiptSerial || await getNextReceiptSerial();
    const applicationData = {
      jobId,
      candidateId,
      employerId: job.employerId,
      coverLetter,
      paymentStatus: 'paid',
      paymentId: `credit_${Date.now()}_${candidateId.toString().slice(-6)}`,
      orderId: `credit_order_${Date.now()}`,
      paymentAmount: 0, // Paid via credits
      paymentCurrency: 'CREDITS',
      receiptSerial
    };

    if (profile && profile.resume) {
      applicationData.resume = {
        data: profile.resume,
        originalName: profile.resumeFileName,
        mimetype: profile.resumeMimeType
      };
    }
    
    let application;
    if (existingUnpaidApplication) {
      Object.assign(existingUnpaidApplication, applicationData);
      application = await existingUnpaidApplication.save();
      applicationPersisted = true;
    } else {
      application = await Application.create(applicationData);
      applicationPersisted = true;
      // 6. Update job application count only for brand new application
      await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });
    }

    await syncPlacementCandidateCreditsForCandidate(candidate, candidate.credits);
    emitCandidateCreditState(candidate);

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
      message: 'Application submitted successfully using credits.Please login to your dashboard to book your interview slots', 
      application,
      remainingCredits: candidate.credits
    });
  } catch (error) {
    if (candidate?._id && !applicationPersisted) {
      try {
        const restoredCandidate = await Candidate.findByIdAndUpdate(
          candidate._id,
          { $inc: { credits: 1 } },
          { new: true }
        );

        if (restoredCandidate) {
          await syncPlacementCandidateCreditsForCandidate(restoredCandidate, restoredCandidate.credits);
        }
      } catch (rollbackError) {
        console.error('Error rolling back deducted credit after failed application:', rollbackError);
      }
    }

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

      if (candidate) {
        await syncPlacementCandidateCreditsForCandidate(candidate, candidate.credits);
        emitCandidateCreditState(candidate);
      }

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
    .populate('employerId', 'companyName brandName')
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

    // Handle credit-based transactions
    if (paymentId.startsWith('credit_')) {
      return res.json({
        success: true,
        payment: {
          id: paymentId,
          method: 'credits',
          amount: 0,
          status: 'captured',
          description: 'Payment made using platform credits'
        }
      });
    }

    const razorpayInstance = getRazorpay();
    if (!razorpayInstance) {
      return res.status(500).json({ 
        success: false, 
        message: 'Razorpay is not properly configured' 
      });
    }

    const payment = await razorpayInstance.payments.fetch(paymentId);
    
    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error fetching Razorpay payment details:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

