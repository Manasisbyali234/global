import React, { useState, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import './BellIcon.css';

const BellIcon = ({ size = 20, color = '#333', className = '' }) => {
  const [isShaking, setIsShaking] = useState(false);
  const audioRef = useRef(null);

  const handleBellClick = () => {
    // Play sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.log('Audio play failed:', error);
      });
    }

    // Trigger shake animation
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  };

  return (
    <>
      <FaBell
        size={size}
        color={color}
        className={`bell-icon ${isShaking ? 'shake' : ''} ${className}`}
        onClick={handleBellClick}
        style={{ cursor: 'pointer' }}
      />
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/alert-tone.mp3" type="audio/mpeg" />
      </audio>
    </>
  );
};

export default BellIcon;