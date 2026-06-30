import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Award, Eye, EyeOff } from 'lucide-react';

const LoginRegister = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('client'); // 'client' | 'designer'
  
  // Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in email and password.');
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!name) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        // Authenticate
        const user = await login(email, password);
        setSuccess('Logged in successfully!');
        
        // Redirect by role
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'designer') {
          navigate('/designer-dashboard');
        } else {
          navigate('/client-dashboard');
        }
      } else {
        // Register
        const user = await register(name, email, password, role);
        setSuccess('Account created successfully!');
        
        // If designer, route to profile onboarding wizard, otherwise to client dashboard
        if (user.role === 'designer') {
          navigate('/onboarding');
        } else {
          navigate('/client-dashboard');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - var(--navbar-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div className="loginregister-style-1">
            <Award size={28} style={{ color: 'var(--color-gold)' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '600' }}>
            {isLogin ? 'Welcome Back' : 'Create Atelier Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
            {isLogin ? 'Sign in to access your dashboard' : 'Join our professional design community'}
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sign Up Specific Fields */}
          {!isLogin && (
            <>
              {/* Role Toggle Selector */}
              <div className="form-group" style={{ marginBottom: '8px' }}>
                <span className="form-label">I want to register as a:</span>
                <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <button type="button" onClick={() => setRole('client')} className="loginregister-style-2" style={{background: role === 'client' ? 'var(--text-primary)' : 'transparent', color: role === 'client' ? '#ffffff' : 'var(--text-primary)'}}>
                    Client
                  </button>
                  <button type="button" onClick={() => setRole('designer')} className="loginregister-style-3" style={{background: role === 'designer' ? 'var(--text-primary)' : 'transparent', color: role === 'designer' ? '#ffffff' : 'var(--text-primary)'}}>
                    Designer
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  placeholder="Sarah Jenkins"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="name@email.com"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{ paddingRight: '48px' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="loginregister-style-4" style={{transform: 'translateY(-50%)'}}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={toggleAuthMode}
              style={{ background: 'none', border: 'none', color: 'var(--color-gold)', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
              disabled={loading}
            >
              {isLogin ? 'Register Now' : 'Sign In'}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
