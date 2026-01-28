import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Save, Plus, Trash2, Edit3, Mail, Send } from 'lucide-react';
import api from '../../../../utils/api';
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';
import { formatTimeToAMPM } from '../../../../utils/dateFormatter';
const InterviewProcessManager = ({ applicationId, onSave }) => {
  const [interviewProcess, setInterviewProcess] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    interviewDate: '',
    interviewTime: '',
    meetingLink: '',
    instructions: ''
  });
  const [candidateResponse, setCandidateResponse] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [assessments, setAssessments] = useState([]);

  const stageTypes = [
    { value: 'assessment', label: 'Assessment Schedule', icon: '📝' },
    { value: 'oneOnOne', label: 'One – On – One', icon: '🤝' },
    { value: 'panel', label: 'Panel', icon: '👥' },
    { value: 'group', label: 'Group', icon: '👨‍👩‍👧‍👦' },
    { value: 'technical', label: 'Technical', icon: '💻' },
    { value: 'situational', label: 'Situational / Behavioral', icon: '🎭' },
    { value: 'others', label: 'Others – Specify.', icon: '⚙️' }
  ];

  useEffect(() => {
    if (applicationId) {
      fetchInterviewProcess();
      fetchAssessments();
    }
  }, [applicationId]);

  const fetchAssessments = async () => {
    try {
      const token = localStorage.getItem('employerToken');
      const response = await fetch('http://localhost:5000/api/employer/assessments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments || []);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  const fetchInterviewProcess = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('employerToken');
      
      // Fetch interview process
      const data = await api.getEmployerInterviewProcess(applicationId);
      if (data.interviewProcess) {
        setInterviewProcess(data.interviewProcess);
        setStages(data.interviewProcess.stages || []);
      }
      
      // Fetch application details including interview invite and candidate response
      try {
        const appResponse = await fetch(`http://localhost:5000/api/employer/applications/${applicationId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (appResponse.ok) {
          const appData = await appResponse.json();
          if (appData.application) {
            // Set interview invite details
            if (appData.application.interviewInvite) {
              setInterviewProcess(prev => ({
                ...prev,
                interviewInvite: appData.application.interviewInvite
              }));
            }
            // Set candidate response
            if (appData.application.candidateResponse) {
              setCandidateResponse(appData.application.candidateResponse);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching application details:', err);
      }
    } catch (error) {
      console.error('Error fetching interview process:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStage = () => {
    const newStage = {
      stageType: 'assessment',
      stageName: 'Assessment Schedule',
      stageOrder: stages.length + 1,
      status: 'pending',
      fromDate: '',
      toDate: '',
      scheduledTime: '',
      location: '',
      interviewerName: '',
      interviewerEmail: '',
      meetingLink: '',
      instructions: '',
      description: ''
    };
    setStages([...stages, newStage]);
  };

  const removeStage = (index) => {
    const updatedStages = stages.filter((_, i) => i !== index);
    // Update stage orders
    updatedStages.forEach((stage, i) => {
      stage.stageOrder = i + 1;
    });
    setStages(updatedStages);
  };

  const updateStage = (index, field, value) => {
    // Validate assessment selection before updating
    if (field === 'assessmentId' && value) {
      const isDuplicate = stages.some((stage, idx) => 
        idx !== index && stage.stageType === 'assessment' && stage.assessmentId === value
      );
      if (isDuplicate) {
        showError('This assessment is already assigned to another round. Please select a different assessment.');
        return;
      }
    }
    
    const updatedStages = [...stages];
    updatedStages[index] = { ...updatedStages[index], [field]: value };
    
    // Update stage name when type changes
    if (field === 'stageType') {
      const stageType = stageTypes.find(type => type.value === value);
      if (stageType) {
        updatedStages[index].stageName = stageType.label;
      }
      // Clear assessment if changing from assessment type
      if (updatedStages[index].assessmentId && value !== 'assessment') {
        updatedStages[index].assessmentId = null;
      }
    }
    
    setStages(updatedStages);
  };

  const sendInterviewInvite = async () => {
    console.log('Sending interview invite with data:', emailData);
    
    if (!emailData.interviewDate || !emailData.interviewTime) {
      showError('Please provide interview date and time');
      return;
    }
    if (!emailData.meetingLink || !emailData.meetingLink.trim()) {
      showError('Google Meet link is mandatory');
      return;
    }

    setSendingEmail(true);
    try {
      const token = localStorage.getItem('employerToken');
      const response = await fetch(`http://localhost:5000/api/employer/send-interview-invite/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(emailData)
      });

      const data = await response.json();
      console.log('API Response:', { status: response.status, data });
      
      if (response.ok) {
        showSuccess('Interview invite sent successfully!');
        setShowEmailModal(false);
        setEmailData({ interviewDate: '', interviewTime: '', meetingLink: '', instructions: '' });
        // Refresh to show the sent invitation
        fetchInterviewProcess();
      } else {
        console.error('API Error:', data);
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg).join(', ');
          showError(`Validation failed: ${errorMessages}`);
        } else {
          showError(data.message || 'Failed to send invite');
        }
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showError('Network error. Please check your connection and try again.');
      } else if (error.message) {
        showError(`Error: ${error.message}`);
      } else {
        showError('Error sending invite. Please try again.');
      }
    } finally {
      setSendingEmail(false);
    }
  };

  const confirmSchedule = async () => {
    try {
      const token = localStorage.getItem('employerToken');
      const response = await fetch(`http://localhost:5000/api/employer/confirm-interview/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          confirmedDate: candidateResponse.availableDate,
          confirmedTime: candidateResponse.availableTime
        })
      });

      const data = await response.json();
      if (response.ok) {
        showSuccess('Interview schedule confirmed!');
        setCandidateResponse(null);
        // Refresh to show updated status
        fetchInterviewProcess();
      } else {
        showError(data.message || 'Failed to confirm schedule');
      }
    } catch (error) {
      console.error('Error confirming schedule:', error);
      showError('Error confirming schedule. Please try again.');
    }
  };

  const saveInterviewProcess = async () => {
    // Validate assessment stages
    const assessmentStages = stages.filter(s => s.stageType === 'assessment');
    for (const stage of assessmentStages) {
      if (!stage.assessmentId) {
        showError('Please select an assessment for all assessment rounds before saving.');
        return;
      }
    }
    
    setSaving(true);
    try {
      const data = await api.createEmployerInterviewProcess(applicationId, {
        stages,
        processStatus: stages.length > 0 ? 'in_progress' : 'not_started'
      });
      
      setInterviewProcess(data.interviewProcess);
      
      // Use formatted message from backend if available, otherwise generate one
      if (data.formattedMessage) {
        showSuccess(data.formattedMessage);
      } else {
        // Generate success message with proper date format for scheduled stages
        const scheduledStages = stages.filter(stage => 
          stage.status === 'scheduled' && (stage.fromDate || stage.scheduledDate)
        );
        
        if (scheduledStages.length > 0) {
          const stage = scheduledStages[0]; // Get first scheduled stage for message
          const stageNames = {
            technical: 'Technical',
            oneOnOne: 'One – On – One',
            panel: 'Panel',
            group: 'Group',
            situational: 'Situational / Behavioral',
            others: 'Others – Specify.',
            assessment: 'Assessment'
          };
          
          const stageName = stageNames[stage.stageType] || stage.stageName || 'Interview round';
          
          let message = `${stageName} scheduled Successfully!!`;
          
          if (stage.fromDate && stage.toDate) {
            // Format dates as DD/MM/YYYY
            const fromDate = new Date(stage.fromDate);
            const toDate = new Date(stage.toDate);
            const formatDate = (date) => {
              const day = date.getDate().toString().padStart(2, '0');
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              const year = date.getFullYear();
              return `${day}/${month}/${year}`;
            };
            
            message += ` From: ${formatDate(fromDate)} | To: ${formatDate(toDate)}`;
          } else if (stage.scheduledDate) {
            const scheduledDate = new Date(stage.scheduledDate);
            const day = scheduledDate.getDate().toString().padStart(2, '0');
            const month = (scheduledDate.getMonth() + 1).toString().padStart(2, '0');
            const year = scheduledDate.getFullYear();
            message += ` Date: ${day}/${month}/${year}`;
          }
          
          if (stage.scheduledTime) {
            message += ` | Time: ${formatTimeToAMPM(stage.scheduledTime)}`;
          }
          
          showSuccess(message);
        } else {
          showSuccess('Interview process saved successfully!');
        }
      }
      
      if (onSave) onSave(data.interviewProcess);
    } catch (error) {
      console.error('Error saving interview process:', error);
      showError('Error saving interview process. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
      <div className="card-header border-0" style={{ background: '#f8f9fa', borderRadius: '15px 15px 0 0' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="mb-0 fw-bold" style={{ color: '#000', flex: '1 1 auto' }}>
            Interview Process Management
          </h5>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: '#ff6600', color: 'white', border: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
            onClick={() => setShowEmailModal(true)}
          >
            <Mail size={16} className="me-1" />
            Send Invite
          </button>
        </div>
      </div>
      
      <div className="card-body p-4">
        {/* Interview Invitation Details */}
        {interviewProcess?.interviewInvite && (
          <div className="mb-4 p-3" style={{ backgroundColor: '#fff3e0', borderRadius: '10px', border: '2px solid #ff6600' }}>
            <h6 className="fw-bold mb-3" style={{ color: '#ff6600' }}>
              <i className="fa fa-paper-plane me-2"></i>
              Interview Invitation Sent
            </h6>
            <div className="row">
              <div className="col-md-6 mb-2">
                <small className="text-muted d-block">Proposed Date:</small>
                <strong>{(() => {
                  const date = new Date(interviewProcess.interviewInvite.proposedDate);
                  const day = date.getDate().toString().padStart(2, '0');
                  const month = (date.getMonth() + 1).toString().padStart(2, '0');
                  const year = date.getFullYear();
                  return `${day}/${month}/${year}`;
                })()}</strong>
              </div>
              <div className="col-md-6 mb-2">
                <small className="text-muted d-block">Proposed Time:</small>
                <strong>{formatTimeToAMPM(interviewProcess.interviewInvite.proposedTime)}</strong>
              </div>
              {interviewProcess.interviewInvite.meetingLink && (
                <div className="col-12 mb-2">
                  <small className="text-muted d-block">Meeting Link:</small>
                  <a href={interviewProcess.interviewInvite.meetingLink} target="_blank" rel="noopener noreferrer" style={{ color: '#ff6600' }}>
                    {interviewProcess.interviewInvite.meetingLink}
                  </a>
                </div>
              )}
              {interviewProcess.interviewInvite.instructions && (
                <div className="col-12 mb-2">
                  <small className="text-muted d-block">Instructions:</small>
                  <p className="mb-0" style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '5px', border: '1px solid #ffe0b2' }}>
                    {interviewProcess.interviewInvite.instructions}
                  </p>
                </div>
              )}
              <div className="col-12 mt-2">
                <small className="text-muted d-block">Sent on:</small>
                <strong>{new Date(interviewProcess.interviewInvite.sentAt).toLocaleString()}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Email Modal */}
        {showEmailModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content" style={{ borderRadius: '15px' }}>
                <div className="modal-header" style={{ borderBottom: '2px solid #ff6600' }}>
                  <h5 className="modal-title fw-bold">Send Interview Invite</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEmailModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Preferred Interview Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={emailData.interviewDate}
                      onChange={(e) => setEmailData({...emailData, interviewDate: e.target.value})}
                      style={{ borderColor: '#ff6600' }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Preferred Interview Time</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 10:00 AM or 14:00"
                      value={emailData.interviewTime}
                      onChange={(e) => setEmailData({...emailData, interviewTime: e.target.value})}
                      style={{ borderColor: '#ff6600' }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Google Meet Link <span style={{color: 'red'}}>*</span></label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://meet.google.com/..."
                      value={emailData.meetingLink}
                      onChange={(e) => setEmailData({...emailData, meetingLink: e.target.value})}
                      style={{ borderColor: '#ff6600' }}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Additional Instructions</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Enter any additional instructions..."
                      value={emailData.instructions}
                      onChange={(e) => setEmailData({...emailData, instructions: e.target.value})}
                      style={{ borderColor: '#ff6600' }}
                    />
                  </div>
                </div>
                <div className="modal-footer interview-modal-footer" style={{ gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowEmailModal(false)}
                    style={{ flex: '0 0 auto' }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn"
                    style={{ backgroundColor: '#ff6600', color: 'white', border: 'none', flex: '0 0 auto' }}
                    onClick={sendInterviewInvite}
                    disabled={sendingEmail}
                  >
                    {sendingEmail ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} className="me-2" />
                        Send Invite
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Candidate Response Display */}
        {candidateResponse && (
          <div className="alert alert-success mb-4" style={{ backgroundColor: '#d4edda', borderColor: '#28a745', borderRadius: '10px' }}>
            <h6 className="fw-bold mb-3" style={{ color: '#155724' }}>
              <i className="fa fa-check-circle me-2"></i>
              Candidate Has Responded!
            </h6>
            <div className="row">
              <div className="col-md-6 mb-2">
                <small className="text-muted d-block">Available Date:</small>
                <strong>{(() => {
                  const date = new Date(candidateResponse.availableDate);
                  const day = date.getDate().toString().padStart(2, '0');
                  const month = (date.getMonth() + 1).toString().padStart(2, '0');
                  const year = date.getFullYear();
                  return `${day}/${month}/${year}`;
                })()}</strong>
              </div>
              <div className="col-md-6 mb-2">
                <small className="text-muted d-block">Available Time:</small>
                <strong>{formatTimeToAMPM(candidateResponse.availableTime)}</strong>
              </div>
              {candidateResponse.message && (
                <div className="col-12 mb-2">
                  <small className="text-muted d-block">Message:</small>
                  <p className="mb-0" style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '5px', border: '1px solid #c3e6cb' }}>
                    {candidateResponse.message}
                  </p>
                </div>
              )}
              <div className="col-12 mt-2">
                <small className="text-muted d-block">Responded on:</small>
                <strong>{new Date(candidateResponse.respondedAt).toLocaleString()}</strong>
              </div>
            </div>
            <button
              className="btn btn-sm mt-3"
              style={{ backgroundColor: '#28a745', color: 'white', border: 'none' }}
              onClick={confirmSchedule}
            >
              <i className="fa fa-check me-2"></i>
              Confirm This Schedule
            </button>
          </div>
        )}

        {/* Confirmed Interview Display */}
        {interviewProcess?.interviewInvite?.status === 'confirmed' && (
          <div className="alert alert-info mb-4" style={{ backgroundColor: '#cfe2ff', borderColor: '#0d6efd', borderRadius: '10px' }}>
            <h6 className="fw-bold mb-3" style={{ color: '#084298' }}>
              <i className="fa fa-calendar-check-o me-2"></i>
              Interview Confirmed
            </h6>
            <div className="row">
              <div className="col-md-6 mb-2">
                <small className="text-muted d-block">Confirmed Date:</small>
                <strong>{(() => {
                  const date = new Date(interviewProcess.interviewInvite.confirmedDate);
                  const day = date.getDate().toString().padStart(2, '0');
                  const month = (date.getMonth() + 1).toString().padStart(2, '0');
                  const year = date.getFullYear();
                  return `${day}/${month}/${year}`;
                })()}</strong>
              </div>
              <div className="col-md-6 mb-2">
                <small className="text-muted d-block">Confirmed Time:</small>
                <strong>{formatTimeToAMPM(interviewProcess.interviewInvite.confirmedTime)}</strong>
              </div>
              <div className="col-12 mt-2">
                <small className="text-muted d-block">Confirmed on:</small>
                <strong>{new Date(interviewProcess.interviewInvite.confirmedAt).toLocaleString()}</strong>
              </div>
            </div>
          </div>
        )}

        {stages.length > 0 && (
          <div className="row g-4">
            {stages.map((stage, index) => (
              <div key={index} className="col-12">
                <div className="border rounded-3 p-4" style={{ backgroundColor: '#fafafa', borderColor: '#e9ecef' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>
                      <span className="badge me-2" style={{ backgroundColor: '#ff6600', color: 'white' }}>
                        {stage.stageOrder}
                      </span>
                      {stageTypes.find(type => type.value === stage.stageType)?.icon} {stage.stageName}
                    </h6>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeStage(index)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="row g-3">
                    {/* Stage Type Selection */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Interview Round Type</label>
                      <select
                        className="form-select"
                        value={stage.stageType}
                        onChange={(e) => updateStage(index, 'stageType', e.target.value)}
                        style={{ borderColor: '#ff6600' }}
                      >
                        {stageTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Custom Stage Name */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Stage Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={stage.stageName}
                        onChange={(e) => updateStage(index, 'stageName', e.target.value)}
                        style={{ borderColor: '#ff6600' }}
                      />
                    </div>

                    {/* Assessment Schedule - Show when Assessment is selected */}
                    {stage.stageType === 'assessment' && (
                      <>
                        <div className="col-12">
                          <div className="alert alert-info" style={{ backgroundColor: '#e3f2fd', borderColor: '#2196f3', color: '#1976d2' }}>
                            <strong>Assessment Schedule:</strong> Configure the date range when candidates can take the assessment.
                          </div>
                        </div>
                        
                        <div className="col-12">
                          <label className="form-label fw-semibold">Select Assessment * (Round {stage.stageOrder})</label>
                          <select
                            className="form-select"
                            value={stage.assessmentId || ''}
                            onChange={(e) => updateStage(index, 'assessmentId', e.target.value)}
                            style={{ borderColor: '#ff6600' }}
                          >
                            <option value="">-- Select Assessment --</option>
                            {assessments.map(assessment => {
                              const isUsed = stages.some((s, idx) => 
                                idx !== index && s.stageType === 'assessment' && s.assessmentId === assessment._id
                              );
                              return (
                                <option 
                                  key={assessment._id} 
                                  value={assessment._id}
                                  disabled={isUsed}
                                >
                                  {assessment.title} - {assessment.designation || 'N/A'} ({assessment.timer || assessment.timeLimit || assessment.duration || assessment.totalTime || 'N/A'} min) {isUsed ? '(Already assigned)' : ''}
                                </option>
                              );
                            })}
                          </select>
                          {!stage.assessmentId && (
                            <small className="text-danger">Please select an assessment for this round</small>
                          )}
                          {assessments.length === 0 && (
                            <small className="text-warning d-block mt-1">No assessments available. Please create assessments first.</small>
                          )}
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label fw-semibold d-flex align-items-center gap-2">
                            <Calendar size={16} style={{ color: '#ff6600' }} />
                            From Date
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={formatDate(stage.fromDate)}
                            onChange={(e) => updateStage(index, 'fromDate', e.target.value)}
                            style={{ borderColor: '#ff6600' }}
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold d-flex align-items-center gap-2">
                            <Calendar size={16} style={{ color: '#ff6600' }} />
                            To Date
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={formatDate(stage.toDate)}
                            onChange={(e) => updateStage(index, 'toDate', e.target.value)}
                            style={{ borderColor: '#ff6600' }}
                            min={formatDate(stage.fromDate)}
                          />
                        </div>
                      </>
                    )}

                    {/* Interview Schedule - Show for other types */}
                    {stage.stageType !== 'assessment' && (
                      <>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold d-flex align-items-center gap-2">
                            <Calendar size={16} style={{ color: '#ff6600' }} />
                            Interview Date
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={formatDate(stage.scheduledDate)}
                            onChange={(e) => updateStage(index, 'scheduledDate', e.target.value)}
                            style={{ borderColor: '#ff6600' }}
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label fw-semibold d-flex align-items-center gap-2">
                            <Clock size={16} style={{ color: '#ff6600' }} />
                            Time
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. 10:00 AM"
                            value={stage.scheduledTime || ''}
                            onChange={(e) => updateStage(index, 'scheduledTime', e.target.value)}
                            style={{ borderColor: '#ff6600' }}
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Location/Mode</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g., Office, Online, Phone"
                            value={stage.location || ''}
                            onChange={(e) => updateStage(index, 'location', e.target.value)}
                            style={{ borderColor: '#ff6600' }}
                          />
                        </div>
                      </>
                    )}

                    {/* Interviewer Details */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Interviewer Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter interviewer name"
                        value={stage.interviewerName || ''}
                        onChange={(e) => updateStage(index, 'interviewerName', e.target.value)}
                        style={{ borderColor: '#ff6600' }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Interviewer Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter interviewer email"
                        value={stage.interviewerEmail || ''}
                        onChange={(e) => updateStage(index, 'interviewerEmail', e.target.value)}
                        style={{ borderColor: '#ff6600' }}
                      />
                    </div>

                    {/* Meeting Link */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">Meeting Link (Optional)</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://meet.google.com/... or https://zoom.us/..."
                        value={stage.meetingLink || ''}
                        onChange={(e) => updateStage(index, 'meetingLink', e.target.value)}
                        style={{ borderColor: '#ff6600' }}
                      />
                    </div>

                    {/* Instructions */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">Instructions for Candidate</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Enter any specific instructions for the candidate..."
                        value={stage.instructions || ''}
                        onChange={(e) => updateStage(index, 'instructions', e.target.value)}
                        style={{ borderColor: '#ff6600' }}
                      />
                    </div>

                    {/* Status */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Status</label>
                      <select
                        className="form-select"
                        value={stage.status}
                        onChange={(e) => updateStage(index, 'status', e.target.value)}
                        style={{ borderColor: '#ff6600' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {stages.length > 0 && (
          <div className="mt-4 d-flex justify-content-between align-items-center">
            <button
              className="btn"
              style={{ backgroundColor: '#28a745', color: 'white', border: 'none' }}
              onClick={addStage}
            >
              <Plus size={16} className="me-2" />
              Add Another Stage
            </button>
            <button
              className="btn btn-lg px-4"
              style={{ backgroundColor: '#ff6600', color: 'white', border: 'none' }}
              onClick={saveInterviewProcess}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="me-2" />
                  Save Interview Process
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewProcessManager;