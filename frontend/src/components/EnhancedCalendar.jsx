import React, { useState, useEffect } from 'react';
import { holidaysApi } from '../utils/holidaysApi';

const EnhancedCalendar = ({ 
  selectedDate, 
  onDateSelect, 
  minDate, 
  maxDate,
  showHolidays = true,
  showWeekends = true,
  disableHolidays = false,
  disableWeekends = false 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showHolidays) {
      fetchHolidays();
    }
  }, [currentMonth, showHolidays]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const result = await holidaysApi.getYearHolidays(year);
      if (result.success) {
        setHolidays(result.holidays);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
    setLoading(false);
  };

  const isHoliday = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.some(holiday => holiday.date === dateStr);
  };

  const getHolidayInfo = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.find(holiday => holiday.date === dateStr);
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isDisabled = (date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (disableHolidays && isHoliday(date)) return true;
    if (disableWeekends && isWeekend(date)) return true;
    return false;
  };

  const getDayClass = (date) => {
    let classes = ['calendar-day'];
    
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      classes.push('selected');
    }
    
    if (isDisabled(date)) {
      classes.push('disabled');
    }
    
    if (isHoliday(date)) {
      classes.push('holiday');
    }
    
    if (isWeekend(date)) {
      classes.push('weekend');
    }
    
    return classes.join(' ');
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const date = new Date(current);
      const isCurrentMonth = date.getMonth() === month;
      const holidayInfo = getHolidayInfo(date);

      days.push(
        <div
          key={i}
          className={`${getDayClass(date)} ${!isCurrentMonth ? 'other-month' : ''}`}
          onClick={() => !isDisabled(date) && onDateSelect(date)}
          title={holidayInfo ? `Holiday: ${holidayInfo.name}` : ''}
          style={{
            padding: '8px',
            textAlign: 'center',
            cursor: isDisabled(date) ? 'not-allowed' : 'pointer',
            opacity: !isCurrentMonth ? 0.3 : 1,
            backgroundColor: selectedDate && date.toDateString() === selectedDate.toDateString() 
              ? '#ff6b35' 
              : isHoliday(date) 
                ? '#fef3c7' 
                : isWeekend(date) 
                  ? '#e0f2fe' 
                  : 'transparent',
            color: selectedDate && date.toDateString() === selectedDate.toDateString() 
              ? '#fff' 
              : isHoliday(date) 
                ? '#92400e' 
                : isWeekend(date) 
                  ? '#0c4a6e' 
                  : '#374151',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            position: 'relative'
          }}
        >
          {date.getDate()}
          {holidayInfo && (
            <div style={{
              position: 'absolute',
              bottom: '2px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '4px',
              height: '4px',
              backgroundColor: '#f59e0b',
              borderRadius: '50%'
            }} />
          )}
        </div>
      );
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  return (
    <div style={{
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <button
          onClick={() => navigateMonth(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: '#6b7280'
          }}
        >
          <i className="fa fa-chevron-left" />
        </button>
        
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          {loading && <i className="fa fa-spinner fa-spin" style={{ marginLeft: '8px' }} />}
        </h3>
        
        <button
          onClick={() => navigateMonth(1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: '#6b7280'
          }}
        >
          <i className="fa fa-chevron-right" />
        </button>
      </div>

      {/* Days of week */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px',
        marginBottom: '8px'
      }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{
            padding: '8px',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280'
          }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px'
      }}>
        {renderCalendar()}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '2px'
          }} />
          <span>Holiday</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#e0f2fe',
            border: '1px solid #0284c7',
            borderRadius: '2px'
          }} />
          <span>Weekend</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#ff6b35',
            borderRadius: '2px'
          }} />
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCalendar;