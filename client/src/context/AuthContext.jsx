import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiRequest, setLocalToken, getLocalToken } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on startup if token exists
  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = getLocalToken();
      if (token) {
        try {
          const data = await apiRequest('/auth/me');
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            setLocalToken('');
          }
        } catch (error) {
          console.log('Failed to restore session via local token. Attempting refresh.');
          // Attempt refresh if local token expired
          try {
            const refreshData = await apiRequest('/auth/refresh', { method: 'POST' });
            if (refreshData.success) {
              setLocalToken(refreshData.accessToken);
              const data = await apiRequest('/auth/me');
              if (data.user) {
                setUser(data.user);
              }
            } else {
              setLocalToken('');
            }
          } catch (e) {
            setLocalToken('');
          }
        }
      }
      setLoading(false);
    };
    bootstrapAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      if (data.success) {
        setLocalToken(data.accessToken);
        setUser(data.user);
      }
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, message: error.message };
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });
      if (data.success) {
        setLocalToken(data.accessToken);
        setUser(data.user);
      }
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLocalToken('');
      setUser(null);
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const data = await apiRequest('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to update user profile in context:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
