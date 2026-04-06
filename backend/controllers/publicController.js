const mongoose = require('mongoose');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Blog = require('../models/Blog');
const Contact = require('../models/Contact');
const Support = require('../models/Support');
const Testimonial = require('../models/Testimonial');
const Partner = require('../models/Partner');
const FAQ = require('../models/FAQ');
const Review = require('../models/Review');
const { cache } = require('../utils/cache');
const { isDBConnected } = require('../config/database');

const resolveEmployerPostingType = (employer, profile) => {
  const employerType = employer?.employerType?.toString().trim().toLowerCase();
  const employerCategory = profile?.employerCategory?.toString().trim().toLowerCase();

  if (employerType === 'consultant' || employerCategory === 'consultancy') {
    return {
      employerType: 'consultant',
      postedBy: 'Consultant'
    };
  }

  return {
    employerType: 'company',
    postedBy: 'Company'
  };
};

// Job Controllers
exports.getJobs = async (req, res) => {
  try {
    // Check if database is connected
    if (!isDBConnected()) {
      return res.json({ success: true, jobs: [], total: 0, message: 'Database offline' });
    }
    
    const { location, jobType, category, search, title, employerId, employmentType, skills, keyword, jobTitle, education, page = 1, limit = 10, sortBy } = req.query;
    
    // Optimized query building
    let query = { 
      status: { $in: ['active', 'pending'] },
      'employerId': { $exists: true }
    };
    
    if (employerId) {
      try {
        query.employerId = new mongoose.Types.ObjectId(employerId);
      } catch (e) {
        query.employerId = employerId;
      }
      // Override status to only active when filtering by specific employer
      query.status = 'active';
    }
    if (title) query.title = { $regex: title, $options: 'i' };
    if (location) query.location = { $regex: location, $options: 'i' };

    if (employmentType) {
      if (Array.isArray(employmentType) && employmentType.length > 0) {
        query.typeOfEmployment = { $in: employmentType };
      } else if (typeof employmentType === 'string' && employmentType !== '') {
        query.typeOfEmployment = employmentType;
      }
    }
    
    if (jobType) {
      if (Array.isArray(jobType) && jobType.length > 0) {
        query.jobType = { $in: jobType };
      } else if (typeof jobType === 'string' && jobType !== '') {
        query.jobType = jobType;
      }
    }
    
    const searchTerms = [search, keyword, jobTitle].filter(Boolean);
    if (searchTerms.length > 0) {
      const searchRegex = new RegExp(searchTerms.join('|'), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { requiredSkills: { $in: [searchRegex] } }
      ];
    }
    
    if (category) {
      if (Array.isArray(category) && category.length > 0) {
        query.category = { $in: category };
      } else if (typeof category === 'string' && category !== '') {
        query.category = { $regex: category, $options: 'i' };
      }
    }
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      query.requiredSkills = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
    }

    if (education) {
      const educationArray = Array.isArray(education) ? education : [education];
      if (educationArray.length > 0) {
        query.education = { $in: [...educationArray, "Any"] };
      }
    }

    const sortMap = {
      'Most Recent': { createdAt: -1 },
      'Oldest': { createdAt: 1 },
      'Salary High to Low': { 'ctc.max': -1, 'ctc.min': -1 },
      'Salary Low to High': { 'ctc.min': 1, 'ctc.max': 1 },
      'A-Z': { title: 1 },
      'Z-A': { title: -1 }
    };
    const sortCriteria = sortMap[sortBy] || { createdAt: -1 };

    // Optimized query for better performance
    const jobs = await Job.find(query)
      .select('title location jobType applicationLimit category ctc createdAt employerId companyName companyLogo education shift lastDateOfApplication lastDateOfApplicationTime vacancies')
      .sort(sortCriteria)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const totalJobs = await Job.countDocuments(query);
    const employerIds = jobs.map(job => job.employerId).filter(Boolean);
    const jobIds = jobs.map(job => job._id);

    const [profiles, employers, applicationCounts] = await Promise.all([
      require('../models/EmployerProfile').find({ employerId: { $in: employerIds } })
        .select('employerId logo companyName brandName')
        .lean(),
      require('../models/Employer').find({ _id: { $in: employerIds } })
        .select('companyName brandName employerType status isApproved')
        .lean(),
      require('../models/Application').aggregate([
        { $match: { jobId: { $in: jobIds }, paymentStatus: 'paid' } },
        { $group: { _id: '$jobId', count: { $sum: 1 } } }
      ])
    ]);

    const profileMap = new Map();
    profiles.forEach(profile => {
      profileMap.set(profile.employerId.toString(), profile);
    });

    const employerMap = new Map();
    employers.forEach(emp => {
      employerMap.set(emp._id.toString(), emp);
    });

    const applicationCountMap = new Map();
    applicationCounts.forEach(item => {
      applicationCountMap.set(item._id.toString(), item.count);
    });

    const filteredJobs = jobs.filter(job => {
      const employer = employerMap.get(job.employerId.toString());
      const applicationCount = applicationCountMap.get(job._id.toString()) || 0;
      const applicationLimit = parseInt(job.applicationLimit, 10) || 0;
      // Filter out jobs where applications have reached the limit (0 means closed)
      const hasAvailableSlots = applicationCount < applicationLimit;
      
      // Filter out jobs past application deadline
      const now = new Date();
      let isBeforeDeadline = true;
      if (job.lastDateOfApplication) {
        const deadline = new Date(job.lastDateOfApplication);
        if (job.lastDateOfApplicationTime) {
          const [hours, minutes] = job.lastDateOfApplicationTime.split(':');
          deadline.setHours(parseInt(hours), parseInt(minutes), 59, 999);
        } else {
          deadline.setHours(23, 59, 59, 999);
        }
        isBeforeDeadline = now <= deadline;
      }
      
      return employer && employer.status === 'active' && employer.isApproved && hasAvailableSlots && isBeforeDeadline;
    });
    
    const jobsWithProfiles = filteredJobs.map(job => {
      const employer = employerMap.get(job.employerId.toString());
      const employerProfile = profileMap.get(job.employerId.toString());
      const applicationCount = applicationCountMap.get(job._id.toString()) || 0;
      const postingType = resolveEmployerPostingType(employer, employerProfile);
      return {
        ...job,
        employerProfile,
        employerType: postingType.employerType,
        postedBy: postingType.postedBy,
        applicationCount
      };
    });
    
    const response = {
      success: true,
      jobs: jobsWithProfiles,
      total: jobsWithProfiles.length,
      totalCount: totalJobs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalJobs / parseInt(limit)),
      hasNextPage: parseInt(page) < Math.ceil(totalJobs / parseInt(limit)),
      hasPrevPage: parseInt(page) > 1
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in getJobs:', error);
    res.json({ success: true, jobs: [], total: 0 });
  }
};

