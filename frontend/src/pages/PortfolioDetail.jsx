import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import Lightbox from '../components/Lightbox';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import { MapPin, Briefcase, Calendar, Star, DollarSign, Send, MessageSquare, AlertCircle, AlertTriangle, Clock, Layers, Hammer, Shield } from 'lucide-react';

const PortfolioDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, apiFetch } = useAuth();

  // Data states
  const [designer, setDesigner] = useState(null);
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inquiry Modal states
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [projectRequirement, setProjectRequirement] = useState('');
  const [inquiryBudget, setInquiryBudget] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryError, setInquiryError] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Report Modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Gallery categorization state
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Lightbox state
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  // Fetch designer details, projects, and reviews
  const loadPortfolioData = async () => {
    setLoading(true);
    try {
      const [designerData, projectsData, reviewsData] = await Promise.all([
        apiFetch(`/designers/${id}`),
        apiFetch(`/portfolio/designer/${id}`),
        apiFetch(`/reviews/designer/${id}`)
      ]);
      
      setDesigner(designerData);
      setProjects(projectsData);
      setReviews(reviewsData);
    } catch (err) {
      console.error('Error loading portfolio details:', err);
      setError('Designer profile not found or server error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolioData();
  }, [id]);

  // Handle send inquiry
  const handleSendInquiry = async (e) => {
    e.preventDefault();
    setInquiryError('');
    setInquirySuccess('');
    setSubmittingInquiry(true);

    if (!projectRequirement || !inquiryBudget || !inquiryMessage) {
      setInquiryError('All fields are required.');
      setSubmittingInquiry(false);
      return;
    }

    try {
      await apiFetch('/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          designerId: designer._id,
          projectRequirement,
          budget: Number(inquiryBudget),
          message: inquiryMessage
        })
      });

      setInquirySuccess('Inquiry sent successfully! You can track this in your dashboard.');
      setProjectRequirement('');
      setInquiryBudget('');
      setInquiryMessage('');
      
      // Auto close modal after a brief delay
      setTimeout(() => {
        setShowInquiryModal(false);
        setInquirySuccess('');
      }, 3000);

    } catch (err) {
      console.error('Inquiry error:', err);
      setInquiryError(err.message || 'Failed to submit inquiry.');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  // Handle submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setSubmittingReview(true);

    if (!reviewFeedback) {
      setReviewError('Feedback comment is required.');
      setSubmittingReview(false);
      return;
    }

    try {
      const newReview = await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          designerId: designer._id,
          rating: reviewRating,
          feedback: reviewFeedback
        })
      });

      setReviewSuccess('Review posted successfully! Thank you.');
      setReviewFeedback('');
      setShowReviewForm(false);
      
      // Reload designer info and review logs to get recalculated avgRating
      loadPortfolioData();

    } catch (err) {
      console.error('Review submit error:', err);
      setReviewError(err.message || 'Only clients with a prior project inquiry can write reviews.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle submit moderation report
  const handleSendReport = async (e) => {
    e.preventDefault();
    setReportError('');
    setReportSuccess('');
    setSubmittingReport(true);

    if (!reportReason) {
      setReportError('Please write a reason for this flag.');
      setSubmittingReport(false);
      return;
    }

    try {
      await apiFetch('/admin/reports', {
        method: 'POST',
        body: JSON.stringify({
          targetType: 'user',
          targetId: designer._id,
          reason: reportReason
        })
      });

      setReportSuccess('Report submitted to system moderators.');
      setReportReason('');
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess('');
      }, 2500);

    } catch (err) {
      console.error('Report error:', err);
      setReportError(err.message || 'Could not submit flag.');
    } finally {
      setSubmittingReport(false);
    }
  };

  // Filter projects by tab
  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  // Trigger lightbox viewer
  const openLightbox = (projectImages, index) => {
    setLightboxImages(projectImages);
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '120px 0', textAlign: 'center', color: 'var(--text-light)' }}>
        Loading designer profile, gallery, and ratings...
      </div>
    );
  }

  if (error || !designer) {
    return (
      <div className="container" style={{ padding: '120px 0', textAlign: 'center' }}>
        <div className="alert alert-danger" style={{ maxWidth: '500px', margin: '0 auto' }}>
          {error || 'Designer profile could not be loaded.'}
        </div>
        <Link to="/designers" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Directory</Link>
      </div>
    );
  }

  return (
    <div className="container section-padding">
      
      {/* 1. Designer Profile Header */}
      <section className="card" style={{ padding: '40px', marginBottom: '48px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Avatar Photo */}
          <div style={{ width: '180px', height: '180px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--color-gold-light)', flexShrink: 0 }}>
            <img 
              src={designer.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'} 
              alt={designer.userId?.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Bio Details */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h1 className="serif-title" style={{ fontSize: '32px' }}>{designer.userId?.name}</h1>
                  {designer.isVerified && (
                    <span 
                      title={`Verified Designer (${designer.licenseType}) - License #${designer.licenseNumber}`}
                      style={{
                        backgroundColor: 'var(--color-gold)',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Shield size={12} fill="#ffffff" />
                      <span>{designer.licenseType} Verified</span>
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {designer.expertise.map(exp => (
                    <span key={exp} className="portfoliodetail-style-1">
                      {exp.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>{designer.avgRating || 'N/A'}</span>
                  <StarRating rating={designer.avgRating} size={18} />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px' }}>
                  Based on {reviews.length} reviews
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '15px' }}>
              {designer.bio}
            </p>

            {/* Quick Metrics */}
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} style={{ color: 'var(--color-gold)' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{designer.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} style={{ color: 'var(--color-gold)' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{designer.experienceYears} Years Experience</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={16} style={{ color: 'var(--color-gold)' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Min project: <strong>${designer.budgetMin.toLocaleString()}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* CTA Inquire Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '220px', width: '100%', maxWidth: '260px' }}>
            {user ? (
              user.role === 'client' ? (
                <button onClick={() => setShowInquiryModal(true)} className="btn btn-accent" style={{ width: '100%' }}>
                  <Send size={16} />
                  <span>Send Project Inquiry</span>
                </button>
              ) : (
                <div style={{ fontSize: '12px', padding: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  Logged in as <strong>{user.role}</strong>. Inquiries are reserved for clients.
                </div>
              )
            ) : (
              <Link to="/login" className="btn btn-accent" style={{ width: '100%' }}>
                Sign In to Connect
              </Link>
            )}

            <button onClick={() => setShowReportModal(true)} className="portfoliodetail-style-2">
              <AlertTriangle size={12} />
              <span>Flag this profile</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Portfolio Gallery */}
      <section style={{ marginBottom: '56px' }}>
        <div className="portfoliodetail-style-3" style={{borderBottom: '1px solid var(--border-color)'}}>
          <h2 className="serif-title" style={{ fontSize: '28px' }}>Project Showcase</h2>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {['All', 'Residential', 'Commercial', 'Renovation'].map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className="portfoliodetail-style-4" style={{borderBottom: activeCategory === cat ? '2px solid var(--color-gold)' : '2px solid transparent', color: activeCategory === cat ? 'var(--text-primary)' : 'var(--text-light)', fontWeight: activeCategory === cat ? '600' : '400'}}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-light)', fontSize: '14px' }}>No projects under the "{activeCategory}" category listed yet.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
            {filteredProjects.map((project) => (
              <div 
                key={project._id} 
                className="card" 
                style={{ 
                  padding: '36px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '24px', 
                  backgroundColor: 'var(--bg-card)', 
                  border: '1px solid var(--border-color)' 
                }}
              >
                {/* Case Study Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '24px', fontWeight: '500', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{project.title}</h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                      <span className="tag-pill" style={{ backgroundColor: 'var(--color-gold-light)', color: 'var(--color-gold)', padding: '2px 8px', fontSize: '11px', fontWeight: '600', borderRadius: '4px', textTransform: 'uppercase' }}>
                        {project.category}
                      </span>
                      <span className="tag-pill" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', padding: '2px 8px', fontSize: '11px', fontWeight: '600', borderRadius: '4px', textTransform: 'uppercase' }}>
                        {project.style}
                      </span>
                      {project.roomType && (
                        <span className="tag-pill" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', padding: '2px 8px', fontSize: '11px', fontWeight: '600', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {project.roomType}
                        </span>
                      )}
                      {project.budgetTier && (
                        <span className="tag-pill" style={{ backgroundColor: 'var(--color-gold-light)', color: 'var(--color-gold)', padding: '2px 8px', fontSize: '11px', fontWeight: '600', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {project.budgetTier} Tier
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Visual & Overview Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }} className="grid-2-to-1">
                  <style>{`
                    @media (max-width: 900px) {
                      .grid-2-to-1 {
                        grid-template-columns: 1fr !important;
                      }
                    }
                  `}</style>
                  
                  {/* Visual Element (Before/After Slider or Primary Image) */}
                  <div>
                    {project.beforeAfterImages && project.beforeAfterImages.before && project.beforeAfterImages.after ? (
                      <BeforeAfterSlider 
                        beforeImage={project.beforeAfterImages.before} 
                        afterImage={project.beforeAfterImages.after} 
                        height="320px" 
                      />
                    ) : (
                      <div style={{ height: '320px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
                        <img 
                          src={project.images[0]} 
                          alt={project.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                          onClick={() => openLightbox(project.images, 0)}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.03)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        />
                      </div>
                    )}
                  </div>

                  {/* Overview & Project Specs Card */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.5px', marginBottom: '6px' }}>Project Narrative</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                        {project.description}
                      </p>
                    </div>

                    {/* Specifications box */}
                    {project.specifications && (project.specifications.durationWeeks || project.specifications.costUSD || (project.specifications.materialsUsed && project.specifications.materialsUsed.length > 0)) && (
                      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h5 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Technical Specifications</h5>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                          {project.specifications.durationWeeks > 0 && (
                            <div>
                              <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block' }}>Timeline</span>
                              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{project.specifications.durationWeeks} Weeks</strong>
                            </div>
                          )}
                          {project.specifications.costUSD > 0 && (
                            <div>
                              <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block' }}>Project Value</span>
                              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>${project.specifications.costUSD.toLocaleString()}</strong>
                            </div>
                          )}
                        </div>
                        {project.specifications.materialsUsed && project.specifications.materialsUsed.length > 0 && (
                          <div style={{ marginTop: '4px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>Material Palette</span>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {project.specifications.materialsUsed.map(mat => (
                                <span key={mat} style={{ fontSize: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                                  {mat}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Case Study Details (Objectives, Challenges, Solutions) */}
                {project.caseStudyDetails && (project.caseStudyDetails.objectives || project.caseStudyDetails.challenges || project.caseStudyDetails.solutions) && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="grid-3-to-1">
                    <style>{`
                      @media (max-width: 768px) {
                        .grid-3-to-1 {
                          grid-template-columns: 1fr !important;
                          gap: 16px !important;
                        }
                      }
                    `}</style>
                    {project.caseStudyDetails.objectives && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-gold)' }}>
                          <Layers size={14} />
                          <h5 style={{ fontSize: '13px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Objectives</h5>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                          {project.caseStudyDetails.objectives}
                        </p>
                      </div>
                    )}
                    {project.caseStudyDetails.challenges && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-gold)' }}>
                          <Clock size={14} />
                          <h5 style={{ fontSize: '13px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Challenges</h5>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                          {project.caseStudyDetails.challenges}
                        </p>
                      </div>
                    )}
                    {project.caseStudyDetails.solutions && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-gold)' }}>
                          <Hammer size={14} />
                          <h5 style={{ fontSize: '13px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Solutions</h5>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                          {project.caseStudyDetails.solutions}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Project Gallery Thumbnails */}
                {project.images && project.images.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <h5 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.5px', marginBottom: '8px' }}>Project Photo Gallery</h5>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {project.images.map((img, idx) => (
                        <div 
                          key={img} 
                          style={{ width: '64px', height: '64px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                          onClick={() => openLightbox(project.images, idx)}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <img src={img} alt={`thumbnail-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Reviews Section */}
      <section style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '32px' }}>
          <h2 className="serif-title" style={{ fontSize: '28px' }}>Reviews & Feedback</h2>
          
          {user && user.role === 'client' && !showReviewForm && (
            <button onClick={() => setShowReviewForm(true)} className="btn btn-secondary btn-sm">
              <MessageSquare size={14} />
              <span>Leave a Review</span>
            </button>
          )}
        </div>

        {/* Inline Review Form */}
        {showReviewForm && (
          <div className="card" style={{ padding: '24px', marginBottom: '32px', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Write Your Client Review</h3>
            {reviewError && <div className="alert alert-danger">{reviewError}</div>}
            {reviewSuccess && <div className="alert alert-success">{reviewSuccess}</div>}

            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <span className="form-label">Assign Star Rating</span>
                <StarRating rating={reviewRating} onRatingChange={setReviewRating} size={24} interactive={true} />
              </div>

              <div className="form-group">
                <label className="form-label">Written Feedback</label>
                <textarea
                  className="form-input"
                  placeholder="Share details of your structural or interior project collaboration experience..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  disabled={submittingReview}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingReview}>
                  {submittingReview ? 'Posting...' : 'Submit Review'}
                </button>
                <button type="button" onClick={() => setShowReviewForm(false)} className="btn btn-secondary btn-sm" disabled={submittingReview}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>
            No reviews have been left for {designer.userId?.name} yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviews.map(rev => (
              <div key={rev._id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  {rev.clientId?.profilePhoto ? (
                    <img 
                      src={rev.clientId.profilePhoto} 
                      alt={rev.clientId.name} 
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                      {rev.clientId?.name?.charAt(0)}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: '14px' }}>{rev.clientId?.name}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                      Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <StarRating rating={rev.rating} size={12} />
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', paddingLeft: '42px' }}>
                  {rev.feedback}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Inquiry Modal */}
      {showInquiryModal && (
        <div className="portfoliodetail-style-7" style={{backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'}}>
          <div className="card" style={{ width: '100%', maxWidth: '560px', padding: '36px', boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
            <h2 className="serif-title" style={{ fontSize: '24px', marginBottom: '6px' }}>Connect with {designer.userId?.name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
              State your details. The designer will receive this directly in their Studio Inbox.
            </p>

            {inquiryError && <div className="alert alert-danger">{inquiryError}</div>}
            {inquirySuccess && <div className="alert alert-success">{inquirySuccess}</div>}

            <form onSubmit={handleSendInquiry} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Project Requirements</label>
                <input
                  type="text"
                  placeholder="e.g. 3-Bedroom residential expansion or loft renovation"
                  className="form-input"
                  value={projectRequirement}
                  onChange={(e) => setProjectRequirement(e.target.value)}
                  disabled={submittingInquiry}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Budget (USD)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  className="form-input"
                  value={inquiryBudget}
                  onChange={(e) => setInquiryBudget(e.target.value)}
                  disabled={submittingInquiry}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Brief Message</label>
                <textarea
                  placeholder="Describe your design goals, timeline, and material preferences..."
                  className="form-input"
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  disabled={submittingInquiry}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submittingInquiry}>
                  {submittingInquiry ? 'Sending...' : 'Send Inquiry'}
                </button>
                <button type="button" onClick={() => setShowInquiryModal(false)} className="btn btn-secondary" disabled={submittingInquiry}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Moderation Report Modal */}
      {showReportModal && (
        <div className="portfoliodetail-style-8" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '30px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error-text)', fontSize: '18px', marginBottom: '12px' }}>
              <AlertCircle size={20} />
              <span>Flag Listing Content</span>
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Explain why this profile should be moderated. System admins will investigate.
            </p>

            {reportError && <div className="alert alert-danger">{reportError}</div>}
            {reportSuccess && <div className="alert alert-success">{reportSuccess}</div>}

            <form onSubmit={handleSendReport}>
              <div className="form-group">
                <label className="form-label">Reason for Flag</label>
                <textarea
                  className="form-input"
                  placeholder="Write details: inappropriate images, false advertising bounds, copyright plagiarism..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  disabled={submittingReport}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-danger btn-sm" style={{ flex: 1 }} disabled={submittingReport}>
                  {submittingReport ? 'Submitting...' : 'Flag Profile'}
                </button>
                <button type="button" onClick={() => setShowReportModal(false)} className="btn btn-secondary btn-sm" disabled={submittingReport}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Overlay */}
      {showLightbox && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setShowLightbox(false)}
          onChangeIndex={setLightboxIndex}
        />
      )}

    </div>
  );
};

export default PortfolioDetail;
