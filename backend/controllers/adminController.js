const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const Admin = require('../models/Admin');
const SubAdmin = require('../models/SubAdmin');
const Candidate = require('../models/Candidate');
const CandidateProfile = require('../models/CandidateProfile');
const Employer = require('../models/Employer');
const Placement = require('../models/Placement');
const PlacementCandidate = require('../models/PlacementCandidate');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Blog = require('../models/Blog');
const Contact = require('../models/Contact');
const Support = require('../models/Support');
const Testimonial = require('../models/Testimonial');
const FAQ = require('../models/FAQ');
const Partner = require('../models/Partner');
const SiteSettings = require('../models/SiteSettings');
const EmployerProfile = require('../models/EmployerProfile');
const EmployerAdminProfile = require('../models/EmployerAdminProfile');
const Notification = require('../models/Notification');
const InterviewProcess = require('../models/InterviewProcess');
const InterviewRound = require('../models/InterviewRound');
const { base64ToBuffer, generateFilename } = require('../utils/base64Helper');
const { createNotification } = require('./notificationController');
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const { emitCreditUpdate, emitBulkCreditUpdate } = require('../utils/websocket');
const { checkEmailExists, findExistingEmails } = require('../utils/authUtils');
const {
  getRowEmail,
  collectDuplicateValues,
  sanitizeRowsByEmail,
  buildStructuredPlacementRows
} = require('../utils/placementFileUtils');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getWorkbookFromStoredFile = (fileData, fileType) => {
  if (!fileData) {
    throw new Error('File data not available');
  }

  // Newer uploads store a relative file path in /uploads.
  if (typeof fileData === 'string' && fileData.startsWith('/uploads/')) {
    const absolutePath = path.join(__dirname, '..', fileData);
    return XLSX.readFile(absolutePath);
  }

  // Legacy uploads store Base64 data URL.
  const { buffer } = base64ToBuffer(fileData);
  if (fileType && fileType.includes('csv')) {
    const csvData = buffer.toString('utf8');
    return XLSX.read(csvData, { type: 'string' });
  }
  return XLSX.read(buffer, { type: 'buffer' });
};

const formatEmailListForNotification = (emails = [], limit = 5) => {
  const uniqueEmails = [...new Set(emails.filter(Boolean))];
  if (uniqueEmails.length === 0) return '';

  const visibleEmails = uniqueEmails.slice(0, limit).join(', ');
  const remainingCount = uniqueEmails.length - limit;
  return remainingCount > 0 ? `${visibleEmails} and ${remainingCount} more` : visibleEmails;
};

const buildPlacementFileConflictMessage = ({ duplicateEmails = [], existingEmails = [] } = {}) => {
  const messageParts = [];

  if (duplicateEmails.length > 0) {
    messageParts.push(`Duplicate emails found in file: ${formatEmailListForNotification(duplicateEmails)}.`);
  }

  if (existingEmails.length > 0) {
    messageParts.push(`Emails already registered in the system: ${formatEmailListForNotification(existingEmails)}.`);
  }

  if (messageParts.length === 0) {
    return 'This batch was not processed. Please remove the conflicting emails and resubmit the file.';
  }

  messageParts.push('This batch was not processed. Please remove these emails and ask the placement officer to resubmit the file.');
  return messageParts.join(' ');
};

const findPlacementFileEmailConflicts = async (rows = []) => {
  const duplicateEmails = collectDuplicateValues(rows, getRowEmail);
  const existingEmails = await findExistingEmails(rows.map(getRowEmail));

  return {
    duplicateEmails,
    existingEmails,
    hasConflicts: duplicateEmails.length > 0 || existingEmails.length > 0,
    message: buildPlacementFileConflictMessage({ duplicateEmails, existingEmails })
  };
};

const rejectPlacementFileForConflicts = async ({ placementId, fileId, rejectionReason, rejectedBy }) => (
  Placement.findOneAndUpdate(
    { _id: placementId, 'fileHistory._id': fileId },
    {
      $set: {
        'fileHistory.$.status': 'rejected',
        'fileHistory.$.rejectedAt': new Date(),
        'fileHistory.$.rejectedBy': rejectedBy,
        'fileHistory.$.rejectionReason': rejectionReason,
        'fileHistory.$.candidatesCreated': 0
      }
    }
  )
);

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

const checkSubAdminPermission = (userPermissions, requiredPermission) => {
  return userPermissions && userPermissions.includes(requiredPermission);
};

const resolveApplicationType = (application = {}) => {
  const isCreditApplication =
    String(application?.paymentId || '').startsWith('credit_') ||
    String(application?.orderId || '').startsWith('credit_order_') ||
    String(application?.paymentCurrency || '').toUpperCase() === 'CREDITS' ||
    Number(application?.paymentAmount) === 0;

  if (isCreditApplication) {
    return 'credit';
  }

  if (String(application?.paymentStatus || '').toLowerCase() === 'paid') {
    return 'paid';
  }

  return 'unknown';
};

const isOfferNotAccepted = (application = {}) =>
  application?.status === 'rejected' &&
  Array.isArray(application?.statusHistory) &&
  application.statusHistory.some((entry) => entry?.status === 'offer_sent');

