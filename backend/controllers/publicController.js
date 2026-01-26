const mongoose = require('mongoose');
const Job = require('../models/Job');
const Blog = require('../models/Blog');
const Contact = require('../models/Contact');
const Support = require('../models/Support');
const Testimonial = require('../models/Testimonial');
const Partner = require('../models/Partner');
const FAQ = require('../models/FAQ');
const Review = require('../models/Review');
const { cache } = require('../utils/cache');
const { isDBConnected } = require('../config/database');

// Job Controllers
exports.getJobs = async (req, res) => {
  try {
    // Check if database is connected
    if (!isDBConnected()) {
      return res.json({ success: true, jobs: [], total: 0, message: 'Database offline' });
    }
    
    const { location, jobType, category, search, title, employerId, employmentType, skills, keyword, jobTitle, education, page = 1, limit = 10, sortBy } = req.query;
    
    // Create cache key for this specific query
    const cacheKey = `jobs_${JSON.stringify({ location, jobType, category, search, title, employerId, employmentType, skills, keyword, jobTitle, education, page, limit, sortBy })}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

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
      .populate({
        path: 'employerId',
        select: 'companyName employerType',
        match: { status: 'active', isApproved: true }
      })
      .select('title location jobType vacancies category ctc createdAt employerId companyName companyLogo education')
      .sort(sortCriteria)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const totalJobs = await Job.countDocuments(query);
    const filteredJobs = jobs.filter(job => job.employerId);

    // Optimize employer profile fetching with batch query
    const EmployerProfile = require('../models/EmployerProfile');
    const employerIds = filteredJobs.map(job => job.employerId._id);
    const profiles = await EmployerProfile.find({ employerId: { $in: employerIds } })
      .select('employerId logo companyName')
      .lean();
    
    // Create profile lookup map
    const profileMap = new Map();
    profiles.forEach(profile => {
      profileMap.set(profile.employerId.toString(), profile);
    });
    
    // Add profiles to jobs
    const jobsWithProfiles = filteredJobs.map(job => ({
      ...job,
      employerProfile: profileMap.get(job.employerId._id.toString()),
      postedBy: job.employerId.employerType === 'consultant' ? 'Consultant' : 'Company'
    }));
    
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
    
    // Cache for 30 seconds for faster updates
    cache.set(cacheKey, response, 30000);
    
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
      select: 'companyName status isApproved employerType',
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
    
    console.log('Found employer profile:', !!employerProfile);
    if (employerProfile) {
      console.log('Profile logo exists:', !!employerProfile.logo);
      console.log('Profile cover exists:', !!employerProfile.coverImage);
    }
    
    const jobWithProfile = {
      ...job,
      employerProfile,
      postedBy: job.employerId.employerType === 'consultant' ? 'Consultant' : 'Company'
    };

    const response = { success: true, job: jobWithProfile };
    cache.set(cacheKey, response, 60000); // Cache for 1 minute
    
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
    
    const contact = await Contact.create({
      name, email, phone, subject, message
    });

    res.status(201).json({ 
      success: true, 
      message: 'Contact form submitted successfully',
      contact 
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
      .populate('employerId', 'name email phone companyName');
    
    // If no profile exists, create basic profile from employer data
    if (!profile) {
      const employer = await Employer.findById(req.params.id);
      if (!employer) {
        return res.status(404).json({ success: false, message: 'Employer not found' });
      }
      
      profile = {
        employerId: employer,
        companyName: employer.companyName,
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
    
    cache.set(cacheKey, response, 30000);
    res.json(response);
  } catch (error) {
    console.error('Error in getEmployers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTopRecruiters = async (req, res) => {
  try {
    // Check if database is connected
    if (!isDBConnected()) {
      return res.json({ success: true, recruiters: [], total: 0, message: 'Database offline' });
    }
    
    const { limit = 8 } = req.query;
    const Employer = require('../models/Employer');
    const EmployerProfile = require('../models/EmployerProfile');
    
    // Get active and approved employers
    const employers = await Employer.find({ 
      status: 'active', 
      isApproved: true 
    }).select('_id companyName employerType createdAt');
    
    // Get job counts and profiles for each employer
    const recruitersWithData = await Promise.all(
      employers.map(async (employer) => {
        // Get job count for this employer
        const jobCount = await Job.countDocuments({
          employerId: employer._id,
          status: { $in: ['active', 'pending'] }
        });
        
        // Get employer profile
        const profile = await EmployerProfile.findOne({ employerId: employer._id });
        
        return {
          _id: employer._id,
          companyName: employer.companyName,
          employerType: employer.employerType,
          jobCount,
          logo: profile?.logo || null,
          description: profile?.description || profile?.companyDescription || 'Leading recruitment company',
          location: profile?.location || profile?.corporateAddress || 'Multiple Locations',
          industry: profile?.industry || profile?.industrySector || 'Various Industries',
          establishedSince: profile?.establishedSince || (profile?.foundedYear ? profile.foundedYear.toString() : null),
          teamSize: profile?.teamSize || profile?.companySize || null,
          website: profile?.website || null
        };
      })
    );
    
    // Sort by job count (descending) and take top recruiters
    const topRecruiters = recruitersWithData
      .filter(recruiter => recruiter.jobCount > 0) // Only include recruiters with active jobs
      .sort((a, b) => b.jobCount - a.jobCount)
      .slice(0, parseInt(limit));
    
    res.json({ 
      success: true, 
      recruiters: topRecruiters,
      total: topRecruiters.length
    });
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

    const cacheKey = 'job_filter_counts';
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    // Get all active jobs with approved employers
    const jobs = await Job.find({
      status: { $in: ['active', 'pending'] },
      'employerId': { $exists: true }
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
        locationCounts[job.location] = (locationCounts[job.location] || 0) + 1;
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

    // Cache for 60 seconds
    cache.set(cacheKey, response, 60000);
    
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

    const { name, email, phone, userType, userId, subject, category, priority, message, receiverRole, receiverId } = req.body;
    
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
      const { fileToBase64 } = require('../middlewares/upload');
      
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
          data: fileToBase64(file),
          size: file.size,
          mimetype: file.mimetype
        }));
      } catch (conversionError) {
        console.error('File conversion error:', conversionError);
        return res.status(400).json({
          success: false,
          message: 'Failed to process uploaded files. Please try with smaller files.'
        });
      }
    }

    // Create support ticket
    const supportData = {
      name,
      email,
      phone,
      userType,
      subject,
      category: category || 'general',
      priority: priority || 'medium',
      message,
      receiverRole: receiverRole || 'admin',
      receiverId: receiverId || null,
      attachments
    };

    // Add user reference if provided
    if (userId && userType !== 'guest') {
      supportData.userId = userId;
      supportData.userModel = userType === 'employer' ? 'Employer' : 'Candidate';
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