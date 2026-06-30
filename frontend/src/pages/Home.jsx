import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import { ChevronRight, ArrowRight, Home as HomeIcon, Briefcase, Sparkles, MapPin } from 'lucide-react';

const Home = () => {
  const { apiFetch } = useAuth();
  const [featuredDesigners, setFeaturedDesigners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        const data = await apiFetch('/designers?sort=rating');
        // Slice top 3 designers
        setFeaturedDesigners(data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching designers for Home:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDesigners();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="home-style-1" style={{background: 'linear-gradient(to right, rgba(30, 29, 27, 0.8), rgba(30, 29, 27, 0.4)), url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80")'}}>
        <div className="container">
          <div style={{ maxWidth: '650px' }}>
            <span style={{ color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '12px' }}>
              Digital Design Marketplace
            </span>
            <h1 className="serif-title" style={{ fontSize: '56px', fontWeight: '400', lineHeight: '1.15', marginBottom: '24px' }}>
              Architects & Designers <br />
              <span style={{ fontStyle: 'normal', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>For Elite Spaces</span>
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.85)', marginBottom: '36px', fontWeight: '300' }}>
              Connect with top architects and interior designers. Discover premium portfolios, compare bespoke design philosophies, and start your project inquiry.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/designers" className="btn btn-accent">
                Explore Portfolios
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ color: '#ffffff', borderColor: '#ffffff' }}>
                Join as Designer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Categories */}
      <section className="section-padding container">
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 className="serif-title" style={{ fontSize: '36px', marginBottom: '16px' }}>Curated Project Specializations</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Browse professional design experts organized across residential planning, high-end commercial spaces, and total historic renovations.
          </p>
        </div>

        <div className="grid-3">
          <div className="card" style={{ padding: '36px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="home-style-2">
              <HomeIcon size={20} style={{ color: 'var(--color-gold)' }} />
            </div>
            <h3>Residential Architecture</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Bespoke luxury estates, modern cabins, and net-zero townhomes tailored to local landscapes and families.
            </p>
            <Link to="/designers?expertise=architecture" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: 'var(--color-gold)', marginTop: 'auto' }}>
              <span>View Architects</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="card" style={{ padding: '36px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="home-style-3">
              <Sparkles size={20} style={{ color: 'var(--color-gold)' }} />
            </div>
            <h3>Interior Design Studio</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Japandi, Minimalist, Transitional, and Art Deco interiors crafted with natural materials and custom details.
            </p>
            <Link to="/designers?expertise=interior_design" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: 'var(--color-gold)', marginTop: 'auto' }}>
              <span>View Decorators</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="card" style={{ padding: '36px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="home-style-4">
              <Briefcase size={20} style={{ color: 'var(--color-gold)' }} />
            </div>
            <h3>Commercial & Hospitality</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Creative office layouts, vintage cocktail bars, and premium retail experiences engineered for utility and beauty.
            </p>
            <Link to="/designers" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: 'var(--color-gold)', marginTop: 'auto' }}>
              <span>Browse All Roles</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Designers Showcase */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
            <div>
              <h2 className="serif-title" style={{ fontSize: '36px', marginBottom: '8px' }}>Featured Studio Profiles</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Discover top-rated designers with exceptional feedback and inquiries.</p>
            </div>
            <Link to="/designers" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Browse Marketplace</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)' }}>
              Loading professional directory...
            </div>
          ) : (
            <div className="grid-3">
              {featuredDesigners.map((designer) => (
                <div key={designer._id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* Photo Header */}
                  <div style={{ height: '240px', position: 'relative', overflow: 'hidden' }}>
                    <img 
                      src={designer.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'} 
                      alt={designer.userId?.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition-smooth)' }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                    <div className="home-style-5" style={{backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)'}}>
                      {designer.experienceYears} Years Exp
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '18px' }}>{designer.userId?.name}</h3>
                      <StarRating rating={designer.avgRating} size={14} />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      <MapPin size={12} />
                      <span>{designer.location}</span>
                    </div>

                    <p className="home-style-6">
                      {designer.bio}
                    </p>

                    {/* Footer Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block', textTransform: 'uppercase' }}>Budget Threshold</span>
                        <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                          ${designer.budgetMin.toLocaleString()} - ${designer.budgetMax.toLocaleString()}
                        </strong>
                      </div>
                      <Link to={`/designers/${designer._id}`} className="btn btn-primary btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        View Studio
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
