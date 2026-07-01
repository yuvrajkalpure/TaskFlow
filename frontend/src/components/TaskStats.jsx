import React from 'react';

const TaskStats = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === 'Completed').length;
  const inProgress = tasks.filter(task => task.status === 'In Progress').length;
  const pending = tasks.filter(task => task.status === 'Pending').length;
  
  // Calculate Overdue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = tasks.filter(task => {
    if (task.status === 'Completed') return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="stats-grid">
      <div className="stat-card total">
        <i className="bx bx-list-ul" style={{ fontSize: '2.2rem', opacity: 0.15, position: 'absolute', right: '1.25rem', top: '1.25rem' }}></i>
        <div className="stat-title">Total Tasks</div>
        <div className="stat-value">{total}</div>
        <div className="stat-desc">{completionRate}% Completion Rate</div>
      </div>
      
      <div className="stat-card pending">
        <i className="bx bx-time" style={{ fontSize: '2.2rem', opacity: 0.15, position: 'absolute', right: '1.25rem', top: '1.25rem' }}></i>
        <div className="stat-title">Pending</div>
        <div className="stat-value">{pending}</div>
        <div className="stat-desc">Awaiting action</div>
      </div>
      
      <div className="stat-card progress">
        <i className="bx bx-loader-circle" style={{ fontSize: '2.2rem', opacity: 0.15, position: 'absolute', right: '1.25rem', top: '1.25rem' }}></i>
        <div className="stat-title">In Progress</div>
        <div className="stat-value">{inProgress}</div>
        <div className="stat-desc">Currently working</div>
      </div>
      
      <div className="stat-card completed">
        <i className="bx bx-check-circle" style={{ fontSize: '2.2rem', opacity: 0.15, position: 'absolute', right: '1.25rem', top: '1.25rem' }}></i>
        <div className="stat-title">Completed</div>
        <div className="stat-value">{completed}</div>
        <div className="stat-desc">All done successfully</div>
      </div>

      {overdue > 0 && (
        <div className="stat-card" style={{ borderLeft: '4px solid var(--priority-high)', position: 'relative' }}>
          <i className="bx bx-error-alt" style={{ fontSize: '2.2rem', opacity: 0.15, position: 'absolute', right: '1.25rem', top: '1.25rem', color: 'var(--priority-high)' }}></i>
          <div className="stat-title" style={{ color: 'var(--priority-high)' }}>Overdue Tasks</div>
          <div className="stat-value" style={{ color: 'var(--priority-high)' }}>{overdue}</div>
          <div className="stat-desc" style={{ color: 'var(--priority-high)' }}>Action required!</div>
        </div>
      )}
    </div>
  );
};

export default TaskStats;
