const calculateTotalExperienceFromEmployment = (employment = []) => {
  if (!Array.isArray(employment) || employment.length === 0) {
    return '0 months';
  }

  // Use the manual total experience from the first entry if available
  const manualExp = employment[0]?.totalExperienceManual;
  
  if (manualExp) {
    return manualExp;
  }

  return '0 months';
};

const getEmploymentSummary = (employment = []) => {
  if (!Array.isArray(employment) || employment.length === 0) {
    return {
      currentEmployments: [],
      pastEmployments: [],
      totalExperience: '0 months'
    };
  }

  return {
    currentEmployments: employment,
    pastEmployments: [],
    totalExperience: employment[0]?.totalExperienceManual || '0 months'
  };
};

module.exports = {
  calculateTotalExperienceFromEmployment,
  getEmploymentSummary
};
