const calculateProfileCompletion = (profile) => {
  if (!profile) return { percentage: 0, missingSections: [] };

  let completedSections = 0;
  const totalSections = 7; // Resume Headline, Profile Summary, Key Skills, Personal Details, Education, Work Location, Resume
  const missingSections = [];

  // 1. Resume Headline
  if (profile.resumeHeadline && profile.resumeHeadline.trim() !== '') {
    completedSections++;
  } else {
    missingSections.push('Resume Headline');
  }

  // 2. Profile Summary
  if (profile.profileSummary && profile.profileSummary.trim() !== '') {
    completedSections++;
  } else {
    missingSections.push('Profile Summary');
  }

  // 3. Key Skills
  if (profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
    completedSections++;
  } else {
    missingSections.push('Key Skills');
  }

  // 4. Personal Details (any personal detail field filled)
  const personalFields = ['dateOfBirth', 'gender', 'fatherName', 'motherName', 'residentialAddress'];
  const hasPersonalDetails = personalFields.some(field => 
    profile[field] && profile[field].toString().trim() !== ''
  );
  if (hasPersonalDetails) {
    completedSections++;
  } else {
    missingSections.push('Personal Details');
  }

  // 5. Education (must have at least 3 education entries: 10th, PUC/Diploma, Degree)
  if (profile.education && Array.isArray(profile.education) && profile.education.length >= 3) {
    const validEducation = profile.education.filter(edu => 
      edu.degreeName && edu.degreeName.trim() !== '' &&
      edu.collegeName && edu.collegeName.trim() !== ''
    );
    if (validEducation.length >= 3) {
      completedSections++;
    } else {
      missingSections.push('Education (need at least 3 complete entries)');
    }
  } else {
    missingSections.push('Education (need at least 3 complete entries)');
  }

  // 6. Work Location Preferences
  if (profile.jobPreferences && 
      profile.jobPreferences.preferredLocations && 
      Array.isArray(profile.jobPreferences.preferredLocations) && 
      profile.jobPreferences.preferredLocations.length > 0) {
    completedSections++;
  } else {
    missingSections.push('Work Location Preferences');
  }

  // 7. Resume Attachment
  if (profile.resume && profile.resume.trim() !== '') {
    completedSections++;
  } else {
    missingSections.push('Resume Attachment');
  }

  const percentage = Math.round((completedSections / totalSections) * 100);
  
  return { percentage, missingSections };
};

// Backward compatibility function
const calculateProfileCompletionPercentage = (profile) => {
  const result = calculateProfileCompletion(profile);
  return result.percentage;
};

module.exports = { 
  calculateProfileCompletion: calculateProfileCompletionPercentage, 
  calculateProfileCompletionWithDetails: calculateProfileCompletion 
};