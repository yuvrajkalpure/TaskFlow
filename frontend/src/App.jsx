import React, { useContext, useState, useEffect } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

const AppContent = () => {
  const { user, loading, logout, updateTheme } = useContext(AuthContext);
  const [view, setView] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [backendConnected, setBackendConnected] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Responsive mobile width tracker
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check connectivity with backend
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL.replace('/api', '')}/`);
        if (res.ok) {
          setBackendConnected(true);
        } else {
          setBackendConnected(false);
        }
      } catch (e) {
        setBackendConnected(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Theme configuration on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Sync state if user settings theme changes
  useEffect(() => {
    if (user && user.theme) {
      setTheme(user.theme);
      document.documentElement.setAttribute('data-theme', user.theme);
    }
  }, [user]);

  // Adjust default tab for admin vs regular user
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('home');
      }
      setView('dashboard');
    } else {
      if (view === 'dashboard') {
        setView('login');
      }
    }
  }, [user]);

  // Close sidebar drawer automatically when tab changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [activeTab]);

  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    
    // Save theme to DB if user is logged in
    if (user) {
      try {
        await updateTheme(nextTheme);
      } catch (e) {
        console.warn('Failed to sync theme preference to database:', e.message);
      }
    }
  };

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
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      
      {/* Backend connection failure banner */}
      {!backendConnected && (
        <div className="connection-warning-banner" style={{ background: 'var(--priority-high)', color: 'white', padding: '0.6rem 1rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600', position: 'sticky', top: 0, zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
          <i className="bx bx-wifi-off" style={{ fontSize: '1.2rem' }}></i> Offline Mode: Unable to connect with the TaskFlow backend server.
        </div>
      )}

      {user ? (
        
        /* AUTHENTICATED SYSTEM LAYOUT */
        <div className={`authenticated-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{ display: 'flex', flex: 1 }}>
          {/* Overlay backdrop for mobile slide-in sidebar */}
          {sidebarOpen && (
            <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
          )}

          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
          />
          
          <div className="main-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
             {/* Header / Top Fixed Navbar */}
            <header 
              className="app-header" 
              style={{ 
                padding: '1rem 2rem', 
                display: 'flex', 
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)'
              }}
            >
              
              {/* Sidebar drawer toggle button */}
              <button 
                className="sidebar-toggle" 
                onClick={() => {
                  if (isMobile) {
                    setSidebarOpen(!sidebarOpen);
                  } else {
                    setSidebarCollapsed(!sidebarCollapsed);
                  }
                }}
                title="Toggle Menu"
                style={{ marginRight: '1rem' }}
              >
                <i className={(isMobile ? sidebarOpen : !sidebarCollapsed) ? "bx bx-x" : "bx bx-menu"}></i>
              </button>

              <div 
                className="header-brand-mobile" 
                onClick={() => setActiveTab('home')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                title="Go to Home"
              >
                <i className="bx bx-check-double" style={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }}></i>
                <span style={{ fontWeight: '800', fontFamily: 'var(--font-heading)' }}>TaskFlow</span>
              </div>

              <div className="nav-actions" style={{ marginLeft: 'auto' }}>
                {/* Theme Toggle */}
                <button
                  className="theme-toggle"
                  onClick={toggleTheme}
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? <i className="bx bx-sun"></i> : <i className="bx bx-moon"></i>}
                </button>

                {/* Clickable Profile Widget (Email sits below username) */}
                <div 
                  className="user-info" 
                  onClick={() => setActiveTab('profile')} 
                  style={{ cursor: 'pointer' }}
                  title="View Profile Settings"
                >
                  {user.profilePhoto ? (
                    <img 
                      src={user.profilePhoto} 
                      alt="" 
                      style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                    />
                  ) : (
                    <div className="avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="user-details" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span className="username" style={{ fontWeight: '700', lineHeight: '1.2' }}>{user.username}</span>
                    <span className="user-email" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</span>
                  </div>
                </div>
              </div>
            </header>

            {/* View Switching */}
            <div className="app-container" style={{ flex: '1 0 auto', padding: '2rem' }}>
              {activeTab === 'home' && <Dashboard />}
              {activeTab === 'profile' && <Profile />}
              {activeTab === 'admin' && user.role === 'admin' && <AdminDashboard />}
            </div>

            {/* Footer */}
            <footer className="app-footer" style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <div>© 2026 TaskFlow. All rights reserved.</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <i className="bx bxl-github" style={{ fontSize: '1.1rem' }}></i>
                <a href="https://github.com/yuvrajkalpure/TaskFlow" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                  github.com/yuvrajkalpure/TaskFlow
                </a>
              </div>
            </footer>
          </div>
        </div>

      ) : (
        
        /* UNAUTHENTICATED SYSTEM LAYOUT */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <header className="app-header" style={{ padding: '1.5rem 2rem' }}>
            <div className="logo">
              <div className="logo-icon"><i className="bx bx-check-double"></i></div>
              <span className="logo-text">TaskFlow</span>
            </div>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? <i className="bx bx-sun"></i> : <i className="bx bx-moon"></i>}
            </button>
          </header>

          <main style={{ flex: 1 }}>
            {view === 'register' ? (
              <Register setView={setView} setAuthEmail={setAuthEmail} />
            ) : (
              <Login setView={setView} />
            )}
          </main>

          <footer className="app-footer" style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <div>© 2026 TaskFlow. All rights reserved.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <i className="bx bxl-github" style={{ fontSize: '1.1rem' }}></i>
              <a href="https://github.com/yuvrajkalpure/TaskFlow" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                github.com/yuvrajkalpure/TaskFlow
              </a>
            </div>
          </footer>
        </div>
      )}
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
