import React, { useState, useEffect } from 'react';

const TaskForm = ({ task, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    dueDate: '',
    dueTime: '12:00'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      const dateObj = task.dueDate ? new Date(task.dueDate) : null;
      const formattedDate = dateObj ? dateObj.toISOString().split('T')[0] : '';
      
      let formattedTime = '12:00';
      if (dateObj) {
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        formattedTime = `${hours}:${minutes}`;
      }

      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'Pending',
        priority: task.priority || 'Medium',
        dueDate: formattedDate,
        dueTime: formattedTime
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData({
        title: '',
        description: '',
        status: 'Pending',
        priority: 'Medium',
        dueDate: tomorrow.toISOString().split('T')[0],
        dueTime: '12:00'
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Combine date and time
    const combinedDate = new Date(`${formData.dueDate}T${formData.dueTime || '12:00'}`);

    onSave({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      dueDate: combinedDate.toISOString()
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <i className="bx bx-x"></i>
        </button>
        <div className="modal-header">
          <h3>{task ? 'Edit Task' : 'Create Task'}</h3>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="task-title">Title</label>
            <input
              type="text"
              id="task-title"
              name="title"
              className="form-control"
              placeholder="Enter task title"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <span className="error-text" style={{ color: 'var(--priority-high)', fontSize: '0.8rem' }}>{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              name="description"
              className="form-control"
              placeholder="Enter task description (optional)"
              rows="3"
              style={{ resize: 'none' }}
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="task-status">Status</label>
              <select
                id="task-status"
                name="status"
                className="select-control"
                style={{ width: '100%', padding: '0.8rem 1rem' }}
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                name="priority"
                className="select-control"
                style={{ width: '100%', padding: '0.8rem 1rem' }}
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Grid display for Date and Time side-by-side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="task-due">Due Date</label>
              <input
                type="date"
                id="task-due"
                name="dueDate"
                className="form-control"
                value={formData.dueDate}
                onChange={handleChange}
              />
              {errors.dueDate && <span className="error-text" style={{ color: 'var(--priority-high)', fontSize: '0.8rem' }}>{errors.dueDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="task-time">Due Time</label>
              <input
                type="time"
                id="task-time"
                name="dueTime"
                className="form-control"
                value={formData.dueTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {task ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
