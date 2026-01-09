import React, { useState, useEffect } from 'react';
import { 
  validateResumeHeadline, 
  validateProfileSummary, 
  validateSkills, 
  validatePersonalDetails, 
  validateEducation 
} from '../../../../utils/resumeValidation';

function ResumeValidationSummary({ profile }) {
  const [validationSummary, setValidationSummary] = useState({
    isValid: true,
    errors: [],
    warnings: [],
    completionPercentage: 0
  });

  useEffect(() => {
    if (profile) {
      validateProfile(profile);
    }
  }, [profile]);

  const validateProfile = (profileData) => {
    const errors = [];
    const warnings = [];
    let completedSections = 0;
    const totalSections = 6; // headline, summary, skills, personal, education, resume file

    // Validate Resume Headline
    if (profileData.resumeHeadline) {
      const headlineErrors = validateResumeHeadline(profileData.resumeHeadline);
      if (headlineErrors.length > 0) {
        errors.push(`Resume Headline: ${headlineErrors.join(', ')}`);
      } else {
        completedSections++;
      }
    } else {
      warnings.push('Resume headline is missing - this helps recruiters understand your profile quickly');
    }

    // Validate Profile Summary
    if (profileData.profileSummary) {
      const summaryErrors = validateProfileSummary(profileData.profileSummary);
      if (summaryErrors.length > 0) {
        errors.push(`Profile Summary: ${summaryErrors.join(', ')}`);
      } else {
        completedSections++;
      }
    } else {
      warnings.push('Profile summary is missing - this is crucial for making a good first impression');
    }

    // Validate Skills
    if (profileData.skills && profileData.skills.length > 0) {
      const skillsErrors = validateSkills(profileData.skills);
      if (skillsErrors.length > 0) {
        errors.push(`Skills: ${skillsErrors.join(', ')}`);
      } else {
        completedSections++;
      }
    } else {
      warnings.push('No skills added - add relevant skills to improve your profile visibility');
    }

    // Validate Personal Details
    const personalErrors = validatePersonalDetails(profileData);
    if (Object.keys(personalErrors).length > 0) {
      errors.push(`Personal Details: ${Object.values(personalErrors).join(', ')}`);
    } else if (profileData.dateOfBirth || profileData.location || profileData.fatherName) {
      completedSections++;
    }

    // Validate Education
    if (profileData.education && profileData.education.length > 0) {
      const educationErrors = validateEducation(profileData.education);
      if (educationErrors.length > 0) {
        errors.push(`Education: ${educationErrors.join(', ')}`);
      } else {
        completedSections++;
      }
    } else {
      warnings.push('Education details are missing - add your educational qualifications');
    }

    // Check for resume file
    if (profileData.resumeFile || profileData.resume) {
      completedSections++;
    } else {
      warnings.push('Resume file not uploaded - upload your resume for better visibility');
    }

    const completionPercentage = Math.round((completedSections / totalSections) * 100);
    const isValid = errors.length === 0;

    setValidationSummary({
      isValid,
      errors,
      warnings,
      completionPercentage
    });
  };

  if (!profile) {
    return null;
  }

  const getProgressBarColor = () => {
    if (validationSummary.completionPercentage >= 80) return 'bg-success';
    if (validationSummary.completionPercentage >= 60) return 'bg-warning';
    return 'bg-danger';
  };

  const getValidationIcon = () => {
    if (validationSummary.isValid && validationSummary.completionPercentage >= 80) {
      return <i className="fa fa-check-circle text-success"></i>;
    } else if (validationSummary.errors.length > 0) {
      return <i className="fa fa-times-circle text-danger"></i>;
    } else {
      return <i className="fa fa-info-circle text-warning"></i>;
    }
  };

  return (
    <div className="panel panel-default mb-4">
      <div className="panel-heading wt-panel-heading p-a20">
        <h4 className="panel-tittle m-a0 d-flex align-items-center">
          {getValidationIcon()}
          <span className="ms-2">Resume Validation Summary</span>
        </h4>
      </div>
      <div className="panel-body wt-panel-body p-a20">
        {/* Completion Progress */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold">Profile Completion</span>
            <span className="badge bg-primary">{validationSummary.completionPercentage}%</span>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div 
              className={`progress-bar ${getProgressBarColor()}`}
              style={{ width: `${validationSummary.completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Validation Status */}
        {validationSummary.isValid && validationSummary.completionPercentage >= 80 ? (
          <div className="alert alert-success">
            <i className="fa fa-check-circle me-2"></i>
            <strong>Excellent!</strong> Your resume is well-structured and complete. Ready for job applications!
          </div>
        ) : (
          <>
            {/* Errors */}
            {validationSummary.errors.length > 0 && (
              <div className="alert alert-danger">
                <h6 className="alert-heading">
                  <i className="fa fa-times-circle me-2"></i>
                  Validation Errors ({validationSummary.errors.length})
                </h6>
                <ul className="mb-0">
                  {validationSummary.errors.map((error, index) => (
                    <li key={index} className="small">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {validationSummary.warnings.length > 0 && (
              <div className="alert alert-warning">
                <h6 className="alert-heading">
                  <i className="fa fa-info-circle me-2"></i>
                  Recommendations ({validationSummary.warnings.length})
                </h6>
                <ul className="mb-0">
                  {validationSummary.warnings.map((warning, index) => (
                    <li key={index} className="small">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Quick Tips */}
        <div className="mt-3">
          <h6 className="text-muted">
            <i className="fa fa-lightbulb-o me-2"></i>
            Quick Tips for Better Resume
          </h6>
          <ul className="list-unstyled small text-muted">
            <li><i className="fa fa-check text-success me-2"></i>Keep your resume headline concise and impactful</li>
            <li><i className="fa fa-check text-success me-2"></i>Write a compelling profile summary (50+ characters)</li>
            <li><i className="fa fa-check text-success me-2"></i>Add relevant skills that match job requirements</li>
            <li><i className="fa fa-check text-success me-2"></i>Include complete education details with percentages</li>
            <li><i className="fa fa-check text-success me-2"></i>Upload a professional resume file (PDF preferred)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ResumeValidationSummary;
