export const DEFAULT_JOB_EDUCATION_SPECIALIZATION = 'All';

export const JOB_EDUCATION_LEVELS = [
  'Any',
  '10th Pass',
  '12th Pass',
  'Diploma',
  'ITI',
  'Polytechnic',
  'B.E',
  'B.Tech',
  'B.Sc',
  'BCA',
  'BBA',
  'B.Com',
  'BA',
  'B.Arch',
  'B.Pharm',
  'B.Ed',
  'BDS',
  'BAMS',
  'BHMS',
  'BPT',
  'B.Des',
  'BFA',
  'LLB',
  'MBBS',
  'M.E',
  'M.Tech',
  'M.Sc',
  'MCA',
  'MBA',
  'M.Com',
  'MA',
  'M.Arch',
  'M.Pharm',
  'M.Ed',
  'MDS',
  'MS',
  'MD',
  'LLM',
  'M.Des',
  'MFA',
  'PhD',
  'D.Pharm',
  'Postgraduate Diploma',
  'Certificate Course'
];

const JOB_EDUCATION_SPECIALIZATION_MAP = {
  '10th Pass': ['CBSE', 'ICSE', 'State Board', 'NIOS', 'IB', 'IGCSE'],
  '12th Pass': ['Science', 'Commerce', 'Arts', 'Humanities', 'Vocational', 'PCM', 'PCB', 'PCMB'],
  Diploma: [
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Electronics and Communication',
    'Computer Science',
    'Automobile Engineering',
    'Mechatronics',
    'Instrumentation',
    'Architecture Assistantship',
    'Pharmacy'
  ],
  ITI: [
    'Electrician',
    'Fitter',
    'Turner',
    'Welder',
    'COPA',
    'Mechanic Diesel',
    'Mechanic Motor Vehicle',
    'Electronics Mechanic',
    'Refrigeration and Air Conditioning',
    'Draughtsman'
  ],
  Polytechnic: [
    'Civil Engineering',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Computer Engineering',
    'Electronics and Communication',
    'Automobile Engineering',
    'Chemical Engineering',
    'Instrumentation',
    'Mining Engineering'
  ],
  'B.E': [
    'Computer Science Engineering',
    'Information Science Engineering',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Artificial Intelligence and Machine Learning',
    'Data Science',
    'Biotechnology',
    'Aerospace Engineering'
  ],
  'B.Tech': [
    'Computer Science and Engineering',
    'Information Technology',
    'Artificial Intelligence and Machine Learning',
    'Data Science',
    'Cybersecurity',
    'Electronics and Communication Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Biotechnology'
  ],
  'B.Sc': [
    'Physics',
    'Chemistry',
    'Mathematics',
    'Computer Science',
    'Information Technology',
    'Biotechnology',
    'Microbiology',
    'Nursing',
    'Agriculture',
    'Hospitality and Hotel Administration'
  ],
  BCA: [
    'Computer Applications',
    'Data Analytics',
    'Cloud Computing',
    'Cybersecurity',
    'Artificial Intelligence',
    'Game Development',
    'Full Stack Development'
  ],
  BBA: [
    'General Management',
    'Finance',
    'Marketing',
    'Human Resources',
    'Business Analytics',
    'Logistics and Supply Chain',
    'International Business',
    'Entrepreneurship'
  ],
  'B.Com': [
    'General Commerce',
    'Accounting and Finance',
    'Banking and Insurance',
    'Taxation',
    'Computer Applications',
    'Corporate Secretaryship',
    'Economics'
  ],
  BA: [
    'English',
    'Economics',
    'Psychology',
    'Sociology',
    'Journalism and Mass Communication',
    'Political Science',
    'History',
    'Public Administration',
    'Fine Arts'
  ],
  'B.Arch': [
    'Architecture Design',
    'Urban Planning',
    'Landscape Architecture',
    'Interior Architecture',
    'Sustainable Architecture'
  ],
  'B.Pharm': [
    'Pharmaceutical Chemistry',
    'Pharmaceutics',
    'Pharmacology',
    'Quality Assurance',
    'Clinical Pharmacy'
  ],
  'B.Ed': [
    'Mathematics',
    'Physical Science',
    'Biological Science',
    'English',
    'Social Science',
    'Computer Science'
  ],
  BDS: ['General Dentistry', 'Orthodontics', 'Prosthodontics', 'Periodontics', 'Oral Surgery'],
  BAMS: ['Ayurveda', 'Panchakarma', 'Kayachikitsa', 'Shalya Tantra', 'Shalakya Tantra'],
  BHMS: ['Homeopathy', 'Materia Medica', 'Organon of Medicine', 'Repertory', 'Practice of Medicine'],
  BPT: ['Orthopedics', 'Neurology', 'Sports Rehabilitation', 'Cardio Respiratory', 'Pediatrics'],
  'B.Des': ['Fashion Design', 'Interior Design', 'Product Design', 'Graphic Design', 'UI/UX Design', 'Animation'],
  BFA: ['Applied Arts', 'Painting', 'Sculpture', 'Visual Communication', 'Photography', 'Animation'],
  LLB: ['Corporate Law', 'Criminal Law', 'Constitutional Law', 'International Law', 'Intellectual Property Law', 'Family Law'],
  MBBS: ['General Medicine', 'Surgery', 'Pediatrics', 'Obstetrics and Gynecology', 'Dermatology', 'Radiology'],
  'M.E': ['Structural Engineering', 'VLSI Design', 'CAD/CAM', 'Computer Science Engineering', 'Power Systems', 'Embedded Systems', 'Thermal Engineering'],
  'M.Tech': ['Computer Science Engineering', 'Data Science', 'Artificial Intelligence', 'Cybersecurity', 'VLSI Design', 'Robotics', 'Structural Engineering', 'Power Electronics', 'Biotechnology'],
  'M.Sc': ['Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Biotechnology', 'Microbiology', 'Data Science', 'Statistics', 'Psychology'],
  MCA: ['Computer Applications', 'Data Science', 'Artificial Intelligence', 'Cybersecurity', 'Cloud Computing', 'Full Stack Development'],
  MBA: ['Finance', 'Marketing', 'Human Resources', 'Operations', 'Business Analytics', 'Information Technology', 'International Business', 'Logistics and Supply Chain', 'Healthcare Management', 'Entrepreneurship'],
  'M.Com': ['Accounting and Finance', 'Banking', 'Taxation', 'Economics', 'Marketing'],
  MA: ['English', 'Economics', 'Psychology', 'Sociology', 'Journalism', 'Political Science', 'History', 'Public Administration'],
  'M.Arch': ['Urban Design', 'Landscape Architecture', 'Sustainable Architecture', 'Interior Architecture', 'Housing'],
  'M.Pharm': ['Pharmaceutics', 'Pharmaceutical Chemistry', 'Pharmacology', 'Pharmacognosy', 'Quality Assurance'],
  'M.Ed': ['Curriculum and Instruction', 'Educational Leadership', 'Guidance and Counselling', 'Special Education'],
  MDS: ['Orthodontics', 'Prosthodontics', 'Periodontics', 'Oral Surgery', 'Conservative Dentistry'],
  MS: ['General Surgery', 'Orthopedics', 'ENT', 'Ophthalmology', 'Obstetrics and Gynecology', 'Urology'],
  MD: ['General Medicine', 'Pediatrics', 'Radiology', 'Dermatology', 'Psychiatry', 'Anesthesiology', 'Pathology'],
  LLM: ['Corporate Law', 'Criminal Law', 'International Law', 'Constitutional Law', 'Intellectual Property Law', 'Human Rights Law'],
  'M.Des': ['Product Design', 'Interaction Design', 'Fashion Design', 'Communication Design', 'Interior Design'],
  MFA: ['Painting', 'Sculpture', 'Applied Arts', 'Photography', 'Digital Arts'],
  PhD: ['Engineering', 'Science', 'Management', 'Commerce', 'Arts', 'Law', 'Computer Applications', 'Education', 'Social Sciences'],
  'D.Pharm': ['Pharmaceutics', 'Community Pharmacy', 'Hospital Pharmacy', 'Pharmaceutical Chemistry'],
  'Postgraduate Diploma': ['Data Science', 'Digital Marketing', 'Business Analytics', 'Supply Chain Management', 'Financial Management', 'Human Resource Management', 'Journalism', 'Clinical Research'],
  'Certificate Course': ['Digital Marketing', 'Data Analytics', 'Cybersecurity', 'Cloud Computing', 'Tally and GST', 'UI/UX Design', 'Graphic Design', 'Web Development', 'Spoken English', 'Foreign Languages']
};

