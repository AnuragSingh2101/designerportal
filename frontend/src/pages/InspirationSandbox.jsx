import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PinterestGrid from '../components/PinterestGrid';
import { Grid, Heart, LayoutGrid, CheckSquare } from 'lucide-react';

const InspirationSandbox = () => {
  const { user, apiFetch } = useAuth();
  
  // Data states
  const [inspirationPool, setInspirationPool] = useState([]);
  const [savedUrls, setSavedUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab state: 'browse' or 'saved'
  const [activeTab, setActiveTab] = useState('browse');

  // Filter states
  const [selectedRoom, setSelectedRoom] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState('All');

  const fetchInspirations = async () => {
    try {
      setLoading(true);
      
      // Fetch public pool
      const poolData = await apiFetch('/inspiration/pool');
      setInspirationPool(poolData);

      // If logged in, fetch user's saved board
      if (user && user.role === 'client') {
        const boardData = await apiFetch('/inspiration');
        const urls = boardData.savedImages.map(img => img.imageUrl);
        setSavedUrls(urls);
      }
    } catch (err) {
      console.error('Error loading inspirations:', err);
      setError('Could not load inspiration library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspirations();
  }, [user]);

  // Handle updates when items are saved/unsaved
  const handleSaveChange = () => {
    fetchInspirations();
  };

  // Filter logic
  const filteredPool = inspirationPool.filter(item => {
    const matchRoom = selectedRoom === 'All' || item.roomType === selectedRoom;
    const matchStyle = selectedStyle === 'All' || item.style.toLowerCase() === selectedStyle.toLowerCase();
    const matchBudget = selectedBudget === 'All' || item.budgetTier === selectedBudget;
    return matchRoom && matchStyle && matchBudget;
  });

  // Items to display based on tab
  const displayedItems = activeTab === 'browse' 
    ? filteredPool
    : inspirationPool.filter(item => savedUrls.includes(item.imageUrl));

  const roomTypes = ['All', 'Kitchen', 'Living Room', 'Bedroom', 'Bathroom', 'Outdoor', 'Office'];
  const stylesList = ['All', 'Modern', 'Minimalist', 'Scandinavian', 'Japandi', 'Biophilic'];
  const budgetBrackets = ['All', 'Basic', 'Medium', 'Premium', 'Luxury'];

  return (
    <div className="container section-padding" style={{ minHeight: '80vh' }}>
      
      {/* Header and Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
        <div>
          <span style={{ color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px', fontWeight: '600' }}>
            Design Sandbox
          </span>
          <h1 className="serif-title" style={{ fontSize: '38px', marginTop: '4px' }}>Infinite Inspiration</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Discover and curate premium architectural spaces, material selections, and room ideas.
          </p>
        </div>

        {/* Tab Switcher */}
        {user && user.role === 'client' && (
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', borderRadius: '30px', padding: '4px' }}>
            <button
              onClick={() => setActiveTab('browse')}
              style={{
                background: activeTab === 'browse' ? 'var(--color-gold)' : 'none',
                color: activeTab === 'browse' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition-smooth)'
              }}
            >
              <LayoutGrid size={14} />
              <span>Browse Catalog</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              style={{
                background: activeTab === 'saved' ? 'var(--color-gold)' : 'none',
                color: activeTab === 'saved' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition-smooth)'
              }}
            >
              <Heart size={14} fill={activeTab === 'saved' ? '#ffffff' : 'none'} />
              <span>My Saved Board ({savedUrls.length})</span>
            </button>
          </div>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-light)' }}>
          Loading visual design pool...
        </div>
      ) : (
        <div>
          {/* Filters Bar (Only show in Browse mode) */}
          {activeTab === 'browse' && (
            <div 
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                borderRadius: 'var(--radius-sm)', 
                padding: '20px 24px', 
                marginBottom: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
                
                {/* Room Filter */}
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <label className="form-label" style={{ fontSize: '11px', marginBottom: '6px' }}>Room Type</label>
                  <select 
                    className="form-input" 
                    value={selectedRoom} 
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                  >
                    {roomTypes.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Style Filter */}
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <label className="form-label" style={{ fontSize: '11px', marginBottom: '6px' }}>Design Style</label>
                  <select 
                    className="form-input" 
                    value={selectedStyle} 
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                  >
                    {stylesList.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Budget Filter */}
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <label className="form-label" style={{ fontSize: '11px', marginBottom: '6px' }}>Project Budget Bracket</label>
                  <select 
                    className="form-input" 
                    value={selectedBudget} 
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                  >
                    {budgetBrackets.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Active Filter Badges */}
              {(selectedRoom !== 'All' || selectedStyle !== 'All' || selectedBudget !== 'All') && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Active filters:</span>
                  {selectedRoom !== 'All' && (
                    <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                      Room: {selectedRoom}
                    </span>
                  )}
                  {selectedStyle !== 'All' && (
                    <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                      Style: {selectedStyle}
                    </span>
                  )}
                  {selectedBudget !== 'All' && (
                    <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                      Budget: {selectedBudget}
                    </span>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedRoom('All');
                      setSelectedStyle('All');
                      setSelectedBudget('All');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-gold)', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Grid display */}
          <PinterestGrid 
            items={displayedItems} 
            savedUrls={savedUrls} 
            onSaveChange={handleSaveChange} 
          />
        </div>
      )}
    </div>
  );
};

export default InspirationSandbox;
