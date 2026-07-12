import React, { useState, useRef, useEffect } from 'react';

const BeforeAfterSlider = ({ beforeImage, afterImage, height = '450px' }) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 to 100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let position = (x / rect.width) * 100;
    
    if (position < 0) position = 0;
    if (position > 100) position = 100;
    
    setSliderPosition(position);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: height,
        overflow: 'hidden',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        cursor: isDragging ? 'ew-resize' : 'default',
        userSelect: 'none'
      }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* After Image (Background) */}
      <img 
        src={afterImage} 
        alt="After Renovation" 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          backgroundColor: 'rgba(30, 29, 27, 0.75)',
          color: '#ffffff',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          zIndex: 10
        }}
      >
        After
      </div>

      {/* Before Image (Overlay Container clipped dynamically) */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${sliderPosition}%`,
          height: '100%',
          overflow: 'hidden',
          pointerEvents: 'none',
          borderRight: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        {/* We need the image inside to remain full-width to prevent squishing */}
        <img 
          src={beforeImage} 
          alt="Before Renovation" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100vw',
            height: '100%',
            objectFit: 'cover',
            maxWidth: 'none'
          }}
        />
        <div 
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            backgroundColor: 'rgba(30, 29, 27, 0.75)',
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            zIndex: 10
          }}
        >
          Before
        </div>
      </div>

      {/* Drag Handle Divider */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${sliderPosition}%`,
          width: '2px',
          backgroundColor: '#ffffff',
          boxShadow: '0 0 10px rgba(0,0,0,0.4)',
          cursor: 'ew-resize',
          zIndex: 20
        }}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        {/* Handle Button */}
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: '2px solid var(--color-gold)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            fontSize: '18px',
            fontWeight: 'bold',
            userSelect: 'none'
          }}
        >
          ↔
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
