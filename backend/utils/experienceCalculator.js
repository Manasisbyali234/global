const calculateTotalExperienceFromEmployment = (employment = []) => {
  if (!Array.isArray(employment) || employment.length === 0) {
    return '0 months';
  }

  let totalYears = 0;
  let totalMonths = 0;

  employment.forEach(emp => {
    if (emp.yearsOfExperience) totalYears += parseInt(emp.yearsOfExperience) || 0;
    if (emp.monthsOfExperience) totalMonths += parseInt(emp.monthsOfExperience) || 0;
  });

  // Convert excess months to years
  totalYears += Math.floor(totalMonths / 12);
  totalMonths = totalMonths % 12;

  if (totalYears > 0 || totalMonths > 0) {
    let result = '';
    if (totalYears > 0) result += `${totalYears} Year${totalYears > 1 ? 's' : ''}`;
    if (totalMonths > 0) result += `${result ? ' ' : ''}${totalMonths} Month${totalMonths > 1 ? 's' : ''}`;
    return result;
  }

  // Use the manual total experience from the first entry if available as fallback
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
