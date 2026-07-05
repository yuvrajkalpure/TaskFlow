import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { userAPI } from '../services/api';

const Profile = () => {
  const { user, updateProfilePhoto, logout } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  // Lightbox modal state
  const [showLightbox, setShowLightbox] = useState(false);

  const handleRemovePhoto = async () => {
    const confirmRemove = window.confirm("Are you sure you want to remove your profile photo?");
    if (!confirmRemove) return;

    setPhotoLoading(true);
    try {
      await updateProfilePhoto(null);
      alert('Profile photo removed successfully');
    } catch (err) {
      alert(err.message || 'Failed to remove profile photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassError('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }

    setPassLoading(true);
    try {
      await userAPI.resetPassword(oldPassword, newPassword);
      setPassSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err.message || 'Failed to update password');
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeactivate = async () => {
    const confirmDeactivate = window.confirm(
      'WARNING: Are you sure you want to delete your account?\n\nThis will log you out of all devices and restrict access. You will need to contact support to reactivate.'
    );
    if (confirmDeactivate) {
      try {
        await userAPI.deactivateAccount();
        alert('Your account has been deleted. Logging out...');
        logout();
      } catch (err) {
        alert(err.message || 'Deletion failed');
      }
    }
  };

  const formatCreationDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="profile-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Profile Info Header */}
      <div className="auth-card" style={{ maxWidth: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', padding: '2rem' }}>
        
        {/* Profile Avatar Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div 
            style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
            onClick={() => { if (user?.profilePhoto) setShowLightbox(true); }}
            title={user?.profilePhoto ? "View large photo" : ""}
          >
            {user && user.profilePhoto ? (
              <img 
                src={user.profilePhoto} 
                alt="Avatar" 
                style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)', transition: 'transform 0.2s' }}
                className="hover-scale"
              />
            ) : (
              <div className="avatar" style={{ width: '90px', height: '90px', fontSize: '2.5rem', borderRadius: '50%', background: 'var(--bg-input)', border: '2px solid var(--border-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '700' }}>
                {user ? user.username.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>
          
          {/* Avatar Edit Controls (Browse and Camera removed, only Remove exists if photo present) */}
          {user && user.profilePhoto && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button 
                className="btn-secondary" 
                onClick={handleRemovePhoto}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                disabled={photoLoading}
              >
                <i className="bx bx-trash"></i> Remove Photo
              </button>
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <h2 style={{ fontSize: '1.8rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.25rem' }}>
            {user ? user.username : 'User Profile'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{user ? user.email : ''}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <i className="bx bx-calendar-event" style={{ fontSize: '1.1rem' }}></i> Account Created: {formatCreationDate(user ? user.createdAt : null)}
          </p>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="auth-card" style={{ maxWidth: '100%', padding: '2rem' }}>
        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          <i className="bx bx-key"></i> Reset Password
        </h3>

        {passError && (
          <div className="error-message" style={{ marginBottom: '1rem' }}>
            <i className="bx bx-error-circle"></i> {passError}
          </div>
        )}

        {passSuccess && (
          <div className="error-message" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--status-completed)', marginBottom: '1rem' }}>
            <i className="bx bx-check-circle"></i> {passSuccess}
          </div>
        )}

        <form onSubmit={handlePasswordReset} className="auth-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div className="form-group">
            <label htmlFor="old-pass">Current Password</label>
            <input
              type="password"
              id="old-pass"
              className="form-control"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-new-pass">New Password</label>
            <input
              type="password"
              id="profile-new-pass"
              className="form-control"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-confirm-pass">Confirm New Password</label>
            <input
              type="password"
              id="profile-confirm-pass"
              className="form-control"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 2rem' }} disabled={passLoading}>
              {passLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone (hidden for administrators) */}
      {user && user.role !== 'admin' && (
        <div className="auth-card" style={{ maxWidth: '100%', padding: '2rem', borderColor: 'rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.02)' }}>
          <h3 style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.15)', paddingBottom: '0.75rem', marginBottom: '1rem', color: 'var(--priority-high)' }}>
            <i className="bx bx-shield-x"></i> Danger Zone
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Deleting your account will immediately revoke all active device sessions, terminate your current login, and restrict access. Your existing data will be safely preserved, but you will not be able to log back in without contacting an administrator for account reactivation.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={handleDeactivate}
              style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.15)', padding: '0.75rem 1.5rem' }}
            >
              Delete My Account
            </button>
          </div>
        </div>
      )}

      {/* Profile Photo Lightbox Modal */}
      {showLightbox && user?.profilePhoto && (
        <div className="lightbox-overlay" onClick={() => setShowLightbox(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setShowLightbox(false)}>
              <i className="bx bx-x"></i>
            </button>
            <img 
              src={user.profilePhoto} 
              alt="Avatar Fullsize" 
              className="lightbox-image"
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
