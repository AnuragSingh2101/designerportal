import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import LoginRegister from './pages/LoginRegister';
import DesignerListing from './pages/DesignerListing';
import PortfolioDetail from './pages/PortfolioDetail';
import ClientDashboard from './pages/ClientDashboard';
import DesignerDashboard from './pages/DesignerDashboard';
import DesignerOnboarding from './pages/DesignerOnboarding';
import AdminPanel from './pages/AdminPanel';

// Route Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', color: 'var(--text-light)' }}>
        Authenticating session security credentials...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/designers" element={<DesignerListing />} />
          <Route path="/designers/:id" element={<PortfolioDetail />} />

          {/* Client Guard Routes */}
          <Route 
            path="/client-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['client', 'admin']}>
                <ClientDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Designer Guard Routes */}
          <Route 
            path="/designer-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['designer', 'admin']}>
                <DesignerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute allowedRoles={['designer', 'admin']}>
                <DesignerOnboarding />
              </ProtectedRoute>
            } 
          />

          {/* Admin Guard Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
