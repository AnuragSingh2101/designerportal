import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, AlertTriangle, BarChart3, Shield, CheckCircle, Ban, Trash2, Calendar } from 'lucide-react';

const AdminPanel = () => {
  const { user, apiFetch, updateUser } = useAuth();

  // Active view tab
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'users' | 'reports'

  // Data states
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Admin Profile States
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
      console.error('Error updating admin profile:', err);
      setProfileError(err.message || 'Could not update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [usersData, reportsData, analyticsData] = await Promise.all([
        apiFetch('/admin/users'),
        apiFetch('/admin/reports'),
        apiFetch('/admin/analytics')
      ]);

      setUsers(usersData);
      setReports(reportsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching admin workspace data:', err);
      setError('Could not load Administrator console.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Suspend/Unsuspend user
  const handleToggleSuspend = async (userId) => {
    try {
      const data = await apiFetch(`/admin/users/${userId}/suspend`, {
        method: 'PUT'
      });

      // Update state
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, suspended: data.user.suspended } : u));
    } catch (err) {
      console.error('Suspension error:', err);
      alert('Could not update user suspension status.');
    }
  };

  // Delete User cascadingly
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('WARNING: Deleting a user will permanently delete their account and all related portfolio projects, reviews, and inquiry threads. Are you sure?')) return;

    try {
      await apiFetch(`/admin/users/${userId}`, {
        method: 'DELETE'
      });

      // Remove from state
      setUsers(prev => prev.filter(u => u._id !== userId));
      // Reload analytics to update counts
      const updatedAnalytics = await apiFetch('/admin/analytics');
      setAnalytics(updatedAnalytics);
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Could not delete user.');
    }
  };

  // Resolve moderation report flag
  const handleResolveReport = async (reportId) => {
    try {
      const data = await apiFetch(`/admin/reports/${reportId}/resolve`, {
        method: 'PUT'
      });

      // Update state
      setReports(prev => prev.map(r => r._id === reportId ? { ...r, status: 'resolved' } : r));
    } catch (err) {
      console.error('Resolve report error:', err);
      alert('Could not resolve moderation item.');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '120px 0', textAlign: 'center', color: 'var(--text-light)' }}>
        Loading admin console workspace...
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="container" style={{ padding: '120px 0', textAlign: 'center' }}>
        <div className="alert alert-danger" style={{ maxWidth: '500px', margin: '0 auto' }}>
          {error || 'Administrator privileges required.'}
        </div>
      </div>
    );
  }

  const { summary, charts } = analytics;

  return (
    <div className="container section-padding" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
      
      {/* Admin Panel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user?.profilePhoto ? (
            <img 
              src={user.profilePhoto} 
              alt={user.name} 
              style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-gold)' }} 
            />
          ) : (
            <div style={{ width: '56px', height: '56px', backgroundColor: 'var(--color-gold-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={26} style={{ color: 'var(--color-gold)' }} />
            </div>
          )}
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px' }}>
              System Administration
            </span>
            <h1 className="serif-title" style={{ fontSize: '32px', marginTop: '4px' }}>Moderation & Analytics Portal</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Logged in as: <strong>{user?.name}</strong> ({user?.email})
            </p>
          </div>
        </div>

        <div>
          <button 
            onClick={() => setIsEditingProfile(!isEditingProfile)} 
            className="btn btn-secondary btn-sm"
          >
            Edit Admin Name/Photo
          </button>
        </div>
      </div>

      {/* Inline Edit Admin Profile Panel */}
      {isEditingProfile && (
        <div className="card" style={{ padding: '24px', marginBottom: '32px', maxWidth: '500px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Edit Admin Details</h3>
          {profileError && <div className="alert alert-danger">{profileError}</div>}
          {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}

          <form onSubmit={handleEditProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Admin Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Profile Photo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {editPhoto ? (
                  <img 
                    src={editPhoto} 
                    alt="Preview" 
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                  />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-light)' }}>
                    No Photo
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  id="admin-photo-upload" 
                  onChange={handleEditPhotoUpload} 
                  style={{ display: 'none' }} 
                />
                <label htmlFor="admin-photo-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0, padding: '6px 12px', fontSize: '12px' }}>
                  Upload Image
                </label>
                {editPhoto && (
                  <button type="button" onClick={() => setEditPhoto('')} className="btn" style={{ padding: '6px 12px', border: 'none', background: 'transparent', color: 'var(--text-light)', fontSize: '12px' }}>
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Predefined Avatars row */}
            <div style={{ display: 'flex', gap: '8px' }}>
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
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    border: editPhoto === url ? '2px solid var(--color-gold)' : '1px solid var(--border-color)', 
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

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={updatingProfile}>
                {updatingProfile ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => { setIsEditingProfile(false); setProfileError(''); }} className="btn btn-secondary btn-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border-color)', marginBottom: '32px' }}>
        <button onClick={() => setActiveTab('analytics')} className="adminpanel-style-1" style={{borderBottom: activeTab === 'analytics' ? '2px solid var(--color-gold)' : '2px solid transparent', color: activeTab === 'analytics' ? 'var(--text-primary)' : 'var(--text-light)', fontWeight: activeTab === 'analytics' ? '600' : '400'}}>
          <BarChart3 size={16} />
          <span>Analytics Overview</span>
        </button>

        <button onClick={() => setActiveTab('users')} className="adminpanel-style-2" style={{borderBottom: activeTab === 'users' ? '2px solid var(--color-gold)' : '2px solid transparent', color: activeTab === 'users' ? 'var(--text-primary)' : 'var(--text-light)', fontWeight: activeTab === 'users' ? '600' : '400'}}>
          <Users size={16} />
          <span>User Profiles ({users.length})</span>
        </button>

        <button onClick={() => setActiveTab('reports')} className="adminpanel-style-3" style={{borderBottom: activeTab === 'reports' ? '2px solid var(--color-gold)' : '2px solid transparent', color: activeTab === 'reports' ? 'var(--text-primary)' : 'var(--text-light)', fontWeight: activeTab === 'reports' ? '600' : '400'}}>
          <AlertTriangle size={16} style={{ color: reports.some(r => r.status === 'open') ? 'var(--error-text)' : 'inherit' }} />
          <span>Moderation Queue ({reports.filter(r => r.status === 'open').length})</span>
        </button>
      </div>

      {/* TAB 1: Analytics charts */}
      {activeTab === 'analytics' && (
        <div>
          {/* Summary Cards */}
          <div className="grid-4" style={{ marginBottom: '40px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-light)', textTransform: 'uppercase' }}>Studio Designers</span>
              <strong style={{ fontSize: '28px', display: 'block', marginTop: '6px' }}>{summary.totalDesigners}</strong>
            </div>
            
            <div className="card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-light)', textTransform: 'uppercase' }}>Client Accounts</span>
              <strong style={{ fontSize: '28px', display: 'block', marginTop: '6px' }}>{summary.totalClients}</strong>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-light)', textTransform: 'uppercase' }}>Project Inquiries</span>
              <strong style={{ fontSize: '28px', display: 'block', marginTop: '6px' }}>{summary.totalInquiries}</strong>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-light)', textTransform: 'uppercase' }}>Response Conversion</span>
              <strong style={{ fontSize: '28px', display: 'block', marginTop: '6px', color: 'var(--success-text)' }}>
                {summary.responseConversionRate}%
              </strong>
            </div>
          </div>

          {/* SVG-based Custom Interactive Charts */}
          <div className="grid-2">
            
            {/* Category breakdown (Bar chart SVG) */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                Portfolios by Specialization Category
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {charts.projectsByCategory.map((cat, idx) => {
                  const maxCount = Math.max(...charts.projectsByCategory.map(c => c.count), 1);
                  const pct = (cat.count / maxCount) * 100;
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ width: '100px', fontSize: '13px', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {cat._id}
                      </span>
                      <div style={{ flex: 1, height: '14px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--color-gold)', borderRadius: '4px', transition: 'width 0.8s ease' }} />
                      </div>
                      <span style={{ width: '24px', textAlign: 'right', fontSize: '13px', fontWeight: '600' }}>
                        {cat.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inquiries by status (horizontal list progress) */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                Inquiry Status Conversion Rates
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {charts.inquiriesByStatus.map((status, idx) => {
                  const maxCount = Math.max(...charts.inquiriesByStatus.map(s => s.count), 1);
                  const pct = (status.count / maxCount) * 100;
                  
                  let color = 'var(--text-secondary)';
                  if (status.name === 'Closed') color = 'var(--status-closed-text)';
                  if (status.name === 'Responded') color = 'var(--status-responded-text)';
                  if (status.name === 'Pending') color = 'var(--status-pending-text)';

                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ width: '100px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {status.name}
                      </span>
                      <div style={{ flex: 1, height: '14px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '4px', transition: 'width 0.8s ease' }} />
                      </div>
                      <span style={{ width: '24px', textAlign: 'right', fontSize: '13px', fontWeight: '600' }}>
                        {status.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: Users Management */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <strong>{u.name}</strong>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '16px 24px', textTransform: 'uppercase', fontSize: '12px', fontWeight: '600' }}>
                    {u.role}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span 
                      className={`badge`} 
                      style={{ 
                        backgroundColor: u.suspended ? 'var(--error-bg)' : 'var(--success-bg)', 
                        color: u.suspended ? 'var(--error-text)' : 'var(--success-text)' 
                      }}
                    >
                      {u.suspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', display: 'flex', gap: '12px' }}>
                    {u.role !== 'admin' && (
                      <>
                        <button onClick={() => handleToggleSuspend(u._id)} className="adminpanel-style-4">
                          <Ban size={12} />
                          <span>{u.suspended ? 'Unsuspend' : 'Suspend'}</span>
                        </button>
                        <button onClick={() => handleDeleteUser(u._id)} className="adminpanel-style-5">
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Moderation reports */}
      {activeTab === 'reports' && (
        <div className="card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border-color)' }}>
          {reports.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>
              No moderation report logs recorded.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Flagged By</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(rep => (
                  <tr key={rep._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
                    <td style={{ padding: '16px 24px', color: 'var(--text-light)' }}>
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <strong>{rep.reportedBy?.name || 'Deleted User'}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block' }}>{rep.reportedBy?.email}</span>
                    </td>
                    <td style={{ padding: '16px 24px', textTransform: 'uppercase', fontSize: '12px', fontWeight: '600' }}>
                      {rep.targetType}
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', maxWidth: '280px', wordBreak: 'break-word' }}>
                      {rep.reason}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className={`badge badge-${rep.status === 'open' ? 'pending' : 'closed'}`}>
                        {rep.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {rep.status === 'open' ? (
                        <button 
                          onClick={() => handleResolveReport(rep._id)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '12px' }}
                        >
                          <CheckCircle size={12} />
                          <span>Resolve</span>
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
