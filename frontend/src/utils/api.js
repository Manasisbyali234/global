// iOS Safari compatible API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// iOS Safari compatible fetch with retry mechanism
const safeFetch = async (url, options = {}, retries = 3) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
  const fetchOptions = {
    ...options,
    signal: controller.signal,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Retry on network errors for iOS Safari
    if (retries > 0 && (error.name === 'AbortError' || error.message.includes('network'))) {
      console.log(`Retrying request to ${url}, attempts left: ${retries - 1}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return safeFetch(url, options, retries - 1);
    }
    
    throw error;
  }
};

// Helper function to get auth headers
const getAuthHeaders = (userType = 'candidate') => {
  const token = localStorage.getItem(`${userType}Token`);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper function to handle API responses with iOS Safari compatibility
const handleApiResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid - redirect to login
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    
    let errorData;
    try {
      const text = await response.text();
      errorData = text ? JSON.parse(text) : { message: 'Network error' };
    } catch (parseError) {
      errorData = { message: `HTTP ${response.status}: Request failed` };
    }
    
    throw new Error(`HTTP ${response.status}: ${errorData.message || 'Request failed'}`);
  }
  
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (parseError) {
    console.error('Failed to parse response:', text);
    throw new Error('Invalid response format');
  }
};

export const api = {
  // Health check with iOS Safari compatibility
  healthCheck: () => {
    return safeFetch('/health', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(handleApiResponse);
  },

  // Public APIs with iOS Safari compatibility
  getJobs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return safeFetch(`${API_BASE_URL}/public/jobs?${queryString}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    }).then(handleApiResponse);
  },

  getJobById: (id) => {
    return safeFetch(`${API_BASE_URL}/public/jobs/${id}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    }).then(handleApiResponse);
  },

  getCompanies: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/public/companies?${queryString}`).then((res) => res.json());
  },

  getBlogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/public/blogs?${queryString}`).then((res) => res.json());
  },

  submitContact: (data) => {
    return fetch(`${API_BASE_URL}/public/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },

  getPublicStats: () => {
    return fetch(`${API_BASE_URL}/public/stats`).then((res) => res.json());
  },

  getTopRecruiters: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/public/top-recruiters?${queryString}`).then((res) => res.json());
  },

  // Candidate APIs
  candidateRegister: (data) => {
    return fetch(`${API_BASE_URL}/candidate/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },

  candidateLogin: (data) => {
    return fetch(`${API_BASE_URL}/candidate/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },

  getCandidateProfile: () => {
    const token = localStorage.getItem('candidateToken');
    console.log('Token from localStorage:', token ? 'exists' : 'missing');
    console.log('Headers being sent:', getAuthHeaders('candidate'));
    return fetch(`${API_BASE_URL}/candidate/profile`, {
      headers: getAuthHeaders('candidate'),
    }).then(async (res) => {
      console.log('Response status:', res.status);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Network error' }));
        console.log('Error data:', errorData);
        throw new Error(`HTTP ${res.status}: ${errorData.message || 'Request failed'}`);
      }
      return res.json();
    });
  },

  updateCandidateProfile: (data) => {
    const token = localStorage.getItem('candidateToken');
    const isFormData = data instanceof FormData;
    
    return fetch(`${API_BASE_URL}/candidate/profile`, {
      method: 'PUT',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? data : JSON.stringify(data),
    }).then((res) => res.json());
  },

  // Work Location Preferences APIs
  getWorkLocationPreferences: () => {
    return fetch(`${API_BASE_URL}/candidate/work-location-preferences`, {
      headers: getAuthHeaders('candidate'),
    }).then(handleApiResponse);
  },

  updateWorkLocationPreferences: (data) => {
    return fetch(`${API_BASE_URL}/candidate/work-location-preferences`, {
      method: 'PUT',
      headers: getAuthHeaders('candidate'),
      body: JSON.stringify(data),
    }).then(handleApiResponse);
  },

  getCandidateDashboard: () => {
    return fetch(`${API_BASE_URL}/candidate/dashboard`, {
      headers: getAuthHeaders('candidate'),
    }).then((res) => res.json());
  },

  applyForJob: (jobId, applicationData) => {
    return fetch(`${API_BASE_URL}/candidate/apply/${jobId}`, {
      method: 'POST',
      headers: getAuthHeaders('candidate'),
      body: JSON.stringify(applicationData),
    }).then((res) => res.json());
  },

  getCandidateApplications: () => {
    return fetch(`${API_BASE_URL}/candidate/applications`, {
      headers: getAuthHeaders('candidate'),
    }).then((res) => res.json());
  },

  getCandidateApplicationsWithInterviews: () => {
    return fetch(`${API_BASE_URL}/candidate/applications/interviews`, {
      headers: getAuthHeaders('candidate'),
    }).then((res) => res.json());
  },

  getRecommendedJobs: () => {
    return fetch(`${API_BASE_URL}/candidate/recommended-jobs`, {
      headers: getAuthHeaders('candidate'),
    }).then((res) => res.json());
  },

  uploadResume: (formData) => {
    const token = localStorage.getItem('candidateToken');
    return fetch(`${API_BASE_URL}/candidate/upload-resume`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }).then(async (res) => {
      console.log('Upload response status:', res.status);
      console.log('Upload response headers:', Object.fromEntries(res.headers.entries()));
      
      const responseText = await res.text();
      console.log('Upload response text:', responseText);
      
      try {
        const jsonResponse = JSON.parse(responseText);
        if (!res.ok) {
          throw new Error(jsonResponse.message || `HTTP ${res.status}`);
        }
        return jsonResponse;
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Raw response:', responseText);
        throw new Error(`Server returned invalid response: ${responseText.substring(0, 100)}...`);
      }
    });
  },

  deleteResume: () => {
    return fetch(`${API_BASE_URL}/candidate/delete-resume`, {
      method: 'DELETE',
      headers: getAuthHeaders('candidate'),
    }).then((res) => res.json());
  },

  uploadIdCard: (formData) => {
    const token = localStorage.getItem('candidateToken');
    return fetch(`${API_BASE_URL}/candidate/upload-idcard`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }).then((res) => res.json());
  },

  // Education APIs
  addEducation: (formData) => {
    const token = localStorage.getItem('candidateToken');
    return fetch(`${API_BASE_URL}/candidate/education`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }).then((res) => res.json());
  },

  deleteEducation: (educationId) => {
    return fetch(`${API_BASE_URL}/candidate/education/${educationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders('candidate'),
    }).then((res) => res.json());
  },

  // Employer APIs
  employerRegister: (data) => {
    return fetch(`${API_BASE_URL}/employer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },

  employerLogin: (data) => {
    return fetch(`${API_BASE_URL}/employer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },

  getEmployerProfile: (employerId) => {
    // If employerId is provided, it's an admin request
    if (employerId) {
      return fetch(`${API_BASE_URL}/admin/employers/${employerId}/profile`, {
        headers: getAuthHeaders('admin'),
      }).then((res) => res.json());
    }
    // Otherwise, it's an employer getting their own profile
    return fetch(`${API_BASE_URL}/employer/profile`, {
      headers: getAuthHeaders('employer'),
    }).then((res) => res.json());
  },

  updateEmployerProfile: (data) => {
    return fetch(`${API_BASE_URL}/employer/profile`, {
      method: 'PUT',
      headers: getAuthHeaders('employer'),
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },

  getEmployerDashboard: () => {
    return fetch(`${API_BASE_URL}/employer/dashboard/stats`, {
      headers: getAuthHeaders('employer'),
    }).then((res) => res.json());
  },

  getEmployerProfileCompletion: () => {
    return fetch(`${API_BASE_URL}/employer/profile/completion`, {
      headers: getAuthHeaders('employer'),
    }).then((res) => res.json());
  },

  getRecentEmployerActivity: () => {
    return fetch(`${API_BASE_URL}/employer/recent-activity`, {
      headers: getAuthHeaders('employer'),
    }).then((res) => res.json());
  },

  getEmployerNotifications: () => {
    return fetch(`${API_BASE_URL}/employer/notifications`, {
      headers: getAuthHeaders('employer'),
    }).then((res) => res.json());
  },

  postJob: (jobData) => {
    return fetch(`${API_BASE_URL}/employer/jobs`, {
      method: 'POST',
      headers: getAuthHeaders('employer'),
      body: JSON.stringify(jobData),
    }).then((res) => res.json());
  },

  getEmployerJobs: () => {
    return fetch(`${API_BASE_URL}/employer/jobs`, {
      headers: getAuthHeaders('employer'),
    }).then((res) => res.json());
  },

  getEmployerJobById: (jobId) => {
    return fetch(`${API_BASE_URL}/employer/jobs/${jobId}`, {
      headers: getAuthHeaders('employer'),
    }).then((res) => res.json());
  },

  updateJob: (jobId, jobData) => {
    return fetch(`${API_BASE_URL}/employer/jobs/${jobId}`, {
      method: 'PUT',
      headers: getAuthHeaders('employer'),
      body: JSON.stringify(jobData),
    }).then((res) => res.json());
  },

  deleteJob: (jobId) => {
    return fetch(`${API_BASE_URL}/employer/jobs/${jobId}`, {
      method: 'DELETE',
      headers: getAuthHeaders('employer'),
    }).then((res) => res.json());
  },

  getJobApplications: (jobId) => {
    return fetch(`${API_BASE_URL}/employer/jobs/${jobId}/applications`, {
      headers: getAuthHeaders('employer'),
    }).then((res) => res.json());
  },

  getAllEmployerApplications: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/employer/applications?${queryString}`, {
      headers: getAuthHeaders('employer'),
    }).then((res) => res.json());
  },

  getConsultantCompanies: () => {
    return fetch(`${API_BASE_URL}/employer/consultant/companies`, {
      headers: getAuthHeaders('employer'),
    }).then((res) => res.json());
  },

  // Placement APIs
  placementLogin: (data) => {
    return fetch(`${API_BASE_URL}/placement/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },

  getPlacementProfile: () => {
    console.log('API: Getting placement profile');
    const headers = getAuthHeaders('placement');
    console.log('API: Request headers for profile fetch:', headers);
    
    return fetch(`${API_BASE_URL}/placement/profile`, {
      headers: headers,
    }).then(async (response) => {
      console.log('API: Profile fetch response status:', response.status);
      const result = await handleApiResponse(response);
      console.log('API: Profile fetch result:', result);
      return result;
    }).catch(error => {
      console.error('API: Profile fetch error:', error);
      throw error;
    });
  },

  getPlacementDashboard: () => {
    return fetch(`${API_BASE_URL}/placement/dashboard`, {
      headers: getAuthHeaders('placement'),
    }).then(handleApiResponse);
  },

  uploadStudentData: (formData) => {
    const token = localStorage.getItem('placementToken');
    if (!token) {
      return Promise.reject(new Error('No authentication token found. Please login again.'));
    }
    return fetch(`${API_BASE_URL}/placement/upload-student-data`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then(handleApiResponse);
  },

  viewPlacementFile: (fileId) => {
    return fetch(`${API_BASE_URL}/placement/files/${fileId}/view`, {
      headers: getAuthHeaders('placement'),
    }).then(handleApiResponse);
  },

  // Admin APIs
  adminLogin: (data) => {
    return fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },

  subAdminLogin: (data) => {
    return fetch(`${API_BASE_URL}/admin/sub-admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },

  getAdminStats: () => {
    return safeFetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: getAuthHeaders('admin'),
    }).then(handleApiResponse);
  },

  getAdminCharts: () => {
    return safeFetch(`${API_BASE_URL}/admin/dashboard/charts`, {
      headers: getAuthHeaders('admin'),
    }).then(handleApiResponse);
  },

  getSubAdminProfile: () => {
    return safeFetch(`${API_BASE_URL}/admin/sub-admin/profile`, {
      headers: getAuthHeaders('admin'),
    }).then(handleApiResponse);
  },

  getAdminUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/admin/users?${queryString}`, {
      headers: getAuthHeaders('admin'),
    }).then((res) => res.json());
  },

  getAllCandidates: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/admin/candidates?${queryString}`, {
      headers: getAuthHeaders('admin'),
    }).then((res) => res.json());
  },

  getAllEmployers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/admin/employers?${queryString}`, {
      headers: getAuthHeaders('admin'),
    }).then((res) => res.json());
  },

  getAllJobs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/admin/jobs?${queryString}`, {
      headers: getAuthHeaders('admin'),
    }).then((res) => res.json());
  },

  deleteCandidate: (candidateId) => {
    return fetch(`${API_BASE_URL}/admin/candidates/${candidateId}`, {
      method: 'DELETE',
      headers: getAuthHeaders('admin'),
    }).then((res) => res.json());
  },

  updateEmployerStatus: (employerId, statusData) => {
    return fetch(`${API_BASE_URL}/admin/employers/${employerId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders('admin'),
      body: JSON.stringify(statusData),
    }).then((res) => res.json());
  },

  deleteEmployer: (employerId) => {
    return fetch(`${API_BASE_URL}/admin/employers/${employerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders('admin'),
    }).then((res) => res.json());
  },

  adminDeleteJob: (jobId) => {
    return fetch(`${API_BASE_URL}/admin/jobs/${jobId}`, {
      method: 'DELETE',
      headers: getAuthHeaders('admin'),
    }).then((res) => res.json());
  },

  getRegisteredCandidates: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/admin/candidates/registered?${queryString}`, {
      headers: getAuthHeaders('admin'),
    }).then((res) => res.json());
  },

  getShortlistedApplications: () => {
    return fetch(`${API_BASE_URL}/admin/applications?status=shortlisted`, {
      headers: getAuthHeaders('admin'),
    }).then((res) => res.json());
  },

  getAllPlacements: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/admin/placements?${queryString}`, {
      headers: getAuthHeaders('admin'),
    }).then(handleApiResponse);
  },

  updatePlacementStatus: (placementId, status) => {
    const isApproved = status === 'approved';
    return fetch(`${API_BASE_URL}/admin/placements/${placementId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders('admin'),
      body: JSON.stringify({ status, isApproved }),
    }).then((res) => res.json());
  },

  getPlacementDetails: (placementId) => {
    return fetch(`${API_BASE_URL}/admin/placements/${placementId}`, {
      headers: getAuthHeaders('admin'),
    }).then((res) => res.json());
  },

  assignPlacementCredits: (placementId, credits) => {
    return fetch(`${API_BASE_URL}/admin/placements/${placementId}/credits`, {
      method: 'PUT',
      headers: getAuthHeaders('admin'),
      body: JSON.stringify({ credits }),
    }).then((res) => res.json());
  },

  processPlacementData: (placementId) => {
    return fetch(`${API_BASE_URL}/admin/placements/${placementId}/process`, {
      method: 'POST',
      headers: getAuthHeaders('admin'),
    }).then((res) => res.json());
  },

  getPlacementData: (placementId) => {
    return fetch(`${API_BASE_URL}/admin/placements/${placementId}/data`, {
      headers: getAuthHeaders('admin'),
    }).then(handleApiResponse);
  },

  getMyPlacementData: () => {
    return fetch(`${API_BASE_URL}/placement/data`, {
      headers: getAuthHeaders('placement'),
    }).then(handleApiResponse);
  },

  updatePlacementProfile: (data) => {
    console.log('API: Updating placement profile with data:', data);
    const headers = getAuthHeaders('placement');
    console.log('API: Request headers:', headers);
    console.log('API: Request URL:', `${API_BASE_URL}/placement/profile`);
    
    return fetch(`${API_BASE_URL}/placement/profile`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(data),
    }).then(async (response) => {
      console.log('API: Profile update response status:', response.status);
      console.log('API: Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API: Error response body:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || `HTTP ${response.status}`);
        } catch (parseError) {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }
      
      const result = await response.json();
      console.log('API: Profile update result:', result);
      return result;
    }).catch(error => {
      console.error('API: Profile update fetch error:', error);
      throw error;
    });
  },

  uploadLogo: (logoBase64) => {
    console.log('API: Uploading logo');
    const headers = getAuthHeaders('placement');
    return fetch(`${API_BASE_URL}/placement/upload-logo`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ logo: logoBase64 }),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || 'Logo upload failed');
      }
      return response.json();
    });
  },

  uploadIdCard: (idCardBase64) => {
    console.log('API: Uploading ID card');
    const headers = getAuthHeaders('placement');
    return fetch(`${API_BASE_URL}/placement/upload-id-card`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ idCard: idCardBase64 }),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || 'ID card upload failed');
      }
      return response.json();
    });
  },

  getEmployerAssessments: () => {
    return safeFetch(`${API_BASE_URL}/employer/assessments`, {
      headers: getAuthHeaders('employer'),
    }).then(handleApiResponse);
  },

  createEmployerAssessment: (assessmentData) => {
    return safeFetch(`${API_BASE_URL}/employer/assessments`, {
      method: 'POST',
      headers: getAuthHeaders('employer'),
      body: JSON.stringify(assessmentData),
    }).then(handleApiResponse);
  },

  updateEmployerAssessment: (assessmentId, assessmentData) => {
    return safeFetch(`${API_BASE_URL}/employer/assessments/${assessmentId}`, {
      method: 'PUT',
      headers: getAuthHeaders('employer'),
      body: JSON.stringify(assessmentData),
    }).then(handleApiResponse);
  },

  deleteEmployerAssessment: (assessmentId) => {
    return safeFetch(`${API_BASE_URL}/employer/assessments/${assessmentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders('employer'),
    }).then(handleApiResponse);
  },

  // Assessment APIs
  getAssessmentById: (assessmentId) => {
    return fetch(`${API_BASE_URL}/candidate/assessments/${assessmentId}`, {
      headers: getAuthHeaders('candidate'),
    }).then((res) => res.json());
  },

  getAssessmentForCandidate: (assessmentId) => {
    return fetch(`${API_BASE_URL}/candidate/assessments/${assessmentId}`, {
      headers: getAuthHeaders('candidate'),
    }).then(handleApiResponse);
  },

  startAssessment: (data) => {
    return fetch(`${API_BASE_URL}/candidate/assessments/start`, {
      method: 'POST',
      headers: getAuthHeaders('candidate'),
      body: JSON.stringify(data),
    }).then(handleApiResponse);
  },

  submitAnswer: (attemptId, questionIndex, selectedAnswer, textAnswer, timeSpent) => {
    return fetch(`${API_BASE_URL}/candidate/assessments/answer`, {
      method: 'POST',
      headers: getAuthHeaders('candidate'),
      body: JSON.stringify({
        attemptId,
        questionIndex,
        selectedAnswer,
        textAnswer,
        timeSpent
      }),
    }).then(handleApiResponse);
  },

  submitAssessment: (attemptId, violations = []) => {
    return fetch(`${API_BASE_URL}/candidate/assessments/submit`, {
      method: 'POST',
      headers: getAuthHeaders('candidate'),
      body: JSON.stringify({
        attemptId,
        violations
      }),
    }).then(handleApiResponse);
  },

  getAssessmentResult: (attemptId) => {
    return fetch(`${API_BASE_URL}/candidate/assessments/result/${attemptId}`, {
      headers: getAuthHeaders('candidate'),
    }).then(handleApiResponse);
  },

  getApplicationAssessmentResult: (applicationId) => {
    return fetch(`${API_BASE_URL}/candidate/assessments/result/application/${applicationId}`, {
      headers: getAuthHeaders('candidate'),
    }).then(handleApiResponse);
  },

  logAssessmentViolation: (violationData) => {
    return fetch(`${API_BASE_URL}/candidate/assessments/violation`, {
      method: 'POST',
      headers: getAuthHeaders('candidate'),
      body: JSON.stringify(violationData),
    }).then(handleApiResponse);
  },

  // Interview Process APIs
  getInterviewProcessDetails: (applicationId) => {
    return fetch(`${API_BASE_URL}/candidate/applications/${applicationId}/interview-process`, {
      headers: getAuthHeaders('candidate'),
    }).then(handleApiResponse);
  },

  getApplicationInterviewDetails: (applicationId) => {
    return fetch(`${API_BASE_URL}/candidate/applications/${applicationId}/interview-details`, {
      headers: getAuthHeaders('candidate'),
    }).then(handleApiResponse);
  },

  getAllInterviewProcessDetails: () => {
    return fetch(`${API_BASE_URL}/candidate/interview-processes`, {
      headers: getAuthHeaders('candidate'),
    }).then(handleApiResponse);
  },

  // New comprehensive interview process APIs
  getAllCandidateInterviewProcesses: () => {
    return fetch(`${API_BASE_URL}/candidate/interview-processes/all`, {
      headers: getAuthHeaders('candidate'),
    }).then(handleApiResponse);
  },

  createOrUpdateInterviewProcess: (applicationId, processData) => {
    return fetch(`${API_BASE_URL}/candidate/applications/${applicationId}/interview-process`, {
      method: 'POST',
      headers: getAuthHeaders('candidate'),
      body: JSON.stringify(processData),
    }).then(handleApiResponse);
  },

  updateInterviewStageStatus: (applicationId, stageIndex, statusData) => {
    return fetch(`${API_BASE_URL}/candidate/applications/${applicationId}/interview-process/stage/${stageIndex}`, {
      method: 'PUT',
      headers: getAuthHeaders('candidate'),
      body: JSON.stringify(statusData),
    }).then(handleApiResponse);
  },

  // Employer Interview Process APIs
  createEmployerInterviewProcess: (applicationId, processData) => {
    return fetch(`${API_BASE_URL}/employer/applications/${applicationId}/interview-process`, {
      method: 'POST',
      headers: getAuthHeaders('employer'),
      body: JSON.stringify(processData),
    }).then(handleApiResponse);
  },

  getEmployerInterviewProcess: (applicationId) => {
    return fetch(`${API_BASE_URL}/employer/applications/${applicationId}/interview-process`, {
      headers: getAuthHeaders('employer'),
    }).then(handleApiResponse);
  },

  updateEmployerStageStatus: (applicationId, stageIndex, statusData) => {
    return fetch(`${API_BASE_URL}/employer/applications/${applicationId}/interview-process/stages/${stageIndex}/status`, {
      method: 'PUT',
      headers: getAuthHeaders('employer'),
      body: JSON.stringify(statusData),
    }).then(handleApiResponse);
  },

  scheduleEmployerInterviewStage: (applicationId, stageIndex, scheduleData) => {
    return fetch(`${API_BASE_URL}/employer/applications/${applicationId}/interview-process/stages/${stageIndex}/schedule`, {
      method: 'PUT',
      headers: getAuthHeaders('employer'),
      body: JSON.stringify(scheduleData),
    }).then(handleApiResponse);
  },

  getCandidatesForCredits: () => {
    return fetch(`${API_BASE_URL}/admin/candidates/credits/list`, {
      headers: getAuthHeaders('admin'),
    }).then((res) => res.json());
  },

  updateCandidateCredits: (candidateId, data) => {
    return fetch(`${API_BASE_URL}/admin/candidates/${candidateId}/credits`, {
      method: 'PUT',
      headers: getAuthHeaders('admin'),
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },

  createCandidate: (data) => {
    return fetch(`${API_BASE_URL}/admin/candidates/create`, {
      method: 'POST',
      headers: getAuthHeaders('admin'),
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },

  // Employer Support Ticket APIs
  getEmployerSupportTickets: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/employer/support-tickets?${queryString}`, {
      headers: getAuthHeaders('employer'),
    }).then((res) => res.json());
  },

  getEmployerSupportTicketById: (id) => {
    return fetch(`${API_BASE_URL}/employer/support-tickets/${id}`, {
      headers: getAuthHeaders('employer'),
    }).then((res) => res.json());
  },

  updateEmployerSupportTicket: (id, data) => {
    return fetch(`${API_BASE_URL}/employer/support-tickets/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders('employer'),
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },

  deleteEmployerSupportTicket: (id) => {
    return fetch(`${API_BASE_URL}/employer/support-tickets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('employer'),
    }).then((res) => res.json());
  },

  downloadEmployerSupportAttachment: (ticketId, attachmentIndex) => {
    return fetch(`${API_BASE_URL}/employer/support-tickets/${ticketId}/attachments/${attachmentIndex}`, {
      headers: getAuthHeaders('employer'),
    });
  },

  submitSupportTicket: (formData) => {
    return fetch(`${API_BASE_URL}/public/support`, {
      method: 'POST',
      body: formData,
    });
  },
};

export default api;
