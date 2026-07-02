import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import { Inbox, FolderHeart, Award, Star, Mail, Edit3, Trash2, Plus, X, Send, Save, ArrowLeftRight } from 'lucide-react';

const DesignerDashboard = () => {
  const { user, designerProfileId, apiFetch, updateUser } = useAuth();
  const navigate = useNavigate();

  // Edit User Profile States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhoto, setEditPhoto] = useState(user?.profilePhoto || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhoto(user.profilePhoto || '');
    }
  }, [user]);

  const handleEditPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        setProfileError('Image file must be under 1.5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setUpdatingProfile(true);

    try {
      const data = await apiFetch('/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify({ name: editName, profilePhoto: editPhoto })
      });

      updateUser(data.user);
      
      // Reload designer data to sync profile
      await loadDesignerStudioData();

      setProfileSuccess('Profile updated!');
      setTimeout(() => {
        setIsEditingProfile(false);
        setProfileSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Error updating designer profile:', err);
      setProfileError(err.message || 'Could not update.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Profile states
  const [profile, setProfile] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active workspace tab
  const [activeTab, setActiveTab] = useState('inquiries'); // 'inquiries' | 'projects' | 'reviews'

  // Inquiry responses state
  const [activeInquiryId, setActiveInquiryId] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Project CRUD Modal state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectStyle, setProjectStyle] = useState('Modern');
  const [projectCategory, setProjectCategory] = useState('Residential');
  const [projectImagesStr, setProjectImagesStr] = useState(''); // Comma-separated
  const [crudError, setCrudError] = useState('');
  const [submittingCrud, setSubmittingCrud] = useState(false);

  const loadDesignerStudioData = async () => {
    if (!designerProfileId) {
      // Redirect to onboarding if profileId doesn't exist
      navigate('/onboarding');
      return;
    }

    try {
      const [profileData, inquiriesData, projectsData, reviewsData] = await Promise.all([
        apiFetch(`/designers/${designerProfileId}`),
        apiFetch(`/inquiries/designer/${designerProfileId}`),
        apiFetch(`/portfolio/designer/${designerProfileId}`),
        apiFetch(`/reviews/designer/${designerProfileId}`)
      ]);

      setProfile(profileData);
      setInquiries(inquiriesData);
      setProjects(projectsData);
      setReviews(reviewsData);
    } catch (err) {
      console.error('Error fetching designer data:', err);
      setError('Could not load Studio workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && designerProfileId) {
      loadDesignerStudioData();
    }
  }, [user, designerProfileId]);

  // Reply message in thread
  const handleSendReply = async (inquiryId, e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSubmittingReply(true);
    try {
      const updated = await apiFetch(`/inquiries/${inquiryId}/respond`, {
        method: 'PUT',
        body: JSON.stringify({ message: replyMessage })
      });

      setInquiries(prev => prev.map(inq => inq._id === inquiryId ? updated : inq));
      setReplyMessage('');
    } catch (err) {
      console.error('Reply error:', err);
      alert('Could not post reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Update inquiry status
  const handleUpdateStatus = async (inquiryId, newStatus) => {
    try {
      const updated = await apiFetch(`/inquiries/${inquiryId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      setInquiries(prev => prev.map(inq => inq._id === inquiryId ? updated : inq));
    } catch (err) {
      console.error('Status error:', err);
      alert('Could not update status.');
    }
  };

  // Open Project Modal for Add
  const handleOpenAddProject = () => {
    setEditingProjectId(null);
    setProjectTitle('');
    setProjectDesc('');
    setProjectStyle('Modern');
    setProjectCategory('Residential');
    setProjectImagesStr('');
    setCrudError('');
    setShowProjectModal(true);
  };

  // Open Project Modal for Edit
  const handleOpenEditProject = (proj) => {
    setEditingProjectId(proj._id);
    setProjectTitle(proj.title);
    setProjectDesc(proj.description);
    setProjectStyle(proj.style);
    setProjectCategory(proj.category);
    setProjectImagesStr(proj.images.join(', '));
    setCrudError('');
    setShowProjectModal(true);
  };

  // Handle Project CRUD submit
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setCrudError('');
    setSubmittingCrud(true);

    if (!projectTitle || !projectDesc || !projectImagesStr || !projectStyle) {
      setCrudError('All project fields are required.');
      setSubmittingCrud(false);
      return;
    }

    const imagesArray = projectImagesStr
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (imagesArray.length === 0) {
      setCrudError('Provide at least one valid image URL.');
      setSubmittingCrud(false);
      return;
    }

    try {
      const body = {
        title: projectTitle,
        description: projectDesc,
        style: projectStyle,
        category: projectCategory,
        images: imagesArray
      };

      if (editingProjectId) {
        // Edit existing project
        const updated = await apiFetch(`/portfolio/${editingProjectId}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        });
        setProjects(prev => prev.map(p => p._id === editingProjectId ? updated : p));
      } else {
        // Create new project
        const created = await apiFetch('/portfolio', {
          method: 'POST',
          body: JSON.stringify(body)
        });
        setProjects(prev => [created, ...prev]);
      }

      setShowProjectModal(false);
    } catch (err) {
      console.error('Project submit error:', err);
      setCrudError(err.message || 'Error processing project.');
    } finally {
      setSubmittingCrud(false);
    }
  };

  // Handle Delete Project
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this portfolio project showcase?')) return;

    try {
      await apiFetch(`/portfolio/${projectId}`, {
        method: 'DELETE'
      });
      setProjects(prev => prev.filter(p => p._id !== projectId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Could not delete project.');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '120px 0', textAlign: 'center', color: 'var(--text-light)' }}>
        Loading designer studio workspace...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container" style={{ padding: '120px 0', textAlign: 'center' }}>
        <div className="alert alert-danger" style={{ maxWidth: '500px', margin: '0 auto' }}>
          {error || 'Could not load designer profile.'}
        </div>
        <button onClick={() => navigate('/onboarding')} className="btn btn-primary" style={{ marginTop: '20px' }}>Setup Profile Wizard</button>
      </div>
    );
  }

  return (
    <div className="container section-padding" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
      <div className="dashboard-layout">
        
        {/* Sidebar Status Column */}
        <aside className="dashboard-sidebar">
          <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 12px', border: '2px solid var(--color-gold)' }}>
              <img src={profile.profilePhotoUrl} alt={profile.userId?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 style={{ fontSize: '18px' }}>{profile.userId?.name}</h3>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: '600', letterSpacing: '0.5px' }}>
              Studio Lead
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
            <div>
              <span className="form-label" style={{ fontSize: '12px' }}>Expertise</span>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                {profile.expertise.map(exp => (
                  <span key={exp} style={{ fontSize: '12px', padding: '2px 6px', backgroundColor: 'var(--color-gold-light)', color: 'var(--color-gold)', borderRadius: '3px', textTransform: 'uppercase', fontWeight: '500' }}>
                    {exp === 'interior_design' ? 'Interior' : 'Arch'}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="form-label" style={{ fontSize: '12px' }}>Average Rating</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <strong>{profile.avgRating}</strong>
                <StarRating rating={profile.avgRating} size={12} />
              </div>
            </div>

            <div>
              <span className="form-label" style={{ fontSize: '12px' }}>Location</span>
              <span style={{ color: 'var(--text-secondary)' }}>{profile.location}</span>
            </div>

            <div>
              <span className="form-label" style={{ fontSize: '12px' }}>Budget Range</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
                ${profile.budgetMin.toLocaleString()} - ${profile.budgetMax.toLocaleString()}
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {!isEditingProfile ? (
                <button 
                  onClick={() => setIsEditingProfile(true)} 
                  className="btn btn-secondary btn-sm" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Edit3 size={12} />
                  <span>Edit Name / Photo</span>
                </button>
              ) : (
                <form onSubmit={handleEditProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', textAlign: 'left' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Edit Name & Photo</span>
                  
                  {profileError && <div className="alert alert-danger" style={{ fontSize: '11px', padding: '6px' }}>{profileError}</div>}
                  {profileSuccess && <div className="alert alert-success" style={{ fontSize: '11px', padding: '6px' }}>{profileSuccess}</div>}

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Full Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ padding: '6px 10px', fontSize: '13px' }}
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Profile Photo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {editPhoto ? (
                        <img 
                          src={editPhoto} 
                          alt="Edit preview" 
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-light)' }}>
                          None
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="edit-designer-photo" 
                        onChange={handleEditPhotoUpload} 
                        style={{ display: 'none' }} 
                      />
                      <label htmlFor="edit-designer-photo" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', padding: '4px 8px', fontSize: '11px', margin: 0 }}>
                        Change
                      </label>
                      {editPhoto && (
                        <button type="button" onClick={() => setEditPhoto('')} className="btn btn-sm" style={{ padding: '4px 8px', fontSize: '11px', border: 'none', background: 'transparent', color: 'var(--text-light)' }}>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Predefined Avatars row in Edit Profile */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                      'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
                      'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
                      'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack',
                      'https://api.dicebear.com/7.x/adventurer/svg?seed=Sophia'
                    ].map((url, idx) => (
                      <button 
                        key={idx} 
                        type="button" 
                        onClick={() => setEditPhoto(url)} 
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          border: editPhoto === url ? '1.5px solid var(--color-gold)' : '1px solid var(--border-color)', 
                          padding: 0, 
                          overflow: 'hidden', 
                          cursor: 'pointer',
                          background: 'transparent'
                        }}
                      >
                        <img src={url} alt={`Avatar ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1, padding: '6px', fontSize: '11px' }} disabled={updatingProfile}>
                      {updatingProfile ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" onClick={() => { setIsEditingProfile(false); setProfileError(''); }} className="btn btn-secondary btn-sm" style={{ flex: 1, padding: '6px', fontSize: '11px' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <Link to="/onboarding" className="btn btn-secondary btn-sm" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Edit3 size={12} />
                <span>Edit Studio Profile</span>
              </Link>
              <Link to={`/designers/${profile._id}`} className="btn btn-primary btn-sm" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span>Public Portfolio</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Studio Workspace Content */}
        <main>
          {/* Tabs header */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '32px' }}>
            <button onClick={() => setActiveTab('inquiries')} className="designerdashboard-style-1" style={{borderBottom: activeTab === 'inquiries' ? '2px solid var(--color-gold)' : '2px solid transparent', color: activeTab === 'inquiries' ? 'var(--text-primary)' : 'var(--text-light)', fontWeight: activeTab === 'inquiries' ? '600' : '400'}}>
              <Inbox size={16} />
              <span>Inquiries Inbox ({inquiries.length})</span>
            </button>

            <button onClick={() => setActiveTab('projects')} className="designerdashboard-style-2" style={{borderBottom: activeTab === 'projects' ? '2px solid var(--color-gold)' : '2px solid transparent', color: activeTab === 'projects' ? 'var(--text-primary)' : 'var(--text-light)', fontWeight: activeTab === 'projects' ? '600' : '400'}}>
              <FolderHeart size={16} />
              <span>Project Manager ({projects.length})</span>
            </button>

            <button onClick={() => setActiveTab('reviews')} className="designerdashboard-style-3" style={{borderBottom: activeTab === 'reviews' ? '2px solid var(--color-gold)' : '2px solid transparent', color: activeTab === 'reviews' ? 'var(--text-primary)' : 'var(--text-light)', fontWeight: activeTab === 'reviews' ? '600' : '400'}}>
              <Star size={16} />
              <span>Review Logs ({reviews.length})</span>
            </button>
          </div>

          {/* TAB 1: Inquiries inbox */}
          {activeTab === 'inquiries' && (
            <div>
              {inquiries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 24px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <Mail size={48} style={{ color: 'var(--text-light)', marginBottom: '16px' }} />
                  <h3>Inbox Empty</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                    You have no incoming client inquiries yet. Complete your onboarding project details to boost search rankings.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {inquiries.map(inq => {
                    const isOpen = activeInquiryId === inq._id;
                    const clientName = inq.clientId?.name || 'Guest Client';

                    return (
                      <div key={inq._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        {/* Header Row */}
                        <div 
                          onClick={() => setActiveInquiryId(isOpen ? null : inq._id)}
                          style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: isOpen ? 'var(--bg-secondary)' : 'transparent', transition: 'var(--transition-smooth)' }}
                        >
                          <div>
                            <strong>{clientName}</strong>
                            <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              Project: {inq.projectRequirement}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                              ${inq.budget.toLocaleString()}
                            </span>
                            <span className={`badge badge-${inq.status}`}>{inq.status}</span>
                          </div>
                        </div>

                        {/* Thread responses */}
                        {isOpen && (
                          <div style={{ borderTop: '1px solid var(--border-color)', padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px' }}>
                              <button onClick={() => handleUpdateStatus(inq._id, 'responded')} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '12px' }}>Mark Responded</button>
                              <button onClick={() => handleUpdateStatus(inq._id, 'closed')} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '12px' }}>Close inquiry</button>
                            </div>

                            {/* Chat bubble list */}
                            <div className="designerdashboard-style-4" style={{border: '1px solid var(--border-color)'}}>
                              <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '2px' }}>
                                  {clientName.toUpperCase()} (CLIENT) • {new Date(inq.createdAt).toLocaleDateString()}
                                </div>
                                <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: '4px', fontSize: '13px' }}>
                                  {inq.message}
                                </div>
                              </div>

                              {inq.responses.map((resp, idx) => {
                                const isDesigner = resp.senderRole === 'designer';
                                return (
                                  <div key={idx} style={{ alignSelf: isDesigner ? 'flex-end' : 'flex-start', maxWidth: '85%', textAlign: isDesigner ? 'right' : 'left' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '2px' }}>
                                      {isDesigner ? 'YOU (STUDIO)' : `${clientName.toUpperCase()} (CLIENT)`}
                                    </div>
                                    <div style={{ backgroundColor: isDesigner ? 'var(--color-gold-light)' : 'var(--bg-card)', border: isDesigner ? '1px solid var(--color-gold)' : '1px solid var(--border-color)', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', textAlign: 'left' }}>
                                      {resp.message}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Form */}
                            {inq.status !== 'closed' ? (
                              <form onSubmit={(e) => handleSendReply(inq._id, e)} style={{ display: 'flex', gap: '10px' }}>
                                <input
                                  type="text"
                                  className="form-input"
                                  placeholder="Type response details to client..."
                                  value={replyMessage}
                                  onChange={(e) => setReplyMessage(e.target.value)}
                                  disabled={submittingReply}
                                  style={{ flex: 1 }}
                                />
                                <button type="submit" className="btn btn-primary" disabled={submittingReply}>
                                  <Send size={14} />
                                </button>
                              </form>
                            ) : (
                              <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-light)', backgroundColor: 'var(--bg-secondary)', padding: '8px', borderRadius: '4px' }}>
                                This inquiry thread has been marked closed. Reopen to reply.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Project Manager */}
          {activeTab === 'projects' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px' }}>Manage Showcase Projects</h3>
                <button onClick={handleOpenAddProject} className="btn btn-accent btn-sm">
                  <Plus size={14} />
                  <span>New Project</span>
                </button>
              </div>

              {projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-light)' }}>No portfolio projects uploaded. Add one to show clients your work!</span>
                </div>
              ) : (
                <div className="grid-2">
                  {projects.map(proj => (
                    <div key={proj._id} className="card" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <img src={proj.images[0]} alt={proj.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '15px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{proj.title}</h4>
                        <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-light)', display: 'block', marginTop: '2px' }}>
                          {proj.category} • {proj.style}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                          <button onClick={() => handleOpenEditProject(proj)} className="designerdashboard-style-5">
                            <Edit3 size={11} />
                            <span>Edit</span>
                          </button>
                          <button onClick={() => handleDeleteProject(proj._id)} className="designerdashboard-style-6">
                            <Trash2 size={11} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Reviews list */}
          {activeTab === 'reviews' && (
            <div>
              <div className="designerdashboard-style-7" style={{border: '1px solid var(--border-color)'}}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)', textTransform: 'uppercase', display: 'block' }}>Average Studio Rating</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <strong style={{ fontSize: '28px' }}>{profile.avgRating}</strong>
                    <StarRating rating={profile.avgRating} size={18} />
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', textAlign: 'right' }}>Total Reviews</span>
                  <strong style={{ fontSize: '28px', display: 'block', textAlign: 'right' }}>{reviews.length}</strong>
                </div>
              </div>

              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-light)', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>No client feedback logs posted yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {reviews.map(rev => (
                    <div key={rev._id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong>{rev.clientId?.name}</strong>
                        <StarRating rating={rev.rating} size={11} />
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{rev.feedback}</p>
                      <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block', marginTop: '6px' }}>
                        Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* CRUD Project Modal */}
      {showProjectModal && (
        <div className="designerdashboard-style-8" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', padding: '30px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>
              {editingProjectId ? 'Edit Project Showcase' : 'Add New Portfolio Project'}
            </h3>

            {crudError && <div className="alert alert-danger">{crudError}</div>}

            <form onSubmit={handleProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Modern Minimalist Kitchen" 
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  disabled={submittingCrud}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Design Style</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Mid-Century, Scandinavian" 
                    value={projectStyle}
                    onChange={(e) => setProjectStyle(e.target.value)}
                    disabled={submittingCrud}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-input"
                    value={projectCategory}
                    onChange={(e) => setProjectCategory(e.target.value)}
                    disabled={submittingCrud}
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Renovation">Renovation</option>
                    <option value="Landscape">Landscape</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Portfolio Image URLs (comma-separated)</label>
                <textarea 
                  className="form-input" 
                  placeholder="Provide image web addresses, e.g:&#10;https://images.unsplash.com/photo-1, https://images.unsplash.com/photo-2" 
                  value={projectImagesStr}
                  onChange={(e) => setProjectImagesStr(e.target.value)}
                  disabled={submittingCrud}
                  style={{ minHeight: '80px' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Description</label>
                <textarea 
                  className="form-input" 
                  placeholder="Describe structural blueprints, textiles, wood finishes..." 
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  disabled={submittingCrud}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }} disabled={submittingCrud}>
                  <Save size={12} />
                  <span>{submittingCrud ? 'Saving...' : 'Save Project'}</span>
                </button>
                <button type="button" onClick={() => setShowProjectModal(false)} className="btn btn-secondary btn-sm" disabled={submittingCrud}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignerDashboard;
