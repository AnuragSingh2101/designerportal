import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, Plus, Folder, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const PinterestGrid = ({ items, onSaveChange, savedUrls = [] }) => {
  const { user, apiFetch } = useAuth();
  const [savingId, setSavingId] = useState(null);

  const isSaved = (imageUrl) => {
    return savedUrls.includes(imageUrl);
  };

  const handleSaveToggle = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in as a client to save inspirations.');
      return;
    }
    
    setSavingId(item.id);
    try {
      if (isSaved(item.imageUrl)) {
        // Remove
        await apiFetch('/inspiration/remove', {
          method: 'POST',
          body: JSON.stringify({ imageUrl: item.imageUrl })
        });
      } else {
        // Save
        await apiFetch('/inspiration/save', {
          method: 'POST',
          body: JSON.stringify({
            imageUrl: item.imageUrl,
            style: item.style,
            roomType: item.roomType,
            projectId: item.projectId
          })
        });
      }
      
      if (onSaveChange) {
        onSaveChange();
      }
    } catch (err) {
      console.error('Error toggling board save:', err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      {/* Dynamic Masonry Columns using a self-contained inline style tag */}
      <style>{`
        .pinterest-masonry {
          column-count: 3;
          column-gap: 20px;
          width: 100%;
        }
        @media (max-width: 992px) {
          .pinterest-masonry {
            column-count: 2;
          }
        }
        @media (max-width: 600px) {
          .pinterest-masonry {
            column-count: 1;
          }
        }
        .pinterest-card {
          break-inside: avoid;
          margin-bottom: 20px;
          position: relative;
          border-radius: var(--radius-md);
          overflow: hidden;
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
          transition: var(--transition-smooth);
        }
        .pinterest-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }
        .pinterest-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 16px;
          z-index: 5;
          color: #ffffff;
        }
        .pinterest-card:hover .pinterest-overlay {
          opacity: 1;
        }
        .tag-pill {
          background-color: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(4px);
          color: #ffffff;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          No inspiration designs matched your selection.
        </div>
      ) : (
        <div className="pinterest-masonry">
          {items.map((item) => (
            <div key={item.id} className="pinterest-card">
              {/* Image */}
              <img 
                src={item.imageUrl} 
                alt={item.projectTitle} 
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                loading="lazy"
              />

              {/* Hover Overlay */}
              <div className="pinterest-overlay">
                {/* Top Action Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="tag-pill">{item.style}</span>
                  {user && user.role === 'client' && (
                    <button 
                      onClick={(e) => handleSaveToggle(e, item)} 
                      disabled={savingId === item.id}
                      style={{
                        background: isSaved(item.imageUrl) ? 'var(--color-gold)' : 'rgba(30, 29, 27, 0.8)',
                        border: 'none',
                        color: '#ffffff',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                      title={isSaved(item.imageUrl) ? "Saved" : "Save to board"}
                    >
                      <Heart size={16} fill={isSaved(item.imageUrl) ? "#ffffff" : "none"} />
                    </button>
                  )}
                </div>

                {/* Bottom Text & Designer Info */}
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '4px', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                    {item.projectTitle}
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Designer</span>
                      <strong style={{ fontSize: '12px' }}>{item.designerName}</strong>
                    </div>
                    {item.designerId && (
                      <Link 
                        to={`/designers/${item.designerId}`}
                        style={{
                          backgroundColor: '#ffffff',
                          color: 'var(--text-primary)',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <span>View Studio</span>
                        <ExternalLink size={10} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PinterestGrid;
