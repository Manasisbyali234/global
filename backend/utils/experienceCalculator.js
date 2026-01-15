const calculateTotalExperienceFromEmployment = (employment = []) => {
  if (!Array.isArray(employment) || employment.length === 0) {
    return 0;
  }

  let totalMonths = 0;

  employment.forEach(emp => {
    if (!emp.startDate) return;

    const startDate = new Date(emp.startDate);
    let endDate;

    if (emp.isCurrent) {
      endDate = new Date();
    } else if (emp.endDate) {
      endDate = new Date(emp.endDate);
    } else {
      return;
    }

    if (startDate > endDate) {
      return;
    }

    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                   (endDate.getMonth() - startDate.getMonth());

    totalMonths += Math.max(0, months);
  });

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0 && months === 0) {
    return '0 months';
  } else if (years === 0) {
    return `${months} month${months > 1 ? 's' : ''}`;
  } else if (months === 0) {
    return `${years} year${years > 1 ? 's' : ''}`;
  } else {
    return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
  }
};

const getEmploymentSummary = (employment = []) => {
  if (!Array.isArray(employment) || employment.length === 0) {
    return {
      currentEmployments: [],
      pastEmployments: [],
      totalCurrentExperience: '0 months',
      totalPastExperience: '0 months',
      totalExperience: '0 months'
    };
  }

  const currentEmployments = employment.filter(emp => emp.isCurrent);
  const pastEmployments = employment.filter(emp => !emp.isCurrent);

  const currentExperienceMonths = calculateMonthsFromEmployment(currentEmployments);
  const pastExperienceMonths = calculateMonthsFromEmployment(pastEmployments);
  const totalMonths = currentExperienceMonths + pastExperienceMonths;

  return {
    currentEmployments,
    pastEmployments,
    totalCurrentExperience: formatMonthsToYearsMonths(currentExperienceMonths),
    totalPastExperience: formatMonthsToYearsMonths(pastExperienceMonths),
    totalExperience: formatMonthsToYearsMonths(totalMonths)
  };
};

const calculateMonthsFromEmployment = (employmentList = []) => {
  let totalMonths = 0;

  employmentList.forEach(emp => {
    if (!emp.startDate) return;

    const startDate = new Date(emp.startDate);
    let endDate;

    if (emp.isCurrent) {
      endDate = new Date();
    } else if (emp.endDate) {
      endDate = new Date(emp.endDate);
    } else {
      return;
    }

    if (startDate > endDate) {
      return;
    }

    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                   (endDate.getMonth() - startDate.getMonth());

    totalMonths += Math.max(0, months);
  });

  return totalMonths;
};

const formatMonthsToYearsMonths = (totalMonths) => {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0 && months === 0) {
    return '0 months';
  } else if (years === 0) {
    return `${months} month${months > 1 ? 's' : ''}`;
  } else if (months === 0) {
    return `${years} year${years > 1 ? 's' : ''}`;
  } else {
    return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
  }
};

module.exports = {
  calculateTotalExperienceFromEmployment,
  getEmploymentSummary,
  calculateMonthsFromEmployment,
  formatMonthsToYearsMonths
};
