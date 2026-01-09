import { useEffect, useState } from "react";
import { MapPin } from 'lucide-react';
import { loadScript } from "../../../../globals/constants";
import SectionCandidateOverview from "../sections/dashboard/section-can-overview";
import CompleteProfileCard from "../sections/dashboard/section-can-profile";
import SectionNotifications from "../sections/dashboard/section-notifications";
import SectionRecommendedJobs from "../sections/dashboard/section-recommended-jobs";
import './can-dashboard.css';

function CanDashboardPage() {
  const [candidate, setCandidate] = useState({ name: 'Loading...', location: '', profilePicture: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadScript("js/custom.js");
    fetchCandidateData().finally(() => setIsLoading(false));
  }, []);

  const fetchCandidateData = async () => {
    try {
      const token = localStorage.getItem('candidateToken');
      console.log('Dashboard: Token exists:', !!token);
      
      if (!token) {
        console.log('Dashboard: No token found');
        setCandidate({ name: 'Guest', location: '', profilePicture: null });
        return;
      }

      // First try dashboard stats API (most reliable for getting candidate name)
      console.log('Dashboard: Fetching dashboard stats...');
      const statsResponse = await fetch('http://localhost:5000/api/candidate/dashboard/stats', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('Dashboard: Stats response status:', statsResponse.status);
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Dashboard: Stats API Response:', statsData);
        
        if (statsData.success && statsData.candidate && statsData.candidate.name) {
          console.log('Dashboard: Found candidate name from stats:', statsData.candidate.name);
          
          // Now try to get profile data for location and picture
          try {
            const profileResponse = await fetch('http://localhost:5000/api/candidate/profile', {
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              if (profileData.success && profileData.profile) {
                setCandidate({
                  name: statsData.candidate.name, // Use name from stats (more reliable)
                  location: profileData.profile.location || '',
                  profilePicture: profileData.profile.profilePicture
                });
                return;
              }
            }
          } catch (profileError) {
            console.log('Dashboard: Profile fetch failed, using stats data only:', profileError);
          }
          
          // If profile fetch failed, use stats data only
          setCandidate({
            name: statsData.candidate.name,
            location: '',
            profilePicture: null
          });
          return;
        }
      }

      // If stats API failed, try other endpoints
      console.log('Dashboard: Stats API failed, trying other endpoints...');
      const fallbackEndpoints = [
        'http://localhost:5000/api/candidate/dashboard',
        'http://localhost:5000/api/candidate/profile'
      ];

      for (const endpoint of fallbackEndpoints) {
        try {
          console.log(`Dashboard: Trying ${endpoint}...`);
          const response = await fetch(endpoint, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`Dashboard: ${endpoint} response:`, data);
            
            if (data.success) {
              let candidateName = null;
              
              // Extract name based on response structure
              if (data.candidate?.name) {
                candidateName = data.candidate.name;
              } else if (data.profile?.candidateId?.name) {
                candidateName = data.profile.candidateId.name;
              } else if (data.profile?.firstName) {
                candidateName = data.profile.firstName;
              }

              if (candidateName) {
                console.log('Dashboard: Found candidate name:', candidateName);
                setCandidate({
                  name: candidateName,
                  location: data.profile?.location || '',
                  profilePicture: data.profile?.profilePicture || null
                });
                return;
              }
            }
          }
        } catch (endpointError) {
          console.error(`Dashboard: Error with ${endpoint}:`, endpointError);
        }
      }

      // If all endpoints failed, set fallback
      console.log('Dashboard: All API endpoints failed, using fallback');
      setCandidate({ name: 'Candidate', location: '', profilePicture: null });
      
    } catch (error) {
      console.error('Dashboard: Error fetching candidate data:', error);
      setCandidate({ name: 'Candidate', location: '', profilePicture: null });
    }
  };

  return (
    <>
      <div className="twm-right-section-panel site-bg-gray can-dashboard">
        {/* Welcome Card */}
        <div style={{ padding: '2rem 2rem 0 2rem' }} className="welcome-card-container">
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {candidate.profilePicture ? (
                <img 
                  src={candidate.profilePicture} 
                  alt="Profile" 
                  style={{
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    objectFit: 'cover', 
                    border: '3px solid #ff6b35',
                    flexShrink: 0
                  }}
                />
              ) : (
                <div style={{
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  backgroundColor: '#f8f9fa', 
                  border: '3px solid #dee2e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <i className="fa fa-user" style={{ color: '#6c757d', fontSize: '24px' }}></i>
                </div>
              )}
              <div style={{ minWidth: '0' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.25rem 0', wordBreak: 'break-word' }}>
                  Welcome, {isLoading ? (
                    <span style={{ color: '#6b7280' }}>Loading...</span>
                  ) : (
                    candidate.name
                  )}
                </h2>
                {candidate.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <MapPin size={16} style={{ color: '#f97316', flexShrink: 0 }} />
                    <span style={{ color: '#f97316', fontSize: '0.875rem', fontWeight: '500', wordBreak: 'break-word' }}>{candidate.location}</span>
                  </div>
                )}
                <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>Here&apos;s an overview of your job applications and profile</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ padding: '0 2rem 2rem 2rem' }}>
          <SectionCandidateOverview />

          {/* Profile Completion and Notifications */}
          <div className="row">
            <div className="col-xl-8 col-lg-8 col-md-12 mb-4" style={{ position: 'relative', zIndex: 1 }}>
              <CompleteProfileCard />
            </div>
            <div className="col-xl-4 col-lg-4 col-md-12 mb-4" style={{ position: 'relative', zIndex: 2 }}>
              <SectionNotifications />
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="row">
            <div className="col-12 mb-4">
              <SectionRecommendedJobs />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CanDashboardPage;
