import React, { useState, useEffect } from 'react';
import './TaskForm.css';

const TaskForm = ({ onAddTask, onUpdateTask, editingTask, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Todo',
    assignedTo: '',
    priority: 'Medium',
    dueDate: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        status: editingTask.status || 'Todo',
        assignedTo: editingTask.assignedEmail || editingTask.assignedTo || '',
        priority: editingTask.priority || 'Medium',
        dueDate: editingTask.dueDate || ''
      });
    }
  }, [editingTask]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Task title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.assignedTo.trim()) newErrors.assignedTo = 'Assignee email is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        assignedTo: formData.assignedTo,
        priority: formData.priority,
        dueDate: formData.dueDate
      };
      
      if (editingTask) {
        await onUpdateTask({ ...taskData, id: editingTask.id });
      } else {
        await onAddTask(taskData);
      }
      
      setFormData({
        title: '',
        description: '',
        status: 'Todo',
        assignedTo: '',
        priority: 'Medium',
        dueDate: ''
      });
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      alert(error.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-container">
      <div className="form-header">
        <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label>Task Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Enter task title"
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows="4"
            placeholder="Enter task description"
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="status-select"
            >
              <option value="Todo">📋 Todo</option>
              <option value="In-Progress">🔄 In Progress</option>
              <option value="Done">✅ Done</option>
            </select>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
            >
              <option value="Low">🟢 Low</option>
              <option value="Medium">🟡 Medium</option>
              <option value="High">🟠 High</option>
              <option value="Urgent">🔴 Urgent</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Due Date *</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            className={errors.dueDate ? 'error' : ''}
          />
          {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
        </div>

        <div className="form-group">
          <label>Assign To (Email) *</label>
          <input
            type="email"
            value={formData.assignedTo}
            onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
            placeholder="Enter assignee email (e.g., john@example.com)"
            className={errors.assignedTo ? 'error' : ''}
          />
          {errors.assignedTo && <span className="error-message">{errors.assignedTo}</span>}
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-form-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="submit-form-btn" disabled={loading}>
            {loading ? 'Saving...' : (editingTask ? 'Update Task' : 'Create Task')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;