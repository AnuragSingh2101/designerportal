import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Calendar, DollarSign, Send, FolderClosed, ExternalLink, ArrowRight, Star } from 'lucide-react';

const ClientDashboard = () => {
  const { user, apiFetch, updateUser } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Profile States
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
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => {
        setIsEditingProfile(false);
        setProfileSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setProfileError(err.message || 'Could not update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Thread reply states
  const [activeInquiryId, setActiveInquiryId] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Favorites board state (stored in local storage for custom client favorites!)
  const [favorites, setFavorites] = useState([]);

  const loadInquiries = async () => {
    try {
      const data = await apiFetch(`/inquiries/client/${user.id}`);
      setInquiries(data);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setError('Could not load inquiries history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      loadInquiries();
      
      // Load favorites from local storage
      const savedFavorites = JSON.parse(localStorage.getItem(`favorites_${user.id}`)) || [];
      setFavorites(savedFavorites);
    }
  }, [user]);

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

      // Update in local state
      setInquiries(prev => prev.map(inq => inq._id === inquiryId ? updated : inq));
      setReplyMessage('');
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Could not send message. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Change inquiry status (Close / Reopen)
  const handleUpdateStatus = async (inquiryId, newStatus) => {
    try {
      const updated = await apiFetch(`/inquiries/${inquiryId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      setInquiries(prev => prev.map(inq => inq._id === inquiryId ? updated : inq));
    } catch (err) {
      console.error('Error updating inquiry status:', err);
      alert('Failed to update status.');
    }
  };

  const toggleExpandThread = (id) => {
    setActiveInquiryId(activeInquiryId === id ? null : id);
  };

  return (
    <div className="container section-padding" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
      <div className="dashboard-layout">
        
        {/* Sidebar Info */}
        <aside className="dashboard-sidebar">
          <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            {user?.profilePhoto ? (
              <img 
                src={user.profilePhoto} 
                alt={user.name} 
                style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', border: '2px solid var(--color-gold)', display: 'block' }} 
              />
            ) : (
              <div className="clientdashboard-style-1">
                {user?.name?.charAt(0)}
              </div>
            )}
            <h3 style={{ fontSize: '18px' }}>{user?.name}</h3>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: '600', letterSpacing: '0.5px' }}>
              Client Member
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span className="form-label" style={{ fontSize: '12px' }}>Account Email</span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{user?.email}</span>
            </div>

            {/* Edit Profile Toggle / Form */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              {!isEditingProfile ? (
                <button 
                  onClick={() => setIsEditingProfile(true)} 
                  className="btn btn-secondary btn-sm" 
                  style={{ width: '100%', padding: '8px', fontSize: '12px' }}
                >
                  Edit Profile Info
                </button>
              ) : (
                <form onSubmit={handleEditProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Edit Profile</span>
                  
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
                        id="edit-profile-photo" 
                        onChange={handleEditPhotoUpload} 
                        style={{ display: 'none' }} 
                      />
                      <label htmlFor="edit-profile-photo" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', padding: '4px 8px', fontSize: '11px', margin: 0 }}>
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
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <span className="form-label" style={{ fontSize: '12px', marginBottom: '8px' }}>Saved Designers</span>
              {favorites.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-light)', fontStyle: 'italic' }}>
                  No studios favorited yet. Browse listings to save.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {favorites.map(fav => (
                    <Link 
                      key={fav.id} 
                      to={`/designers/${fav.id}`}
                      style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', hover: 'color: var(--color-gold)' }}
                    >
                      <Star size={12} style={{ fill: 'var(--color-gold)', stroke: 'var(--color-gold)' }} />
                      <span>{fav.name}</span>
                      <ExternalLink size={10} style={{ marginLeft: 'auto', color: 'var(--text-light)' }} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/designers" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
              <span>Search Designers</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </aside>

        {/* Dashboard Main Workspace */}
        <main>
          <div style={{ marginBottom: '32px' }}>
            <span style={{ color: 'var(--color-gold)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Studio Connections
            </span>
            <h1 className="serif-title" style={{ fontSize: '32px', marginTop: '4px' }}>Project Inquiry Logs</h1>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
              Loading inquiries log...
            </div>
          ) : inquiries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <FolderClosed size={48} style={{ color: 'var(--text-light)', marginBottom: '16px' }} />
              <h3>No Active Inquiries</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px', marginBottom: '24px' }}>
                You have not contacted any designers yet. Discover professional profiles and send your first project blueprint inquiry.
              </p>
              <Link to="/designers" className="btn btn-accent btn-sm">Find Designers</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {inquiries.map((inq) => {
                const isOpen = activeInquiryId === inq._id;
                const designerName = inq.designerId?.userId?.name || 'Unknown Designer';
                const profileId = inq.designerId?._id;

                return (
                  <div key={inq._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Inquiry Row Header */}
                    <div onClick={() => toggleExpandThread(inq._id)} className="clientdashboard-style-2" style={{backgroundColor: isOpen ? 'var(--bg-secondary)' : 'transparent'}}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h3 style={{ fontSize: '16px' }}>{designerName}</h3>
                          {profileId && (
                            <Link 
                              to={`/designers/${profileId}`} 
                              onClick={(e) => e.stopPropagation()} 
                              style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-gold)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}
                            >
                              <span>Studio</span>
                              <ExternalLink size={10} style={{ marginLeft: '2px' }} />
                            </Link>
                          )}
                        </div>
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                          Requirement: <strong>{inq.projectRequirement}</strong>
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <DollarSign size={14} style={{ color: 'var(--color-gold)' }} />
                          <span>${inq.budget.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-light)' }}>
                          <Calendar size={13} />
                          <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className={`badge badge-${inq.status}`}>
                          {inq.status}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Conversation Logs */}
                    {isOpen && (
                      <div style={{ borderTop: '1px solid var(--border-color)', padding: '24px' }}>
                        
                        {/* Status update buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '24px' }}>
                          {inq.status !== 'closed' ? (
                            <button 
                              onClick={() => handleUpdateStatus(inq._id, 'closed')} 
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '12px', padding: '6px 12px' }}
                            >
                              Close Connection
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUpdateStatus(inq._id, 'pending')} 
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '12px', padding: '6px 12px' }}
                            >
                              Re-Open Inquiry
                            </button>
                          )}
                        </div>

                        {/* Message Threads */}
                        <div className="clientdashboard-style-3" style={{border: '1px solid var(--border-color)'}}>
                          {/* Initial Inquiry Message */}
                          <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' }}>
                              YOU (CLIENT) • {new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{ backgroundColor: 'var(--bg-card)', padding: '12px 16px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '14px' }}>
                              {inq.message}
                            </div>
                          </div>

                          {/* Replies */}
                          {inq.responses.map((resp, index) => {
                            const isMe = resp.senderRole === 'client';
                            return (
                              <div 
                                key={index} 
                                style={{ 
                                  alignSelf: isMe ? 'flex-start' : 'flex-end', 
                                  maxWidth: '85%',
                                  textAlign: isMe ? 'left' : 'right'
                                }}
                              >
                                <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' }}>
                                  {isMe ? 'YOU (CLIENT)' : `${designerName.toUpperCase()} (DESIGNER)`} • {new Date(resp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div 
                                  style={{ 
                                    backgroundColor: isMe ? 'var(--bg-card)' : 'var(--color-gold-light)', 
                                    border: isMe ? '1px solid var(--border-color)' : '1px solid var(--color-gold)', 
                                    padding: '12px 16px', 
                                    borderRadius: '4px', 
                                    fontSize: '14px',
                                    color: 'var(--text-primary)',
                                    textAlign: 'left'
                                  }}
                                >
                                  {resp.message}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Reply Form */}
                        {inq.status !== 'closed' ? (
                          <form onSubmit={(e) => handleSendReply(inq._id, e)} style={{ display: 'flex', gap: '12px' }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Write your response message..."
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              disabled={submittingReply}
                              style={{ flex: 1 }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px' }} disabled={submittingReply}>
                              <Send size={16} />
                            </button>
                          </form>
                        ) : (
                          <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-light)', padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
                            This inquiry log has been marked as <strong>CLOSED</strong>. Re-open thread to send messages.
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
