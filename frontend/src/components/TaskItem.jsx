import React from 'react';

const TaskItem = ({ task, onEdit, onDelete, onStatusToggle }) => {
  const { _id, title, description, status, priority, dueDate } = task;

  const isOverdue = () => {
    if (status === 'Completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dDate = new Date(dueDate);
    dDate.setHours(0, 0, 0, 0);
    return dDate < today;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCheckboxChange = () => {
    const nextStatus = status === 'Completed' ? 'Pending' : 'Completed';
    onStatusToggle(_id, { status: nextStatus });
  };

  return (
    <div className={`task-card ${status}`}>
      <div className="task-card-header">
        <div className="task-status-container">
          <div className="custom-checkbox-wrapper" onClick={handleCheckboxChange} role="checkbox" aria-checked={status === 'Completed'} tabIndex="0">
            <div className={`custom-checkbox ${status === 'Completed' ? 'checked' : 'unchecked'}`}>
              {status === 'Completed' && <i className="bx bx-check"></i>}
            </div>
          </div>
          <h4 className="task-card-title">{title}</h4>
        </div>
        <div className="task-badges">
          <span className={`badge badge-priority-${priority.toLowerCase()}`}>
            {priority}
          </span>
          <span className={`badge badge-status-${status.toLowerCase().replace(' ', '-')}`}>
            {status}
          </span>
        </div>
      </div>

      {description && <p className="task-desc">{description}</p>}

      <div className="task-card-footer">
        <div className={`task-due-date ${isOverdue() ? 'overdue' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <i className="bx bx-calendar" style={{ fontSize: '1rem' }}></i> {formatDate(dueDate)} {isOverdue() && '(Overdue)'}
        </div>

        <div className="task-actions">
          <button
            className="btn-icon edit"
            title="Edit Task"
            onClick={() => onEdit(task)}
          >
            <i className="bx bx-edit-alt"></i>
          </button>
          <button
            className="btn-icon delete"
            title="Delete Task"
            onClick={() => onDelete(_id)}
          >
            <i className="bx bx-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
