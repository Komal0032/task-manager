import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import '../pages/Dashboard.css';

// API URL - Declared only ONCE at the top
const API_URL = 'https://task-manager-backend.onrender.com/api';

const AdminDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Member', password: 'member123' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchTasks();
    fetchProjects();
    loadTeamMembers();
  }, [navigate]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/team`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTeamMembers(data.members);
      }
    } catch (error) {
      console.error('Error loading team:', error);
    }
  };

  const addTask = async (newTask) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newTask)
      });
      const data = await response.json();
      if (data.success) {
        setTasks([data.task, ...tasks]);
        setShowForm(false);
        fetchTasks();
        alert('Task created successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create task');
    }
  };

  const createProject = async () => {
    if (!newProject.name) {
      alert('Please enter project name');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newProject.name,
          description: newProject.description
        })
      });
      const data = await response.json();
      if (data.success) {
        setProjects([...projects, data.project]);
        setNewProject({ name: '', description: '' });
        setShowProjectForm(false);
        alert('Project created successfully!');
        fetchProjects();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create project');
    }
  };

  const addTeamMember = async () => {
    if (!newMember.name || !newMember.email) {
      alert('Please enter name and email');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/team`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newMember.name,
          email: newMember.email,
          role: newMember.role,
          password: newMember.password || 'member123'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTeamMembers([...teamMembers, data.member]);
        setNewMember({ name: '', email: '', role: 'Member', password: 'member123' });
        setShowMemberForm(false);
        alert(`✅ ${newMember.name} added successfully!\n📧 Email: ${newMember.email}\n🔑 Password: ${newMember.password || 'member123'}`);
      } else {
        alert(data.message || 'Failed to add team member');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding team member');
    }
  };

  const removeTeamMember = async (memberId) => {
    const memberToRemove = teamMembers.find(m => m._id === memberId);
    if (memberToRemove?.role === 'Admin') {
      alert('Cannot remove the main Admin!');
      return;
    }
    
    if (window.confirm(`Remove ${memberToRemove?.name} from team?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/team/${memberId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setTeamMembers(teamMembers.filter(m => m._id !== memberId));
          alert('Team member removed successfully');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to remove team member');
      }
    }
  };

  const updateMemberRole = async (memberId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/team/${memberId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTeamMembers(teamMembers.map(member =>
          member._id === memberId ? { ...member, role: newRole } : member
        ));
        alert(`Role updated to ${newRole}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update role');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/tasks/${taskId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setTasks(tasks.filter(t => t._id !== taskId));
        alert('Task deleted successfully');
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete task');
      }
    }
  };

  const deleteProject = async (projectId) => {
    if (window.confirm('Delete this project?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/projects/${projectId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setProjects(projects.filter(p => p._id !== projectId));
        alert('Project deleted successfully');
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete project');
      }
    }
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  const stats = {
    totalTasks: tasks.length,
    todoTasks: tasks.filter(t => t.status === 'Todo').length,
    inProgressTasks: tasks.filter(t => t.status === 'In-Progress').length,
    doneTasks: tasks.filter(t => t.status === 'Done').length,
    totalProjects: projects.length,
    teamMembers: teamMembers.length
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'All' && task.status !== filterStatus) return false;
    if (searchTerm && !task.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div><p>Loading Admin Dashboard...</p></div>;

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">👑</span>
            <span className="logo-text">Admin Portal</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveSection('dashboard')}>
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button className={`nav-item ${activeSection === 'projects' ? 'active' : ''}`} onClick={() => setActiveSection('projects')}>
            <span className="nav-icon">📁</span>
            <span>Projects</span>
            <span className="nav-badge">{projects.length}</span>
          </button>
          <button className={`nav-item ${activeSection === 'tasks' ? 'active' : ''}`} onClick={() => setActiveSection('tasks')}>
            <span className="nav-icon">📋</span>
            <span>All Tasks</span>
            <span className="nav-badge">{tasks.length}</span>
          </button>
          <button className={`nav-item ${activeSection === 'team' ? 'active' : ''}`} onClick={() => setActiveSection('team')}>
            <span className="nav-icon">👥</span>
            <span>Team Management</span>
            <span className="nav-badge">{teamMembers.length}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{user?.name?.charAt(0)}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">Administrator</div>
            </div>
            <button onClick={handleLogout} className="logout-btn">🚪</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div>
            <h1 className="page-title">
              {activeSection === 'dashboard' && 'Admin Dashboard'}
              {activeSection === 'projects' && 'Project Management'}
              {activeSection === 'tasks' && 'Task Management'}
              {activeSection === 'team' && 'Team Management'}
            </h1>
            <p className="page-subtitle">Welcome back, {user?.name}! You have full control over the system.</p>
          </div>
          {activeSection !== 'team' && (
            <button onClick={() => setShowForm(true)} className="create-task-btn">
              + Create Task
            </button>
          )}
          {activeSection === 'projects' && (
            <button onClick={() => setShowProjectForm(true)} className="create-task-btn" style={{ background: '#10b981' }}>
              + Create Project
            </button>
          )}
          {activeSection === 'team' && (
            <button onClick={() => setShowMemberForm(true)} className="create-task-btn" style={{ background: '#10b981' }}>
              + Add Team Member
            </button>
          )}
        </header>

        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
          <>
            <div className="stats-container">
              <div className="stat-card"><div className="stat-icon">📊</div><div><h3>{stats.totalTasks}</h3><p>Total Tasks</p></div></div>
              <div className="stat-card stat-todo"><div className="stat-icon">⏳</div><div><h3>{stats.todoTasks}</h3><p>To Do</p></div></div>
              <div className="stat-card stat-progress"><div className="stat-icon">🔄</div><div><h3>{stats.inProgressTasks}</h3><p>In Progress</p></div></div>
              <div className="stat-card stat-done"><div className="stat-icon">✅</div><div><h3>{stats.doneTasks}</h3><p>Completed</p></div></div>
              <div className="stat-card"><div className="stat-icon">📁</div><div><h3>{stats.totalProjects}</h3><p>Projects</p></div></div>
              <div className="stat-card"><div className="stat-icon">👥</div><div><h3>{stats.teamMembers}</h3><p>Team Members</p></div></div>
            </div>

            <div className="recent-tasks">
              <h3>Recent Tasks</h3>
              <div className="tasks-list">
                {tasks.slice(0, 5).map(task => (
                  <div key={task._id} className="task-card">
                    <div><strong>{task.title}</strong><p>{task.description?.substring(0, 50)}</p></div>
                    <span className={`status-${task.status?.toLowerCase().replace('-', '')}`}>{task.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="recent-tasks" style={{ marginTop: '20px' }}>
              <h3>Active Projects</h3>
              <div className="tasks-list">
                {projects.slice(0, 5).map(project => (
                  <div key={project._id} className="task-card">
                    <div><strong>{project.name}</strong><p>{project.description}</p></div>
                    <span className="status-progress">{project.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Projects Section */}
        {activeSection === 'projects' && (
          <div className="section-container">
            <div className="projects-grid">
              {projects.map(project => (
                <div key={project._id} className="project-card">
                  <div className="project-header">
                    <h3>{project.name}</h3>
                    <button className="delete-project-btn" onClick={() => deleteProject(project._id)}>🗑️</button>
                  </div>
                  <p>{project.description}</p>
                  <div className="project-meta">
                    <span>📅 Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                    <span>📊 Status: {project.status}</span>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="empty-state">No projects yet. Click "Create Project" to get started!</div>
              )}
            </div>
          </div>
        )}

        {/* Tasks Section */}
        {activeSection === 'tasks' && (
          <>
            <div className="filters-bar">
              <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <div className="filter-buttons">
                {['All', 'Todo', 'In-Progress', 'Done'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} className={filterStatus === s ? 'active' : ''}>{s}</button>
                ))}
              </div>
            </div>
            <div className="tasks-list">
              {filteredTasks.map(task => (
                <TaskItem 
                  key={task._id} 
                  task={{ id: task._id, title: task.title, description: task.description, status: task.status, assignedTo: task.assignedTo, priority: task.priority, dueDate: task.dueDate }} 
                  onDelete={deleteTask} 
                  onEdit={() => { setEditingTask(task); setShowForm(true); }} 
                  onStatusChange={updateTaskStatus} 
                />
              ))}
            </div>
          </>
        )}

        {/* Team Management Section */}
        {activeSection === 'team' && (
          <div className="section-container">
            <div className="team-stats">
              <div className="team-stat-card"><h4>{teamMembers.length}</h4><p>Total Members</p></div>
              <div className="team-stat-card"><h4>{teamMembers.filter(m => m.role === 'Admin').length}</h4><p>Admins</p></div>
              <div className="team-stat-card"><h4>{teamMembers.filter(m => m.status === 'online').length}</h4><p>Online Now</p></div>
            </div>

            <div className="team-grid">
              {teamMembers.map(member => (
                <div key={member._id} className="team-card">
                  <div className="team-avatar" style={{ background: member.role === 'Admin' ? 'linear-gradient(135deg, #dc2626, #ef4444)' : 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                    {member.avatar}
                  </div>
                  <div className="team-info">
                    <h3>{member.name}</h3>
                    <p>{member.email}</p>
                    <div className="team-role">
                      <select 
                        value={member.role} 
                        onChange={(e) => updateMemberRole(member._id, e.target.value)}
                        className={`role-select role-${member.role.toLowerCase()}`}
                      >
                        <option value="Admin">👑 Admin</option>
                        <option value="Member">👤 Member</option>
                        <option value="Viewer">👁️ Viewer</option>
                      </select>
                    </div>
                    <div className="member-status">
                      <span className={`status-dot ${member.status}`}></span>
                      <span className="status-text">{member.status}</span>
                    </div>
                  </div>
                  {member.role !== 'Admin' && (
                    <button className="remove-member-btn" onClick={() => removeTeamMember(member._id)} title="Remove Member">
                      🗑️
                    </button>
                  )}
                  {member.role === 'Admin' && (
                    <div className="admin-badge">Admin</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Task Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <TaskForm onAddTask={addTask} editingTask={editingTask} onClose={() => { setShowForm(false); setEditingTask(null); }} />
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showProjectForm && (
        <div className="modal-overlay" onClick={() => setShowProjectForm(false)}>
          <div className="modal-container small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Project</h3>
              <button className="close-modal" onClick={() => setShowProjectForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <input type="text" placeholder="Project Name" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} />
              <textarea placeholder="Project Description" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} rows="3" />
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowProjectForm(false)}>Cancel</button>
                <button className="save-btn" onClick={createProject}>Create Project</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Team Member Modal */}
      {showMemberForm && (
        <div className="modal-overlay" onClick={() => setShowMemberForm(false)}>
          <div className="modal-container small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Add Team Member</h3>
              <button className="close-modal" onClick={() => setShowMemberForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name *</label>
                <input 
                  type="text" 
                  placeholder="Enter full name" 
                  value={newMember.name} 
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})} 
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email Address *</label>
                <input 
                  type="email" 
                  placeholder="Enter email address" 
                  value={newMember.email} 
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})} 
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Role</label>
                <select value={newMember.role} onChange={(e) => setNewMember({...newMember, role: e.target.value})}>
                  <option value="Member">👤 Member</option>
                  <option value="Viewer">👁️ Viewer</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Password (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Leave empty for default password: member123" 
                  value={newMember.password} 
                  onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                />
              </div>
              
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowMemberForm(false)}>Cancel</button>
                <button className="save-btn" onClick={addTeamMember}>Add Member</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;