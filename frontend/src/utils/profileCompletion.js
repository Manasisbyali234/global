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

  // 5. Education (must have at least 3 education entries: 10th, PUC/Diploma, Degree)
  if (profile.education && Array.isArray(profile.education) && profile.education.length >= 3) {
    const validEducation = profile.education.filter(edu => 
      edu.degreeName && edu.degreeName.trim() !== '' &&
      edu.collegeName && edu.collegeName.trim() !== ''
    );
    if (validEducation.length >= 3) {
      completedSections++;
    }
  }

  // 6. Resume Attachment
  if (profile.resume && profile.resume.trim() !== '') {
    completedSections++;
  }

  return Math.round((completedSections / totalSections) * 100);
};
