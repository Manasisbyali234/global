import React, { useState, useEffect } from 'react';

export default function ResponsiveTable({ children, minWidth = '1000px' }) {
  const [isMobile, setIsMobile] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 767);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div>
      <div 
        className="table-responsive" 
        onScroll={(e) => {
          const scrollLeft = e.target.scrollLeft;
          const scrollWidth = e.target.scrollWidth - e.target.clientWidth;
          setScrollPercent((scrollLeft / scrollWidth) * 100);
        }}
        style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: '#ff6b35 #f1f1f1'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth }}>
          {children}
        </table>
      </div>
      {isMobile && (
        <>
          <div style={{
            height: '6px',
            background: '#f1f1f1',
            borderRadius: '3px',
            margin: '10px 0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: '#ff6b35',
              borderRadius: '3px',
              width: '30%',
              transform: `translateX(${scrollPercent * 2.33}%)`,
              transition: 'transform 0.1s ease'
            }} />
          </div>
          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.875rem',
            margin: '5px 0 10px'
          }}>
            <i className="fa fa-arrows-h" style={{color: '#ff6b35', marginRight: '5px'}}></i>
            Scroll horizontally to view all columns
          </p>
        </>
      )}
    </div>
  );
}
