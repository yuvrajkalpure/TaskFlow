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

  // Mobile filters modal state
  const [showFilterModal, setShowFilterModal] = useState(false);

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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (filters.search && filters.search.trim()) count++;
    return count;
  };

  const clearFilters = () => {
    setFilters(prev => ({
      ...prev,
      status: '',
      priority: '',
      search: ''
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
      setError(err.message || 'Failed to save task');
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this task?');
    if (!confirmDelete) return;

    try {
      setError('');
      await taskAPI.deleteTask(id);
      fetchTasks();
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const handleStatusToggle = async (id, updatedFields) => {
    try {
      setError('');
      await taskAPI.updateTask(id, updatedFields);
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
    <div className="dashboard animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Stats Deck */}
      <TaskStats tasks={tasks} />

      {/* Header controls bar */}
      <div className="controls-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        
        {/* Search & Mobile Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', flex: '1 1 250px', minWidth: 0 }}>
          <div className="search-wrapper" style={{ position: 'relative', flex: 1 }}>
            <i className="bx bx-search search-icon" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
            <input
              type="text"
              name="search"
              placeholder="Search tasks..."
              className="form-control search-input"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <button
            type="button"
            className="btn-secondary mobile-filter-btn"
            onClick={() => setShowFilterModal(true)}
            title="Filter & Sort"
            style={{ display: 'none', padding: '0.75rem', alignItems: 'center', justifyContent: 'center' }}
          >
            <i className="bx bx-filter-alt" style={{ fontSize: '1.2rem' }}></i>
          </button>
        </div>

        {/* Active Filters Badge */}
        {getActiveFiltersCount() > 0 && (
          <span className="filter-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.8rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', color: 'var(--accent-primary)', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '600' }}>
            <i className="bx bx-filter-alt"></i> {getActiveFiltersCount()} Applied
            <button 
              type="button" 
              className="clear-filter-btn" 
              onClick={clearFilters}
              title="Clear all filters"
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '1.1rem', padding: '0 0 0 0.2rem', display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}
            >
              &times;
            </button>
          </span>
        )}

        {/* Desktop-only Inline Filters */}
        <div className="filters-group desktop-filters" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          
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

        <button className="btn-primary btn-add-task" onClick={openCreateModal} style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
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

      {/* Task Form Modal */}
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

      {/* Mobile-only Filter Modal Popup */}
      {showFilterModal && (
        <div className="crop-modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="crop-modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '400px', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
            <button className="modal-close" onClick={() => setShowFilterModal(false)} aria-label="Close modal">
              <i className="bx bx-x"></i>
            </button>
            <div className="modal-header" style={{ width: '100%', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Filters & Sorting</h3>
            </div>

            <div className="auth-form" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 6 }}>Filter by Status</label>
                <select
                  name="status"
                  className="select-control"
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg-input)' }}
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 6 }}>Filter by Priority</label>
                <select
                  name="priority"
                  className="select-control"
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg-input)' }}
                  value={filters.priority}
                  onChange={handleFilterChange}
                >
                  <option value="">All Priorities</option>
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 6 }}>Sort By</label>
                <select
                  name="sortBy"
                  className="select-control"
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg-input)' }}
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                >
                  <option value="dueDate">Sort by Due Date</option>
                  <option value="createdAt">Sort by Creation Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="priority">Sort by Priority</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 6 }}>Sort Direction</label>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={toggleSortOrder}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', width: '100%', padding: '0.8rem' }}
                >
                  {filters.order === 'asc' ? (
                    <><i className="bx bx-sort-up"></i> Ascending</>
                  ) : (
                    <><i className="bx bx-sort-down"></i> Descending</>
                  )}
                </button>
              </div>

              <div className="modal-footer" style={{ width: '100%', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn-primary" style={{ width: '100%', padding: '0.8rem' }} onClick={() => setShowFilterModal(false)}>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