const normalizeValue = (value = '') => String(value || '').trim();

const uniqueValues = (values = []) => (
  [...new Set(values.map(normalizeValue).filter(Boolean))]
);

export const getJobEducationSpecializationOptions = (qualification = '') => {
  const normalizedQualification = normalizeValue(qualification);
  if (!normalizedQualification || normalizedQualification === 'Any') {
    return [];
  }

  return uniqueValues([
    DEFAULT_JOB_EDUCATION_SPECIALIZATION,
    ...(JOB_EDUCATION_SPECIALIZATION_MAP[normalizedQualification] || [])
  ]);
};

export const normalizeJobEducationSpecializations = (specializations = [], education = []) => {
  const selectedQualifications = uniqueValues(Array.isArray(education) ? education : [education]);
  const validQualifications = selectedQualifications.filter((qualification) => qualification !== 'Any');

  if (validQualifications.length === 0) {
    return [];
  }

  const specializationByQualification = new Map();
  const specializationEntries = Array.isArray(specializations) ? specializations : [];

  specializationEntries.forEach((entry) => {
    const qualification = normalizeValue(entry?.qualification || entry?.education || entry?.level);
    if (!qualification || !validQualifications.includes(qualification) || specializationByQualification.has(qualification)) {
      return;
    }

    const specializationOptions = getJobEducationSpecializationOptions(qualification);
    const specialization = normalizeValue(entry?.specialization || entry?.stream || entry?.courseName);

    specializationByQualification.set(
      qualification,
      specializationOptions.includes(specialization)
        ? specialization
        : DEFAULT_JOB_EDUCATION_SPECIALIZATION
    );
  });

  return validQualifications.map((qualification) => ({
    qualification,
    specialization: specializationByQualification.get(qualification) || DEFAULT_JOB_EDUCATION_SPECIALIZATION
  }));
};

export const formatJobEducationDisplay = (education = [], specializations = []) => {
  const selectedQualifications = uniqueValues(Array.isArray(education) ? education : [education]);
  if (selectedQualifications.length === 0) {
    return '';
  }

  const normalizedSpecializations = normalizeJobEducationSpecializations(specializations, selectedQualifications);
  const specializationMap = new Map(
    normalizedSpecializations.map((entry) => [entry.qualification, entry.specialization])
  );

  return selectedQualifications.map((qualification) => {
    if (qualification === 'Any') {
      return qualification;
    }

    const specialization = specializationMap.get(qualification);
    if (!specialization || specialization === DEFAULT_JOB_EDUCATION_SPECIALIZATION) {
      return qualification;
    }

    return `${qualification} (${specialization})`;
  }).join(', ');
};
