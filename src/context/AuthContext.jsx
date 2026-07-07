import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nitr_marks_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const profile = await api.login(email, password);
      setUser(profile);
      localStorage.setItem('nitr_marks_current_user', JSON.stringify(profile));
      return profile;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nitr_marks_current_user');
  };

  const updateProfile = async (name, email, department) => {
    if (!user) return;
    setLoading(true);
    try {
      const updated = await api.updateProfile(user.id, name, email, department);
      setUser(updated);
      localStorage.setItem('nitr_marks_current_user', JSON.stringify(updated));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => user?.role === 'Admin';
  const isCoordinator = () => user?.role === 'Course Coordinator';
  const isSubCoordinator = () => user?.role === 'Sub-Coordinator';

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    isAdmin,
    isCoordinator,
    isSubCoordinator,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