exports.getJobsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const jobs = await Job.find({ 
      status: 'active',
      category: new RegExp(category, 'i')
    })
    .populate({
      path: 'employerId',
      select: 'companyName brandName status isApproved employerType',
      match: { status: 'active', isApproved: true }
    })
    .sort({ createdAt: -1 });
    
    const approvedJobs = jobs.filter(job => job.employerId);
    const roles = [...new Set(approvedJobs.map(job => job.title))];
    
    res.json({ success: true, roles, jobs: approvedJobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const cacheKey = `job_${req.params.id}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const job = await Job.findById(req.params.id)
      .populate({
        path: 'employerId',
        select: 'companyName email phone employerType'
      })
      .lean();
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const EmployerProfile = require('../models/EmployerProfile');
    const employerProfile = await EmployerProfile.findOne({ employerId: job.employerId._id }).lean();
    const postingType = resolveEmployerPostingType(job.employerId, employerProfile);
    
    console.log('Found employer profile:', !!employerProfile);
    if (employerProfile) {
      console.log('Profile logo exists:', !!employerProfile.logo);
      console.log('Profile cover exists:', !!employerProfile.coverImage);
    }
    
    const jobWithProfile = {
      ...job,
      employerProfile,
      employerType: postingType.employerType,
      postedBy: postingType.postedBy
    };

    const response = { success: true, job: jobWithProfile };
    cache.set(cacheKey, response, 600000); // Cache for 10 minutes
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchJobs = async (req, res) => {
  try {
    const { q, location, jobType } = req.query;
    
    let query = { status: 'active' };
    
    if (q) {
      query.$or = [
        { title: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { skills: { $in: [new RegExp(q, 'i')] } }
      ];
    }
    
    if (location) query.location = new RegExp(location, 'i');
    if (jobType) query.jobType = jobType;

    const jobs = await Job.find(query)
      .populate({
        path: 'employerId',
        select: 'companyName status isApproved employerType',
        match: { status: 'active', isApproved: true }
      })
      .sort({ createdAt: -1 });

    // Filter out jobs where employer is not approved
    const filteredJobs = jobs.filter(job => job.employerId);

    res.json({ success: true, jobs: filteredJobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Blog Controllers
exports.getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    
    let query = { isPublished: true };
    if (category) query.category = category;
    
    const blogs = await Blog.find(query)
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
      isPublished: true 
    }).populate('author', 'name');
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    blog.views += 1;
    await blog.save();

    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Contact Controller
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const normalizedSubject = String(subject || '').trim() || 'Contact Us Submission';

    const [contact, supportTicket] = await Promise.all([
      Contact.create({
        name,
        email,
        phone,
        subject: normalizedSubject,
        message
      }),
      Support.create({
        name,
        email,
        phone,
        userType: 'guest',
        subject: normalizedSubject,
        category: 'general',
        priority: 'medium',
        message,
        receiverRole: 'admin'
      })
    ]);

    res.status(201).json({ 
      success: true, 
      message: 'Contact form submitted successfully',
      contact,
      ticketId: supportTicket._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Content Controllers
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    res.json({ success: true, testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPartners = async (req, res) => {
  try {
    const partners = await Partner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    res.json({ success: true, partners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFAQs = async (req, res) => {
  try {
    const { category } = req.query;
    let query = { isActive: true };
    if (category) query.category = category;
    
    const faqs = await FAQ.find(query).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Public stats for homepage (no auth)
exports.getPublicStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ status: { $in: ['active', 'pending', 'closed', 'draft'] } });
    const totalEmployers = await require('../models/Employer').countDocuments();
    const totalApplications = await require('../models/Application').countDocuments();

    res.json({
      success: true,
      stats: {
        totalJobs,
        totalEmployers,
        totalApplications,
      },
    });
  } catch (error) {
    // Return fallback stats when DB is unavailable
    res.json({
      success: true,
      stats: {
        totalJobs: 0,
        totalEmployers: 0,
        totalApplications: 0,
      },
    });
  }
};

exports.getEmployerProfile = async (req, res) => {
  try {
    const EmployerProfile = require('../models/EmployerProfile');
    const Employer = require('../models/Employer');
    
    let profile = await EmployerProfile.findOne({ employerId: req.params.id })
      .populate('employerId', 'name email phone companyName brandName employerType');
    
    // If no profile exists, create basic profile from employer data
    if (!profile) {
      const employer = await Employer.findById(req.params.id);
      if (!employer) {
        return res.status(404).json({ success: false, message: 'Employer not found' });
      }
      
      profile = {
        employerId: employer,
        companyName: employer.companyName,
        brandName: employer.brandName,
        email: employer.email,
        phone: employer.phone,
        description: 'No company description available.',
        whyJoinUs: 'No information available about why to join this company.',
        location: 'Location not specified',
        googleMapsEmbed: '',
        gallery: []
      };
    }

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployers = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy, keyword, location, industry, teamSize, companyType, establishedSince } = req.query;
    
    const keywordFilter = keyword?.trim();
    const locationFilter = location?.trim();
    const industryFilter = Array.isArray(industry) ? industry : (industry ? [industry] : []);
    const teamSizeFilter = Array.isArray(teamSize) ? teamSize : (teamSize ? [teamSize] : []);
    const companyTypeFilter = Array.isArray(companyType) ? companyType : (companyType ? [companyType] : []);
    const establishedSinceFilter = establishedSince?.trim();
    const createRegex = (value) => new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    
    const cacheKey = `employers_v4_${JSON.stringify({ page, limit, sortBy, keyword: keywordFilter, location: locationFilter, industry: industryFilter, teamSize: teamSizeFilter, companyType: companyTypeFilter, establishedSince: establishedSinceFilter })}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const Employer = require('../models/Employer');
    const EmployerProfile = require('../models/EmployerProfile');
    
    const sortMap = {
      'companyName': { companyName: 1 },
      '-companyName': { companyName: -1 },
      '-jobCount': { jobCount: -1 },
      'jobCount': { jobCount: 1 },
      '-establishedSince': { establishedSince: -1 },
      'establishedSince': { establishedSince: 1 },
      'Most Recent': { createdAt: -1 },
      'Oldest': { createdAt: 1 },
      'A-Z': { companyName: 1 },
      'Z-A': { companyName: -1 }
    };
    const sortCriteria = sortMap[sortBy] || { createdAt: -1 };

    const pipeline = [
      { $match: { status: 'active', isApproved: true } },
      {
        $lookup: {
          from: 'employerprofiles',
          localField: '_id',
          foreignField: 'employerId',
          as: 'profile',
          pipeline: [
            {
              $project: {
                // Basic Information
                logo: 1,
                coverImage: 1,
                companyName: 1,
                description: 1,
                location: 1,
                whyJoinUs: 1,
                website: 1,
                establishedSince: 1,
                teamSize: 1,
                
                // Company Details
                corporateAddress: 1,
                companyType: 1,
                industrySector: 1,
                
                // Legacy fields for backward compatibility
                industry: 1,
                companySize: 1,
                foundedYear: 1,
                companyDescription: 1
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: 'employerId',
          as: 'jobs',
          pipeline: [
            { $match: { status: { $in: ['active', 'pending'] } } },
            { $count: 'count' }
          ]
        }
      },
      {
        $addFields: {
          profile: { $arrayElemAt: ['$profile', 0] },
          jobCount: { $ifNull: [{ $arrayElemAt: ['$jobs.count', 0] }, 0] },
          establishedSince: {
            $ifNull: [
              '$profile.establishedSince',
              { $toString: '$profile.foundedYear' },
              'Not specified'
            ]
          }
        }
      }
    ];

    const matchConditions = [];

    if (keywordFilter) {
      matchConditions.push({
        $or: [
          { companyName: createRegex(keywordFilter) },
          { 'profile.companyName': createRegex(keywordFilter) }
        ]
      });
    }

    if (locationFilter) {
      const locationRegex = createRegex(locationFilter);
      matchConditions.push({
        $or: [
          { 'profile.corporateAddress': locationRegex },
          { 'profile.location': locationRegex }
        ]
      });
    }

    if (industryFilter.length > 0) {
      matchConditions.push({
        $or: [
          { 'profile.industrySector': { $in: industryFilter.map(f => new RegExp(`^${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')) } },
          { 'profile.industry': { $in: industryFilter.map(f => new RegExp(`^${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')) } }
        ]
      });
    }

    if (teamSizeFilter.length > 0) {
      matchConditions.push({
        $or: [
          { 'profile.teamSize': { $in: teamSizeFilter } },
          { 'profile.companySize': { $in: teamSizeFilter } }
        ]
      });
    }

    if (companyTypeFilter.length > 0) {
      matchConditions.push({ 'profile.companyType': { $in: companyTypeFilter } });
    }

    if (establishedSinceFilter) {
      matchConditions.push({
        $or: [
          { 'profile.establishedSince': createRegex(establishedSinceFilter) },
          { 'profile.foundedYear': parseInt(establishedSinceFilter) || 0 }
        ]
      });
    }

    if (matchConditions.length > 0) {
      pipeline.push({ $match: { $and: matchConditions } });
    }

    pipeline.push(
      {
        $project: {
          companyName: 1,
          email: 1,
          phone: 1,
          employerType: 1,
          createdAt: 1,
          profile: 1,
          jobCount: 1,
          establishedSince: 1
        }
      },
      { $sort: sortCriteria },
      {
        $facet: {
          employers: [
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
          ],
          totalCount: [{ $count: 'count' }]
        }
      }
    );

    const [result] = await Employer.aggregate(pipeline);
    const employers = result.employers || [];
    const totalEmployers = result.totalCount[0]?.count || 0;
    
    // Enhance employer data with proper field mapping
    const enhancedEmployers = employers.map(employer => {
      const profile = employer.profile || {};
      
      return {
        ...employer,
        // Use profile company name if available, fallback to employer company name
        companyName: profile.companyName || employer.companyName,
        // Map established since properly
        establishedSince: profile.establishedSince || (profile.foundedYear ? profile.foundedYear.toString() : 'Not specified'),
        profile: {
          ...profile,
          // Ensure all necessary fields are available
          logo: profile.logo,
          coverImage: profile.coverImage,
          description: profile.description || profile.companyDescription || 'We are a dynamic company focused on delivering excellent services and creating opportunities for talented professionals.',
          location: profile.location || profile.corporateAddress || 'Multiple Locations',
          teamSize: profile.teamSize || profile.companySize || 'Growing',
          industry: profile.industrySector || profile.industry || 'Various Industries',
          companyType: profile.companyType || 'Company',
          website: profile.website,
          whyJoinUs: profile.whyJoinUs
        }
      };
    });
    
    const response = {
      success: true,
      employers: enhancedEmployers,
      total: enhancedEmployers.length,
      totalCount: totalEmployers,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalEmployers / parseInt(limit)),
      hasNextPage: parseInt(page) < Math.ceil(totalEmployers / parseInt(limit)),
      hasPrevPage: parseInt(page) > 1
    };
    
    cache.set(cacheKey, response, 600000); // Cache for 10 minutes
    res.json(response);
  } catch (error) {
    console.error('Error in getEmployers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTopRecruiters = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.json({ success: true, recruiters: [], total: 0, message: 'Database offline' });
    }
    
    const { limit = 8 } = req.query;
    const cacheKey = `top_recruiters_${limit}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const Employer = require('../models/Employer');
    const EmployerProfile = require('../models/EmployerProfile');
    
    // Optimized aggregation pipeline
    const topRecruiters = await Employer.aggregate([
      { $match: { status: 'active', isApproved: true } },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: 'employerId',
          as: 'jobs',
          pipeline: [
            { $match: { status: { $in: ['active', 'pending'] } } },
            { $count: 'count' }
          ]
        }
      },
      {
        $addFields: {
          jobCount: { $ifNull: [{ $arrayElemAt: ['$jobs.count', 0] }, 0] }
        }
      },
      { $match: { jobCount: { $gt: 0 } } },
      { $sort: { jobCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 1,
          companyName: 1,
          employerType: 1,
          jobCount: 1
        }
      }
    ]);
    
    // Get profiles for top recruiters
    const employerIds = topRecruiters.map(r => r._id);
    const profiles = await EmployerProfile.find({ employerId: { $in: employerIds } })
      .select('employerId logo description location industry establishedSince teamSize website companyDescription corporateAddress industrySector companySize foundedYear')
      .lean();
    
    const profileMap = new Map();
    profiles.forEach(p => profileMap.set(p.employerId.toString(), p));
    
    const recruitersWithData = topRecruiters.map(recruiter => {
      const profile = profileMap.get(recruiter._id.toString());
      return {
        _id: recruiter._id,
        companyName: recruiter.companyName,
        employerType: recruiter.employerType,
        jobCount: recruiter.jobCount,
        logo: profile?.logo || null,
        description: profile?.description || profile?.companyDescription || 'Leading recruitment company',
        location: profile?.location || profile?.corporateAddress || 'Multiple Locations',
        industry: profile?.industry || profile?.industrySector || 'Various Industries',
        establishedSince: profile?.establishedSince || (profile?.foundedYear ? profile.foundedYear.toString() : null),
        teamSize: profile?.teamSize || profile?.companySize || null,
        website: profile?.website || null
      };
    });
    
    const response = { 
      success: true, 
      recruiters: recruitersWithData,
      total: recruitersWithData.length
    };
    
    cache.set(cacheKey, response, 600000); // Cache for 10 minutes
    res.json(response);
  } catch (error) {
    console.error('Error in getTopRecruiters:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Apply for job without login
exports.applyForJob = async (req, res) => {
  try {
    return res.status(400).json({ 
      success: false, 
      message: 'Direct application is no longer supported. Please login and apply through the job detail page with payment of ₹129.' 
    });
  } catch (error) {
    console.error('Error in applyForJob:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Review Controllers
exports.getEmployerReviews = async (req, res) => {
  try {
    const { employerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const reviews = await Review.find({ 
      employerId, 
      isApproved: true 
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    const totalReviews = await Review.countDocuments({ 
      employerId, 
      isApproved: true 
    });
    
    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $match: { employerId: new mongoose.Types.ObjectId(employerId), isApproved: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, totalCount: { $sum: 1 } } }
    ]);
    
    const averageRating = avgRating.length > 0 ? Math.round(avgRating[0].avgRating * 10) / 10 : 0;
    const reviewCount = avgRating.length > 0 ? avgRating[0].totalCount : 0;
    
    res.json({ 
      success: true, 
      reviews,
      totalReviews,
      averageRating,
      reviewCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalReviews / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitEmployerReview = async (req, res) => {
  try {
    const { employerId } = req.params;
    const { reviewerName, reviewerEmail, rating, description, image } = req.body;
    
    // Validate required fields
    if (!reviewerName || !reviewerEmail || !rating || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please select a rating between 1 and 5 stars' 
      });
    }
    
    // Check if employer exists
    const Employer = require('../models/Employer');
    const employer = await Employer.findById(employerId);
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }
    
    // Check if user already reviewed this employer
    const existingReview = await Review.findOne({ 
      employerId, 
      reviewerEmail: reviewerEmail.trim().toLowerCase() 
    });
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already submitted a review for this company' 
      });
    }
    
    // Create review
    const review = await Review.create({
      employerId,
      reviewerName: reviewerName.trim(),
      reviewerEmail: reviewerEmail.trim().toLowerCase(),
      rating: parseInt(rating),
      description: description.trim(),
      image: image || null
    });
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      reviewId: review._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubmittedReviews = async (req, res) => {
  try {
    const { employerId } = req.params;
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    const reviews = await Review.find({ 
      employerId, 
      reviewerEmail: email.toLowerCase() 
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get filter counts for job search sidebar
exports.getJobFilterCounts = async (req, res) => {
  try {
    // Check if database is connected
    if (!isDBConnected()) {
      return res.json({ 
        success: true, 
        counts: {
          jobTypes: [],
          locations: [],
          categories: [],
          designations: []
        }
      });
    }

    const cacheKey = 'job_filter_counts_v2_active_only';
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    // Get only currently active (non-expired) jobs with approved employers
    const now = new Date();
    const jobs = await Job.find({
      status: 'active',
      employerId: { $exists: true },
      $or: [
        { lastDateOfApplication: { $exists: false } },
        { lastDateOfApplication: null },
        { lastDateOfApplication: { $gte: now } }
      ]
    })
    .populate({
      path: 'employerId',
      select: 'status isApproved',
      match: { status: 'active', isApproved: true }
    })
    .select('jobType location category title requiredSkills description')
    .lean();

    // Filter out jobs where employer is not approved
    const activeJobs = jobs.filter(job => job.employerId);

    // Calculate job type counts
    const jobTypeCounts = {};
    activeJobs.forEach(job => {
      const type = job.jobType || 'full-time';
      jobTypeCounts[type] = (jobTypeCounts[type] || 0) + 1;
    });

    // Calculate location counts
    const locationCounts = {};
    activeJobs.forEach(job => {
      if (job.location) {
        if (Array.isArray(job.location)) {
          job.location.forEach(loc => {
            if (loc) locationCounts[loc] = (locationCounts[loc] || 0) + 1;
          });
        } else {
          locationCounts[job.location] = (locationCounts[job.location] || 0) + 1;
        }
      }
    });

    // Calculate category counts
    const categoryCounts = {};
    activeJobs.forEach(job => {
      if (job.category) {
        categoryCounts[job.category] = (categoryCounts[job.category] || 0) + 1;
      }
    });

    // Calculate designation/title counts
    const designationCounts = {};
    const allDesignations = new Set();
    
    activeJobs.forEach(job => {
      if (job.title) {
        allDesignations.add(job.title);
        designationCounts[job.title] = (designationCounts[job.title] || 0) + 1;
      }
      
      // Also add skills as potential designations
      if (job.requiredSkills && Array.isArray(job.requiredSkills)) {
        job.requiredSkills.forEach(skill => {
          allDesignations.add(skill);
        });
      }
      
      // Extract tech keywords from description
      if (job.description) {
        const techWords = ['React', 'Angular', 'Vue', 'Node', 'Python', 'Java', 'JavaScript', 'TypeScript', 'PHP', 'Laravel', 'Django', 'Spring', 'MongoDB', 'MySQL', 'PostgreSQL', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'HTML', 'CSS', 'Bootstrap', 'jQuery', 'Express', 'API', 'REST', 'GraphQL', 'Redux', 'DevOps', 'Linux', 'Windows', 'iOS', 'Android', 'Flutter', 'React Native', 'Swift', 'Kotlin', 'C++', 'C#', '.NET', 'Ruby', 'Rails', 'Golang', 'Rust', 'Scala', 'Jenkins', 'CI/CD', 'Agile', 'Scrum', 'Jira', 'Figma', 'Photoshop', 'Illustrator', 'Unity', 'Salesforce', 'Tableau', 'Power BI', 'Excel', 'Machine Learning', 'AI', 'Data Science', 'Big Data', 'Cloud', 'Cybersecurity', 'Blockchain', 'UI', 'UX', 'Frontend', 'Backend', 'Full Stack', 'Mobile', 'Web', 'Database', 'Testing', 'QA', 'Automation'];
        techWords.forEach(word => {
          if (job.description.toLowerCase().includes(word.toLowerCase())) {
            allDesignations.add(word);
          }
        });
      }
    });

    const response = {
      success: true,
      counts: {
        jobTypes: Object.entries(jobTypeCounts),
        locations: Object.keys(locationCounts).sort(),
        categories: Object.entries(categoryCounts),
        designations: Array.from(allDesignations).sort()
      }
    };

    // Cache for 10 minutes
    cache.set(cacheKey, response, 600000);
    
    res.json(response);
  } catch (error) {
    console.error('Error in getJobFilterCounts:', error);
    res.json({ 
      success: true, 
      counts: {
        jobTypes: [],
        locations: [],
        categories: [],
        designations: []
      }
    });
  }
};

// Support Controller
exports.submitSupportTicket = async (req, res) => {
  try {
    console.log('Support ticket submission received:', {
      ...req.body,
      attachmentsCount: req.files ? req.files.length : 0
    });

    const { name, email, phone, userType, userId, subject, category, priority, message, receiverRole, receiverId, jobId } = req.body;
    
    // Validate required fields manually as backup to express-validator
    if (!name || !email || !subject || !message || !userType) {
      console.error('Missing required fields in submitSupportTicket');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields. Please ensure name, email, subject, message and user type are provided.'
      });
    }
    let attachments = [];
    if (req.files && req.files.length > 0) {
      // Check total file size
      const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
      const maxTotalSize = 30 * 1024 * 1024; // 30MB total limit
      
      if (totalSize > maxTotalSize) {
        return res.status(413).json({
          success: false,
          message: 'Total file size exceeds 30MB limit. Please reduce file sizes or upload fewer files.'
        });
      }
      
      // Validate individual file sizes
      for (const file of req.files) {
        if (file.size > 10 * 1024 * 1024) {
          return res.status(413).json({
            success: false,
            message: `File "${file.originalname}" is too large. Maximum file size is 10MB.`
          });
        }
      }
      
      try {
        attachments = req.files.map(file => ({
          filename: file.originalname,
          originalName: file.originalname,
          data: `/uploads/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype
        }));
      } catch (conversionError) {
        console.error('File process error:', conversionError);
        return res.status(400).json({
          success: false,
          message: 'Failed to process uploaded files. Please try again.'
        });
      }
    }

    // Create support ticket
    const normalizedReceiverRole = receiverRole || 'admin';
    const normalizedReceiverId = receiverId || null;
    const normalizedJobId = jobId || null;
    let relatedCompanyName = '';
    let relatedJobTitle = '';

    if (normalizedReceiverRole === 'employer' && userType === 'candidate') {
      if (!normalizedReceiverId) {
        return res.status(400).json({
          success: false,
          message: 'Please select an employer for HR support.'
        });
      }

      if (!normalizedJobId) {
        return res.status(400).json({
          success: false,
          message: 'Please select the related job for this employer ticket.'
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(normalizedReceiverId) ||
        !mongoose.Types.ObjectId.isValid(normalizedJobId)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid employer or job selected.'
        });
      }

      const matchedApplication = await Application.findOne({
        candidateId: userId || null,
        jobId: normalizedJobId,
        paymentStatus: 'paid'
      })
        .select('_id employerId')
        .lean();

      if (!matchedApplication) {
        return res.status(400).json({
          success: false,
          message: 'The selected job is not linked to your submitted applications.'
        });
      }

      if (String(matchedApplication.employerId) !== String(normalizedReceiverId)) {
        return res.status(400).json({
          success: false,
          message: 'The selected job does not belong to the selected employer.'
        });
      }

      const matchedJob = await Job.findById(normalizedJobId)
        .populate('employerId', 'companyName brandName name')
        .select('title companyName employerId')
        .lean();

      relatedJobTitle = matchedJob?.title || '';
      relatedCompanyName =
        matchedJob?.companyName ||
        matchedJob?.employerId?.brandName ||
        matchedJob?.employerId?.companyName ||
        matchedJob?.employerId?.name ||
        '';
    }

    const supportData = {
      name,
      email,
      phone,
      userType,
      subject,
      category: category || 'general',
      priority: priority || 'medium',
      message,
      receiverRole: normalizedReceiverRole,
      receiverId: normalizedReceiverId,
      jobId: normalizedJobId,
      relatedCompanyName,
      relatedJobTitle,
      attachments
    };

    // Add user reference if provided
    if (userId && userType !== 'guest') {
      const userModelMap = {
        employer: 'Employer',
        candidate: 'Candidate',
        placement: 'Placement'
      };

      supportData.userId = userId;
      supportData.userModel = userModelMap[userType];
    }

    const support = await Support.create(supportData);

    // Skip notification creation for now to avoid validation errors
    console.log('Support ticket created successfully, skipping notification');

    res.status(201).json({ 
      success: true, 
      message: 'Support ticket submitted successfully. We will get back to you soon.',
      ticketId: support._id
    });
  } catch (error) {
    console.error('Error in submitSupportTicket:', error);
    
    // Handle specific multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File size too large. Each file must be under 10MB.'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        success: false,
        message: 'Too many files. Maximum 3 files allowed.'
      });
    }
    
    if (error.message && error.message.includes('File type not supported')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};
