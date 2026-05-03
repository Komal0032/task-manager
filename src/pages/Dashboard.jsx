import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import MemberDashboard from '../components/MemberDashboard';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    if (onLogout) onLogout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // Render different dashboard based on user role
  if (user?.role === 'Admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  } else {
    return <MemberDashboard user={user} onLogout={handleLogout} />;
  }
};

export default Dashboard;