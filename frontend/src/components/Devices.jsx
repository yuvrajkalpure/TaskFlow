import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { userAPI } from '../services/api';

const Devices = () => {
  const { logout } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userAPI.getSessions();
      setSessions(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevoke = async (sessionId, isCurrent) => {
    const confirmRevoke = window.confirm(
      isCurrent 
        ? 'Are you sure you want to terminate this current login session? You will be logged out immediately.'
        : 'Are you sure you want to log out this other device session?'
    );

    if (confirmRevoke) {
      try {
        await userAPI.revokeSession(sessionId);
        if (isCurrent) {
          logout();
        } else {
          fetchSessions();
        }
      } catch (err) {
        alert(err.message || 'Failed to revoke session');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="auth-card animate-fade-in" style={{ maxWidth: '100%', padding: '2rem' }}>
      <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
        <i className="bx bx-devices"></i> Active Sessions
      </h3>

      {error && (
        <div className="error-message" style={{ marginBottom: '1.5rem' }}>
          <i className="bx bx-error-circle"></i> {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading active sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <p>No active sessions found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Review and manage all devices where you are currently logged in to your TaskFlow account.
          </p>

          {sessions.map(session => (
            <div 
              key={session._id} 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '1.2rem',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                border: session.isCurrent ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                boxShadow: session.isCurrent ? '0 0 10px var(--glow-color)' : 'none'
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem', color: session.isCurrent ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                  <i className={session.deviceInfo.includes('on Windows') || session.deviceInfo.includes('on macOS') || session.deviceInfo.includes('on Linux') ? 'bx bx-laptop' : 'bx bx-mobile-alt'}></i>
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.15rem', display: 'flex', alignItems: 'center' }}>
                    {session.deviceInfo} 
                    {session.isCurrent && (
                      <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.2)', marginLeft: '0.5rem', textTransform: 'capitalize', padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
                        This Device
                      </span>
                    )}
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span>IP: {session.ipAddress}</span>
                    <span>•</span>
                    <span>Last Active: {formatDate(session.lastActive)}</span>
                  </p>
                </div>
              </div>

              <div>
                <button
                  className="btn-secondary"
                  onClick={() => handleRevoke(session._id, session.isCurrent)}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem',
                    background: session.isCurrent ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-secondary)',
                    color: session.isCurrent ? '#ef4444' : 'var(--text-primary)',
                    borderColor: session.isCurrent ? 'rgba(239, 68, 68, 0.15)' : 'var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <i className="bx bx-log-out-circle"></i> Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Devices;
