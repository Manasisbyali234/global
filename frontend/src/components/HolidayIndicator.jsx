import React, { useState, useEffect } from 'react';

const HolidayIndicator = ({ date, style = {} }) => {
  const [holidayInfo, setHolidayInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Indian holidays for 2024-2026
  const holidays = {
    // 2024
    '2024-01-01': 'New Year\'s Day', '2024-01-15': 'Makar Sankranti', '2024-01-26': 'Republic Day',
    '2024-02-14': 'Vasant Panchami', '2024-02-24': 'Guru Ravidas Jayanti',
    '2024-03-08': 'Holi', '2024-03-14': 'Holi (Second Day)', '2024-03-25': 'Good Friday',
    '2024-04-09': 'Ugadi', '2024-04-11': 'Eid ul-Fitr', '2024-04-14': 'Baisakhi', '2024-04-17': 'Ram Navami', '2024-04-21': 'Mahavir Jayanti',
    '2024-05-01': 'Labour Day', '2024-05-23': 'Buddha Purnima',
    '2024-06-17': 'Eid al-Adha',
    '2024-07-17': 'Muharram',
    '2024-08-15': 'Independence Day', '2024-08-19': 'Raksha Bandhan', '2024-08-26': 'Janmashtami',
    '2024-09-07': 'Ganesh Chaturthi', '2024-09-16': 'Eid Milad un-Nabi',
    '2024-10-02': 'Gandhi Jayanti', '2024-10-12': 'Dussehra', '2024-10-31': 'Karva Chauth',
    '2024-11-01': 'Diwali', '2024-11-02': 'Govardhan Puja', '2024-11-15': 'Guru Nanak Jayanti',
    '2024-12-25': 'Christmas Day',
    // 2025
    '2025-01-01': 'New Year\'s Day', '2025-01-13': 'Lohri', '2025-01-14': 'Makar Sankranti', '2025-01-26': 'Republic Day',
    '2025-02-12': 'Vasant Panchami', '2025-02-26': 'Maha Shivratri',
    '2025-03-14': 'Holi', '2025-03-31': 'Eid ul-Fitr',
    '2025-04-06': 'Ram Navami', '2025-04-13': 'Baisakhi', '2025-04-14': 'Good Friday', '2025-04-18': 'Mahavir Jayanti',
    '2025-05-01': 'Labour Day', '2025-05-12': 'Buddha Purnima',
    '2025-06-07': 'Eid al-Adha',
    '2025-07-06': 'Muharram',
    '2025-08-09': 'Raksha Bandhan', '2025-08-15': 'Independence Day', '2025-08-16': 'Janmashtami',
    '2025-09-05': 'Eid Milad un-Nabi', '2025-09-27': 'Ganesh Chaturthi',
    '2025-10-02': 'Gandhi Jayanti', '2025-10-22': 'Dussehra',
    '2025-11-01': 'Diwali', '2025-11-05': 'Guru Nanak Jayanti',
    '2025-12-25': 'Christmas Day',
    // 2026
    '2026-01-01': 'New Year\'s Day', '2026-01-13': 'Lohri', '2026-01-14': 'Makar Sankranti', '2026-01-26': 'Republic Day',
    '2026-02-01': 'Vasant Panchami', '2026-02-16': 'Guru Ravidas Jayanti', '2026-02-17': 'Maha Shivratri',
    '2026-03-03': 'Holi', '2026-03-20': 'Eid ul-Fitr',
    '2026-04-02': 'Ram Navami', '2026-04-03': 'Good Friday', '2026-04-06': 'Mahavir Jayanti', '2026-04-14': 'Baisakhi',
    '2026-05-01': 'Labour Day', '2026-05-11': 'Buddha Purnima', '2026-05-29': 'Raksha Bandhan',
    '2026-06-26': 'Eid al-Adha',
    '2026-07-26': 'Muharram',
    '2026-08-15': 'Independence Day',
    '2026-09-05': 'Eid Milad un-Nabi', '2026-09-16': 'Ganesh Chaturthi',
    '2026-10-02': 'Gandhi Jayanti', '2026-10-11': 'Dussehra',
    '2026-11-11': 'Diwali', '2026-11-24': 'Guru Nanak Jayanti',
    '2026-12-25': 'Christmas Day'
  };

  useEffect(() => {
    if (date) {
      checkHoliday();
    }
  }, [date]);

  const checkHoliday = async () => {
    setLoading(true);
    try {
      // Check local holidays first
      const holidayName = holidays[date];
      if (holidayName) {
        setHolidayInfo({ name: holidayName, date });
      } else {
        setHolidayInfo(null);
      }
    } catch (error) {
      console.error('Error checking holiday:', error);
      setHolidayInfo(null);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ ...style, fontSize: 12, color: '#6b7280' }}>
        <i className="fa fa-spinner fa-spin"></i> Checking...
      </div>
    );
  }

  const isWeekend = date ? (new Date(date).getDay() === 0 || new Date(date).getDay() === 6) : false;

  if (!holidayInfo && !isWeekend) {
    return null;
  }

  if (isWeekend && !holidayInfo) {
    return (
      <div style={{
        ...style,
        padding: '4px 8px',
        background: '#e0f2fe',
        border: '1px solid #0284c7',
        borderRadius: 4,
        fontSize: 12,
        color: '#0c4a6e',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginTop: 4
      }}>
        <i className="fa fa-calendar-times"></i>
        <span>Weekend</span>
      </div>
    );
  }

  return (
    <div style={{
      ...style,
      padding: '4px 8px',
      background: '#fef3c7',
      border: '1px solid #f59e0b',
      borderRadius: 4,
      fontSize: 12,
      color: '#92400e',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      marginTop: 4
    }}>
      <i className="fa fa-exclamation-triangle"></i>
      <span>Holiday: {holidayInfo.name}</span>
    </div>
  );
};

export default HolidayIndicator;