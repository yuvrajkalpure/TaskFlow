import React, { createContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user session
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Apply user theme stored in localStorage initially
        const savedTheme = parsedUser.theme || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem('token', data.token);
      
      const userProfile = {
        _id: data._id,
        username: data.username,
        email: data.email,
        role: data.role,
        theme: data.theme,
        profilePhoto: data.profilePhoto,
        createdAt: data.createdAt
      };
      
      localStorage.setItem('user', JSON.stringify(userProfile));
      setUser(userProfile);
      
      // Apply theme preference from database
      document.documentElement.setAttribute('data-theme', data.theme || 'dark');
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const data = await authAPI.register(username, email, password);
      localStorage.setItem('token', data.token);
      
      const userProfile = {
        _id: data._id,
        username: data.username,
        email: data.email,
        role: data.role,
        theme: data.theme,
        profilePhoto: data.profilePhoto,
        createdAt: data.createdAt
      };
      
      localStorage.setItem('user', JSON.stringify(userProfile));
      setUser(userProfile);
      
      document.documentElement.setAttribute('data-theme', data.theme || 'dark');
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateProfilePhoto = async (base64Photo) => {
    const data = await userAPI.updateProfilePhoto(base64Photo);
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, profilePhoto: data ? data.profilePhoto : null };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const updateTheme = async (newTheme) => {
    const data = await userAPI.updateTheme(newTheme);
    document.documentElement.setAttribute('data-theme', data.theme);
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, theme: data.theme };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint to revoke session token from active list
      await authAPI.logout();
    } catch (e) {
      console.warn('Backend logout session revocation failed:', e.message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfilePhoto, updateTheme, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
