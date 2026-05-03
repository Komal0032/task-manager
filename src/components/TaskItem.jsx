import React, { useState } from 'react';
import './TaskItem.css';

const TaskItem = ({ task, onDelete, onEdit, onStatusChange }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'Urgent': return 'priority-urgent';
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      default: return 'priority-low';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'Urgent': return '🔴';
      case 'High': return '🟠';
      case 'Medium': return '🟡';
      default: return '🟢';
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Todo': return 'status-todo';
      case 'In-Progress': return 'status-progress';
      case 'Doing': return 'status-progress';
      case 'Done': return 'status-done';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Todo': return '📋';
      case 'In-Progress': return '🔄';
      case 'Doing': return '🔄';
      case 'Done': return '✅';
      default: return '📋';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  return (
    <div className="task-card-item" onClick={() => setShowDetails(!showDetails)}>
      <div className="task-card-main">
        <div className="task-card-status" onClick={(e) => e.stopPropagation()}>
          <select 
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className={`status-select ${getStatusClass(task.status)}`}
          >
            <option value="Todo">📋 Todo</option>
            <option value="In-Progress">🔄 In Progress</option>
            <option value="Done">✅ Done</option>
          </select>
        </div>
        
        <div className="task-card-content">
          <h3 className="task-card-title">
            {getStatusIcon(task.status)} {task.title}
          </h3>
          <p className="task-card-description">{task.description?.substring(0, 100)}...</p>
          <div className="task-card-meta">
            <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
              {getPriorityIcon(task.priority)} {task.priority}
            </span>
            <span className="assignee-badge">
              👤 {task.assignedTo || 'Unassigned'}
            </span>
            {task.assignedEmail && (
              <span className="email-badge">
                📧 {task.assignedEmail}
              </span>
            )}
            {task.dueDate && (
              <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
                📅 {formatDate(task.dueDate)}
                {isOverdue && ' ⚠️ Overdue'}
              </span>
            )}
          </div>
        </div>
        
        <div className="task-card-actions" onClick={(e) => e.stopPropagation()}>
          <button className="edit-btn" onClick={() => onEdit(task)}>
            ✏️ Edit
          </button>
          <button className="delete-btn" onClick={() => onDelete(task.id)}>
            🗑️ Delete
          </button>
        </div>
      </div>
      
      {showDetails && (
        <div className="task-card-details">
          <div className="details-grid">
            <div className="detail-item">
              <strong>Task ID:</strong> #{task.id}
            </div>
            <div className="detail-item">
              <strong>Status:</strong> 
              <span className={`status-badge ${getStatusClass(task.status)}`}>
                {getStatusIcon(task.status)} {task.status}
              </span>
            </div>
            <div className="detail-item">
              <strong>Priority:</strong>
              <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                {getPriorityIcon(task.priority)} {task.priority}
              </span>
            </div>
            <div className="detail-item">
              <strong>Created:</strong> {new Date().toLocaleDateString()}
            </div>
            {task.dueDate && (
              <div className="detail-item">
                <strong>Due Date:</strong> 
                <span className={isOverdue ? 'overdue-text' : ''}>
                  {formatDate(task.dueDate)}
                  {isOverdue && ' (Overdue!)'}
                </span>
              </div>
            )}
            <div className="detail-item">
              <strong>Assigned To:</strong> {task.assignedTo || 'Unassigned'}
            </div>
            {task.assignedEmail && (
              <div className="detail-item">
                <strong>Assigned Email:</strong> {task.assignedEmail}
              </div>
            )}
            <div className="detail-item full-width">
              <strong>Full Description:</strong>
              <p>{task.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;