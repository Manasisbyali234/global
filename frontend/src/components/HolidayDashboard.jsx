import React, { useState, useEffect } from 'react';
import { holidaysApi } from '../utils/holidaysApi';

const HolidayDashboard = ({ country = 'IN', showUpcoming = true, maxUpcoming = 5 }) => {
  const [holidays, setHolidays] = useState([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchHolidays();
  }, [selectedYear, country]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const result = await holidaysApi.getYearHolidays(selectedYear, country);
      if (result.success) {
        setHolidays(result.holidays);
        
        if (showUpcoming) {
          const today = new Date();
          const upcoming = result.holidays
            .filter(holiday => new Date(holiday.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, maxUpcoming);
          setUpcomingHolidays(upcoming);
        }
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
    setLoading(false);
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

  const getDaysUntil = (dateString) => {
    const today = new Date();
    const holidayDate = new Date(dateString);
    const diffTime = holidayDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMonthlyHolidays = () => {
    const monthlyData = {};
    holidays.forEach(holiday => {
      const month = new Date(holiday.date).toLocaleDateString('en-US', { month: 'long' });
      if (!monthlyData[month]) {
        monthlyData[month] = [];
      }
      monthlyData[month].push(holiday);
    });
    return monthlyData;
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: '700',
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="fa fa-calendar-alt" style={{ color: '#ff6b35' }} />
          Holiday Dashboard
        </h2>
        
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        >
          {[2024, 2025, 2026].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#6b7280'
        }}>
          <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }} />
          Loading holidays...
        </div>
      )}

      {!loading && (
        <>
          {/* Upcoming Holidays */}
          {showUpcoming && upcomingHolidays.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fa fa-clock" style={{ color: '#10b981' }} />
                Upcoming Holidays
              </h3>
              
              <div style={{
                display: 'grid',
                gap: '8px'
              }}>
                {upcomingHolidays.map((holiday, index) => {
                  const daysUntil = getDaysUntil(holiday.date);
                  return (
                    <div key={index} style={{
                      padding: '12px 16px',
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <div>
                        <div style={{
                          fontWeight: '600',
                          color: '#1e293b',
                          marginBottom: '4px'
                        }}>
                          {holiday.name}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#64748b'
                        }}>
                          {formatDate(holiday.date)}
                        </div>
                      </div>
                      
                      <div style={{
                        padding: '4px 12px',
                        backgroundColor: daysUntil <= 7 ? '#fef3c7' : '#e0f2fe',
                        color: daysUntil <= 7 ? '#92400e' : '#0c4a6e',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {daysUntil === 0 ? 'Today' : 
                         daysUntil === 1 ? 'Tomorrow' : 
                         `${daysUntil} days`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Monthly Breakdown */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fa fa-calendar-check" style={{ color: '#3b82f6' }} />
              {selectedYear} Holidays by Month
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {Object.entries(getMonthlyHolidays()).map(([month, monthHolidays]) => (
                <div key={month} style={{
                  padding: '16px',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h4 style={{
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1e293b',
                    borderBottom: '2px solid #ff6b35',
                    paddingBottom: '4px'
                  }}>
                    {month} ({monthHolidays.length})
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {monthHolidays.map((holiday, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '4px'
                      }}>
                        <span style={{
                          fontSize: '13px',
                          color: '#1e293b',
                          fontWeight: '500'
                        }}>
                          {holiday.name}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: '#64748b'
                        }}>
                          {new Date(holiday.date).getDate()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e293b'
            }}>
              Holiday Statistics for {selectedYear}
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#ff6b35'
                }}>
                  {holidays.length}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  Total Holidays
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#10b981'
                }}>
                  {upcomingHolidays.length}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  Upcoming
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#3b82f6'
                }}>
                  {Object.keys(getMonthlyHolidays()).length}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  Months with Holidays
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HolidayDashboard;