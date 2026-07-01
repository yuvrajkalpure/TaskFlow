import React, { useContext, useState, useEffect } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard';
import './App.css';

const AppContent = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const [view, setView] = useState('login');
  const [theme, setTheme] = useState('dark');

  // Toggle Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Sync view with auth state
  useEffect(() => {
    if (user) {
      setView('dashboard');
    } else {
      if (view === 'dashboard') {
        setView('login');
      }
    }
  }, [user, view]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <h2>Loading Task Tracker...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header Bar */}
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon"><i className="bx bx-check-double"></i></div>
          <span className="logo-text">TaskFlow</span>
        </div>

        <div className="nav-actions">
          {/* Light/Dark Toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <i className="bx bx-sun"></i> : <i className="bx bx-moon"></i>}
          </button>

          {user && (
            <div className="user-info">
              <div className="avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-details" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="username" style={{ fontWeight: '700', lineHeight: '1.2' }}>{user.username}</span>
                <span className="user-email" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</span>
              </div>
              <button className="btn-secondary logout-btn" onClick={logout}>
                <i className="bx bx-log-out" style={{ marginRight: '0.4rem', verticalAlign: 'middle' }}></i>Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main>
        {user ? (
          <Dashboard />
        ) : view === 'register' ? (
          <Register setView={setView} />
        ) : (
          <Login setView={setView} />
        )}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
