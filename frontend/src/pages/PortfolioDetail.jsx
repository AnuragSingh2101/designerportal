import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import Lightbox from '../components/Lightbox';
import { MapPin, Briefcase, Calendar, Star, DollarSign, Send, MessageSquare, AlertCircle, AlertTriangle } from 'lucide-react';

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
                <h1 className="serif-title" style={{ fontSize: '32px' }}>{designer.userId?.name}</h1>
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
          <div className="grid-3">
            {filteredProjects.map((project) => (
              <div key={project._id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Main image */}
                <div style={{ height: '240px', position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={project.images[0]} 
                    alt={project.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => openLightbox(project.images, 0)}
                  />
                  <div className="portfoliodetail-style-5" style={{backgroundColor: 'rgba(30, 29, 27, 0.75)'}}>
                    {project.style}
                  </div>
                </div>

                {/* Body details */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{project.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
                    {project.description}
                  </p>

                  {/* Thumbnail Row */}
                  {project.images.length > 1 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      {project.images.slice(1, 4).map((img, idx) => (
                        <div 
                          key={img} 
                          style={{ width: '48px', height: '48px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                          onClick={() => openLightbox(project.images, idx + 1)}
                        >
                          <img src={img} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                      {project.images.length > 4 && (
                        <div className="portfoliodetail-style-6" onClick={() => openLightbox(project.images, 3)}>
                          +{project.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong>{rev.clientId?.name}</strong>
                  <StarRating rating={rev.rating} size={12} />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {rev.feedback}
                </p>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block', marginTop: '6px' }}>
                  Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                </span>
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
