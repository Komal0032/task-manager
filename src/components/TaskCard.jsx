import React, { useState } from 'react';
import './TaskCard.css';

const TaskCard = ({ task, onStatusUpdate, onTaskUpdated }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusClass = (status) => {
    switch(status) {
      case 'Todo': return 'status-todo';
      case 'In-Progress': return 'status-progress';
      case 'Done': return 'status-done';
      default: return '';
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'Urgent': return 'priority-urgent';
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      default: return 'priority-low';
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Done';

  return (
    <div className={`task-card ${isExpanded ? 'expanded' : ''}`} onClick={() => setIsExpanded(!isExpanded)}>
      <div className="task-card-header">
        <div className="task-title-section">
          <h3 className="task-title">{task.title}</h3>
          <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
            {task.priority}
          </span>
        </div>
        <div className="task-status-section" onClick={(e) => e.stopPropagation()}>
          <select 
            value={task.status} 
            onChange={(e) => onStatusUpdate(task._id, e.target.value)}
            className={`status-select ${getStatusClass(task.status)}`}
          >
            <option value="Todo">📋 Todo</option>
            <option value="In-Progress">🔄 In Progress</option>
            <option value="Done">✅ Done</option>
          </select>
        </div>
      </div>

      <div className="task-card-body">
        <p className="task-description">{task.description}</p>
        <div className="task-meta">
          <span className="meta-item">
            <span className="meta-icon">📁</span>
            {task.project?.name || 'No Project'}
          </span>
          <span className="meta-item">
            <span className="meta-icon">👤</span>
            {task.assignedTo?.name || 'Unassigned'}
          </span>
          <span className={`meta-item ${isOverdue ? 'meta-overdue' : ''}`}>
            <span className="meta-icon">📅</span>
            Due: {new Date(task.dueDate).toLocaleDateString()}
            {isOverdue && <span className="overdue-badge">Overdue!</span>}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="task-card-footer">
          <div className="task-details">
            <div className="detail-row">
              <strong>Created By:</strong> {task.assignedBy?.name || 'Unknown'}
            </div>
            <div className="detail-row">
              <strong>Created At:</strong> {new Date(task.createdAt).toLocaleString()}
            </div>
            <div className="detail-row">
              <strong>Full Description:</strong>
              <p>{task.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;