import React, { useState, useEffect, useCallback } from 'react';
import { taskAPI } from '../services/api';
import TaskStats from './TaskStats';
import TaskList from './TaskList';
import TaskForm from './TaskForm';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    sortBy: 'dueDate',
    order: 'asc'
  });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await taskAPI.getTasks(filters);
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleSortOrder = () => {
    setFilters(prev => ({
      ...prev,
      order: prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleCreateOrUpdate = async (taskData) => {
    try {
      setError('');
      if (editingTask) {
        await taskAPI.updateTask(editingTask._id, taskData);
      } else {
        await taskAPI.createTask(taskData);
      }
      setIsFormOpen(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setError('');
        await taskAPI.deleteTask(id);
        fetchTasks();
      } catch (err) {
        setError(err.message || 'Failed to delete task');
      }
    }
  };

  const handleStatusToggle = async (id, statusData) => {
    try {
      setError('');
      await taskAPI.updateTask(id, statusData);
      fetchTasks();
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  return (
    <div className="dashboard">
      {/* Stats Counter Panel */}
      <TaskStats tasks={tasks} />

      {/* Control Actions & Filters */}
      <div className="controls-bar">
        <div className="filters-group">
          {/* Search box */}
          <div className="search-wrapper">
            <i className="bx bx-search search-icon"></i>
            <input
              type="text"
              name="search"
              placeholder="Search tasks..."
              className="form-control search-input"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          {/* Status filter */}
          <select
            name="status"
            className="select-control"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority filter */}
          <select
            name="priority"
            className="select-control"
            value={filters.priority}
            onChange={handleFilterChange}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>

          {/* Sort field select */}
          <select
            name="sortBy"
            className="select-control"
            value={filters.sortBy}
            onChange={handleFilterChange}
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="createdAt">Sort by Creation Date</option>
            <option value="title">Sort by Title</option>
            <option value="priority">Sort by Priority</option>
          </select>

          {/* Sort direction button */}
          <button
            className="btn-secondary"
            title="Toggle sort order"
            onClick={toggleSortOrder}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {filters.order === 'asc' ? (
              <><i className="bx bx-sort-up"></i> Ascending</>
            ) : (
              <><i className="bx bx-sort-down"></i> Descending</>
            )}
          </button>
        </div>

        {/* Add Task Trigger button */}
        <button className="btn-primary btn-add-task" onClick={openCreateModal}>
          <i className="bx bx-plus" style={{ fontSize: '1.2rem' }}></i> Add Task
        </button>
      </div>

      {error && (
        <div className="error-message">
          <i className="bx bx-error-circle" style={{ fontSize: '1.1rem' }}></i> {error}
        </div>
      )}

      {/* Grid of Tasks */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>Loading dashboard tasks...</h3>
        </div>
      ) : (
        <TaskList
          tasks={tasks}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onStatusToggle={handleStatusToggle}
        />
      )}

      {/* Task Creation Modal */}
      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onSave={handleCreateOrUpdate}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