// Authentication Controller
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim();

    // First check if it's a regular admin
    let user = await Admin.findByEmail(normalizedEmail);
    let userType = 'admin';
    
    // If not found in Admin, check SubAdmin
    if (!user) {
      const subAdminUser = await SubAdmin.findByEmail(normalizedEmail);
      if (subAdminUser) {
        user = subAdminUser;
        userType = 'sub-admin';
      }
    }
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email' });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    const token = generateToken(user._id, userType);

    const responseData = {
      success: true,
      token,
      [userType === 'admin' ? 'admin' : 'subAdmin']: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(userType === 'sub-admin' && { permissions: user.permissions })
      }
    };

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dashboard Statistics Controller
exports.getDashboardStats = async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments();
    const candidatesWithProfile = await CandidateProfile.countDocuments();
    const approvedEmployers = await Employer.countDocuments({ isApproved: true });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const activeJobs = await Job.countDocuments({
      status: { $in: ['active'] }
    });
    const pendingJobs = await Job.countDocuments({ status: 'pending' });
    const pendingPlacements = await Placement.countDocuments({ status: 'pending' });
    const approvedPlacements = await Placement.countDocuments({ isApproved: true, status: 'active' });
    const totalPlacements = await Placement.countDocuments();
    const hiredCandidates = await Application.countDocuments({ status: 'accepted' });
    const rejectedCandidates = await Application.countDocuments({ status: 'rejected' });

    const stats = {
      totalCandidates,
      completedProfileCandidates: candidatesWithProfile,
      approvedEmployers,
      totalJobs,
      totalApplications,
      activeJobs,
      pendingJobs,
      pendingPlacements,
      approvedPlacements,
      totalPlacements,
      hiredCandidates,
      rejectedCandidates
    };

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Jobs Posted overview for admin dashboard
exports.getJobsPosted = async (req, res) => {
  try {
    const jobs = await Job.find({ status: { $ne: 'draft' } })
      .populate('employerId', 'companyName name employerType')
      .select('_id title status createdAt lastDateOfApplication offerLetterDate companyName employerId')
      .sort({ createdAt: -1 })
      .lean();

    const jobIds = jobs.map(j => j._id);
    const offerSentCounts = jobIds.length
      ? await Application.aggregate([
          {
            $match: {
              jobId: { $in: jobIds },
              $or: [
                { status: 'offer_sent' },
                {
                  statusHistory: {
                    $elemMatch: { status: 'offer_sent' }
                  }
                }
              ]
            }
          },
          { $group: { _id: '$jobId', count: { $sum: 1 } } }
        ])
      : [];

    const offerSentMap = new Map(offerSentCounts.map(item => [String(item._id), item.count]));

    const data = jobs.map(job => ({
      jobId: job._id,
      title: job.title,
      companyName: job.companyName || job.employerId?.companyName || job.employerId?.name || 'N/A',
      employerType: job.employerId?.employerType || 'company',
      postedDate: job.createdAt,
      lastDateOfApplication: job.lastDateOfApplication || null,
      offerLetterDate: job.offerLetterDate || null,
      offerLetterSentCount: offerSentMap.get(String(job._id)) || 0,
      status: job.status
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer overview for admin dashboard
exports.getEmployerOverview = async (req, res) => {
  try {
    const [employers, jobsByEmployer, applicationsByEmployer] = await Promise.all([
      Employer.find({ isApproved: true }).select('_id companyName name employerType createdAt').lean(),
      Job.aggregate([
        {
          $match: {
            status: { $ne: 'draft' }
          }
        },
        {
          $group: {
            _id: '$employerId',
            jobsCount: { $sum: 1 },
            activeJobsCount: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
          }
        }
      ]),
      Application.aggregate([
        {
          $lookup: {
            from: 'jobs',
            localField: 'jobId',
            foreignField: '_id',
            as: 'job'
          }
        },
        { $unwind: '$job' },
        {
          $match: {
            'job.status': { $ne: 'draft' }
          }
        },
        {
          $group: {
            _id: '$job.employerId',
            applicationsCount: { $sum: 1 },
            acceptedOfferCount: {
              $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
            },
            rejectedOfferCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$status', 'rejected'] },
                      {
                        $gt: [
                          {
                            $size: {
                              $filter: {
                                input: { $ifNull: ['$statusHistory', []] },
                                as: 'h',
                                cond: { $eq: ['$$h.status', 'offer_sent'] }
                              }
                            }
                          },
                          0
                        ]
                      }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    const applicationsCountMap = new Map(applicationsByEmployer.map(item => [String(item._id), item]));

    const data = employers
      .map((employer) => {
        const appData = applicationsCountMap.get(String(employer._id)) || {};
        const jobData = jobsByEmployer.find(j => String(j._id) === String(employer._id)) || {};
        return {
          employerId: employer._id,
          employerName: employer.companyName || employer.name || 'N/A',
          employerType: employer.employerType || 'company',
          createdAt: employer.createdAt,
          jobsCount: jobData.jobsCount || 0,
          activeJobsCount: jobData.activeJobsCount || 0,
          applicationsCount: appData.applicationsCount || 0,
          acceptedOfferCount: appData.acceptedOfferCount || 0,
          rejectedOfferCount: appData.rejectedOfferCount || 0
        };
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployerOverviewJobs = async (req, res) => {
  try {
    const { employerId } = req.params;
    const employer = await Employer.findOne({ _id: employerId, isApproved: true }).select('_id companyName name employerType').lean();

    if (!employer) {
      return res.status(404).json({ success: false, message: 'Approved employer not found' });
    }

    const jobs = await Job.find({
      employerId,
      status: { $ne: 'draft' }
    })
      .select('_id title status createdAt lastDateOfApplication offerLetterDate companyName')
      .sort({ createdAt: -1 })
      .lean();

    const jobIds = jobs.map(job => job._id);
    const applications = jobIds.length
      ? await Application.find({ jobId: { $in: jobIds } })
          .select('jobId status statusHistory paymentStatus paymentId orderId paymentAmount paymentCurrency')
          .lean()
      : [];

    const applicationsByJobMap = applications.reduce((acc, application) => {
      const jobKey = String(application.jobId);
      const currentCounts = acc.get(jobKey) || {
        applicationsCount: 0,
        paidApplicationsCount: 0,
        creditApplicationsCount: 0,
        acceptedOfferCount: 0,
        notAcceptedOfferCount: 0,
        rejectedApplicationsCount: 0
      };

      currentCounts.applicationsCount += 1;

      const applicationType = resolveApplicationType(application);
      if (applicationType === 'paid') {
        currentCounts.paidApplicationsCount += 1;
      } else if (applicationType === 'credit') {
        currentCounts.creditApplicationsCount += 1;
      }

      if (application.status === 'accepted') {
        currentCounts.acceptedOfferCount += 1;
      } else if (isOfferNotAccepted(application)) {
        currentCounts.notAcceptedOfferCount += 1;
      } else if (application.status === 'rejected') {
        currentCounts.rejectedApplicationsCount += 1;
      }

      acc.set(jobKey, currentCounts);
      return acc;
    }, new Map());

    const data = jobs.map((job) => ({
      jobId: job._id,
      title: job.title,
      companyName: job.companyName || employer.companyName || employer.name || 'N/A',
      status: job.status,
      createdAt: job.createdAt,
      lastDateOfApplication: job.lastDateOfApplication,
      offerLetterDate: job.offerLetterDate,
      applicationsCount: applicationsByJobMap.get(String(job._id))?.applicationsCount || 0,
      paidApplicationsCount: applicationsByJobMap.get(String(job._id))?.paidApplicationsCount || 0,
      creditApplicationsCount: applicationsByJobMap.get(String(job._id))?.creditApplicationsCount || 0,
      acceptedOfferCount: applicationsByJobMap.get(String(job._id))?.acceptedOfferCount || 0,
      notAcceptedOfferCount: applicationsByJobMap.get(String(job._id))?.notAcceptedOfferCount || 0,
      rejectedApplicationsCount: applicationsByJobMap.get(String(job._id))?.rejectedApplicationsCount || 0
    }));

    res.json({
      success: true,
      employer: {
        employerId: employer._id,
        employerName: employer.companyName || employer.name || 'N/A',
        employerType: employer.employerType || 'company'
      },
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobApplicantsForOverview = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId).select('_id title').lean();

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const applications = await Application.find({ jobId })
      .populate('candidateId', 'name email')
      .populate('jobId', 'interviewRoundOrder interviewRoundTypes interviewRoundDetails')
      .select('candidateId applicantName applicantEmail status appliedAt isGuestApplication interviewProcesses interviewProcessId processRemarks jobId paymentStatus paymentId orderId paymentAmount paymentCurrency')
      .sort({ appliedAt: -1 })
      .lean();

    const applicationIds = applications.map((application) => application._id);
    const [interviewProcesses, interviewRounds] = await Promise.all([
      applicationIds.length
        ? InterviewProcess.find({ applicationId: { $in: applicationIds } })
            .select('applicationId stages')
            .lean()
        : [],
      InterviewRound.find({ jobId })
        .select('key name roundType fromdate todate startTime endTime scheduleObject formDataObject subStages')
        .lean()
    ]);

    const interviewProcessMap = new Map(
      interviewProcesses.map((process) => [String(process.applicationId), process])
    );

    const normalizeKey = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const formatTimeRange = (startTime, endTime) => {
      if (startTime && endTime) return `${startTime} - ${endTime}`;
      return startTime || endTime || '';
    };
    const resolveRemark = (round, remarksMap = {}) => {
      if (!remarksMap || typeof remarksMap !== 'object') return '';
      const candidates = [round?.id, round?._id, round?.type, round?.name].filter(Boolean);
      for (const key of candidates) {
        const direct = remarksMap[key];
        if (typeof direct === 'string' && direct.trim()) return direct;
      }
      const normalizedCandidates = candidates.map(normalizeKey).filter(Boolean);
      for (const [key, value] of Object.entries(remarksMap)) {
        if (typeof value !== 'string' || !value.trim()) continue;
        const normalizedKey = normalizeKey(key);
        if (normalizedCandidates.some((candidate) => candidate && normalizedKey.includes(candidate))) {
          return value;
        }
      }
      return '';
    };

    const findNestedTimeWindow = (value) => {
      if (!value) return null;

      if (Array.isArray(value)) {
        for (const item of value) {
          const found = findNestedTimeWindow(item);
          if (found) return found;
        }
        return null;
      }

      if (typeof value === 'object') {
        const directStart =
          value.startTime ||
          value.fromTime ||
          value.start ||
          value.from ||
          value?.interviewTime?.start;
        const directEnd =
          value.endTime ||
          value.toTime ||
          value.end ||
          value.to ||
          value?.interviewTime?.end;

        if (directStart || directEnd) {
          return {
            startTime: directStart || '',
            endTime: directEnd || ''
          };
        }

        const nestedKeys = [
          'subStages',
          'subStagesArray',
          'days',
          'daysArray',
          'schedulesArray',
          'daySchedulesArray',
          'roomsArray',
          'scheduleObject',
          'schedule',
          'schedules',
          'daySchedules',
          'rooms'
        ];

        for (const key of nestedKeys) {
          if (value[key]) {
            const found = findNestedTimeWindow(value[key]);
            if (found) return found;
          }
        }
      }

      return null;
    };

    const buildRoundLookup = (roundDocs = []) => {
      const lookup = new Map();
      roundDocs.forEach((round) => {
        const aliases = [round.key, round.roundType, round.name, round._id].filter(Boolean);
        aliases.forEach((alias) => {
          lookup.set(String(alias), round);
          lookup.set(normalizeKey(alias), round);
        });
      });
      return lookup;
    };

    const roundLookup = buildRoundLookup(interviewRounds);

    const getRoundDetails = (jobDetails, identifiers = []) => {
      const detailEntries = Object.entries(jobDetails?.interviewRoundDetails || {});
      let matchedConfig = null;

      for (const identifier of identifiers.filter(Boolean)) {
        if (jobDetails?.interviewRoundDetails?.[identifier]) {
          matchedConfig = jobDetails.interviewRoundDetails[identifier];
          break;
        }
      }

      if (!matchedConfig) {
        const normalizedIdentifiers = identifiers.map(normalizeKey).filter(Boolean);
        const matchedEntry = detailEntries.find(([key]) =>
          normalizedIdentifiers.includes(normalizeKey(key))
        );
        matchedConfig = matchedEntry ? matchedEntry[1] : null;
      }

      let matchedRound = null;
      for (const identifier of identifiers.filter(Boolean)) {
        matchedRound = roundLookup.get(String(identifier)) || roundLookup.get(normalizeKey(identifier));
        if (matchedRound) break;
      }

      const nestedTime = findNestedTimeWindow(matchedConfig);
      const startTime = matchedRound?.startTime || matchedConfig?.startTime || nestedTime?.startTime || '';
      const endTime = matchedRound?.endTime || matchedConfig?.endTime || nestedTime?.endTime || '';

      return {
        scheduledDate:
          matchedConfig?.scheduledDate ||
          matchedRound?.fromdate ||
          matchedConfig?.fromDate ||
          matchedConfig?.date ||
          matchedConfig?.fromdate ||
          null,
        fromDate:
          matchedRound?.fromdate ||
          matchedConfig?.fromDate ||
          matchedConfig?.date ||
          matchedConfig?.fromdate ||
          null,
        toDate:
          matchedRound?.todate ||
          matchedConfig?.toDate ||
          matchedConfig?.todate ||
          null,
        scheduledTime:
          matchedConfig?.time ||
          formatTimeRange(startTime, endTime),
        startTime,
        endTime
      };
    };

    const buildInterviewRounds = (application) => {
      const interviewProcess = interviewProcessMap.get(String(application._id));
      if (interviewProcess?.stages?.length) {
        return interviewProcess.stages.map((stage) => ({
          id: stage._id,
          name: stage.stageName,
          type: stage.stageType,
          status: stage.status || 'pending',
          remark: resolveRemark({ id: stage._id, name: stage.stageName, type: stage.stageType }, application.processRemarks),
          scheduledDate: stage.scheduledDate || stage.fromDate || null,
          fromDate: stage.fromDate || stage.scheduledDate || null,
          toDate: stage.toDate || null,
          scheduledTime: stage.scheduledTime || '',
          startTime: '',
          endTime: ''
        }));
      }
      if (Array.isArray(application?.interviewProcesses) && application.interviewProcesses.length) {
        return application.interviewProcesses.map((process) => {
          const roundDetails = getRoundDetails(application?.jobId, [
            process.id,
            process._id,
            process.type,
            process.name
          ]);
          return {
          id: process.id || process._id,
          name: process.name,
          type: process.type,
          status: process.status || 'pending',
          remark: resolveRemark(process, application.processRemarks),
          ...roundDetails
        };
        });
      }
      const job = application?.jobId;
      if (job?.interviewRoundOrder?.length) {
        const roundNames = {
          oneOnOne: 'One-to-One',
          oneOnOnePanel: 'One-on-One / Panel',
          panel: 'Panel',
          group: 'Group',
          technical: 'Technical',
          managerial: 'Managerial Round',
          hr: 'HR Round',
          situational: 'Situational / Behavioral',
          others: 'Others - Specify.',
          assessment: 'Assessment'
        };
        return job.interviewRoundOrder.map((roundKey) => {
          const roundType = job.interviewRoundTypes?.[roundKey] || roundKey;
          const roundDetails = job.interviewRoundDetails?.[roundKey];
          let displayName = roundNames[roundType] || roundType;
          if (roundType === 'others' && roundDetails?.customType) {
            displayName = roundDetails.customType;
          }
          const scheduleDetails = getRoundDetails(job, [roundKey, roundType, displayName]);
          const remark = resolveRemark(
            { id: roundKey, name: displayName, type: roundType },
            application.processRemarks
          );
          return {
            id: roundKey,
            name: displayName,
            type: roundType,
            status: 'pending',
            remark,
            ...scheduleDetails
          };
        });
      }
      return [];
    };

    const data = applications.map((application) => {
      const interviewRounds = buildInterviewRounds(application);
      const applicationType = resolveApplicationType(application);
      return {
        applicationId: application._id,
        applicantName:
          application.candidateId?.name ||
          application.applicantName ||
          'N/A',
        applicantEmail:
          application.candidateId?.email ||
          application.applicantEmail ||
          'N/A',
        status: application.status || 'pending',
        appliedAt: application.appliedAt,
        isGuestApplication: !!application.isGuestApplication,
        applicationType,
        interviewRoundsCount: interviewRounds.length,
        interviewRounds
      };
    });

    res.json({
      success: true,
      job: {
        jobId: job._id,
        title: job.title
      },
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Chart Data Controller
exports.getChartData = async (req, res) => {
  try {
    const monthsToShow = 6;
    const now = new Date();
    const chartLabels = [];
    const monthlyDataMap = new Map();

    // Generate labels and initialize map for the last 6 months
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // MongoDB months are 1-indexed
      const key = `${year}-${month}`;
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      chartLabels.push({ year, month, label: `${monthNames[month - 1]} ${year}` });
      
      monthlyDataMap.set(key, { applications: 0, employers: 0 });
    }

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - (monthsToShow - 1), 1);

    const applications = await Application.aggregate([
      { 
        $match: { 
          $or: [
            { createdAt: { $gte: sixMonthsAgo } },
            { appliedAt: { $gte: sixMonthsAgo } }
          ]
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: { $ifNull: ['$appliedAt', '$createdAt'] } },
            month: { $month: { $ifNull: ['$appliedAt', '$createdAt'] } }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const employers = await Employer.aggregate([
      { 
        $match: { 
          $or: [
            { createdAt: { $gte: sixMonthsAgo } },
            { profileSubmittedAt: { $gte: sixMonthsAgo } }
          ]
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: { $ifNull: ['$createdAt', '$profileSubmittedAt'] } },
            month: { $month: { $ifNull: ['$createdAt', '$profileSubmittedAt'] } }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Populate data map with robust key matching
    applications.forEach(item => {
      if (item._id && item._id.year && item._id.month) {
        const key = `${item._id.year}-${item._id.month}`;
        if (monthlyDataMap.has(key)) {
          monthlyDataMap.get(key).applications = item.count || 0;
        }
      }
    });

    employers.forEach(item => {
      if (item._id && item._id.year && item._id.month) {
        const key = `${item._id.year}-${item._id.month}`;
        if (monthlyDataMap.has(key)) {
          monthlyDataMap.get(key).employers = item.count || 0;
        }
      }
    });

    // Convert map back to sorted array based on chartLabels
    const formattedMonthlyData = chartLabels.map(item => {
      const data = monthlyDataMap.get(`${item.year}-${item.month}`);
      return {
        label: item.label,
        applications: data.applications,
        employers: data.employers
      };
    });

    // Get top employers by job count
    const topEmployers = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'employers',
          localField: 'employerId',
          foreignField: '_id',
          as: 'employer'
        }
      },
      { $unwind: '$employer' },
      {
        $group: {
          _id: '$employerId',
          companyName: { $first: '$employer.companyName' },
          jobCount: { $sum: 1 }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      chartData: {
        monthlyData: formattedMonthlyData,
        topEmployers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User Management Controllers
exports.getUsers = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    
    let users;
    if (type === 'candidates') {
      const candidates = await Candidate.find().select('-password')
        .limit(limit * 1).skip((page - 1) * limit)
        .lean();
      
      const candidateIds = candidates.map(c => c._id);
      const profiles = await CandidateProfile.find({ candidateId: { $in: candidateIds } }).lean();
      
      const profileMap = new Map();
      profiles.forEach(profile => {
        profileMap.set(profile.candidateId.toString(), profile);
      });
      
      const { calculateProfileCompletionWithDetails } = require('../utils/profileCompletion');
      const enhancedCandidates = candidates.map((candidate) => {
        const profile = profileMap.get(candidate._id.toString());
        const profileCompletion = calculateProfileCompletionWithDetails(profile);
        
        return {
          ...candidate,
          hasProfile: !!profile,
          isProfileComplete: profileCompletion.percentage === 100,
          profileCompletionPercentage: profileCompletion.percentage
        };
      });
      users = enhancedCandidates;
    } else if (type === 'employers') {
      users = await Employer.find().select('-password')
        .limit(limit * 1).skip((page - 1) * limit)
        .lean();
    } else {
      const candidates = await Candidate.find().select('-password').limit(5).lean();
      const employers = await Employer.find().select('-password').limit(5).lean();
      users = { candidates, employers };
    }

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    
    if (userType === 'candidate') {
      await Candidate.findByIdAndDelete(userId);
    } else if (userType === 'employer') {
      await Employer.findByIdAndDelete(userId);
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    
    let user;
    if (userType === 'candidate') {
      user = await Candidate.findByIdAndUpdate(userId, req.body, { new: true }).select('-password');
    } else if (userType === 'employer') {
      user = await Employer.findByIdAndUpdate(userId, req.body, { new: true }).select('-password');
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Job Management Controllers
exports.approveJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.jobId,
      { status: 'active' },
      { new: true }
    );

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.jobId,
      { status: 'closed' },
      { new: true }
    );

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const jobs = await Job.find(query)
      .populate('employerId', 'companyName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllEmployers = async (req, res) => {
  try {
    const { status, page = 1, limit = 50, approvalStatus } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (approvalStatus === 'pending') {
      query.isApproved = false;
    }
    if (approvalStatus === 'approved') query.isApproved = true;

    const employers = await Employer.find(query)
      .select('-password')
      .populate('approvedBy', 'name username email role firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const employerIds = employers.map(e => e._id);
    const profiles = await EmployerProfile.find({ employerId: { $in: employerIds } }).lean();
    
    const profileMap = new Map();
    profiles.forEach(profile => {
      profileMap.set(profile.employerId.toString(), profile);
    });

    const requiredFields = ['companyName', 'description', 'location', 'phone', 'email'];
    const employersWithProfile = employers.map(employer => {
      const profile = profileMap.get(employer._id.toString());
      const isProfileComplete = profile && requiredFields.every(field => profile[field]);
      const authorizationLetters = Array.isArray(profile?.authorizationLetters) ? profile.authorizationLetters : [];
      const normalizeCompanyName = (value) => String(value || '').trim().toLowerCase();
      const isConsultantEmployer = ['consultancy', 'consultant'].includes(
        String(profile?.employerCategory || employer?.employerType || '').trim().toLowerCase()
      );
      const approvedAuthorizationCompanies = new Set(
        authorizationLetters
          .filter((letter) => letter?.status === 'approved')
          .map((letter) => normalizeCompanyName(letter?.companyName || profile?.companyName || employer?.companyName))
          .filter(Boolean)
      );
      const newConsultantCompanies = isConsultantEmployer && approvedAuthorizationCompanies.size > 0
        ? Array.from(new Set(
            authorizationLetters
              .filter((letter) => letter?.status !== 'approved')
              .map((letter) => String(letter?.companyName || '').trim())
              .filter((companyName) => {
                const companyKey = normalizeCompanyName(companyName);
                return companyKey && !approvedAuthorizationCompanies.has(companyKey);
              })
          ))
        : [];
      
      return {
        ...employer,
        hasProfile: !!profile,
        isProfileComplete,
        hiringCompanies: Array.isArray(profile?.hiringCompanies) ? profile.hiringCompanies : [],
        authorizationLetters,
        hasNewConsultantCompanies: newConsultantCompanies.length > 0,
        newConsultantCompanies,
        profileCompletionPercentage: profile 
          ? Math.round((requiredFields.filter(field => profile[field]).length / requiredFields.length) * 100)
          : 0
      };
    });

    res.json({ success: true, data: employersWithProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCandidates = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const candidates = await Candidate.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const candidateIds = candidates.map(c => c._id);
    const profiles = await CandidateProfile.find({ candidateId: { $in: candidateIds } }).lean();
    
    const profileMap = new Map();
    profiles.forEach(profile => {
      profileMap.set(profile.candidateId.toString(), profile);
    });

    const { calculateProfileCompletionWithDetails } = require('../utils/profileCompletion');
    const enhancedCandidates = candidates.map((candidate) => {
      const profile = profileMap.get(candidate._id.toString());
      const profileCompletion = calculateProfileCompletionWithDetails(profile);
      
      return {
        ...candidate,
        hasProfile: !!profile,
        isProfileComplete: profileCompletion.percentage === 100,
        profileCompletionPercentage: profileCompletion.percentage
      };
    });

    res.json({ success: true, data: enhancedCandidates, candidates: enhancedCandidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEmployerStatus = async (req, res) => {
  try {
    const { status, isApproved } = req.body;

    // Check if employer has completed their profile before approving
    if (isApproved === true) {
      const profile = await EmployerProfile.findOne({ employerId: req.params.id });
      
      if (!profile) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot approve employer. Company profile not found. Employer must complete their profile first.' 
        });
      }

      // Check required profile fields
      const requiredFields = ['companyName', 'description', 'location', 'phone', 'email'];
      const missingFields = requiredFields.filter(field => !profile[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot approve employer. Company profile is incomplete. Missing fields: ${missingFields.join(', ')}`,
          missingFields
        });
      }
    }

    const updateData = {};

    // Normalize and validate status to only 'active' | 'inactive'
    if (status !== undefined) {
      const normalized = String(status).toLowerCase();
      if (normalized === 'approved') {
        updateData.status = 'active';
      } else if (normalized === 'rejected') {
        updateData.status = 'inactive';
      } else if (normalized === 'active' || normalized === 'inactive') {
        updateData.status = normalized;
      }
      // Any other status values are ignored to prevent invalid writes
    }

    // Update approval flag
    if (isApproved !== undefined) {
      updateData.isApproved = !!isApproved;
      if (isApproved) {
        updateData.approvedBy = new mongoose.Types.ObjectId(req.user.id);
        updateData.approvedByModel = (req.user.role === 'admin' || req.user.role === 'super-admin') ? 'Admin' : 'SubAdmin';
      }
    }

    // If approving and no explicit status provided, ensure account is active
    if (updateData.isApproved === true && updateData.status === undefined) {
      updateData.status = 'active';
    }
    
    const employer = await Employer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }

    // Send approval email and create notification
    if (isApproved !== undefined) {
      try {
        if (isApproved) {
          const employerName = employer.name || employer.firstName || employer.companyName || 'Employer';
          
          // Send different email based on employer type
          if (employer.employerType === 'consultant') {
            const { sendConsultantApprovalEmail } = require('../utils/emailService');
            await sendConsultantApprovalEmail(employer.email, employerName, employer.companyName);
          } else {
            const { sendEmployerAccountApprovalEmail } = require('../utils/emailService');
            await sendEmployerAccountApprovalEmail(employer.email, employerName, employer.companyName);
          }
        }
        
        const notificationData = {
          title: isApproved ? 'Profile Approved - You Can Now Post Jobs!' : 'Profile Rejected',
          message: isApproved 
            ? 'Congratulations! Your company profile has been approved by admin. You can now post jobs and start hiring candidates.' 
            : 'Your company profile has been rejected by admin. Please contact support for more information or resubmit your profile with the required corrections.',
          type: isApproved ? 'profile_approved' : 'profile_rejected',
          role: 'employer',
          relatedId: employer._id,
          createdBy: req.user.id
        };
        
        await createNotification(notificationData);
      } catch (notifError) {
        console.error('Failed to send approval email/notification:', notifError);
      }
    }

    res.json({ success: true, employer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteEmployer = async (req, res) => {
  try {
    const employer = await Employer.findByIdAndDelete(req.params.id);
    
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }

    res.json({ success: true, message: 'Employer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployerProfile = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOne({ employerId: req.params.id })
      .populate('employerId', 'name email phone companyName');
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEmployerProfile = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.params.id },
      req.body,
      { new: true }
    ).populate('employerId', 'name email phone companyName');
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    // Check if any document verification status was updated and create notification
    try {
      const verificationFields = {
        panCardVerified: 'PAN Card',
        cinVerified: 'CIN Document',
        gstVerified: 'GST Certificate',
        incorporationVerified: 'Certificate of Incorporation',
        authorizationVerified: 'Authorization Letter',
        companyIdCardVerified: 'Company ID Card'
      };

      for (const [field, documentName] of Object.entries(verificationFields)) {
        if (req.body[field] && (req.body[field] === 'approved' || req.body[field] === 'rejected')) {
          const isApproved = req.body[field] === 'approved';
          const notificationData = {
            title: `${documentName} ${isApproved ? 'Approved' : 'Rejected'}`,
            message: `Your ${documentName} has been ${req.body[field]} by admin. ${isApproved ? 'You can now proceed.' : 'Please resubmit the document with correct information.'}`,
            type: isApproved ? 'document_approved' : 'document_rejected',
            role: 'employer',
            relatedId: new mongoose.Types.ObjectId(req.params.id),
            createdBy: new mongoose.Types.ObjectId(req.user.id)
          };
          
          console.log('Creating notification:', notificationData);
          const createdNotification = await createNotification(notificationData);
          console.log('Notification created:', createdNotification);
        }
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue execution even if notification fails
    }

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper to get MIME type from file extension
const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

// Download Base64 document
exports.downloadDocument = async (req, res) => {
  try {
    const { employerId, documentType } = req.params;
    
    const profile = await EmployerProfile.findOne({ employerId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const documentData = profile[documentType];
    if (!documentData) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Check if it's a file path or base64 data
    const isFilePath = typeof documentData === 'string' && 
                      (documentData.startsWith('/') || documentData.startsWith('uploads') || documentData.includes('\\') || documentData.includes('/')) &&
                      !documentData.startsWith('data:');

    if (isFilePath) {
      let fullPath = documentData;
      if (documentData.startsWith('/uploads')) {
        fullPath = path.join(__dirname, '..', documentData);
      } else if (!path.isAbsolute(documentData)) {
        fullPath = path.join(__dirname, '..', documentData);
      }

      if (fs.existsSync(fullPath)) {
        const mimeType = getMimeType(fullPath);
        const filename = path.basename(fullPath);
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return fs.createReadStream(fullPath).pipe(res);
      }
    }

    const { buffer, mimeType, extension } = base64ToBuffer(documentData);
    const filename = generateFilename(documentType, extension);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// View Base64 document (for displaying images without downloading)
exports.viewDocument = async (req, res) => {
  try {
    const { employerId, documentType } = req.params;
    
    console.log(`Viewing document: ${documentType} for employer: ${employerId}`);
    
    const profile = await EmployerProfile.findOne({ employerId });
    if (!profile) {
      console.log('Profile not found for employer:', employerId);
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    let documentData = profile[documentType];
    if (!documentData) {
      console.log(`Document ${documentType} not found in profile`);
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Check if it's a file path or base64 data
    const isFilePath = typeof documentData === 'string' && 
                      (documentData.startsWith('/') || documentData.startsWith('uploads') || documentData.includes('\\') || documentData.includes('/')) &&
                      !documentData.startsWith('data:');

    if (isFilePath) {
      let fullPath = documentData;
      if (documentData.startsWith('/uploads')) {
        fullPath = path.join(__dirname, '..', documentData);
      } else if (!path.isAbsolute(documentData)) {
        fullPath = path.join(__dirname, '..', documentData);
      }

      if (fs.existsSync(fullPath)) {
        const mimeType = getMimeType(fullPath);
        const stats = fs.statSync(fullPath);

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        if (mimeType === 'application/pdf') {
          res.setHeader('Content-Disposition', `inline; filename="${path.basename(fullPath)}"`);
          res.setHeader('X-Content-Type-Options', 'nosniff');
        }
        
        return fs.createReadStream(fullPath).pipe(res);
      }
    }

    console.log(`Document found, data length: ${documentData.length}`);
    console.log(`Document starts with: ${documentData.substring(0, 50)}`);

    let buffer, mimeType;
    
    try {
      if (documentData.startsWith('data:')) {
        const result = base64ToBuffer(documentData);
        buffer = result.buffer;
        mimeType = result.mimeType;
        console.log(`Processed with base64ToBuffer, mimeType: ${mimeType}`);
      } else {
        // Handle legacy base64 without data URL prefix
        buffer = Buffer.from(documentData, 'base64');
        mimeType = 'image/jpeg'; // Default fallback
        console.log('Processed as legacy base64, using default mimeType: image/jpeg');
      }

      console.log(`Buffer created, size: ${buffer.length} bytes`);

      // Validate buffer content
      if (buffer.length === 0) {
        console.error('Buffer is empty');
        return res.status(400).json({ 
          success: false, 
          message: 'Document data is empty' 
        });
      }

      // Set appropriate headers with CORS support
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      // For PDF files, add specific headers to ensure proper display
      if (mimeType === 'application/pdf') {
        res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
        res.setHeader('X-Content-Type-Options', 'nosniff');
      }
      
      console.log('Sending document response');
      res.send(buffer);
    } catch (bufferError) {
      console.error('Error processing document buffer:', bufferError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error processing document data',
        error: bufferError.message 
      });
    }
  } catch (error) {
    console.error('Error in viewDocument:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Content Management Controllers
exports.createContent = async (req, res) => {
  try {
    const { type } = req.params;
    let content;

    switch (type) {
      case 'blog':
        content = await Blog.create({ ...req.body, author: req.user._id });
        break;
      case 'testimonial':
        content = await Testimonial.create(req.body);
        break;
      case 'faq':
        content = await FAQ.create(req.body);
        break;
      case 'partner':
        content = await Partner.create(req.body);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid content type' });
    }

    res.status(201).json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const { type, contentId } = req.params;
    let content;

    switch (type) {
      case 'blog':
        content = await Blog.findByIdAndUpdate(contentId, req.body, { new: true });
        break;
      case 'testimonial':
        content = await Testimonial.findByIdAndUpdate(contentId, req.body, { new: true });
        break;
      case 'faq':
        content = await FAQ.findByIdAndUpdate(contentId, req.body, { new: true });
        break;
      case 'partner':
        content = await Partner.findByIdAndUpdate(contentId, req.body, { new: true });
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid content type' });
    }

    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const { type, contentId } = req.params;

    switch (type) {
      case 'blog':
        await Blog.findByIdAndDelete(contentId);
        break;
      case 'testimonial':
        await Testimonial.findByIdAndDelete(contentId);
        break;
      case 'faq':
        await FAQ.findByIdAndDelete(contentId);
        break;
      case 'partner':
        await Partner.findByIdAndDelete(contentId);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid content type' });
    }

    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Contact Form Management Controllers
exports.getContactForms = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteContactForm = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.contactId);
    res.json({ success: true, message: 'Contact form deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Site Settings Controllers
exports.updateSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true }
    );

    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = status ? { status } : {};
    
    const applications = await Application.find(filter)
      .populate('candidateId', 'name email phone')
      .populate('employerId', 'companyName email')
      .populate('jobId', 'title location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Application.countDocuments(filter);

    res.json({ success: true, data: applications, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRegisteredCandidates = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const candidates = await Candidate.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const candidateIds = candidates.map(c => c._id);

    const [profiles, applicationAggregates] = await Promise.all([
      CandidateProfile.find({ candidateId: { $in: candidateIds } }).lean(),
      Application.aggregate([
        { $match: { candidateId: { $in: candidateIds } } },
        {
          $group: {
            _id: '$candidateId',
            totalApplications: { $sum: 1 },
            totalPaidAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$paymentStatus', 'paid'] },
                  { $ifNull: ['$paymentAmount', 129] },
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    const profileMap = new Map();
    profiles.forEach(profile => {
      profileMap.set(profile.candidateId.toString(), profile);
    });

    const appMap = new Map();
    applicationAggregates.forEach(app => {
      appMap.set(app._id.toString(), app);
    });

    const { calculateProfileCompletionWithDetails } = require('../utils/profileCompletion');
    const enhancedCandidates = candidates.map(candidate => {
      const profile = profileMap.get(candidate._id.toString());
      const appData = appMap.get(candidate._id.toString()) || { totalApplications: 0, totalPaidAmount: 0 };
      const profileCompletion = calculateProfileCompletionWithDetails(profile);

      return {
        ...candidate,
        profile,
        hasProfile: !!profile,
        isProfileComplete: profileCompletion.percentage === 100,
        profileCompletionPercentage: profileCompletion.percentage,
        missingSections: profileCompletion.missingSections,
        totalApplications: appData.totalApplications,
        totalPaidAmount: appData.totalPaidAmount
      };
    });

    const total = await Candidate.countDocuments();

    res.json({ 
      success: true, 
      data: enhancedCandidates,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('getRegisteredCandidates error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCandidateDetails = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const candidate = await Candidate.findById(candidateId).select('-password');
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Fetch fresh profile data without caching
    const profile = await CandidateProfile.findOne({ candidateId }).lean();
    
    // Calculate profile completion status
    const { calculateProfileCompletionWithDetails } = require('../utils/profileCompletion');
    const profileCompletion = calculateProfileCompletionWithDetails(profile);
    const isProfileComplete = profileCompletion.percentage === 100;
    
    // Get candidate's job applications with company details
    const applications = await Application.find({ candidateId })
      .populate({
        path: 'jobId',
        select: 'title category location',
        populate: {
          path: 'employerId',
          select: 'companyName'
        }
      })
      .populate('employerId', 'companyName')
      .sort({ createdAt: -1 });

    // Format applications data for the frontend
    const formattedApplications = applications.map(app => ({
      companyName: app.jobId?.employerId?.companyName || app.employerId?.companyName || 'N/A',
      jobTitle: app.jobId?.title || 'N/A',
      jobCategory: app.jobId?.category || 'N/A',
      status: app.status || 'pending',
      shortlistedStatus: app.status === 'shortlisted' || app.status === 'interview_scheduled' || app.status === 'selected',
      currentRound: app.interviewRound || (app.status === 'applied' ? 'Initial' : app.status),
      selected: app.status === 'selected',
      appliedDate: app.createdAt,
      createdAt: app.createdAt
    }));
    
    // Ensure education data is properly formatted with the latest updates
    let formattedEducation = [];
    if (profile && profile.education && Array.isArray(profile.education)) {
      formattedEducation = profile.education.map((edu, index) => ({
        ...edu,
        // Ensure passYear is properly mapped for admin display
        passYear: edu.passYear || edu.yearOfPassing || edu.year,
        // Map different field names to consistent format
        degreeName: edu.degreeName || edu.schoolName || edu.degree,
        collegeName: edu.collegeName || edu.location || edu.institution,
        percentage: edu.percentage || edu.score,
        cgpa: edu.cgpa || edu.gpa,
        grade: edu.grade || edu.result,
        specialization: edu.specialization || edu.courseName || edu.stream,
        registrationNumber: edu.registrationNumber || edu.enrollmentNumber,
        state: edu.state || edu.location,
        marksheet: edu.marksheet || edu.document
      }));
    }
    
    // Calculate total experience from employment records
    const { calculateTotalExperienceFromEmployment } = require('../utils/experienceCalculator');
    const calculatedExperience = profile && profile.employment ? 
      calculateTotalExperienceFromEmployment(profile.employment) : '0 months';
    
    const currentEmployment = profile?.employment?.find(emp => emp.isCurrentCompany || emp.isCurrent || emp.current);
    const currentExp = profile?.experience?.find(exp => exp.current || exp.isCurrent);
    
    const candidateWithProfile = {
      ...candidate.toObject(),
      ...profile,
      currentCompany: currentEmployment?.organizationName || currentEmployment?.organization || currentEmployment?.company || currentExp?.company || currentExp?.organization,
      currentLocation: currentEmployment?.location || profile?.location,
      currentCTC: currentEmployment?.presentCTC,
      expectedCTC: currentEmployment?.expectedCTC || profile?.expectedSalary,
      noticePeriod: currentEmployment?.noticePeriod || profile?.jobPreferences?.noticePeriod,
      preferredLocations: profile?.jobPreferences?.preferredLocations,
      // Override education with properly formatted data
      education: formattedEducation,
      // Set calculated total experience
      totalExperience: calculatedExperience || profile?.totalExperience || '0 months',
      hasProfile: !!profile,
      isProfileComplete,
      profileCompletionPercentage: profileCompletion.percentage,
      missingSections: profileCompletion.missingSections,
      applications: formattedApplications
    };

    // Set cache headers to prevent stale data
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({ success: true, candidate: candidateWithProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployerJobs = async (req, res) => {
  try {
    const employerId = req.params.id || req.params.employerId;
    
    const jobs = await Job.find({ employerId })
      .select('title status createdAt')
      .sort({ createdAt: -1 });

    const jobCount = jobs.length;
    const activeJobCount = jobs.filter(job => job.status === 'active').length;

    res.json({ success: true, jobs, jobCount, activeJobCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Placement Management Controllers
exports.getAllPlacements = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const placements = await Placement.find(query)
      .select('-password')
      .populate('approvedBy', 'name username email role firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const placementsWithUploadFlags = placements.map((placement) => {
      const approvalReference = placement.approvalEmailSentAt || placement.createdAt || null;
      const fileHistory = Array.isArray(placement.fileHistory) ? placement.fileHistory : [];
      const newBatchUploads = approvalReference
        ? fileHistory.filter((file) => {
            if (!file?.uploadedAt) return false;
            return new Date(file.uploadedAt).getTime() > new Date(approvalReference).getTime();
          })
        : [];

      return {
        ...placement,
        hasNewBatchUploads: newBatchUploads.length > 0,
        newBatchUploads: newBatchUploads.map((file) => ({
          _id: file._id,
          batch: file.batch || '',
          customName: file.customName || '',
          uploadedAt: file.uploadedAt
        }))
      };
    });

    res.json({ success: true, data: placementsWithUploadFlags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePlacementStatus = async (req, res) => {
  try {
    const { status, isApproved } = req.body;

    // First, fetch the current placement to check its state
    const currentPlacement = await Placement.findById(req.params.id);
    if (!currentPlacement) {
      return res.status(404).json({ success: false, message: 'Placement Dean not found' });
    }

    const updateData = {};
    let shouldSendEmail = false;

    if (status !== undefined) {
      const normalized = String(status).toLowerCase();
      if (normalized === 'approved') {
        updateData.status = 'active';
      } else if (normalized === 'rejected') {
        try {
          const { sendPlacementRejectionEmail } = require('../utils/emailService');
          await sendPlacementRejectionEmail(currentPlacement.email, currentPlacement.collegeOfficialEmail);
        } catch (emailError) {
          console.error('Failed to send placement rejection email:', emailError);
        }
        updateData.status = 'rejected';
        updateData.isApproved = false;
        updateData.rejectedAt = new Date();
        updateData.rejectedBy = new mongoose.Types.ObjectId(req.user.id);
      }
    }

    if (isApproved !== undefined) {
      updateData.isApproved = !!isApproved;
      if (isApproved) {
        updateData.approvedBy = new mongoose.Types.ObjectId(req.user.id);
        updateData.approvedByModel = (req.user.role === 'admin' || req.user.role === 'super-admin') ? 'Admin' : 'SubAdmin';
      }
    }
    if (updateData.isApproved === true && updateData.status === undefined) {
      updateData.status = 'active';
    }
    
    // Determine if we should send the approval email
    // Only send if: status is being set to 'active' AND email hasn't been sent yet
    if ((updateData.status === 'active' || currentPlacement.status === 'active') && !currentPlacement.approvalEmailSent) {
      shouldSendEmail = true;
      updateData.approvalEmailSent = true;
      updateData.approvalEmailSentAt = new Date();
    }
    
    const placement = await Placement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement Dean not found' });
    }

    // Send approval email and create notification only if it hasn't been sent before
    if (shouldSendEmail) {
      try {
        const { sendApprovalEmail } = require('../utils/emailService');
        const placementName = placement.name || placement.firstName || 'Placement Dean';
        await sendApprovalEmail(placement.email, placementName, 'placement', placement.collegeName, placement.collegeOfficialEmail);
        
        await createNotification({
          title: 'Account Approved',
          message: 'Your Placement Dean account has been approved by admin. You can now sign in.',
          type: 'placement_approved',
          role: 'placement',
          placementId: new mongoose.Types.ObjectId(placement._id),
          relatedId: placement._id,
          createdBy: req.user.id
        });
      } catch (notifError) {
        console.error('Failed to send approval email/notification:', notifError);
        // Still mark as sent to prevent retries
      }
    }

    res.json({ success: true, placement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPlacementDetails = async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.id).select('-password');
    
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement Dean not found' });
    }

    res.json({ success: true, placement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPlacementData = async (req, res) => {
  try {
    const placementId = req.params.id;
    
    const candidates = await Candidate.find({ placementId })
      .select('name email phone course credits')
      .lean();
    
    res.json({ success: true, students: candidates });
  } catch (error) {
    console.error('Error getting placement data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFileData = async (req, res) => {
  try {
    const { id: placementId, fileId } = req.params;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement Dean not found' });
    }

    const file = placement.fileHistory.id(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (!file.fileData) {
      return res.json({ success: true, students: [] });
    }

    const workbook = getWorkbookFromStoredFile(file.fileData, file.fileType);
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (!jsonData || jsonData.length === 0) {
      return res.json({ success: true, students: [] });
    }
    
    const emails = jsonData.map(getRowEmail).filter(Boolean);
    const [existingCandidates, placementCandidates, existingSystemEmails] = await Promise.all([
      Candidate.find({ placementId, email: { $in: emails } }).select('_id email'),
      PlacementCandidate.find({ fileId: fileId }),
      findExistingEmails(emails)
    ]);
    const candidateMap = new Map(existingCandidates.map(c => [c.email.toLowerCase(), c._id]));
    const pcMap = new Map(placementCandidates.map(pc => [pc.studentEmail.toLowerCase(), pc]));
    const placementOwnedEmails = existingCandidates.map(candidate => candidate.email.toLowerCase());
    const { rows: previewRows } = sanitizeRowsByEmail(jsonData, {
      blockedEmails: existingSystemEmails,
      allowedEmails: placementOwnedEmails
    });

    let students = previewRows.map((row, index) => {
      const email = getRowEmail(row);
      const candidateId = email ? candidateMap.get(email) : null;
      const pcRecord = email ? pcMap.get(email) : null;

      return {
        id: row.ID || row.id || row.Id || '',
        name: row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['full name'] || row['FULL NAME'] || row['Student Name'] || row['student name'] || row['STUDENT NAME'] || '',
        collegeName: row['College Name'] || row['college name'] || row['COLLEGE NAME'] || row.College || row.college || row.COLLEGE || '',
        email: row.Email || row.email || row.EMAIL || '',
        phone: row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE || '',
        course: row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH || 'Not Specified',
        password: row.Password || row.password || row.PASSWORD || '',
        credits: parseInt(row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || file.credits || 0),
        candidateId: candidateId,
        isProcessed: !!pcRecord
      };
    });

    // If file is approved or processed, show only candidates who were actually processed for this file
    if (file.status === 'approved' || file.status === 'processed') {
      const processedEmails = new Set();
      students = students.filter(student => {
        if (!student.isProcessed || !student.candidateId) return false;

        const email = (student.email || '').toString().trim().toLowerCase();
        if (!email) return true;
        if (processedEmails.has(email)) return false;

        processedEmails.add(email);
        return true;
      });
    }
    
    res.json({ success: true, students });
  } catch (error) {
    console.error('Error getting file data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadPlacementFile = async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.id);
    if (!placement || !placement.studentData) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const { buffer, mimeType } = base64ToBuffer(placement.studentData);
    const filename = placement.fileName || 'student_data.xlsx';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignPlacementCredits = async (req, res) => {
  try {
    const { credits } = req.body;
    const creditsNum = Math.min(10000, Math.max(0, parseInt(credits, 10) || 0));

    if (creditsNum <= 0) {
      return res.status(400).json({ success: false, message: 'Credits must be greater than 0' });
    }
    
    const placement = await Placement.findById(req.params.id);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement Dean not found' });
    }

    // Update all non-rejected files in fileHistory with the new credits
    if (placement.fileHistory && placement.fileHistory.length > 0) {
      for (let file of placement.fileHistory) {
        // Skip rejected files
        if (file.status === 'rejected') {
          continue;
        }
        file.credits = creditsNum;
        
        // Update the file data with new credits
        if (file.fileData) {
          try {
            const result = base64ToBuffer(file.fileData);
            const buffer = result.buffer;

            let workbook;
            if (file.fileType && file.fileType.includes('csv')) {
              const csvData = buffer.toString('utf8');
              workbook = XLSX.read(csvData, { type: 'string' });
            } else {
              workbook = XLSX.read(buffer, { type: 'buffer' });
            }
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            // Update all rows with new credits
            const updatedData = jsonData.map(row => ({
              ...row,
              'Credits Assigned': creditsNum,
              'credits assigned': creditsNum,
              'CREDITS ASSIGNED': creditsNum,
              Credits: creditsNum,
              credits: creditsNum,
              CREDITS: creditsNum,
              Credit: creditsNum,
              credit: creditsNum
            }));
            
            // Convert back to Excel/CSV
            const newWorksheet = XLSX.utils.json_to_sheet(updatedData);
            const newWorkbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
            
            let newBuffer;
            let mimeType;
            if (file.fileType && file.fileType.includes('csv')) {
              const csvOutput = XLSX.utils.sheet_to_csv(newWorksheet);
              newBuffer = Buffer.from(csvOutput, 'utf8');
              mimeType = 'text/csv';
            } else {
              newBuffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });
              mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            }
            
            file.fileData = `data:${mimeType};base64,${newBuffer.toString('base64')}`;
          } catch (fileError) {
            console.error('Error updating file data with credits:', fileError);
          }
        }
      }
    }
    
    // Update legacy studentData if it exists
    let updatedStudentData = placement.studentData;
    if (placement.studentData && placement.fileType) {
      try {
        const XLSX = require('xlsx');
        const { buffer } = base64ToBuffer(placement.studentData);
        
        let workbook;
        if (placement.fileType.includes('csv')) {
          const csvData = buffer.toString('utf8');
          workbook = XLSX.read(csvData, { type: 'string' });
        } else {
          workbook = XLSX.read(buffer, { type: 'buffer' });
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const updatedData = jsonData.map(row => ({
          ...row,
          'Credits Assigned': creditsNum
        }));
        
        const newWorksheet = XLSX.utils.json_to_sheet(updatedData);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
        
        let newBuffer;
        let mimeType;
        if (placement.fileType.includes('csv')) {
          const csvOutput = XLSX.utils.sheet_to_csv(newWorksheet);
          newBuffer = Buffer.from(csvOutput, 'utf8');
          mimeType = 'text/csv';
        } else {
          newBuffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }
        
        updatedStudentData = `data:${mimeType};base64,${newBuffer.toString('base64')}`;
      } catch (fileError) {
        console.error('Error updating legacy file:', fileError);
      }
    }
    
    const updatedPlacement = await Placement.findByIdAndUpdate(
      req.params.id,
      { 
        credits: creditsNum,
        studentData: updatedStudentData,
        fileHistory: placement.fileHistory
      },
      { new: true, runValidators: true }
    ).select('-password');

    // Update all candidates linked to this placement with new credits
    const placementObjectId = new mongoose.Types.ObjectId(req.params.id);
    const candidatesToUpdate = await Candidate.find(
      { placementId: placementObjectId },
      { _id: 1 }
    );
    
    const updateResult = await Candidate.updateMany(
      { placementId: placementObjectId },
      { $set: { credits: creditsNum } }
    );

    // Emit real-time credit updates to affected candidates
    if (candidatesToUpdate.length > 0) {
      const candidateIds = candidatesToUpdate.map(c => c._id.toString());
      emitBulkCreditUpdate(candidateIds, creditsNum);
      // Removed console debug line for security
      
      // Add a small delay to ensure WebSocket messages are processed
      setTimeout(() => {
        // Removed console debug line for security
      }, 1000);
    }

    // Removed console debug line for security
    // Removed console debug line for security;

    res.json({ 
      success: true, 
      placement: updatedPlacement,
      message: `Credits updated successfully! ${updateResult.modifiedCount} candidates will see the updated credits in their dashboard immediately.`,
      candidatesUpdated: updateResult.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Credit Management Controllers
exports.updateCandidateCredits = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { creditsToAdd } = req.body;
    
    if (typeof creditsToAdd !== 'number') {
      return res.status(400).json({ success: false, message: 'Credits must be a number' });
    }
    
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    
    const newCredits = Math.max(0, (candidate.credits || 0) + creditsToAdd);
    
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { credits: newCredits },
      { new: true }
    ).select('-password');
    
    res.json({ success: true, candidate: updatedCandidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkUpdateCandidateCredits = async (req, res) => {
  try {
    const { creditsToAdd, candidateIds } = req.body;
    
    if (typeof creditsToAdd !== 'number' || !Array.isArray(candidateIds)) {
      return res.status(400).json({ success: false, message: 'Invalid request data' });
    }
    
    // Get all candidates to calculate new credits
    const candidates = await Candidate.find({ _id: { $in: candidateIds } });
    
    // Update each candidate's credits
    const updatePromises = candidates.map(candidate => {
      const newCredits = Math.max(0, (candidate.credits || 0) + creditsToAdd);
      return Candidate.findByIdAndUpdate(
        candidate._id,
        { credits: newCredits },
        { new: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    res.json({ 
      success: true, 
      message: `Successfully updated credits for ${candidates.length} candidates`,
      updatedCount: candidates.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCandidatesForCredits = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    
    const candidates = await Candidate.find()
      .select('name email credits registrationMethod placementId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const total = await Candidate.countDocuments();
    
    res.json({ 
      success: true, 
      candidates,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCandidate = async (req, res) => {
  try {
    const { name, mobileNumber, email, credits, collegeName } = req.body;
    
    if (!name || !mobileNumber || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, mobile number, and email are required' 
      });
    }
    
    // Validate mobile number format (10 digits starting with 6-9)
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid 10-digit mobile number' 
      });
    }
    
    const existingUser = await checkEmailExists(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    const finalCredits = Math.max(0, Math.min(10000, parseInt(credits) || 0));
    
    const candidate = await Candidate.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: mobileNumber.trim(),
      registrationMethod: 'admin',
      credits: finalCredits,
      isVerified: false,
      status: 'active'
    });
    
    await CandidateProfile.create({ 
      candidateId: candidate._id,
      ...(collegeName && collegeName.trim() && { collegeName: collegeName.trim() })
    });
    
    try {
      const { sendCandidateDetailsUpdatedEmail } = require('../utils/emailService');
      await sendCandidateDetailsUpdatedEmail(
        candidate.email,
        candidate.name,
        finalCredits
      );
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Candidate created successfully. Welcome email sent with create password link.',
      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        credits: candidate.credits
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Sub Admin Management Controllers
exports.createSubAdmin = async (req, res) => {
  try {
    const { name, firstName, lastName, username, email, phone, employerCode, permissions, password } = req.body;
    
    // Check if username already exists in SubAdmin
    const existingSubAdminByUsername = await SubAdmin.findOne({ username: username.trim() });
    if (existingSubAdminByUsername) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    // Check if email already exists in any role
    const existingUser = await checkEmailExists(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    const subAdmin = await SubAdmin.create({
      name,
      firstName,
      lastName,
      username,
      email,
      phone,
      employerCode,
      permissions,
      password,
      createdBy: req.user.id
    });
    
    const subAdminResponse = subAdmin.toObject();
    delete subAdminResponse.password;
    
    res.status(201).json({ success: true, subAdmin: subAdminResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllSubAdmins = async (req, res) => {
  try {
    const subAdmins = await SubAdmin.find()
      .select('-password')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, subAdmins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSubAdmin = async (req, res) => {
  try {
    const { name, firstName, lastName, username, email, phone, employerCode, permissions, password } = req.body;
    
    // Check if username or email already exists for other sub-admins
    const existingSubAdmin = await SubAdmin.findOne({ 
      $or: [
        { email: new RegExp(`^${email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }, 
        { username: username.trim() }
      ],
      _id: { $ne: req.params.id }
    });
    
    if (existingSubAdmin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
    }
    
    const updateData = {
      name,
      firstName,
      lastName,
      username,
      email,
      phone,
      employerCode,
      permissions,
      updatedAt: new Date() // Force update timestamp
    };
    
    // Only update password if provided
    if (password) {
      updateData.password = password;
    }
    
    const subAdmin = await SubAdmin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!subAdmin) {
      return res.status(404).json({ success: false, message: 'Sub Admin not found' });
    }
    
    // Create notification for the sub-admin about profile update
    try {
      await createNotification({
        title: 'Profile Updated',
        message: 'Your sub-admin profile has been updated by the main admin. Please refresh your page to see the changes.',
        type: 'profile_updated',
        role: 'sub-admin',
        relatedId: subAdmin._id,
        createdBy: req.user.id
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }
    
    res.json({ 
      success: true, 
      subAdmin,
      message: 'Sub Admin updated successfully. They will need to refresh their page to see changes.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSubAdmin = async (req, res) => {
  try {
    const subAdmin = await SubAdmin.findByIdAndDelete(req.params.id);
    
    if (!subAdmin) {
      return res.status(404).json({ success: false, message: 'Sub Admin not found' });
    }
    
    res.json({ success: true, message: 'Sub Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get employers pending approval with complete profiles
exports.getEmployersPendingApproval = async (req, res) => {
  try {
    const employers = await Employer.find({ 
      isApproved: false, 
      status: 'active',
      profileSubmittedForReview: true // Only show employers who have submitted complete profiles
    })
      .select('-password')
      .sort({ profileSubmittedAt: -1 }); // Sort by submission date

    // Filter employers with complete profiles
    const employersWithCompleteProfile = [];
    
    for (const employer of employers) {
      const profile = await EmployerProfile.findOne({ employerId: employer._id });
      const requiredFields = ['companyName', 'description', 'location', 'phone', 'email'];
      const isProfileComplete = profile && requiredFields.every(field => profile[field]);
      
      if (isProfileComplete) {
        employersWithCompleteProfile.push({
          ...employer.toObject(),
          profile: profile.toObject(),
          isProfileComplete: true,
          profileSubmittedAt: employer.profileSubmittedAt
        });
      }
    }

    res.json({ 
      success: true, 
      data: employersWithCompleteProfile,
      count: employersWithCompleteProfile.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate login token for Placement Dean
exports.generatePlacementLoginToken = async (req, res) => {
  try {
    const { placementId } = req.body;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement Dean not found' });
    }
    
    if (placement.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Placement Dean is not active' });
    }
    
    const token = generateToken(placement._id, 'placement');
    
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Authorization Letter Management
exports.approveAuthorizationLetter = async (req, res) => {
  try {
    const { employerId, letterId } = req.params;
    
    const [profile, adminProfile] = await Promise.all([
      EmployerProfile.findOne({ employerId }),
      EmployerAdminProfile.findOne({ employerId })
    ]);

    if (!profile && !adminProfile) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    // Find the authorization letter
    const letterIndex = profile?.authorizationLetters?.findIndex(letter => letter._id.toString() === letterId) ?? -1;
    const adminLetterIndex = adminProfile?.authorizationLetters?.findIndex(letter => letter._id.toString() === letterId) ?? -1;
    if (letterIndex === -1 && adminLetterIndex === -1) {
      return res.status(404).json({ success: false, message: 'Authorization letter not found' });
    }

    // Update the letter status
    if (letterIndex !== -1 && profile) {
      profile.authorizationLetters[letterIndex].status = 'approved';
      profile.authorizationLetters[letterIndex].approvedAt = new Date();
      profile.authorizationLetters[letterIndex].approvedBy = req.user.id;
      profile.authorizationLetters[letterIndex].isResubmitted = false; // Reset resubmitted flag
    }
    if (adminLetterIndex !== -1 && adminProfile) {
      adminProfile.authorizationLetters[adminLetterIndex].status = 'approved';
      adminProfile.authorizationLetters[adminLetterIndex].approvedAt = new Date();
      adminProfile.authorizationLetters[adminLetterIndex].approvedBy = req.user.id;
      adminProfile.authorizationLetters[adminLetterIndex].isResubmitted = false; // Reset resubmitted flag
    }

    await Promise.all([
      profile ? profile.save() : Promise.resolve(),
      adminProfile ? adminProfile.save() : Promise.resolve()
    ]);

    // Create notification for employer
    try {
      const approvedLetter = (profile && letterIndex !== -1)
        ? profile.authorizationLetters[letterIndex]
        : adminProfile.authorizationLetters[adminLetterIndex];

      const notificationData = {
        title: 'Authorization Letter Approved',
        message: `Your authorization letter "${approvedLetter.fileName}" has been approved by admin. You can now proceed with the next steps.`,
        type: 'document_approved',
        role: 'employer',
        relatedId: new mongoose.Types.ObjectId(employerId),
        createdBy: new mongoose.Types.ObjectId(req.user.id)
      };
      
      await createNotification(notificationData);
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    res.json({ success: true, message: 'Authorization letter approved successfully' });
  } catch (error) {
    console.error('Error approving authorization letter:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectAuthorizationLetter = async (req, res) => {
  try {
    const { employerId, letterId } = req.params;
    
    const [profile, adminProfile] = await Promise.all([
      EmployerProfile.findOne({ employerId }),
      EmployerAdminProfile.findOne({ employerId })
    ]);

    if (!profile && !adminProfile) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    // Find the authorization letter
    const letterIndex = profile?.authorizationLetters?.findIndex(letter => letter._id.toString() === letterId) ?? -1;
    const adminLetterIndex = adminProfile?.authorizationLetters?.findIndex(letter => letter._id.toString() === letterId) ?? -1;
    if (letterIndex === -1 && adminLetterIndex === -1) {
      return res.status(404).json({ success: false, message: 'Authorization letter not found' });
    }

    // Update the letter status
    if (letterIndex !== -1 && profile) {
      profile.authorizationLetters[letterIndex].status = 'rejected';
      profile.authorizationLetters[letterIndex].rejectedAt = new Date();
      profile.authorizationLetters[letterIndex].rejectedBy = req.user.id;
      profile.authorizationLetters[letterIndex].isResubmitted = false; // Reset resubmitted flag
    }
    if (adminLetterIndex !== -1 && adminProfile) {
      adminProfile.authorizationLetters[adminLetterIndex].status = 'rejected';
      adminProfile.authorizationLetters[adminLetterIndex].rejectedAt = new Date();
      adminProfile.authorizationLetters[adminLetterIndex].rejectedBy = req.user.id;
      adminProfile.authorizationLetters[adminLetterIndex].isResubmitted = false; // Reset resubmitted flag
    }

    await Promise.all([
      profile ? profile.save() : Promise.resolve(),
      adminProfile ? adminProfile.save() : Promise.resolve()
    ]);

    // Create notification for employer
    try {
      const rejectedLetter = (profile && letterIndex !== -1)
        ? profile.authorizationLetters[letterIndex]
        : adminProfile.authorizationLetters[adminLetterIndex];

      const notificationData = {
        title: 'Authorization Letter Rejected',
        message: `Your authorization letter "${rejectedLetter.fileName}" has been rejected by admin. Please resubmit the document with correct information or contact support for assistance.`,
        type: 'document_rejected',
        role: 'employer',
        relatedId: new mongoose.Types.ObjectId(employerId),
        createdBy: new mongoose.Types.ObjectId(req.user.id)
      };
      
      await createNotification(notificationData);
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    res.json({ success: true, message: 'Authorization letter rejected successfully' });
  } catch (error) {
    console.error('Error rejecting authorization letter:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Individual file approval/rejection
exports.approveIndividualFile = async (req, res) => {
  try {
    const { id: placementId, fileId } = req.params;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement not found' });
    }

    // Find the file in history
    const fileIndex = placement.fileHistory.findIndex(file => file._id.toString() === fileId);
    if (fileIndex === -1) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const file = placement.fileHistory[fileIndex];
    if (!file.fileData) {
      return res.status(400).json({ success: false, message: 'File data not available' });
    }

    // Process the file data
    
    try {
      const workbook = getWorkbookFromStoredFile(file.fileData, file.fileType);
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const emailConflicts = await findPlacementFileEmailConflicts(jsonData);
      if (emailConflicts.hasConflicts) {
        await rejectPlacementFileForConflicts({
          placementId,
          fileId,
          rejectionReason: emailConflicts.message,
          rejectedBy: req.user.id
        });

        return res.status(400).json({
          success: false,
          message: emailConflicts.message,
          duplicateEmails: emailConflicts.duplicateEmails,
          existingEmails: emailConflicts.existingEmails,
          requiresResubmission: true,
          fileStatus: 'rejected'
        });
      }
      
      let createdCount = 0;
      let skippedCount = 0;
      let emailsSent = 0;
      let emailsFailed = 0;
      const errors = [];
      const createdCandidates = [];
      const skippedCandidates = [];
      const emailsProcessedInFile = new Set();
      
      // Process each row from Excel
      for (let index = 0; index < jsonData.length; index++) {
        try {
          const row = jsonData[index];
          let email = row.Email || row.email || row.EMAIL;
          let password = row.Password || row.password || row.PASSWORD;
          let name = row.Name || row.name || row.NAME || row['Full Name'] || row['full name'] || row['FULL NAME'] || row['Student Name'] || row['student name'] || row['STUDENT NAME'] || row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'];
          const phone = row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE;
          const course = row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH;
          const collegeName = row['College Name'] || row['college name'] || row['COLLEGE NAME'] || row.College || row.college || row.COLLEGE || placement.collegeName;
          
          // Auto-generate missing fields with proper validation
          if (!email || email.trim() === '') {
            email = `student${index + 1}@${placement.collegeName.toLowerCase().replace(/\s+/g, '')}.edu`;
          }
          if (!password || password.trim() === '') {
            password = `pwd${Math.random().toString(36).substr(2, 8)}`;
          }
          if (!name || name.trim() === '') {
            name = `Student ${index + 1}`;
          }
          
          // Validate required fields
          if (!email || !password || !name) {
            errors.push(`Row ${index + 1}: Missing required fields (email, password, or name)`);
            continue;
          }

          const normalizedEmail = email.trim().toLowerCase();
          if (emailsProcessedInFile.has(normalizedEmail)) {
            skippedCount++;
            skippedCandidates.push({
              name: name.trim(),
              email: normalizedEmail,
              reason: 'Duplicate email in uploaded file'
            });
            continue;
          }
          emailsProcessedInFile.add(normalizedEmail);
          
          // Check if user already exists in any role
          const existingUser = await checkEmailExists(normalizedEmail);
          let candidate;
          
          if (existingUser) {
            console.log(`Skipping existing user: ${email} in role: ${existingUser.role}`);
            skippedCount++;
            skippedCandidates.push({
              name: name.trim(),
              email: email.trim().toLowerCase(),
              reason: `Email already registered as ${existingUser.role}`
            });
            continue;
          }
          
          // Use file-specific credits or individual row credits
          const rowCredits = parseInt(row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || 0);
          const finalCredits = rowCredits || file.credits || placement.credits || 0;
          
          if (!candidate) {
            // Create candidate with placement credentials
            candidate = await Candidate.create({
              name: name.trim(),
              email: email.trim().toLowerCase(),
              password: password.trim(),
              phone: phone ? phone.toString().trim() : '',
              course: course ? course.trim() : '',
              credits: finalCredits,
              registrationMethod: 'placement',
              placementId: placement._id,
              fileId: file._id,
              isVerified: true,
              status: 'active'
            });
            
            // Create candidate profile
            await CandidateProfile.create({ 
              candidateId: candidate._id,
              collegeName: collegeName || placement.collegeName,
              education: [{
                degreeName: course ? course.trim() : '',
                collegeName: collegeName || placement.collegeName,
                scoreType: 'percentage',
                scoreValue: '0'
              }]
            });
          } else {
            // Update existing candidate credits if needed
            if (finalCredits > 0) {
              await Candidate.findByIdAndUpdate(candidate._id, {
                $inc: { credits: finalCredits }
              });
            }
          }
          
          // Create or Update placement candidate record
          let placementCandidate = await PlacementCandidate.findOne({
            candidateId: candidate._id,
            placementId: placement._id
          });
          
          if (placementCandidate) {
             placementCandidate.status = 'approved';
             placementCandidate.approvedAt = new Date();
             placementCandidate.approvedBy = req.user.id;
             placementCandidate.creditsAssigned = (placementCandidate.creditsAssigned || 0) + finalCredits;
             placementCandidate.studentName = name.trim();
             placementCandidate.studentPhone = phone ? phone.toString().trim() : placementCandidate.studentPhone;
             placementCandidate.course = course ? course.trim() : placementCandidate.course;
             placementCandidate.fileId = file._id;
             placementCandidate.fileName = file.customName || file.fileName;
             await placementCandidate.save();
          } else {
            placementCandidate = await PlacementCandidate.create({
              candidateId: candidate._id,
              studentName: name.trim(),
              studentEmail: email.trim().toLowerCase(),
              studentPhone: phone ? phone.toString().trim() : '',
              course: course ? course.trim() : '',
              collegeName: collegeName || placement.collegeName,
              placementId: placement._id,
              placementOfficerName: placement.name,
              placementOfficerEmail: placement.email,
              placementOfficerPhone: placement.phone,
              fileId: file._id,
              fileName: file.customName || file.fileName,
              status: 'approved',
              approvedAt: new Date(),
              approvedBy: req.user.id,
              creditsAssigned: finalCredits,
              originalRowData: row
            });
          }
          
          // Send welcome email with create password link
          try {
            const { sendPlacementCandidateWelcomeEmail } = require('../utils/emailService');
            console.log(`=== SENDING WELCOME EMAIL ===`);
            console.log(`To: ${email.trim().toLowerCase()}`);
            console.log(`Name: ${name.trim()}`);
            console.log(`Placement Dean: ${placement.name}`);
            console.log(`College: ${collegeName || placement.collegeName}`);
            console.log(`Credits: ${finalCredits}`);
            
            await sendPlacementCandidateWelcomeEmail(
              email.trim().toLowerCase(),
              name.trim(),
              password.trim(),
              placement.name,
              collegeName || placement.collegeName,
              finalCredits
            );
            
            console.log(`✅ Welcome email sent successfully to ${email}`);
            
            // Update placement candidate record to mark email as sent
            await PlacementCandidate.findByIdAndUpdate(
              placementCandidate._id,
              { 
                welcomeEmailSent: true,
                welcomeEmailSentAt: new Date()
              }
            );
            
            emailsSent++;
          } catch (emailError) {
            console.error(`❌ Failed to send welcome email to ${email}:`, emailError);
            console.error('Email error details:', {
              message: emailError.message,
              code: emailError.code,
              command: emailError.command
            });
            emailsFailed++;
            // Continue processing even if email fails
          }
          
          createdCandidates.push({
            name: candidate.name,
            email: candidate.email,
            password: password.trim(),
            credits: finalCredits,
            course: course || 'Not Specified',
            collegeName: collegeName || placement.collegeName
          });
          
          createdCount++;
        } catch (rowError) {
          console.error('Row processing error:', rowError);
          errors.push(`Row ${index + 1}: ${rowError.message}`);
        }
      }
      
      // Update file status to 'processed' after successful approval and processing
      await Placement.findOneAndUpdate(
        { _id: placementId, 'fileHistory._id': fileId },
        { 
          $set: { 
            'fileHistory.$.status': 'processed',
            'fileHistory.$.processedAt': new Date(),
            'fileHistory.$.candidatesCreated': createdCount
          }
        }
      );

      // Create comprehensive notification
      try {
        const displayName = file.customName || file.fileName;
        await createNotification({
          title: 'Students Approved - Welcome Emails Sent',
          message: `File "${displayName}" approved! Welcome emails sent successfully to students.`,
          type: 'file_processed',
          role: 'admin',
          relatedId: placementId,
          createdBy: req.user.id
        });

        await createNotification({
          title: 'Student File Processed',
          message: `File "${displayName}" processed. Created: ${createdCount}, skipped: ${skippedCount}.`,
          type: 'file_processed',
          role: 'placement',
          placementId: new mongoose.Types.ObjectId(placementId),
          relatedId: new mongoose.Types.ObjectId(placementId),
          createdBy: req.user.id
        });
      } catch (notifError) {
        console.error('Notification creation failed:', notifError);
      }
      
      const displayName = file.customName || file.fileName;
      let message;
      if (createdCount === 0 && skippedCount > 0) {
        message = `File "${displayName}" processed! ${skippedCount} duplicate ${skippedCount === 1 ? 'student was' : 'students were'} found. Use "Resend Welcome Emails" to send emails to existing students.`;
      } else {
        message = `File "${displayName}" approved! All non-skipped students can now create their passwords and access their accounts.`;
      }
      
      res.json({
        success: true,
        message,
        stats: { 
          created: createdCount, 
          skipped: skippedCount, 
          errors: errors.length,
          emailsSent: emailsSent,
          emailsFailed: emailsFailed
        },
        createdCandidates: createdCandidates.slice(0, 10),
        skippedCandidates: skippedCandidates.slice(0, 10),
        errors: errors.slice(0, 10),
        loginInstructions: {
          url: 'http://localhost:3000/',
          message: createdCount > 0 ? 'Students have received welcome emails with create password links. They can create their passwords and then login using Sign In → Candidate tab' : 'Students already exist. Use Resend Welcome Emails feature to send login credentials.'
        }
      });
      
    } catch (processError) {
      console.error('File processing error:', processError);
      res.status(400).json({ success: false, message: 'Failed to process file data' });
    }
  } catch (error) {
    console.error('Error approving file:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectIndividualFile = async (req, res) => {
  try {
    const { id: placementId, fileId } = req.params;
    const { rejectionReason } = req.body;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement not found' });
    }

    // Find the file in history
    const fileIndex = placement.fileHistory.findIndex(file => file._id.toString() === fileId);
    if (fileIndex === -1) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const file = placement.fileHistory[fileIndex];
    
    // Update file status in history
    console.log(`Updating file ${fileId} status to rejected`);
    const updatedPlacement = await Placement.findOneAndUpdate(
      { _id: placementId, 'fileHistory._id': fileId },
      { $set: { 
        'fileHistory.$.status': 'rejected',
        'fileHistory.$.rejectionReason': rejectionReason || 'No reason provided',
        'fileHistory.$.processedAt': new Date() 
      } },
      { new: true }
    );
    console.log(`File status updated to rejected for placement ${placementId}`);
    
    // Verify the update
    const verifyPlacement = await Placement.findById(placementId);
    const updatedFile = verifyPlacement.fileHistory.find(f => f._id.toString() === fileId);
    console.log(`Verified file status: ${updatedFile?.status}`);

    // Create notification for Placement Dean
    try {
      const notification = await createNotification({
        title: 'File Rejected',
        message: `File "${file.customName || file.fileName}" has been rejected. Reason: ${rejectionReason || 'No reason provided'}. You can resubmit a corrected version.`,
        type: 'file_rejected',
        role: 'placement',
        placementId: new mongoose.Types.ObjectId(placementId),
        relatedId: new mongoose.Types.ObjectId(placementId),
        createdBy: req.user.id
      });
    } catch (notifError) {
      console.error('Notification creation failed:', notifError);
    }
    
    res.json({ success: true, message: 'File rejected successfully' });
  } catch (error) {
    console.error('Error rejecting file:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update credits for specific file
exports.updateFileCredits = async (req, res) => {
  try {
    const { id: placementId, fileId } = req.params;
    const { credits } = req.body;
    
    if (typeof credits !== 'number' || credits <= 0 || credits > 10000) {
      return res.status(400).json({ success: false, message: 'Credits must be greater than 0 and up to 10000' });
    }
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement Dean not found' });
    }

    const file = placement.fileHistory.id(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if file is rejected
    if (file.status === 'rejected') {
      return res.status(400).json({ success: false, message: 'Cannot update credits for rejected files' });
    }

    // Update file credits
    file.credits = credits;
    
    // Update the file data with new credits
    if (file.fileData) {
      try {
        const result = base64ToBuffer(file.fileData);
        const buffer = result.buffer;

        let workbook;
        if (file.fileType && file.fileType.includes('csv')) {
          const csvData = buffer.toString('utf8');
          workbook = XLSX.read(csvData, { type: 'string' });
        } else {
          workbook = XLSX.read(buffer, { type: 'buffer' });
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Update all rows with new credits
        const updatedData = jsonData.map(row => ({
          ...row,
          'Credits Assigned': credits,
          'credits assigned': credits,
          'CREDITS ASSIGNED': credits,
          Credits: credits,
          credits: credits,
          CREDITS: credits,
          Credit: credits,
          credit: credits
        }));
        
        // Convert back to Excel/CSV
        const newWorksheet = XLSX.utils.json_to_sheet(updatedData);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
        
        let newBuffer;
        let mimeType;
        if (file.fileType && file.fileType.includes('csv')) {
          const csvOutput = XLSX.utils.sheet_to_csv(newWorksheet);
          newBuffer = Buffer.from(csvOutput, 'utf8');
          mimeType = 'text/csv';
        } else {
          newBuffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }
        
        file.fileData = `data:${mimeType};base64,${newBuffer.toString('base64')}`;
      } catch (fileError) {
        console.error('Error updating file data with credits:', fileError);
      }
    }
    
    await placement.save();
    
    // Update all candidates linked to this specific file with new credits
    const candidatesToUpdate = await Candidate.find(
      { placementId: placementId, fileId: fileId },
      { _id: 1 }
    );
    
    const updateResult = await Candidate.updateMany(
      { placementId: placementId, fileId: fileId },
      { $set: { credits: credits } }
    );
    
    // Emit real-time credit updates to affected candidates
    if (candidatesToUpdate.length > 0) {
      const candidateIds = candidatesToUpdate.map(c => c._id.toString());
      emitBulkCreditUpdate(candidateIds, credits);
    }
    
    // Also update candidates who don't have fileId but belong to this placement
    // This handles legacy candidates created before fileId tracking
    const legacyCandidatesToUpdate = await Candidate.find(
      { placementId: placementId, fileId: { $exists: false } },
      { _id: 1 }
    );
    
    let legacyUpdateResult = { modifiedCount: 0 };
    if (legacyCandidatesToUpdate.length > 0) {
      legacyUpdateResult = await Candidate.updateMany(
        { placementId: placementId, fileId: { $exists: false } },
        { $set: { credits: credits } }
      );
      
      const legacyCandidateIds = legacyCandidatesToUpdate.map(c => c._id.toString());
      emitBulkCreditUpdate(legacyCandidateIds, credits);
    }
    
    res.json({
      success: true,
      message: `File credits updated successfully. ${updateResult.modifiedCount} candidates updated.`,
      file: {
        id: file._id,
        fileName: file.fileName,
        credits: file.credits
      },
      candidatesUpdated: updateResult.modifiedCount + legacyUpdateResult.modifiedCount
    });
    
  } catch (error) {
    console.error('Error updating file credits:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign credits to all files in a placement
exports.assignBulkFileCredits = async (req, res) => {
  try {
    const { id: placementId } = req.params;
    const { credits } = req.body;
    const creditsNum = Math.min(10000, Math.max(0, parseInt(credits, 10) || 0));

    if (creditsNum <= 0) {
      return res.status(400).json({ success: false, message: 'Credits must be greater than 0' });
    }
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement Dean not found' });
    }

    let updatedFiles = 0;
    
    // Update only processed files in fileHistory with the new credits
    if (placement.fileHistory && placement.fileHistory.length > 0) {
      for (let file of placement.fileHistory) {
        // Only update processed files
        if (file.status !== 'processed') {
          continue;
        }
        file.credits = creditsNum;
        
        // Update the file data with new credits
        if (file.fileData) {
          try {
            const { base64ToBuffer } = require('../utils/base64Helper');
            const result = base64ToBuffer(file.fileData);
            const buffer = result.buffer;

            let workbook;
            if (file.fileType && file.fileType.includes('csv')) {
              const csvData = buffer.toString('utf8');
              workbook = XLSX.read(csvData, { type: 'string' });
            } else {
              workbook = XLSX.read(buffer, { type: 'buffer' });
            }
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            // Update all rows with new credits
            const updatedData = jsonData.map(row => ({
              ...row,
              'Credits Assigned': creditsNum,
              'credits assigned': creditsNum,
              'CREDITS ASSIGNED': creditsNum,
              Credits: creditsNum,
              credits: creditsNum,
              CREDITS: creditsNum,
              Credit: creditsNum,
              credit: creditsNum
            }));
            
            // Convert back to Excel/CSV
            const newWorksheet = XLSX.utils.json_to_sheet(updatedData);
            const newWorkbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
            
            let newBuffer;
            let mimeType;
            if (file.fileType && file.fileType.includes('csv')) {
              const csvOutput = XLSX.utils.sheet_to_csv(newWorksheet);
              newBuffer = Buffer.from(csvOutput, 'utf8');
              mimeType = 'text/csv';
            } else {
              newBuffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });
              mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            }
            
            file.fileData = `data:${mimeType};base64,${newBuffer.toString('base64')}`;
            updatedFiles++;
          } catch (fileError) {
            console.error('Error updating file data with credits:', fileError);
          }
        }
      }
    }
    
    await placement.save();
    
    // Update all candidates linked to this placement with new credits
    const placementObjectId = new mongoose.Types.ObjectId(placementId);
    const updateResult = await Candidate.updateMany(
      { placementId: placementObjectId },
      { $set: { credits: creditsNum } }
    );

    res.json({ 
      success: true, 
      message: `Credits updated successfully for ${updatedFiles} files and ${updateResult.modifiedCount} candidates`,
      stats: {
        filesUpdated: updatedFiles,
        candidatesUpdated: updateResult.modifiedCount,
        creditsAssigned: creditsNum
      }
    });
  } catch (error) {
    console.error('Error assigning bulk file credits:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Store complete Excel data in MongoDB
exports.storeExcelDataInMongoDB = async (req, res) => {
  try {
    const { id: placementId } = req.params;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement Dean not found' });
    }

    let totalRecordsStored = 0;
    const storedFiles = [];
    
    // Process all files in fileHistory
    if (placement.fileHistory && placement.fileHistory.length > 0) {
      for (let file of placement.fileHistory) {
        if (file.fileData) {
          try {
            const { base64ToBuffer } = require('../utils/base64Helper');
            const result = base64ToBuffer(file.fileData);
            const buffer = result.buffer;

            let workbook;
            if (file.fileType && file.fileType.includes('csv')) {
              const csvData = buffer.toString('utf8');
              workbook = XLSX.read(csvData, { type: 'string' });
            } else {
              workbook = XLSX.read(buffer, { type: 'buffer' });
            }
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            const fileEmails = jsonData.map(getRowEmail).filter(Boolean);
            const [placementOwnedCandidates, existingSystemEmails] = await Promise.all([
              Candidate.find({ placementId: placement._id, email: { $in: fileEmails } }).select('email').lean(),
              findExistingEmails(fileEmails)
            ]);
            const { rows: sanitizedRows } = sanitizeRowsByEmail(jsonData, {
              blockedEmails: existingSystemEmails,
              allowedEmails: placementOwnedCandidates.map(candidate => candidate.email)
            });
            
            const structuredData = buildStructuredPlacementRows(sanitizedRows, { file, placement });
            
            // Update file with structured data
            file.structuredData = structuredData;
            file.dataStoredAt = new Date();
            file.recordCount = structuredData.length;
            
            totalRecordsStored += structuredData.length;
            storedFiles.push({
              fileName: file.fileName,
              recordCount: structuredData.length,
              fileId: file._id
            });
            
          } catch (fileError) {
            console.error(`Error processing file ${file.fileName}:`, fileError);
          }
        }
      }
    }
    
    // Save placement with structured data
    await placement.save();
    
    res.json({ 
      success: true, 
      message: `Excel data stored successfully in MongoDB`,
      stats: {
        totalFilesProcessed: storedFiles.length,
        totalRecordsStored: totalRecordsStored,
        storedFiles: storedFiles
      }
    });
  } catch (error) {
    console.error('Error storing Excel data in MongoDB:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Get stored Excel data from MongoDB
exports.getStoredExcelData = async (req, res) => {
  try {
    const { id: placementId, fileId } = req.params;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement Dean not found' });
    }

    if (fileId) {
      // Get data for specific file
      const file = placement.fileHistory.id(fileId);
      if (!file) {
        return res.status(404).json({ success: false, message: 'File not found' });
      }

      res.json({
        success: true,
        data: file.structuredData || [],
        fileInfo: {
          fileName: file.fileName,
          recordCount: file.recordCount || 0,
          dataStoredAt: file.dataStoredAt,
          status: file.status
        }
      });
    } else {
      // Get data for all files
      const allData = [];
      const fileInfos = [];

      placement.fileHistory.forEach(file => {
        if (file.structuredData && file.structuredData.length > 0) {
          allData.push(...file.structuredData);
          fileInfos.push({
            fileName: file.fileName,
            recordCount: file.recordCount || 0,
            dataStoredAt: file.dataStoredAt,
            status: file.status,
            fileId: file._id
          });
        }
      });

      res.json({
        success: true,
        data: allData,
        totalRecords: allData.length,
        files: fileInfos
      });
    }
  } catch (error) {
    console.error('Error getting stored Excel data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get all placement candidates with comprehensive details
exports.getAllPlacementCandidates = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, placementId, search } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (placementId) query.placementId = placementId;
    
    // Add search functionality
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { studentEmail: { $regex: search, $options: 'i' } },
        { placementOfficerName: { $regex: search, $options: 'i' } },
        { collegeName: { $regex: search, $options: 'i' } }
      ];
    }

    const placementCandidates = await PlacementCandidate.find(query)
      .populate('candidateId', 'name email phone credits status createdAt')
      .populate('placementId', 'name email collegeName phone')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalCandidates = await PlacementCandidate.countDocuments(query);
    
    // Enhance data with additional information
    const enhancedCandidates = placementCandidates.map(pc => ({
      id: pc._id,
      studentName: pc.studentName,
      studentEmail: pc.studentEmail,
      studentPhone: pc.studentPhone,
      course: pc.course,
      collegeName: pc.collegeName,
      creditsAssigned: pc.creditsAssigned,
      
      // Placement Dean Details
      placementOfficer: {
        id: pc.placementId?._id,
        name: pc.placementOfficerName,
        email: pc.placementOfficerEmail,
        phone: pc.placementOfficerPhone,
        collegeName: pc.placementId?.collegeName
      },
      
      // File Information
      fileInfo: {
        id: pc.fileId,
        fileName: pc.fileName
      },
      
      // Status and Approval
      status: pc.status,
      approvedAt: pc.approvedAt,
      approvedBy: pc.approvedBy ? {
        name: pc.approvedBy.name,
        email: pc.approvedBy.email
      } : null,
      
      // Email Status
      welcomeEmailSent: pc.welcomeEmailSent,
      welcomeEmailSentAt: pc.welcomeEmailSentAt,
      
      // Candidate Account Status
      candidateAccount: pc.candidateId ? {
        id: pc.candidateId._id,
        name: pc.candidateId.name,
        email: pc.candidateId.email,
        phone: pc.candidateId.phone,
        credits: pc.candidateId.credits,
        status: pc.candidateId.status,
        createdAt: pc.candidateId.createdAt
      } : null,
      
      createdAt: pc.createdAt,
      updatedAt: pc.updatedAt
    }));

    res.json({ 
      success: true, 
      data: enhancedCandidates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCandidates / parseInt(limit)),
        totalCandidates,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting placement candidates:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resend welcome email to specific placement candidate
exports.resendWelcomeEmail = async (req, res) => {
  try {
    const { placementCandidateId } = req.params;
    
    const placementCandidate = await PlacementCandidate.findById(placementCandidateId)
      .populate('candidateId', 'password')
      .populate('placementId', 'name collegeName');
    
    if (!placementCandidate) {
      return res.status(404).json({ success: false, message: 'Placement candidate not found' });
    }

    if (!placementCandidate.candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate account not found' });
    }

    try {
      const { sendPlacementCandidateWelcomeEmail } = require('../utils/emailService');
      await sendPlacementCandidateWelcomeEmail(
        placementCandidate.studentEmail,
        placementCandidate.studentName,
        placementCandidate.candidateId.password,
        placementCandidate.placementOfficerName,
        placementCandidate.collegeName
      );
      
      // Update email sent status
      await PlacementCandidate.findByIdAndUpdate(
        placementCandidateId,
        { 
          welcomeEmailSent: true,
          welcomeEmailSentAt: new Date()
        }
      );
      
      res.json({ 
        success: true, 
        message: `Welcome email resent successfully to ${placementCandidate.studentEmail}` 
      });
    } catch (emailError) {
      console.error('Failed to resend welcome email:', emailError);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send welcome email. Please try again.' 
      });
    }
  } catch (error) {
    console.error('Error resending welcome email:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Retry failed email sends for placement candidates
exports.retryFailedEmails = async (req, res) => {
  try {
    // Find placement candidates where email failed or wasn't sent
    const failedEmailCandidates = await PlacementCandidate.find({
      status: 'approved',
      $or: [
        { welcomeEmailSent: { $ne: true } },
        { emailRetryCount: { $gt: 0 } }
      ]
    })
    .populate('candidateId', 'password')
    .populate('placementId', 'name collegeName')
    .limit(50); // Process in batches
    
    let emailsSent = 0;
    let emailsFailed = 0;
    const results = [];

    for (const placementCandidate of failedEmailCandidates) {
      try {
        if (!placementCandidate.candidateId) {
          emailsFailed++;
          results.push({
            email: placementCandidate.studentEmail,
            status: 'failed',
            reason: 'Candidate account not found'
          });
          continue;
        }

        const { retryFailedEmail } = require('../utils/emailService');
        const retryResult = await retryFailedEmail(
          placementCandidate.studentEmail,
          placementCandidate.studentName,
          placementCandidate.candidateId.password,
          placementCandidate.placementOfficerName,
          placementCandidate.collegeName
        );
        
        if (retryResult.success) {
          // Update placement candidate record
          await PlacementCandidate.findByIdAndUpdate(
            placementCandidate._id,
            { 
              welcomeEmailSent: true,
              welcomeEmailSentAt: new Date(),
              emailRetryCount: (placementCandidate.emailRetryCount || 0) + 1,
              lastEmailAttempt: new Date()
            }
          );
          
          emailsSent++;
          results.push({
            email: placementCandidate.studentEmail,
            status: 'sent',
            attempts: retryResult.attempt,
            sentAt: new Date()
          });
        } else {
          // Update retry count even if failed
          await PlacementCandidate.findByIdAndUpdate(
            placementCandidate._id,
            { 
              emailRetryCount: (placementCandidate.emailRetryCount || 0) + retryResult.attempts,
              lastEmailAttempt: new Date()
            }
          );
          
          emailsFailed++;
          results.push({
            email: placementCandidate.studentEmail,
            status: 'failed',
            attempts: retryResult.attempts,
            reason: retryResult.error?.message || 'Unknown error'
          });
        }
      } catch (emailError) {
        console.error(`Failed to retry email for ${placementCandidate.studentEmail}:`, emailError);
        emailsFailed++;
        results.push({
          email: placementCandidate.studentEmail,
          status: 'failed',
          reason: emailError.message
        });
      }
    }
    
    res.json({ 
      success: true, 
      message: `Email retry completed. ${emailsSent} emails sent successfully, ${emailsFailed} failed.`,
      stats: {
        total: failedEmailCandidates.length,
        sent: emailsSent,
        failed: emailsFailed
      },
      results: results
    });
  } catch (error) {
    console.error('Error retrying failed emails:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk resend welcome emails to multiple placement candidates
exports.bulkResendWelcomeEmails = async (req, res) => {
  try {
    const { placementCandidateIds } = req.body;
    
    if (!Array.isArray(placementCandidateIds) || placementCandidateIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid candidate IDs provided' });
    }

    const placementCandidates = await PlacementCandidate.find({
      _id: { $in: placementCandidateIds }
    })
    .populate('candidateId', 'password')
    .populate('placementId', 'name collegeName');
    
    let emailsSent = 0;
    let emailsFailed = 0;
    const results = [];

    for (const placementCandidate of placementCandidates) {
      try {
        if (!placementCandidate.candidateId) {
          emailsFailed++;
          results.push({
            email: placementCandidate.studentEmail,
            status: 'failed',
            reason: 'Candidate account not found'
          });
          continue;
        }

        const { sendPlacementCandidateWelcomeEmail } = require('../utils/emailService');
        await sendPlacementCandidateWelcomeEmail(
          placementCandidate.studentEmail,
          placementCandidate.studentName,
          placementCandidate.candidateId.password,
          placementCandidate.placementOfficerName,
          placementCandidate.collegeName
        );
        
        // Update email sent status
        await PlacementCandidate.findByIdAndUpdate(
          placementCandidate._id,
          { 
            welcomeEmailSent: true,
            welcomeEmailSentAt: new Date()
          }
        );
        
        emailsSent++;
        results.push({
          email: placementCandidate.studentEmail,
          status: 'sent',
          sentAt: new Date()
        });
      } catch (emailError) {
        console.error(`Failed to send welcome email to ${placementCandidate.studentEmail}:`, emailError);
        emailsFailed++;
        results.push({
          email: placementCandidate.studentEmail,
          status: 'failed',
          reason: emailError.message
        });
      }
    }
    
    res.json({ 
      success: true, 
      message: `Bulk email operation completed. ${emailsSent} emails sent, ${emailsFailed} failed.`,
      stats: {
        total: placementCandidates.length,
        sent: emailsSent,
        failed: emailsFailed
      },
      results: results
    });
  } catch (error) {
    console.error('Error bulk resending welcome emails:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Sync credits between Excel data and candidate dashboard
exports.syncExcelCreditsWithCandidates = async (req, res) => {
  try {
    const { id: placementId } = req.params;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement Dean not found' });
    }

    let syncedCandidates = 0;
    const syncResults = [];
    
    // Process all files in fileHistory
    if (placement.fileHistory && placement.fileHistory.length > 0) {
      for (let file of placement.fileHistory) {
        if (file.fileData) {
          try {
            const { base64ToBuffer } = require('../utils/base64Helper');
            const result = base64ToBuffer(file.fileData);
            const buffer = result.buffer;

            let workbook;
            if (file.fileType && file.fileType.includes('csv')) {
              const csvData = buffer.toString('utf8');
              workbook = XLSX.read(csvData, { type: 'string' });
            } else {
              workbook = XLSX.read(buffer, { type: 'buffer' });
            }
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            // Sync each row with candidate data
            for (const row of jsonData) {
              const email = row.Email || row.email || row.EMAIL;
              const credits = parseInt(row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || file.credits || 0);
              const course = row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH || 'Not Specified';
              
              if (email) {
                try {
                  const updateResult = await Candidate.findOneAndUpdate(
                    { 
                      email: email.toLowerCase(),
                      placementId: placement._id
                    },
                    { 
                      credits: credits,
                      course: course
                    },
                    { new: true }
                  );
                  
                  if (updateResult) {
                    syncedCandidates++;
                    syncResults.push({
                      email: email,
                      credits: credits,
                      course: course,
                      fileName: file.fileName
                    });
                  }
                } catch (syncError) {
                  console.error(`Error syncing credits for ${email}:`, syncError);
                }
              }
            }
            
          } catch (fileError) {
            console.error(`Error processing file ${file.fileName}:`, fileError);
          }
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: `Credits synchronized successfully for ${syncedCandidates} candidates`,
      syncedCandidates: syncedCandidates,
      syncResults: syncResults
    });
  } catch (error) {
    console.error('Error syncing Excel credits with candidates:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Download placement ID card
exports.downloadPlacementIdCard = async (req, res) => {
  try {
    const { id: placementId } = req.params;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement Dean not found' });
    }

    if (!placement.idCard) {
      return res.status(404).json({ success: false, message: 'ID card not found' });
    }

    const { buffer, mimeType, extension } = base64ToBuffer(placement.idCard);
    const filename = `${placement.name.replace(/\s+/g, '_')}_ID_Card${extension}`;

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const enrichSupportTicketRequester = (ticket) => {
  if (!ticket) return ticket;

  const populatedUser = ticket.userId && typeof ticket.userId === 'object' ? ticket.userId : null;
  const populatedReceiver = ticket.receiverId && typeof ticket.receiverId === 'object' ? ticket.receiverId : null;
  const actualUserEmail = populatedUser?.email || ticket.email || '';
  const actualUserName = populatedUser?.name || ticket.name || '';
  const requesterCompanyName = ticket.userType === 'employer'
    ? (populatedUser?.companyName || ticket.companyName || '')
    : ticket.userType === 'placement'
      ? (populatedUser?.collegeName || ticket.collegeName || '')
    : '';
  const associatedCompanyName = ticket.userType === 'candidate'
    ? (populatedReceiver?.brandName || populatedReceiver?.companyName || populatedReceiver?.name || '')
    : requesterCompanyName;
  const requesterDisplayName = ticket.userType === 'employer'
    ? (requesterCompanyName || actualUserName || ticket.name || 'N/A')
    : (actualUserName || ticket.name || requesterCompanyName || 'N/A');

  return {
    ...ticket,
    actualUserName,
    actualUserEmail,
    actualCompanyName: requesterCompanyName,
    associatedCompanyName,
    requesterDisplayName
  };
};

// Support Ticket Management Controllers
exports.getSupportTickets = async (req, res) => {
  try {
    const { status, userType, priority, page = 1, limit = 20 } = req.query;
    
    let query = { receiverRole: 'admin' };
    if (status) query.status = status;
    if (userType) query.userType = userType;
    if (priority) query.priority = priority;

    const tickets = await Support.find(query)
      .populate('userId', 'name email companyName collegeName')
      .populate('receiverId', 'name companyName brandName')
      .populate('jobId', 'title companyName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalTickets = await Support.countDocuments(query);
    const unreadCount = await Support.countDocuments({ ...query, isRead: false });

    res.json({ 
      success: true, 
      tickets: tickets.map(enrichSupportTicketRequester),
      totalTickets,
      unreadCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalTickets / parseInt(limit))
    });
  } catch (error) {
    console.error('Error in getSupportTickets:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch support tickets' });
  }
};

exports.getSupportTicketById = async (req, res) => {
  try {
    const ticket = await Support.findOneAndUpdate(
      { _id: req.params.id, receiverRole: 'admin' },
      { isRead: true },
      { new: true }
    )
      .populate('userId', 'name email companyName collegeName')
      .populate('receiverId', 'name companyName brandName')
      .populate('jobId', 'title companyName')
      .lean();
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    res.json({ success: true, ticket: enrichSupportTicketRequester(ticket) });
  } catch (error) {
    console.error('Error in getSupportTicketById:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch ticket' });
  }
};

exports.updateSupportTicketStatus = async (req, res) => {
  try {
    const { status, response } = req.body;
    const ticketId = req.params.id;
    
    // Validate ticket ID
    if (!ticketId || !mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket ID provided' });
    }
    
    // Validate status
    const validStatuses = ['new', 'in-progress', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided' });
    }
    
    const updateData = { 
      status,
      isRead: true // Mark as read when admin updates
    };
    
    if (response && response.trim()) {
      updateData.response = response.trim();
      updateData.respondedAt = new Date();
      updateData.respondedBy = req.user.id;
    }

    const ticket = await Support.findOneAndUpdate(
      { _id: req.params.id, receiverRole: 'admin' },
      updateData,
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email companyName collegeName')
      .populate('receiverId', 'name companyName brandName')
      .populate('jobId', 'title companyName')
      .populate('respondedBy', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    // Create notification for user if responded or status changed
    if ((response && response.trim()) || status === 'resolved' || status === 'closed') {
      try {
        let notificationTitle = 'Support Ticket Updated';
        let notificationMessage = `Your support ticket "${ticket.subject}" has been updated by admin.`;
        
        if (response && response.trim()) {
          notificationTitle = 'TaleGlobal: Support Desk';
          notificationMessage = `Subject: ${ticket.subject}\n\nStatus: ${status.toUpperCase()}\n\nAdmin Response:\n${response.trim()}`;
        } else if (status === 'resolved') {
          notificationTitle = 'Support Ticket Resolved';
          notificationMessage = `Subject: ${ticket.subject}\n\nYour support ticket has been resolved by admin.\n\nStatus: RESOLVED`;
        } else if (status === 'closed') {
          notificationTitle = 'Support Ticket Closed';
          notificationMessage = `Subject: ${ticket.subject}\n\nYour support ticket has been closed by admin.\n\nStatus: CLOSED`;
        }
        
        // Find user by email if userId not available
        let targetUserId = ticket.userId;
        if (!targetUserId && ticket.email) {
          if (ticket.userType === 'employer') {
            const employer = await Employer.findByEmail(ticket.email);
            targetUserId = employer?._id;
          } else if (ticket.userType === 'candidate') {
            const candidate = await Candidate.findByEmail(ticket.email);
            targetUserId = candidate?._id;
          } else if (ticket.userType === 'placement') {
            const placement = await Placement.findByEmail(ticket.email);
            targetUserId = placement?._id;
          }
        }
        
        if (targetUserId) {
          const notificationData = {
            title: notificationTitle,
            message: notificationMessage,
            type: 'support_response',
            role: ticket.userType === 'guest' ? 'candidate' : ticket.userType,
            createdBy: req.user.id
          };
          
          // Use candidateId for candidate notifications, relatedId for others
          if (ticket.userType === 'candidate' || ticket.userType === 'guest') {
            notificationData.candidateId = targetUserId;
          } else if (ticket.userType === 'placement') {
            notificationData.placementId = targetUserId;
            notificationData.relatedId = targetUserId;
          } else {
            notificationData.relatedId = targetUserId;
          }
          
          console.log('Creating support notification with full response:', {
            title: notificationTitle,
            messageLength: notificationMessage.length,
            hasResponse: !!(response && response.trim()),
            status: status,
            isCandidateNotif: ticket.userType === 'candidate' || ticket.userType === 'guest'
          });
          
          await createNotification(notificationData);
        }
      } catch (notifError) {
        console.error('Error creating support response notification:', notifError);
        // Don't fail the request if notification fails
      }
    } else {
      console.log('No notification created - no response or status change:', {
        hasResponse: !!(response && response.trim()),
        status: status,
        isResolved: status === 'resolved',
        isClosed: status === 'closed'
      });
    }

    res.json({ 
      success: true, 
      ticket,
      message: `Support ticket ${status === 'closed' ? 'closed' : 'updated'} successfully`
    });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSupportTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    // Validate ticket ID
    if (!ticketId || !mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket ID provided' });
    }
    
    const ticket = await Support.findOneAndDelete({ _id: ticketId, receiverRole: 'admin' });
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    res.json({ success: true, message: 'Support ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting support ticket:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadSupportAttachment = async (req, res) => {
  try {
    const { ticketId, attachmentIndex } = req.params;
    
    const ticket = await Support.findOne({ _id: ticketId, receiverRole: 'admin' }).lean();
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    const attachment = ticket.attachments[parseInt(attachmentIndex)];
    if (!attachment) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    let buffer;
    let mimeType;
    const rawAttachmentData = typeof attachment.data === 'string' ? attachment.data.trim() : '';
    const normalizedAttachmentPath = rawAttachmentData
      ? rawAttachmentData.replace(/\\/g, '/')
      : '';
    const uploadsIndex = normalizedAttachmentPath.toLowerCase().indexOf('/uploads/');
    const relativeUploadPath = uploadsIndex >= 0
      ? normalizedAttachmentPath.slice(uploadsIndex)
      : (normalizedAttachmentPath.toLowerCase().startsWith('uploads/')
          ? `/${normalizedAttachmentPath}`
          : '');

    if (relativeUploadPath) {
      const filePath = path.join(__dirname, '..', relativeUploadPath);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'Attachment file not found' });
      }

      buffer = fs.readFileSync(filePath);
      mimeType = attachment.mimetype || getMimeType(filePath);
    } else if (rawAttachmentData.startsWith('data:')) {
      const converted = base64ToBuffer(rawAttachmentData);
      buffer = converted.buffer;
      mimeType = attachment.mimetype || converted.mimeType;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported attachment format stored for this ticket'
      });
    }
    
    if (req.query.download === '1') {
      res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
    }
    res.setHeader('Content-Type', mimeType);
    res.send(buffer);
  } catch (error) {
    console.error('Error in downloadSupportAttachment:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to download attachment' });
  }
};


// Get placement candidate statistics
exports.getPlacementCandidateStats = async (req, res) => {
  try {
    const totalCandidates = await PlacementCandidate.countDocuments();
    const approvedCandidates = await PlacementCandidate.countDocuments({ status: 'approved' });
    const pendingCandidates = await PlacementCandidate.countDocuments({ status: 'pending' });
    const rejectedCandidates = await PlacementCandidate.countDocuments({ status: 'rejected' });
    
    const emailsSent = await PlacementCandidate.countDocuments({ welcomeEmailSent: true });
    const emailsPending = await PlacementCandidate.countDocuments({ 
      status: 'approved',
      welcomeEmailSent: { $ne: true }
    });
    
    // Get Placement Dean with candidate counts
    const placementOfficerStats = await PlacementCandidate.aggregate([
      {
        $group: {
          _id: '$placementId',
          placementOfficerName: { $first: '$placementOfficerName' },
          collegeName: { $first: '$collegeName' },
          totalCandidates: { $sum: 1 },
          approvedCandidates: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          emailsSent: {
            $sum: { $cond: ['$welcomeEmailSent', 1, 0] }
          }
        }
      },
      { $sort: { totalCandidates: -1 } },
      { $limit: 10 }
    ]);
    
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivity = await PlacementCandidate.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    res.json({
      success: true,
      stats: {
        totalCandidates,
        approvedCandidates,
        pendingCandidates,
        rejectedCandidates,
        emailsSent,
        emailsPending,
        recentActivity
      },
      placementOfficerStats
    });
  } catch (error) {
    console.error('Error getting placement candidate stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk approve all students in a placement
exports.approveAllStudentsInPlacement = async (req, res) => {
  try {
    const { id: placementId } = req.params;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement Dean not found' });
    }

    let totalProcessed = 0;
    let totalEmailsSent = 0;
    let totalEmailsFailed = 0;
    let totalErrors = 0;
    let rejectedFiles = 0;
    const processedFiles = [];
    
    // Process all pending files in fileHistory
    if (placement.fileHistory && placement.fileHistory.length > 0) {
      for (let file of placement.fileHistory) {
        if (file.status === 'pending' && file.fileData) {
          try {
            const { base64ToBuffer } = require('../utils/base64Helper');
            const result = base64ToBuffer(file.fileData);
            const buffer = result.buffer;

            let workbook;
            if (file.fileType && file.fileType.includes('csv')) {
              const csvData = buffer.toString('utf8');
              workbook = XLSX.read(csvData, { type: 'string' });
            } else {
              workbook = XLSX.read(buffer, { type: 'buffer' });
            }
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const emailConflicts = await findPlacementFileEmailConflicts(jsonData);
            if (emailConflicts.hasConflicts) {
              await rejectPlacementFileForConflicts({
                placementId,
                fileId: file._id,
                rejectionReason: emailConflicts.message,
                rejectedBy: req.user.id
              });

              rejectedFiles++;
              totalErrors++;
              processedFiles.push({
                fileName: file.customName || file.fileName,
                status: 'rejected',
                reason: emailConflicts.message,
                duplicateEmails: emailConflicts.duplicateEmails,
                existingEmails: emailConflicts.existingEmails,
                studentsProcessed: 0,
                emailsSent: 0,
                emailsFailed: 0
              });
              continue;
            }
            
            let fileProcessed = 0;
            let fileEmailsSent = 0;
            let fileEmailsFailed = 0;
            
            // Process each row from Excel
            for (let index = 0; index < jsonData.length; index++) {
              try {
                const row = jsonData[index];
                let email = row.Email || row.email || row.EMAIL;
                let password = row.Password || row.password || row.PASSWORD;
                let name = row.Name || row.name || row.NAME || row['Full Name'] || row['Student Name'] || row['Candidate Name'];
                const phone = row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile;
                const course = row.Course || row.course || row.Branch || row.branch;
                const collegeName = row['College Name'] || row.College || placement.collegeName;
                
                // Auto-generate missing fields
                if (!email || email.trim() === '') {
                  email = `student${index + 1}@${placement.collegeName.toLowerCase().replace(/\s+/g, '')}.edu`;
                }
                if (!password || password.trim() === '') {
                  password = `pwd${Math.random().toString(36).substr(2, 8)}`;
                }
                if (!name || name.trim() === '') {
                  name = `Student ${index + 1}`;
                }
                
                // Check if user already exists in any role
                const existingUser = await checkEmailExists(email);
                let candidate;
                
                if (existingUser) {
                  // If it's a candidate, we might want to still process them for placement
                  if (existingUser.role === 'candidate') {
                    console.log(`User ${email} already exists as candidate. Checking placement record...`);
                    candidate = existingUser.user;
                    
                    // Check if they already have a placement candidate record for THIS placement and file
                    const existingPC = await PlacementCandidate.findOne({
                      candidateId: candidate._id,
                      placementId: placement._id
                    });
                    
                    if (existingPC && existingPC.welcomeEmailSent) {
                      console.log(`Skipping existing candidate: ${email} - Placement record already exists and email sent.`);
                      continue;
                    }
                    
                    // If we reach here, we will update/create the placement record and send email
                    console.log(`Proceeding with existing candidate: ${email} to send welcome email.`);
                  } else {
                    console.log(`Skipping existing user: ${email} in role: ${existingUser.role}`);
                    continue;
                  }
                }
                
                const rowCredits = parseInt(row['Credits Assigned'] || row.Credits || file.credits || placement.credits || 0);
                
                if (!candidate) {
                  // Create candidate
                  candidate = await Candidate.create({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password: password.trim(),
                    phone: phone ? phone.toString().trim() : '',
                    course: course ? course.trim() : '',
                    credits: rowCredits,
                    registrationMethod: 'placement',
                    placementId: placement._id,
                    fileId: file._id,
                    isVerified: true,
                    status: 'active'
                  });
                  
                  // Create candidate profile
                  await CandidateProfile.create({ 
                    candidateId: candidate._id,
                    collegeName: collegeName || placement.collegeName,
                    education: [{
                      degreeName: course ? course.trim() : '',
                      collegeName: collegeName || placement.collegeName,
                      scoreType: 'percentage',
                      scoreValue: '0'
                    }]
                  });
                } else {
                  // Update existing candidate credits if needed
                  if (rowCredits > 0) {
                    await Candidate.findByIdAndUpdate(candidate._id, {
                      $inc: { credits: rowCredits }
                    });
                  }
                }
                
                // Create or Update placement candidate record
                let placementCandidate = await PlacementCandidate.findOne({
                  candidateId: candidate._id,
                  placementId: placement._id
                });
                
                if (placementCandidate) {
                   placementCandidate.status = 'approved';
                   placementCandidate.approvedAt = new Date();
                   placementCandidate.approvedBy = req.user.id;
                   placementCandidate.creditsAssigned = (placementCandidate.creditsAssigned || 0) + rowCredits;
                   placementCandidate.studentName = name.trim();
                   placementCandidate.studentPhone = phone ? phone.toString().trim() : placementCandidate.studentPhone;
                   placementCandidate.course = course ? course.trim() : placementCandidate.course;
                   placementCandidate.fileId = file._id;
                   placementCandidate.fileName = file.customName || file.fileName;
                   await placementCandidate.save();
                } else {
                  placementCandidate = await PlacementCandidate.create({
                    candidateId: candidate._id,
                    studentName: name.trim(),
                    studentEmail: email.trim().toLowerCase(),
                    studentPhone: phone ? phone.toString().trim() : '',
                    course: course ? course.trim() : '',
                    collegeName: collegeName || placement.collegeName,
                    placementId: placement._id,
                    placementOfficerName: placement.name,
                    placementOfficerEmail: placement.email,
                    placementOfficerPhone: placement.phone,
                    fileId: file._id,
                    fileName: file.customName || file.fileName,
                    status: 'approved',
                    approvedAt: new Date(),
                    approvedBy: req.user.id,
                    creditsAssigned: rowCredits,
                    originalRowData: row
                  });
                }
                
                // Send welcome email
                try {
                  const { sendPlacementCandidateWelcomeEmail } = require('../utils/emailService');
                  await sendPlacementCandidateWelcomeEmail(
                    email.trim().toLowerCase(),
                    name.trim(),
                    password.trim(),
                    placement.name,
                    collegeName || placement.collegeName,
                    rowCredits
                  );
                  
                  await PlacementCandidate.findByIdAndUpdate(
                    placementCandidate._id,
                    { 
                      welcomeEmailSent: true,
                      welcomeEmailSentAt: new Date()
                    }
                  );
                  
                  fileEmailsSent++;
                } catch (emailError) {
                  console.error(`Failed to send welcome email to ${email}:`, emailError);
                  fileEmailsFailed++;
                }
                
                fileProcessed++;
              } catch (rowError) {
                console.error('Row processing error:', rowError);
                totalErrors++;
              }
            }
            
            // Update file status
            await Placement.findOneAndUpdate(
              { _id: placementId, 'fileHistory._id': file._id },
              { 
                $set: { 
                  'fileHistory.$.status': 'processed',
                  'fileHistory.$.processedAt': new Date(),
                  'fileHistory.$.candidatesCreated': fileProcessed
                }
              }
            );
            
            processedFiles.push({
              fileName: file.customName || file.fileName,
              studentsProcessed: fileProcessed,
              emailsSent: fileEmailsSent,
              emailsFailed: fileEmailsFailed
            });
            
            totalProcessed += fileProcessed;
            totalEmailsSent += fileEmailsSent;
            totalEmailsFailed += fileEmailsFailed;
            
          } catch (fileError) {
            console.error(`Error processing file ${file.fileName}:`, fileError);
            totalErrors++;
          }
        }
      }
    }
    
    // Create comprehensive notification
    try {
      await createNotification({
        title: 'Bulk Student Approval Completed',
        message: `All pending students in ${placement.collegeName} have been processed. ${totalProcessed} students approved, ${totalEmailsSent} welcome emails sent successfully.${rejectedFiles > 0 ? ` ${rejectedFiles} ${rejectedFiles === 1 ? 'file was' : 'files were'} rejected because they contained duplicate or already-registered emails.` : ''}`,
        type: 'bulk_approval_completed',
        role: 'admin',
        relatedId: placementId,
        createdBy: req.user.id
      });
    } catch (notifError) {
      console.error('Notification creation failed:', notifError);
    }
    
    res.json({
      success: true,
      message: `Bulk approval completed! ${totalProcessed} students approved and ${totalEmailsSent} welcome emails sent.${rejectedFiles > 0 ? ` ${rejectedFiles} ${rejectedFiles === 1 ? 'file was' : 'files were'} rejected and must be resubmitted with only new email addresses.` : ''}`,
      stats: {
        totalStudentsProcessed: totalProcessed,
        totalEmailsSent: totalEmailsSent,
        totalEmailsFailed: totalEmailsFailed,
        totalErrors: totalErrors,
        rejectedFiles: rejectedFiles,
        filesProcessed: processedFiles.length
      },
      processedFiles: processedFiles,
      loginInstructions: {
        url: 'http://localhost:3000/',
        message: 'All approved students have received welcome emails with login credentials'
      }
    });
    
  } catch (error) {
    console.error('Error in bulk approval:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Sub Admin Profile
exports.getSubAdminProfile = async (req, res) => {
  try {
    const subAdmin = await SubAdmin.findById(req.user.id)
      .select('-password -resetPasswordOTP -resetPasswordOTPExpires')
      .populate('createdBy', 'name email')
      .lean();
    
    if (!subAdmin) {
      return res.status(404).json({ success: false, message: 'Sub Admin not found' });
    }

    // Set cache headers to prevent stale data
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({ success: true, subAdmin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Admin Profile
exports.getAdminProfile = async (req, res) => {
  try {
    let admin;
    if (req.user.role === 'admin' || req.user.role === 'super-admin') {
      admin = await Admin.findById(req.user.id).select('-password');
    } else {
      admin = await SubAdmin.findById(req.user.id).select('-password');
    }
    
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    res.json({ success: true, profile: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// OTP-based Password Reset for Admin/SubAdmin
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await Admin.findByEmail(email.trim());
    let userType = 'Admin';
    
    if (!user) {
      user = await SubAdmin.findByEmail(email.trim());
      userType = 'SubAdmin';
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const { sendOTPEmail } = require('../utils/emailService');
    await sendOTPEmail(email, otp, user.name);

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyOTPAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    let user = await Admin.findByEmail(email.trim());
    
    if (!user || user.resetPasswordOTP !== otp || (user.resetPasswordOTPExpires && user.resetPasswordOTPExpires < Date.now())) {
      user = await SubAdmin.findByEmail(email.trim());
    }

    if (!user || user.resetPasswordOTP !== otp || (user.resetPasswordOTPExpires && user.resetPasswordOTPExpires < Date.now())) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPasswordDirect = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const normalizedEmail = email.trim();

    let user = await Admin.findByEmail(normalizedEmail);

    if (!user) {
      user = await SubAdmin.findByEmail(normalizedEmail);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
