import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    return 'http://localhost:5000/api';
  }
  const trimmed = envUrl.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

export const API_BASE_URL = getApiBaseUrl();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [designerProfileId, setDesignerProfileId] = useState(localStorage.getItem('designerProfileId') || null);
  const [loading, setLoading] = useState(true);

  // Configure axios-like fetch helper
  const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  };

  const loadCurrentUser = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch('/auth/me');
      setUser(data.user);
      if (data.designerProfileId) {
        setDesignerProfileId(data.designerProfileId);
        localStorage.setItem('designerProfileId', data.designerProfileId);
      } else {
        setDesignerProfileId(null);
        localStorage.removeItem('designerProfileId');
      }
    } catch (err) {
      console.error('Error loading current user:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      
      if (data.designerProfileId) {
        localStorage.setItem('designerProfileId', data.designerProfileId);
        setDesignerProfileId(data.designerProfileId);
      } else {
        localStorage.removeItem('designerProfileId');
        setDesignerProfileId(null);
      }
      return data.user;
    } catch (error) {
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role, profilePhoto = '') => {
    setLoading(true);
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role, profilePhoto }),
      });

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      
      if (data.designerProfileId) {
        localStorage.setItem('designerProfileId', data.designerProfileId);
        setDesignerProfileId(data.designerProfileId);
      } else {
        localStorage.removeItem('designerProfileId');
        setDesignerProfileId(null);
      }
      return data.user;
    } catch (error) {
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('designerProfileId');
    setToken(null);
    setUser(null);
    setDesignerProfileId(null);
    setLoading(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const updateProfileId = (id) => {
    localStorage.setItem('designerProfileId', id);
    setDesignerProfileId(id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        designerProfileId,
        loading,
        login,
        register,
        logout,
        apiFetch,
        updateProfileId,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
