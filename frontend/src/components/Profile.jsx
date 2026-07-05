import React, { useContext, useState, useRef, useEffect } from 'react';
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

  // Camera integration states
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Lightbox modal state
  const [showLightbox, setShowLightbox] = useState(false);

  // Cropping image states
  const [tempImage, setTempImage] = useState(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);

  // Gesture event states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startTouchDist, setStartTouchDist] = useState(0);
  const [startZoom, setStartZoom] = useState(1);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setUseCamera(true);
    setPassError('');
    setPassSuccess('');
    try {
      setTimeout(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 400, height: 300, facingMode: 'user' } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error('Camera access failed:', err.message);
      alert('Failed to access camera. Please check camera permissions.');
      setUseCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setUseCamera(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 400;
      canvas.height = videoRef.current.videoHeight || 300;
      
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      const base64Photo = canvas.toDataURL('image/jpeg', 0.85);
      stopCamera();
      
      // Send to cropper
      setTempImage(base64Photo);
      setCropZoom(1.2);
      setCropOffsetX(0);
      setCropOffsetY(0);
    } catch (err) {
      alert(err.message || 'Capture failed');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Photo must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImage(reader.result);
      setCropZoom(1.2);
      setCropOffsetX(0);
      setCropOffsetY(0);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset file input
  };

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

  // Perform cropping and export base64 to DB
  const handleApplyCrop = () => {
    if (!tempImage) return;
    setPhotoLoading(true);
    
    const img = new Image();
    img.src = tempImage;
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 250;
      canvas.height = 250;
      const ctx = canvas.getContext('2d');
      
      // White canvas background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 250, 250);
      
      const w = img.width;
      const h = img.height;
      
      const minSide = Math.min(w, h);
      const baseScale = 250 / minSide;
      const finalScale = baseScale * cropZoom;
      const drawWidth = w * finalScale;
      const drawHeight = h * finalScale;
      
      // Calculate drawing coordinates with offset positions
      const drawX = (250 - drawWidth) / 2 + cropOffsetX;
      const drawY = (250 - drawHeight) / 2 + cropOffsetY;
      
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      
      try {
        const croppedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        await updateProfilePhoto(croppedBase64);
        setTempImage(null);
        alert('Profile photo updated successfully!');
      } catch (err) {
        alert(err.message || 'Failed to crop photo');
      } finally {
        setPhotoLoading(false);
      }
    };
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

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropOffsetX, y: e.clientY - cropOffsetY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setCropOffsetX(e.clientX - dragStart.x);
    setCropOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Wheel zoom handler (for desktop)
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    const nextZoom = e.deltaY < 0 ? cropZoom + zoomFactor : cropZoom - zoomFactor;
    setCropZoom(Math.min(Math.max(nextZoom, 1), 4));
  };

  // Touch gesture handlers (for mobile)
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setStartTouchDist(dist);
      setStartZoom(cropZoom);
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - cropOffsetX, y: touch.clientY - cropOffsetY });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && startTouchDist > 0) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / startTouchDist;
      setCropZoom(Math.min(Math.max(startZoom * factor, 1), 4));
    } else if (e.touches.length === 1 && isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      setCropOffsetX(touch.clientX - dragStart.x);
      setCropOffsetY(touch.clientY - dragStart.y);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setStartTouchDist(0);
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
          
          {/* Avatar Edit Controls */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <label htmlFor="photo-upload" className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <i className="bx bx-upload"></i> Browse
            </label>
            <input 
              type="file" 
              id="photo-upload" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
              style={{ display: 'none' }}
              disabled={photoLoading}
            />

            <button 
              className="btn-secondary" 
              onClick={useCamera ? stopCamera : startCamera}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              disabled={photoLoading}
            >
              <i className="bx bx-camera"></i> {useCamera ? 'Close Camera' : 'Camera'}
            </button>

            {user && user.profilePhoto && (
              <button 
                className="btn-secondary" 
                onClick={handleRemovePhoto}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                disabled={photoLoading}
              >
                <i className="bx bx-trash"></i> Remove
              </button>
            )}
          </div>
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

      {/* Video Webcam Capture Interface */}
      {useCamera && (
        <div className="camera-preview-container">
          <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Webcam Capture</h4>
          <video ref={videoRef} autoPlay playsInline className="camera-video"></video>
          <div className="camera-actions-row">
            <button className="btn-secondary" onClick={stopCamera}>
              Cancel
            </button>
            <button className="btn-primary" onClick={capturePhoto} disabled={photoLoading}>
              Capture Snapshot
            </button>
          </div>
        </div>
      )}

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

      {/* Interactive Gesture-Driven Image Cropper Modal */}
      {tempImage && (
        <div className="crop-modal-overlay">
          <div className="crop-modal-content">
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Crop & Position Photo</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', marginTop: '0.5rem', lineHeight: '1.4' }}>
              <strong>Mobile:</strong> Use one finger to drag and position, or pinch with two fingers to zoom.<br/>
              <strong>Desktop:</strong> Left-click and drag to move, or use the mouse scroll wheel to zoom.
            </p>

            <div 
              className="crop-preview-circle"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
            >
              <img 
                src={tempImage} 
                alt="Crop preview" 
                className="crop-preview-image"
                style={{
                  transform: `translate(calc(-50% + ${cropOffsetX}px), calc(-50% + ${cropOffsetY}px)) scale(${cropZoom})`,
                  pointerEvents: 'none' // Let container capture gestures
                }}
              />
            </div>

            <div className="modal-footer" style={{ width: '100%', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setTempImage(null)}
                disabled={photoLoading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleApplyCrop}
                disabled={photoLoading}
              >
                {photoLoading ? 'Cropping...' : 'Apply & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
