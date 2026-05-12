export const checkResumeReadyToApply = (profile) => {
  if (!profile) return { ready: false, missingSections: ['Resume/Profile data not loaded'] };

  const missingSections = [];

  if (!profile.resumeHeadline?.trim()) missingSections.push('Resume Headline');
  if (!profile.profileSummary?.trim()) missingSections.push('Profile Summary');
  if (!Array.isArray(profile.skills) || profile.skills.length === 0) missingSections.push('Key Skills');
  if (!profile.dateOfBirth) missingSections.push('Date of Birth');
  if (!profile.gender?.trim()) missingSections.push('Gender');
  if (!profile.fatherName?.trim()) missingSections.push("Father's/Husband's Name");
  if (!profile.motherName?.trim()) missingSections.push("Mother's Name");
  if (!profile.residentialAddress?.trim()) missingSections.push('Residential Address');
  if (!profile.permanentAddress?.trim()) missingSections.push('Permanent Address');

  const hasValidEducation = Array.isArray(profile.education) &&
    profile.education.some(edu => edu.degreeName?.trim() && edu.collegeName?.trim());
  if (!hasValidEducation) missingSections.push('Educational Qualification (at least one entry)');

  return { ready: missingSections.length === 0, missingSections };
};

export const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;

  let completedSections = 0;
  const totalSections = 6; // Resume Headline, Profile Summary, Key Skills, Personal Details, Education, Resume

  // 1. Resume Headline
  if (profile.resumeHeadline && profile.resumeHeadline.trim() !== '') {
    completedSections++;
  }

  // 2. Profile Summary
  if (profile.profileSummary && profile.profileSummary.trim() !== '') {
    completedSections++;
  }

  // 3. Key Skills
  if (profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
    completedSections++;
  }

  // 4. Personal Details (any personal detail field filled)
  const personalFields = ['dateOfBirth', 'gender', 'fatherName', 'motherName', 'residentialAddress'];
  const hasPersonalDetails = personalFields.some(field => 
    profile[field] && profile[field].toString().trim() !== ''
  );
  if (hasPersonalDetails) {
    completedSections++;
  }

  // 5. Education (must have at least 1 complete education entry)
  if (profile.education && Array.isArray(profile.education) && profile.education.length >= 1) {
    const validEducation = profile.education.filter(edu => 
      edu.degreeName && edu.degreeName.trim() !== '' &&
      edu.collegeName && edu.collegeName.trim() !== ''
    );
    if (validEducation.length >= 1) {
      completedSections++;
    }
  }

  // 6. Resume Attachment
  if (profile.resume && profile.resume.trim() !== '') {
    completedSections++;
  }

  return Math.round((completedSections / totalSections) * 100);
};
