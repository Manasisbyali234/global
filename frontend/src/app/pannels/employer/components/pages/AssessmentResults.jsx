import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ResponsiveTable from '../../../../../components/ResponsiveTable';
import '../emp-dashboard.css';
import '../../../../../captured-images-modal-fix.css';

export default function AssessmentResults() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showCapturesModal, setShowCapturesModal] = useState(false);
  const [selectedCaptures, setSelectedCaptures] = useState([]);

  useEffect(() => {
    if (showCapturesModal) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open-fix');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open-fix');
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open-fix');
    };
  }, [showCapturesModal]);

  useEffect(() => {
    fetchResults();
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [assessmentId]);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('employerToken');
      console.log('Fetching results for assessment ID:', assessmentId);
      const response = await axios.get(`http://localhost:5000/api/employer/assessments/${assessmentId}/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setAssessment(response.data.assessment);
        console.log('Assessment results received:', response.data.results.length);
        console.log('Sample result:', response.data.results[0]);
        console.log('Detailed violations check:', response.data.results.map(r => ({ 
          id: r._id, 
          violations: r.violations,
          violationsType: typeof r.violations,
          violationsIsArray: Array.isArray(r.violations),
          violationsLength: r.violations?.length || 0,
          candidateName: r.candidateId?.name || 'N/A',
          candidateEmail: r.candidateId?.email || 'N/A',
          applicationId: r.applicationId,
          applicationIdType: typeof r.applicationId,
          hasApplicationId: !!r.applicationId
        })));
        setResults(response.data.results);
      } else {
        console.error('API returned success: false', response.data);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="twm-right-section-panel site-bg-gray emp-dashboard" style={{
        width: '100%',
        margin: 0,
        padding: 0,
        background: '#f7f7f7',
        minHeight: '100vh'
      }}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Loading assessment results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="twm-right-section-panel site-bg-gray emp-dashboard" style={{
      width: '100%',
      margin: 0,
      padding: 0,
      background: '#f7f7f7',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ padding: '2rem 2rem 2rem 2rem' }}>
        <div className="wt-admin-right-page-header clearfix" style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: isMobile ? '1rem' : '2rem', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => navigate('/employer/create-assessment')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <i className="fa fa-arrow-left" style={{ fontSize: '1.125rem', color: '#ff6b35' }}></i>
              </button>
              <div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>
                  {assessment?.title} - Results
                </h2>
                {assessment?.designation && (
                  <p style={{ color: '#6b7280', margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: '500' }}>Designation:</span> {assessment.designation}
                  </p>
                )}
                {assessment?.companyName && (
                  <p style={{ color: '#6b7280', margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: '500' }}>Company:</span> {assessment.companyName}
                  </p>
                )}
                <p style={{ color: '#6b7280', margin: 0, fontSize: '1rem' }}>
                  {results.length} participants completed this assessment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div style={{ padding: '0 2rem 2rem 2rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          {results.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ marginBottom: '1rem' }}>
                <i className="fa fa-chart-bar" style={{ fontSize: '3rem', color: '#d1d5db', marginBottom: '1rem' }}></i>
              </div>
              <h4 style={{ color: '#374151', marginBottom: '0.5rem' }}>No Assessment Results Yet</h4>
              <p style={{ color: '#6b7280', fontSize: '1rem', margin: 0 }}>No candidates have completed this assessment yet. Results will appear here once candidates submit their assessments.</p>
            </div>
          ) : (
            <ResponsiveTable>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#232323', fontSize: '13px', border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <i className="fa fa-user me-2" style={{color: '#ff6b35'}}></i>
                      Candidate
                    </th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#232323', fontSize: '13px', border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <i className="fa fa-envelope me-2" style={{color: '#ff6b35'}}></i>
                      Email
                    </th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#232323', fontSize: '13px', border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <i className="fa fa-trophy me-2" style={{color: '#ff6b35'}}></i>
                      Score
                    </th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#232323', fontSize: '13px', border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <i className="fa fa-percent me-2" style={{color: '#ff6b35'}}></i>
                      Percentage
                    </th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#232323', fontSize: '13px', border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <i className="fa fa-flag me-2" style={{color: '#ff6b35'}}></i>
                      Result
                    </th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#232323', fontSize: '13px', border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <i className="fa fa-calendar me-2" style={{color: '#ff6b35'}}></i>
                      Completed
                    </th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#232323', fontSize: '13px', border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <i className="fa fa-exclamation-triangle me-2" style={{color: '#ff6b35'}}></i>
                      Violations
                    </th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#232323', fontSize: '13px', border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <i className="fa fa-file-text me-2" style={{color: '#ff6b35'}}></i>
                      Answers
                    </th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#232323', fontSize: '13px', border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <i className="fa fa-camera me-2" style={{color: '#ff6b35'}}></i>
                      Captures
                    </th>
                    <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '600', color: '#232323', fontSize: '13px', border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <i className="fa fa-eye me-2" style={{color: '#ff6b35'}}></i>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={result._id} style={{ 
                      borderBottom: index < results.length - 1 ? '1px solid #f3f4f6' : 'none',
                      transition: 'background-color 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '1rem', color: '#111827', fontWeight: '500' }}>
                        {result.candidateId?.name || result.candidateId || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>
                        {result.candidateId?.email || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', color: '#111827', fontWeight: '600' }}>
                        {result.score}/{result.totalMarks}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          background: result.percentage >= 70 ? '#dcfce7' : result.percentage >= 50 ? '#fef3c7' : '#fecaca',
                          color: result.percentage >= 70 ? '#166534' : result.percentage >= 50 ? '#92400e' : '#991b1b',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {result.percentage}%
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          background: result.result === 'pass' ? '#dcfce7' : '#fecaca',
                          color: result.result === 'pass' ? '#166534' : '#991b1b',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {result.result || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                        {new Date(result.endTime).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxWidth: '150px' }}>
                          <span style={{
                            background: (result.violations?.length > 0) ? '#fef3c7' : '#f3f4f6',
                            color: (result.violations?.length > 0) ? '#92400e' : '#6b7280',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            display: 'inline-block',
                            width: 'fit-content'
                          }}>
                            {result.violations ? result.violations.length : 0}
                          </span>
                          {result.violations && result.violations.length > 0 && (
                            <small style={{ 
                              color: '#6b7280', 
                              fontSize: '0.75rem',
                              lineHeight: '1.2',
                              wordBreak: 'break-word',
                              whiteSpace: 'normal'
                            }}>
                              {result.violations.map(v => {
                                // Format violation types to be more readable
                                const formattedType = v.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                return formattedType;
                              }).join(', ')}
                            </small>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button 
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => navigate(`/employer/view-answers/${result._id}`)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#2563eb';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#3b82f6';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          View Answers
                        </button>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button 
                          style={{
                            background: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => {
                            setSelectedCaptures(result.captures || []);
                            setShowCapturesModal(true);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#7c3aed';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#8b5cf6';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          View ({result.captures?.length || 0})
                        </button>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {result.applicationId || (result.candidateId && result.jobId) ? (
                          <button 
                            style={{
                              background: '#f97316',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onClick={async () => {
                              let appId = typeof result.applicationId === 'object' ? result.applicationId._id : result.applicationId;
                              
                              // If no applicationId, try to find it using candidate and job info
                              if (!appId && result.candidateId && result.jobId) {
                                try {
                                  const token = localStorage.getItem('employerToken');
                                  const candidateId = typeof result.candidateId === 'object' ? result.candidateId._id : result.candidateId;
                                  const jobId = typeof result.jobId === 'object' ? result.jobId._id : result.jobId;
                                  
                                  const response = await axios.get(`${process.env.REACT_APP_API_URL || 'https://taleglobal.net'}/api/employer/find-application?candidateId=${candidateId}&jobId=${jobId}`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  
                                  if (response.data.success) {
                                    appId = response.data.applicationId;
                                  }
                                } catch (error) {
                                  console.error('Error finding application:', error);
                                  alert('Could not find application details. Please try again.');
                                  return;
                                }
                              }
                              
                              if (appId) {
                                navigate(`/employer/emp-candidate-review/${appId}`);
                              } else {
                                alert('Application not found. Please contact support.');
                              }
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#ea580c';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f97316';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            View Details
                          </button>
                        ) : (
                          <span style={{
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            fontStyle: 'italic'
                          }}>
                            No application found
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
            </ResponsiveTable>
          )}
        </div>
      </div>

      {/* Captures Modal */}
      {showCapturesModal && (
        <div className="captured-images-modal-overlay">
          <div className="captured-images-modal-content">
            <div className="captured-images-modal-header">
              <h3>Captured Images ({selectedCaptures.length})</h3>
              <button
                className="captured-images-modal-close"
                onClick={() => setShowCapturesModal(false)}
              >
                ×
              </button>
            </div>
            {selectedCaptures.length === 0 ? (
              <p className="no-captures-message">No captures available</p>
            ) : (
              <div className="captured-images-grid">
                {selectedCaptures.map((capture, index) => {
                  const imagePath = typeof capture === 'string' ? capture : (capture?.path || capture?.url || capture?.data || '');
                  
                  if (!imagePath) {
                    return (
                      <div key={index} className="captured-image-item">
                        <div className="captured-image-container">
                          <div style={{ 
                            height: '200px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f9fafb',
                            color: '#6b7280'
                          }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                            <div>No image available</div>
                          </div>
                        </div>
                        <div className="captured-image-label">
                          <small>Capture {index + 1}</small>
                        </div>
                      </div>
                    );
                  }
                  
                  // Handle Base64 data or file paths
                  let imageUrl;
                  if (imagePath.startsWith('data:image/')) {
                    // Base64 image data
                    imageUrl = imagePath;
                  } else if (imagePath.startsWith('http')) {
                    // Full URL
                    imageUrl = imagePath;
                  } else {
                    // File path - construct URL
                    imageUrl = `${process.env.REACT_APP_API_URL || 'https://taleglobal.net'}${imagePath}`;
                  }
                  
                  return (
                    <div key={index} className="captured-image-item">
                      <div className="captured-image-container">
                        <img 
                          src={imageUrl}
                          alt={`Capture ${index + 1}`}
                          className="captured-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="captured-image-error">
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Image Not Available</div>
                          <div style={{ fontSize: '0.75rem', color: '#7f1d1d' }}>Failed to load image</div>
                        </div>
                      </div>
                      <div className="captured-image-label">
                        <small>Capture {index + 1}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}