import React from 'react';
import BellIcon from './BellIcon';

const BellIconDemo = () => {
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>
        Bell Icon Component Demo
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#555' }}>
          Basic Usage
        </h2>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <span>Default Bell:</span>
          <BellIcon />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#555' }}>
          Different Sizes
        </h2>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <span>Small (16px):</span>
          <BellIcon size={16} />
          <span>Medium (24px):</span>
          <BellIcon size={24} />
          <span>Large (32px):</span>
          <BellIcon size={32} />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#555' }}>
          Different Colors
        </h2>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <BellIcon color="#007bff" />
          <BellIcon color="#28a745" />
          <BellIcon color="#dc3545" />
          <BellIcon color="#ffc107" />
          <BellIcon color="#6f42c1" />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#555' }}>
          In Navigation Context
        </h2>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
            My App
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Notifications</span>
            <BellIcon size={20} color="#007bff" />
          </div>
        </div>
      </div>

      <div style={{ 
        padding: '1rem',
        backgroundColor: '#e7f3ff',
        borderRadius: '8px',
        border: '1px solid #b3d9ff'
      }}>
        <h3 style={{ marginBottom: '0.5rem', color: '#0056b3' }}>
          Instructions:
        </h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#0056b3' }}>
          <li>Click any bell icon to hear the notification sound</li>
          <li>The bell will shake when clicked</li>
          <li>Make sure to place your alert-tone.mp3 file in public/sounds/</li>
          <li>The component is fully reusable across all pages</li>
        </ul>
      </div>
    </div>
  );
};

export default BellIconDemo;