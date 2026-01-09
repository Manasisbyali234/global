import React, { useState } from 'react';
import { Calendar, Clock, MessageSquare, Send } from 'lucide-react';
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';
const InterviewResponseModal = ({ isOpen, onClose, application, onSubmit }) => {
  const [responseData, setResponseData] = useState({
    availableDate: '',
    availableTime: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!responseData.availableDate || !responseData.availableTime) {
      showError('Please provide your available date and time');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('candidateToken');
      const response = await fetch(`http://localhost:5000/api/candidate/respond-interview/${application._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(responseData)
      });

      const data = await response.json();
      if (response.ok) {
        showSuccess('Response sent successfully!');
        onSubmit && onSubmit(data);
        onClose();
      } else {
        showError(data.message || 'Failed to send response');
      }
    } catch (error) {
      console.error('Error sending response:', error);
      showError('Error sending response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content" style={{ borderRadius: '15px' }}>
          <div className="modal-header" style={{ borderBottom: '2px solid #ff6600' }}>
            <h5 className="modal-title fw-bold">
              <Calendar size={20} className="me-2" style={{ color: '#ff6600' }} />
              Respond to Interview Invitation
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="mb-3 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h6 className="mb-2">Interview Invitation for:</h6>
                <p className="mb-1"><strong>Position:</strong> {application?.jobId?.title}</p>
                <p className="mb-0"><strong>Company:</strong> {application?.employerId?.companyName}</p>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <Calendar size={16} className="me-1" style={{ color: '#ff6600' }} />
                  Your Available Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={responseData.availableDate}
                  onChange={(e) => setResponseData({ ...responseData, availableDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  style={{ borderColor: '#ff6600' }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <Clock size={16} className="me-1" style={{ color: '#ff6600' }} />
                  Your Available Time
                </label>
                <input
                  type="time"
                  className="form-control"
                  value={responseData.availableTime}
                  onChange={(e) => setResponseData({ ...responseData, availableTime: e.target.value })}
                  required
                  style={{ borderColor: '#ff6600' }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <MessageSquare size={16} className="me-1" style={{ color: '#ff6600' }} />
                  Additional Message (Optional)
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Any additional information or alternative time slots..."
                  value={responseData.message}
                  onChange={(e) => setResponseData({ ...responseData, message: e.target.value })}
                  style={{ borderColor: '#ff6600' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn"
                style={{ backgroundColor: '#ff6600', color: 'white', border: 'none' }}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} className="me-2" />
                    Send Response
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InterviewResponseModal;
