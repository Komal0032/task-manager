import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskItem from './TaskItem';
import '../pages/Dashboard.css';

const MemberDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchTasks();
  }, [navigate]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  const myTasks = tasks.filter(t => t.assignedTo === user?.email);
  const stats = {
    total: myTasks.length,
    todo: myTasks.filter(t => t.status === 'Todo').length,
    doing: myTasks.filter(t => t.status === 'In-Progress').length,
    done: myTasks.filter(t => t.status === 'Done').length
  };

  const filteredTasks = myTasks.filter(task => {
    if (filterStatus !== 'All' && task.status !== filterStatus) return false;
    if (searchTerm && !task.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div><p>Loading Member Dashboard...</p></div>;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo"><span className="logo-icon">✓</span><span className="logo-text">TaskPro</span></div>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active">📊 Dashboard</button>
          <button className="nav-item">📋 My Tasks</button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{user?.name?.charAt(0)}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">Team Member</div>
            </div>
            <button onClick={handleLogout} className="logout-btn">🚪</button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div><h1>Member Dashboard</h1><p>Welcome back, {user?.name}! Track your assigned tasks.</p></div>
        </header>

        <div className="stats-container">
          <div className="stat-card"><div className="stat-icon">📊</div><div><h3>{stats.total}</h3><p>My Tasks</p></div></div>
          <div className="stat-card"><div className="stat-icon">⏳</div><div><h3>{stats.todo}</h3><p>To Do</p></div></div>
          <div className="stat-card"><div className="stat-icon">🔄</div><div><h3>{stats.doing}</h3><p>In Progress</p></div></div>
          <div className="stat-card"><div className="stat-icon">✅</div><div><h3>{stats.done}</h3><p>Completed</p></div></div>
        </div>

        <div className="filters-bar">
          <input type="text" placeholder="Search my tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <div className="filter-buttons">
            {['All', 'Todo', 'In-Progress', 'Done'].map(s => <button key={s} onClick={() => setFilterStatus(s)} className={filterStatus === s ? 'active' : ''}>{s}</button>)}
          </div>
        </div>

        <div className="tasks-list">
          {filteredTasks.map(task => (
            <TaskItem 
              key={task._id} 
              task={{ id: task._id, title: task.title, description: task.description, status: task.status, assignedTo: task.assignedTo, priority: task.priority, dueDate: task.dueDate }} 
              onStatusChange={updateTaskStatus} 
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default MemberDashboard;