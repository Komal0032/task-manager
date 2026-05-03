import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './components/AdminDashboard';
import MemberDashboard from './components/MemberDashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user && token !== 'undefined' && token !== 'null') {
      try {
        const userData = JSON.parse(user);
        setIsAuthenticated(true);
        setUserRole(userData.role);
      } catch (error) {
        console.error('Error parsing user:', error);
        handleLogout();
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login onLogin={checkAuth} /> : <Navigate to={userRole === 'Admin' ? "/admin-dashboard" : "/member-dashboard"} replace />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to={userRole === 'Admin' ? "/admin-dashboard" : "/member-dashboard"} replace />} 
        />
        <Route 
          path="/admin-dashboard" 
          element={isAuthenticated && userRole === 'Admin' ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/member-dashboard" 
          element={isAuthenticated && userRole === 'Member' ? <MemberDashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? (userRole === 'Admin' ? "/admin-dashboard" : "/member-dashboard") : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;