import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const Lightbox = ({ images = [], currentIndex = 0, onClose, onChangeIndex }) => {
  
  // Close on Escape, navigate on Arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock scrolling
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [currentIndex, images]);

  if (!images || images.length === 0) return null;

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    const nextIdx = (currentIndex - 1 + images.length) % images.length;
    onChangeIndex(nextIdx);
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    const nextIdx = (currentIndex + 1) % images.length;
    onChangeIndex(nextIdx);
  };

  return (
    <div 
      className="lightbox-overlay"
      onClick={onClose}
    >
      {/* Close button */}
      <button 
        onClick={onClose} 
        className="lightbox-close-btn"
      >
        <X size={32} />
      </button>

      {/* Prev Navigation */}
      {images.length > 1 && (
        <button 
          onClick={handlePrev}
          className="lightbox-nav-btn"
          style={{ left: '24px' }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Image container */}
      <div 
        style={{
          maxWidth: '85%',
          maxHeight: '80%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={images[currentIndex]} 
          alt={`Slide ${currentIndex + 1}`}
          style={{
            maxWidth: '100%',
            maxHeight: '75vh',
            objectFit: 'contain',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}
        />
        
        {/* Caption */}
        <div style={{ color: '#8e8a83', marginTop: '20px', fontSize: '14px', letterSpacing: '1px' }}>
          PROJECT SLIDE {currentIndex + 1} OF {images.length}
        </div>
      </div>

      {/* Next Navigation */}
      {images.length > 1 && (
        <button 
          onClick={handleNext}
          className="lightbox-nav-btn"
          style={{ right: '24px' }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
        >
          <ChevronRight size={28} />
        </button>
      )}
    </div>
  );
};

export default Lightbox;
