import React, { useState, useEffect } from 'react';
import { holidaysApi } from '../utils/holidaysApi';

const EnhancedHolidayIndicator = ({ 
  date, 
  style = {}, 
  showTooltip = true,
  showWeekends = true,
  showDetails = true,
  size = 'normal' // 'small', 'normal', 'large'
}) => {
  const [holidayInfo, setHolidayInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTooltipState, setShowTooltipState] = useState(false);

  useEffect(() => {
    if (date) {
      checkHoliday();
    }
  }, [date]);

  const checkHoliday = async () => {
    setLoading(true);
    try {
      const result = await holidaysApi.checkHoliday(date);
      if (result.success && result.isHoliday) {
        setHolidayInfo(result.holidayInfo);
      } else {
        setHolidayInfo(null);
      }
    } catch (error) {
      console.error('Error checking holiday:', error);
    }
    setLoading(false);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { fontSize: 10, padding: '2px 6px' };
      case 'large':
        return { fontSize: 14, padding: '6px 12px' };
      default:
        return { fontSize: 12, padding: '4px 8px' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  if (loading) {
    return (
      <div style={{ 
        ...style, 
        ...getSizeStyles(),
        color: '#6b7280',
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }}>
        <i className="fa fa-spinner fa-spin"></i> 
        {size !== 'small' && 'Checking...'}
      </div>
    );
  }

  const isWeekend = date ? (new Date(date).getDay() === 0 || new Date(date).getDay() === 6) : false;

  if (!holidayInfo && (!isWeekend || !showWeekends)) {
    return null;
  }

  // Weekend indicator
  if (isWeekend && !holidayInfo && showWeekends) {
    return (
      <div 
        style={{
          ...style,
          ...getSizeStyles(),
          background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
          border: '1px solid #0284c7',
          borderRadius: 6,
          color: '#0c4a6e',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: 4,
          position: 'relative',
          cursor: showTooltip ? 'help' : 'default'
        }}
        onMouseEnter={() => showTooltip && setShowTooltipState(true)}
        onMouseLeave={() => showTooltip && setShowTooltipState(false)}
      >
        <i className="fa fa-calendar-times"></i>
        {size !== 'small' && <span>Weekend</span>}
        
        {showTooltip && showTooltipState && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1f2937',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            marginBottom: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            {getDayOfWeek(date)} - Weekend
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '4px solid #1f2937'
            }} />
          </div>
        )}
      </div>
    );
  }

  // Holiday indicator
  return (
    <div 
      style={{
        ...style,
        ...getSizeStyles(),
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        border: '1px solid #f59e0b',
        borderRadius: 6,
        color: '#92400e',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
        position: 'relative',
        cursor: showTooltip ? 'help' : 'default',
        boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)'
      }}
      onMouseEnter={() => showTooltip && setShowTooltipState(true)}
      onMouseLeave={() => showTooltip && setShowTooltipState(false)}
    >
      <i className="fa fa-exclamation-triangle"></i>
      {size === 'small' ? (
        <span>Holiday</span>
      ) : (
        <span>
          Holiday{showDetails && holidayInfo ? `: ${holidayInfo.name}` : ''}
        </span>
      )}
      
      {showTooltip && showTooltipState && holidayInfo && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1f2937',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          marginBottom: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          maxWidth: '250px',
          whiteSpace: 'normal',
          textAlign: 'center'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            {holidayInfo.name}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>
            {formatDate(date)}
          </div>
          {isWeekend && (
            <div style={{ 
              fontSize: '11px', 
              opacity: 0.8,
              marginTop: '4px',
              color: '#93c5fd'
            }}>
              Also a weekend
            </div>
          )}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #1f2937'
          }} />
        </div>
      )}
    </div>
  );
};

export default EnhancedHolidayIndicator;