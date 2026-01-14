import React, { useState } from 'react';
import { holidaysApi } from '../utils/holidaysApi';

const HolidayTester = () => {
  const [testDate, setTestDate] = useState('2024-12-25');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testHoliday = async () => {
    setLoading(true);
    try {
      const response = await holidaysApi.checkHoliday(testDate);
      setResult(response);
    } catch (error) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', borderRadius: '8px' }}>
      <h3>Holiday API Tester</h3>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="date"
          value={testDate}
          onChange={(e) => setTestDate(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button 
          onClick={testHoliday} 
          disabled={loading}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          {loading ? 'Testing...' : 'Test Holiday'}
        </button>
      </div>
      
      {result && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '4px',
          marginTop: '10px'
        }}>
          <strong>Result:</strong>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default HolidayTester;