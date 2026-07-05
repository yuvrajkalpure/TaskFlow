import React, { useEffect, useState, useCallback } from 'react';
import { userAPI, feedbackAPI } from '../services/api';

const AdminDashboard = () => {
  const [adminTab, setAdminTab] = useState('users'); // 'users' or 'feedback'
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Image lightbox preview state
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  
  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (adminTab === 'users') {
        const data = await userAPI.adminGetUsers();
        setUsers(data);
      } else {
        const data = await feedbackAPI.getFeedbackList();
        setFeedbacks(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  }, [adminTab]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return (
      <span style={{ color: '#fbbf24', fontSize: '1.1rem' }}>
        {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
      </span>
    );
  };

  const getAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  return (
    <div className="dashboard animate-fade-in">
      
      {/* Admin Dashboard header / navigation */}
      <div className="controls-bar" style={{ padding: '0.75rem 1.5rem' }}>
        <h3 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
          <i className="bx bx-shield-quarter" style={{ color: 'var(--accent-secondary)', fontSize: '1.4rem' }}></i> Admin Control Center
        </h3>
        
        <div className="filters-group" style={{ margin: 0 }}>
          <button 
            className={`btn-secondary ${adminTab === 'users' ? 'active' : ''}`}
            onClick={() => setAdminTab('users')}
            style={{ borderColor: adminTab === 'users' ? 'var(--accent-primary)' : 'var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <i className="bx bx-group"></i> Manage Users
          </button>
          <button 
            className={`btn-secondary ${adminTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setAdminTab('feedback')}
            style={{ borderColor: adminTab === 'feedback' ? 'var(--accent-primary)' : 'var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <i className="bx bx-chat"></i> User Feedback ({feedbacks.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="bx bx-error-circle"></i> {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Loading administration data...</p>
        </div>
      ) : adminTab === 'users' ? (
        
        /* USERS DIRECTORY */
        <div className="auth-card" style={{ maxWidth: '100%', padding: '2rem', overflow: 'hidden' }}>
          <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Registered Users ({users.length})</h4>
          
          <div className="admin-table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>User Info</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Joined Date</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Total Tasks</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Pending</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>In Progress</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Completed</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.95rem' }}>
                    <td style={{ padding: '1rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div 
                        onClick={() => { if (u.profilePhoto) setLightboxPhoto(u.profilePhoto); }}
                        style={{ cursor: u.profilePhoto ? 'pointer' : 'default' }}
                      >
                        {u.profilePhoto ? (
                          <img 
                            src={u.profilePhoto} 
                            alt="" 
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '700' }}>
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{u.username}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span className="badge" style={{ background: u.role === 'admin' ? 'rgba(217, 70, 239, 0.12)' : 'rgba(255, 255, 255, 0.05)', color: u.role === 'admin' ? 'var(--accent-secondary)' : 'var(--text-primary)' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                      {u.isDeleted ? (
                        <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Deleted</span>
                      ) : (
                        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Active</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center', fontWeight: '700' }}>
                      {u.taskStats?.total || 0}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center', color: 'var(--status-pending)' }}>
                      {u.taskStats?.pending || 0}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center', color: 'var(--accent-primary)' }}>
                      {u.taskStats?.inProgress || 0}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center', color: 'var(--status-completed)', fontWeight: '600' }}>
                      {u.taskStats?.completed || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        
        /* FEEDBACK PANEL */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Feedback score banner */}
          <div className="stats-grid">
            <div className="stat-card total" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="stat-title">Average Rating</div>
                <div className="stat-value">{getAverageRating()} / 5.0</div>
                <div className="stat-desc">Based on user reviews</div>
              </div>
              <div style={{ fontSize: '2.5rem', color: '#fbbf24' }}>★</div>
            </div>
            <div className="stat-card completed" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="stat-title">Total Submissions</div>
                <div className="stat-value">{feedbacks.length}</div>
                <div className="stat-desc">User reviews received</div>
              </div>
              <div style={{ fontSize: '2.5rem', color: 'var(--status-completed)', display: 'flex', alignItems: 'center' }}>
                <i className="bx bx-chat"></i>
              </div>
            </div>
          </div>

          {/* Feedback listing cards */}
          <div className="tasks-grid">
            {feedbacks.length === 0 ? (
              <div className="no-tasks" style={{ gridColumn: '1 / -1' }}>
                <h3>No feedbacks logged</h3>
                <p>User feedback and ratings will display here once submitted.</p>
              </div>
            ) : (
              feedbacks.map(f => (
                <div key={f._id} className="task-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{f.username}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{f.email}</p>
                    </div>
                    <div>{renderStars(f.rating)}</div>
                  </div>
                  
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontStyle: 'italic', wordBreak: 'break-word', minHeight: '40px' }}>
                    "{f.comment}"
                  </p>
                  
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.2rem' }}>
                    <i className="bx bx-calendar"></i> {formatDate(f.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* Lightbox for Admin users avatar click */}
      {lightboxPhoto && (
        <div className="lightbox-overlay" onClick={() => setLightboxPhoto(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxPhoto(null)}>
              <i className="bx bx-x"></i>
            </button>
            <img 
              src={lightboxPhoto} 
              alt="Avatar Fullsize" 
              className="lightbox-image"
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
