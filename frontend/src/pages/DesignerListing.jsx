import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import { Search, MapPin, SlidersHorizontal, Award, Sparkles, X } from 'lucide-react';

const DesignerCardBio = ({ bio }) => {
  const [expanded, setExpanded] = useState(false);
  const maxChars = 140;

  if (!bio) return null;
  if (bio.length <= maxChars) {
    return <p className="designerlisting-style-3">{bio}</p>;
  }

  return (
    <p className="designerlisting-style-3" style={{ display: 'block', overflow: 'visible', minHeight: '54px' }}>
      {expanded ? bio : `${bio.substring(0, maxChars)}...`}
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(!expanded); }}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-gold)',
          fontWeight: '600',
          cursor: 'pointer',
          padding: 0,
          marginLeft: '4px',
          fontSize: '12px',
          textTransform: 'none',
          letterSpacing: 'normal',
          display: 'inline'
        }}
      >
        {expanded ? 'Read Less' : 'Read More'}
      </button>
    </p>
  );
};

const DesignerListing = () => {
  const { apiFetch } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Load initial state from query params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedExpertise, setSelectedExpertise] = useState({
    architecture: searchParams.get('expertise') === 'architecture' || searchParams.get('expertise') === 'both',
    interior_design: searchParams.get('expertise') === 'interior_design' || searchParams.get('expertise') === 'both'
  });
  const [location, setLocation] = useState(searchParams.get('location') || 'All');
  const [budgetMax, setBudgetMax] = useState(parseInt(searchParams.get('budgetMax')) || 1000000);
  const [experienceMin, setExperienceMin] = useState(parseInt(searchParams.get('experienceMin')) || 0);
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating');

  // Designers list state
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Location Options Seed
  const locationOptions = [
    'All',
    'San Francisco, CA',
    'New York, NY',
    'Austin, TX',
    'Miami, FL',
    'Chicago, IL',
    'Seattle, WA',
    'Los Angeles, CA',
    'Boston, MA'
  ];

  // Fetch designers on parameter changes
  const fetchDesignersData = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      
      // Expertise formatting
      if (selectedExpertise.architecture && selectedExpertise.interior_design) {
        queryParams.append('expertise', 'architecture');
        queryParams.append('expertise', 'interior_design');
      } else if (selectedExpertise.architecture) {
        queryParams.append('expertise', 'architecture');
      } else if (selectedExpertise.interior_design) {
        queryParams.append('expertise', 'interior_design');
      }

      if (location && location !== 'All') {
        // Just extract city name to allow matching the pattern in DB
        const city = location.split(',')[0];
        queryParams.append('location', city);
      }
      
      if (budgetMax < 1000000) {
        queryParams.append('budgetMax', budgetMax);
      }
      if (experienceMin > 0) {
        queryParams.append('experienceMin', experienceMin);
      }
      
      queryParams.append('sort', sort);

      const endpoint = `/designers?${queryParams.toString()}`;
      const data = await apiFetch(endpoint);
      setDesigners(data.designers || data || []);
    } catch (err) {
      console.error('Error fetching designers:', err);
      setError('Could not load designer directory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignersData();

    // Sync state with URL params
    const params = {};
    if (search) params.search = search;
    if (selectedExpertise.architecture && selectedExpertise.interior_design) {
      params.expertise = 'both';
    } else if (selectedExpertise.architecture) {
      params.expertise = 'architecture';
    } else if (selectedExpertise.interior_design) {
      params.expertise = 'interior_design';
    }
    if (location !== 'All') params.location = location;
    if (budgetMax < 1000000) params.budgetMax = budgetMax;
    if (experienceMin > 0) params.experienceMin = experienceMin;
    params.sort = sort;
    setSearchParams(params);

  }, [search, selectedExpertise.architecture, selectedExpertise.interior_design, location, budgetMax, experienceMin, sort]);

  const handleCheckboxChange = (name) => {
    setSelectedExpertise(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedExpertise({ architecture: false, interior_design: false });
    setLocation('All');
    setBudgetMax(1000000);
    setExperienceMin(0);
    setSort('rating');
  };

  return (
    <div className="container section-padding" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
      <div style={{ marginBottom: '40px' }}>
        <span style={{ color: 'var(--color-gold)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Marketplace Directory
        </span>
        <h1 className="serif-title" style={{ fontSize: '36px', marginTop: '6px' }}>Discover Studio Visionaries</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Sidebar Filters */}
        <aside style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', position: 'sticky', top: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </h3>
            <button 
              onClick={handleResetFilters} 
              style={{ background: 'none', border: 'none', color: 'var(--color-gold)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
            >
              Reset All
            </button>
          </div>

          {/* Search bar */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Keyword Search</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Name, style, bio keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            </div>
          </div>

          {/* Expertise filters */}
          <div className="form-group">
            <label className="form-label">Expertise</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={selectedExpertise.architecture}
                  onChange={() => handleCheckboxChange('architecture')}
                  style={{ accentColor: 'var(--color-gold)', width: '16px', height: '16px' }}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Award size={14} style={{ color: 'var(--text-secondary)' }} />
                  Architecture
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={selectedExpertise.interior_design}
                  onChange={() => handleCheckboxChange('interior_design')}
                  style={{ accentColor: 'var(--color-gold)', width: '16px', height: '16px' }}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={14} style={{ color: 'var(--text-secondary)' }} />
                  Interior Design
                </span>
              </label>
            </div>
          </div>

          {/* Location filter */}
          <div className="form-group">
            <label className="form-label">Studio Location</label>
            <select 
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Budget Limit Slider */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>Max Budget Cap</label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-gold)' }}>
                {budgetMax === 1000000 ? 'Any Budget' : `$${budgetMax.toLocaleString()}`}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="1000000"
              step="10000"
              value={budgetMax}
              onChange={(e) => setBudgetMax(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-gold)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
              <span>$10,000</span>
              <span>$1,000,000+</span>
            </div>
          </div>

          {/* Minimum Experience */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>Min Experience</label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-gold)' }}>
                {experienceMin === 0 ? 'Any' : `${experienceMin} Years`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={experienceMin}
              onChange={(e) => setExperienceMin(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-gold)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
              <span>0 Yrs</span>
              <span>20 Yrs</span>
            </div>
          </div>
        </aside>

        {/* Listings Content */}
        <main>
          {/* Top Sort Header */}
          <div className="designerlisting-style-1" style={{border: '1px solid var(--border-color)'}}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Showing <strong>{designers.length}</strong> designers
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Sort By:</span>
              <select 
                className="form-input" 
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{ padding: '6px 12px', fontSize: '13px', width: 'auto', border: '1px solid var(--border-color)' }}
              >
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Inquiries</option>
                <option value="experience">Most Experienced</option>
                <option value="newest">New Members</option>
              </select>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-light)' }}>
              Scanning directories for design studios...
            </div>
          ) : designers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <SlidersHorizontal size={48} style={{ color: 'var(--text-light)', marginBottom: '16px' }} />
              <h3>No Designers Match Your Filters</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '14px', maxWidth: '400px', margin: '8px auto 20px' }}>
                Try loosening your search criteria or resetting filters to view all studios.
              </p>
              <button onClick={handleResetFilters} className="btn btn-secondary btn-sm">Reset All Filters</button>
            </div>
          ) : (
            <div className="grid-2">
              {designers.map((designer) => (
                <div key={designer._id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* Photo Head */}
                  <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
                    <img 
                      src={designer.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'} 
                      alt={designer.userId?.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                      {designer.expertise.map(exp => (
                        <span key={exp} className="designerlisting-style-2" style={{backgroundColor: 'rgba(30, 29, 27, 0.85)'}}>
                          {exp === 'interior_design' ? 'Interior' : 'Arch'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Body details */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h3 style={{ fontSize: '16px' }}>{designer.userId?.name}</h3>
                        {designer.isVerified && (
                          <span 
                            title={`${designer.licenseType || 'AIA'} Verified`} 
                            style={{
                              backgroundColor: 'var(--color-gold)',
                              color: '#ffffff',
                              borderRadius: '50%',
                              width: '15px',
                              height: '15px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '9px',
                              fontWeight: 'bold'
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <StarRating rating={designer.avgRating} size={12} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      <MapPin size={12} />
                      <span>{designer.location}</span>
                    </div>

                    <DesignerCardBio bio={designer.bio} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: 'auto' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block', textTransform: 'uppercase' }}>Budget Bounds</span>
                        <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                          ${designer.budgetMin.toLocaleString()} - ${designer.budgetMax.toLocaleString()}
                        </strong>
                      </div>
                      <Link to={`/designers/${designer._id}`} className="btn btn-primary btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DesignerListing;
