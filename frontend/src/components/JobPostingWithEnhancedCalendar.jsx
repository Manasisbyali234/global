import React, { useState } from 'react';
import EnhancedCalendar from './EnhancedCalendar';
import EnhancedHolidayIndicator from './EnhancedHolidayIndicator';
import HolidayDashboard from './HolidayDashboard';

// Example of how to integrate enhanced holiday features into your job posting form
const JobPostingWithEnhancedCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showHolidayDashboard, setShowHolidayDashboard] = useState(false);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px', color: '#1f2937' }}>
        Enhanced Job Posting with Holiday Integration
      </h2>

      {/* Holiday Dashboard Toggle */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setShowHolidayDashboard(!showHolidayDashboard)}
          style={{
            padding: '12px 20px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <i className="fa fa-calendar-alt" />
          {showHolidayDashboard ? 'Hide' : 'Show'} Holiday Dashboard
        </button>
      </div>

      {/* Holiday Dashboard */}
      {showHolidayDashboard && (
        <div style={{ marginBottom: '32px' }}>
          <HolidayDashboard />
        </div>
      )}

      {/* Date Selection with Enhanced Features */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Date Input with Calendar */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            <i className="fa fa-calendar" style={{ marginRight: '8px', color: '#ff6b35' }} />
            Interview Date
          </label>
          
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            />
            
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                fontSize: '16px'
              }}
            >
              <i className="fa fa-calendar-alt" />
            </button>
          </div>

          {/* Enhanced Holiday Indicator */}
          {selectedDate && (
            <EnhancedHolidayIndicator 
              date={selectedDate.toISOString().split('T')[0]}
              showTooltip={true}
              showWeekends={true}
              showDetails={true}
              size="normal"
            />
          )}

          {/* Calendar Popup */}
          {showCalendar && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              zIndex: 1000,
              marginTop: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
              <EnhancedCalendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                minDate={new Date()}
                showHolidays={true}
                showWeekends={true}
                disableHolidays={false}
                disableWeekends={false}
              />
            </div>
          )}
        </div>

        {/* Multiple Date Examples */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Holiday Indicator Examples
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Different sizes */}
            <div>
              <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                Small Size
              </label>
              <EnhancedHolidayIndicator 
                date="2024-12-25"
                size="small"
                showTooltip={true}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                Normal Size
              </label>
              <EnhancedHolidayIndicator 
                date="2024-12-25"
                size="normal"
                showTooltip={true}
                showDetails={true}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                Large Size
              </label>
              <EnhancedHolidayIndicator 
                date="2024-12-25"
                size="large"
                showTooltip={true}
                showDetails={true}
              />
            </div>

            {/* Weekend example */}
            <div>
              <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                Weekend Example
              </label>
              <EnhancedHolidayIndicator 
                date="2024-12-22" // Sunday
                showWeekends={true}
                showTooltip={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Integration Tips */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '8px',
        marginTop: '32px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#0c4a6e',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="fa fa-lightbulb" />
          Integration Tips
        </h3>
        
        <ul style={{ color: '#0c4a6e', fontSize: '14px', lineHeight: '1.6' }}>
          <li>Replace your existing HolidayIndicator with EnhancedHolidayIndicator for better UX</li>
          <li>Use EnhancedCalendar as a popup for date selection instead of native date inputs</li>
          <li>Add HolidayDashboard to your employer dashboard for holiday planning</li>
          <li>The existing holidaysApi.js and backend services work seamlessly with these components</li>
          <li>All components are responsive and support different themes</li>
        </ul>
      </div>

      {/* Code Examples */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginTop: '24px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '12px'
        }}>
          Quick Integration Code
        </h3>
        
        <pre style={{
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          padding: '16px',
          borderRadius: '6px',
          fontSize: '12px',
          overflow: 'auto'
        }}>
{`// Replace existing HolidayIndicator
import EnhancedHolidayIndicator from './EnhancedHolidayIndicator';

// In your form component
<EnhancedHolidayIndicator 
  date={formData.interviewDate}
  showTooltip={true}
  showWeekends={true}
  showDetails={true}
  size="normal"
/>

// Add calendar popup
import EnhancedCalendar from './EnhancedCalendar';

<EnhancedCalendar
  selectedDate={selectedDate}
  onDateSelect={handleDateSelect}
  minDate={new Date()}
  showHolidays={true}
  disableHolidays={false}
/>`}
        </pre>
      </div>
    </div>
  );
};

export default JobPostingWithEnhancedCalendar;