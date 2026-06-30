import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, User, LogOut, Menu, ShieldAlert, Award, Sun, Moon, Search, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar" style={{ padding: '0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div className="navbar-logo-badge">
            <Award size={20} style={{ color: '#ffffff' }} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: '700',
              fontSize: '18px',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)'
            }}
          >
            ATELIER<span style={{ fontWeight: '300', opacity: 0.85 }}>CONNECT</span>
          </span>
        </Link>

        <div style={{ display: 'none', position: 'relative', width: '240px', margin: '0 24px' }} className="d-md-block">
          <input
            type="text"
            placeholder="Search projects or designers..."
            className="navbar-search-input"
            readOnly
            onClick={() => navigate('/designers')}
          />
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link
            to="/designers"
            className="navbar-link"
            style={{ gap: '8px', color: isActive('/designers') ? 'var(--color-primary)' : 'var(--text-secondary)' }}
          >
            <Compass size={15} />
            <span>Designers</span>
            {isActive('/designers') && (
              <span style={{
                position: 'absolute',
                bottom: '-2px',
                left: '0',
                right: '0',
                height: '2px',
                background: 'linear-gradient(90deg, #A855F7, #06B6D4)',
                borderRadius: '2px'
              }} />
            )}
          </Link>

          {user && (
            <>
              {user.role === 'client' && (
                <Link
                  to="/client-dashboard"
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: isActive('/client-dashboard') ? 'var(--color-primary)' : 'var(--text-secondary)',
                    position: 'relative',
                    padding: '10px 0'
                  }}
                >
                  Dashboard
                  {isActive('/client-dashboard') && (
                    <span style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: '0',
                      right: '0',
                      height: '2px',
                      background: 'linear-gradient(90deg, #A855F7, #06B6D4)',
                      borderRadius: '2px'
                    }} />
                  )}
                </Link>
              )}

              {user.role === 'designer' && (
                <Link
                  to="/designer-dashboard"
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: isActive('/designer-dashboard') ? 'var(--color-primary)' : 'var(--text-secondary)',
                    position: 'relative',
                    padding: '10px 0'
                  }}
                >
                  Studio Inbox
                  {isActive('/designer-dashboard') && (
                    <span style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: '0',
                      right: '0',
                      height: '2px',
                      background: 'linear-gradient(90deg, #A855F7, #06B6D4)',
                      borderRadius: '2px'
                    }} />
                  )}
                </Link>
              )}

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="navbar-link"
                  style={{ gap: '6px', color: isActive('/admin') ? 'var(--color-primary)' : 'var(--text-secondary)' }}
                >
                  <ShieldAlert size={15} />
                  <span>Admin Panel</span>
                  {isActive('/admin') && (
                    <span style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: '0',
                      right: '0',
                      height: '2px',
                      background: 'linear-gradient(90deg, #A855F7, #06B6D4)',
                      borderRadius: '2px'
                    }} />
                  )}
                </Link>
              )}
            </>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Avatar with initial letter */}
                <div className="navbar-avatar">
                  {user.name.charAt(0)}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }} className="d-none d-sm-block">
                  {user.name.split(' ')[0]}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
              >
                <LogOut size={12} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
