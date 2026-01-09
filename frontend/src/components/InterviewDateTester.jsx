import React, { useState } from 'react';

const InterviewDateTester = ({ jobId }) => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testDates = async () => {
    if (!jobId) {
      alert('Please provide a job ID to test');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('employerToken');
      const response = await fetch(`http://localhost:5000/api/employer/jobs/${jobId}/test-dates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: 20,
      border: '2px solid #e2e8f0',
      borderRadius: 8,
      margin: '20px 0',
      background: '#f8fafc'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>
        🧪 Interview Date Persistence Tester
      </h3>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
          Job ID to Test:
        </label>
        <input
          type="text"
          value={jobId || ''}
          readOnly
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            background: '#f9fafb'
          }}
          placeholder="Job ID will be auto-filled when editing a job"
        />
      </div>

      <button
        onClick={testDates}
        disabled={loading || !jobId}
        style={{
          padding: '10px 20px',
          background: loading ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: loading || !jobId ? 'not-allowed' : 'pointer',
          fontWeight: 600
        }}
      >
        {loading ? 'Testing...' : 'Test Date Persistence'}
      </button>

      {testResult && (
        <div style={{
          marginTop: 20,
          padding: 16,
          background: testResult.success ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${testResult.success ? '#10b981' : '#ef4444'}`,
          borderRadius: 6
        }}>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            color: testResult.success ? '#065f46' : '#991b1b' 
          }}>
            {testResult.success ? '✅ Test Results' : '❌ Test Failed'}
          </h4>
          
          {testResult.success ? (
            <div>
              <p><strong>Job:</strong> {testResult.jobTitle}</p>
              <p><strong>Job ID:</strong> {testResult.jobId}</p>
              
              {testResult.dateInfo && Object.keys(testResult.dateInfo).length > 0 ? (
                <div>
                  <h5 style={{ margin: '12px 0 8px 0' }}>Interview Round Dates:</h5>
                  {Object.entries(testResult.dateInfo).map(([roundKey, info]) => (
                    <div key={roundKey} style={{
                      padding: 12,
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      marginBottom: 8
                    }}>
                      <h6 style={{ margin: '0 0 8px 0', color: '#374151' }}>
                        {roundKey} - {info.description}
                      </h6>
                      <div style={{ fontSize: 14, color: '#6b7280' }}>
                        <div>
                          <strong>From Date:</strong> {info.fromDate.formatted || 'Not set'} 
                          <span style={{ marginLeft: 8, fontSize: 12 }}>
                            (Type: {info.fromDate.type}, Is Date: {info.fromDate.isDate ? 'Yes' : 'No'})
                          </span>
                        </div>
                        <div>
                          <strong>To Date:</strong> {info.toDate.formatted || 'Not set'}
                          <span style={{ marginLeft: 8, fontSize: 12 }}>
                            (Type: {info.toDate.type}, Is Date: {info.toDate.isDate ? 'Yes' : 'No'})
                          </span>
                        </div>
                        <div><strong>Time:</strong> {info.time || 'Not set'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#f59e0b' }}>No interview round details found</p>
              )}
            </div>
          ) : (
            <p style={{ color: '#991b1b' }}>{testResult.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewDateTester;