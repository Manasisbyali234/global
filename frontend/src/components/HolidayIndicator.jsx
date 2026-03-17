import React, { useState, useEffect } from 'react';
import { getLocalHolidayName, isWeekendDate } from '../utils/holidayUtils';

const HolidayIndicator = ({ date, style = {} }) => {
  const [holidayInfo, setHolidayInfo] = useState(null);
  const [loading, setLoading] = useState(false);



  useEffect(() => {
    if (date) {
      checkHoliday();
    }
  }, [date]);

  const checkHoliday = async () => {
    setLoading(true);
    try {
      if (!date) {
        setHolidayInfo(null);
        setLoading(false);
        return;
      }

      const holidayName = getLocalHolidayName(date);

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

  const isWeekend = isWeekendDate(date);

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
