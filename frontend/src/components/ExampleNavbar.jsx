import React from 'react';
import BellIcon from './BellIcon';

const ExampleNavbar = () => {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderBottom: '1px solid #e0e0e0'
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
        Your App
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span>Welcome, User!</span>
        
        {/* Bell Icon with default styling */}
        <BellIcon />
        
        {/* Bell Icon with custom size and color */}
        <BellIcon size={24} color="#007bff" />
        
        {/* Bell Icon with custom class for additional styling */}
        <BellIcon 
          size={22} 
          color="#28a745" 
          className="custom-bell"
        />
      </div>
    </nav>
  );
};

export default ExampleNavbar;