import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { feedbackAPI } from '../services/api';

const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feedbackAPI.submitFeedback(rating, comment);
      setSuccess(true);
      setComment('');
      setRating(5);
      setTimeout(() => {
        setShowFeedbackModal(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogoutClick = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      logout();
    }
  };

  return (
    <>
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Mobile close toggle button */}
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
          <i className="bx bx-x"></i>
        </button>

        <div className="sidebar-brand">
          <div className="logo-sidebar-icon">
            <i className="bx bx-check-double"></i>
          </div>
          <span className="logo-text">TaskFlow</span>
        </div>

        {user && (
          <div 
            className="sidebar-profile-widget" 
            onClick={() => setActiveTab('profile')} 
            style={{ cursor: 'pointer' }}
            title="View Profile Settings"
          >
            {user.profilePhoto ? (
              <img 
                src={user.profilePhoto} 
                alt="" 
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
              />
            ) : (
              <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', background: 'var(--bg-input)' }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="sidebar-profile-details">
              <span className="sidebar-profile-username">{user.username}</span>
              <span className="sidebar-profile-email">{user.email}</span>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          <button
            className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <i className="bx bx-home"></i> <span>Home</span>
          </button>

          <button
            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="bx bx-user"></i> <span>Profile</span>
          </button>


          {user && user.role === 'admin' && (
            <button
              className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
              style={{ borderLeft: '3px solid var(--accent-secondary)' }}
            >
              <i className="bx bx-shield-quarter"></i> <span>Admin Panel</span>
            </button>
          )}

          {/* Log Out button in Sidebar nav list */}
          <button
            className="nav-link logout-nav-link"
            onClick={handleLogoutClick}
            style={{ 
              marginTop: 'auto', 
              color: '#ef4444',
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.1)'
            }}
          >
            <i className="bx bx-log-out"></i> <span>Log Out</span>
          </button>
        </nav>

        <div className="sidebar-footer" style={{ marginTop: '1.5rem' }}>
          <button
            className="btn-feedback"
            onClick={() => setShowFeedbackModal(true)}
          >
            <i className="bx bx-heart"></i> Give Feedback
          </button>
        </div>
      </aside>

      {showFeedbackModal && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowFeedbackModal(false)}>
              <i className="bx bx-x"></i>
            </button>
            <div className="modal-header">
              <h3>Submit Feedback</h3>
            </div>

            {success ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <i className="bx bx-check-circle" style={{ fontSize: '3rem', color: 'var(--status-completed)', marginBottom: '1rem', display: 'block' }}></i>
                <h4>Thank you for your feedback!</h4>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="auth-form">
                <div className="form-group">
                  <label>Rating (1 to 5 Stars)</label>
                  <div className="rating-stars" style={{ display: 'flex', gap: '0.5rem', fontSize: '1.8rem', cursor: 'pointer', margin: '0.5rem 0' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setRating(star)}
                        style={{ color: star <= rating ? '#fbbf24' : 'var(--text-muted)' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="feedback-comment">Comments</label>
                  <textarea
                    id="feedback-comment"
                    className="form-control"
                    placeholder="Tell us what you think of TaskFlow..."
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowFeedbackModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
