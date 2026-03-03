import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        // Refresh profile if employeeId is missing or stale
        if (!userData.employeeId) {
          axiosInstance
            .get(API_ENDPOINTS.AUTH.ME)
            .then((profileResponse) => {
              const profile = profileResponse.data;
              const role = resolveRole(profile.roles);
              const refreshed = {
                username: profile.username,
                email: profile.username,
                role,
                roles: profile.roles,
                employeeId: profile.employeeId,
                department: profile.department || profile.departmentName || profile?.employee?.department,
              };
              localStorage.setItem('user', JSON.stringify(refreshed));
              setUser(refreshed);
              setIsAuthenticated(true);
            })
            .catch(() => {
              // If refresh fails, force logout
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setIsAuthenticated(false);
            })
            .finally(() => setLoading(false));
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (emailOrUsername, password) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
        username: emailOrUsername,
        password,
      });

      const { token } = response.data;
      if (!token) {
        return { success: false, error: 'Invalid login response.' };
      }

      localStorage.setItem('token', token);

      const profileResponse = await axiosInstance.get(API_ENDPOINTS.AUTH.ME);
      const profile = profileResponse.data;

      const role = resolveRole(profile.roles);
      const userData = {
        username: profile.username,
        email: profile.username,
        role,
        roles: profile.roles,
        employeeId: profile.employeeId,
        department: profile.department || profile.departmentName || profile?.employee?.department,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Login failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const loginWithToken = async (token) => {
    if (!token) {
      return { success: false, error: 'Missing token.' };
    }
    try {
      localStorage.setItem('token', token);
      const profileResponse = await axiosInstance.get(API_ENDPOINTS.AUTH.ME);
      const profile = profileResponse.data;

      const role = resolveRole(profile.roles);
      const userData = {
        username: profile.username,
        email: profile.username,
        role,
        roles: profile.roles,
        employeeId: profile.employeeId,
        department: profile.department || profile.departmentName || profile?.employee?.department,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: 'OAuth login failed. Please try again.' };
    }
  };

  const resolveRole = (roles) => {
    if (!roles || !Array.isArray(roles)) return 'EMPLOYEE';
    const r = roles.map((s) => (typeof s === 'string' ? s : s?.name || ''));
    if (r.some((name) => name === 'ROLE_ADMIN')) return 'ADMIN';
    if (r.some((name) => name?.startsWith('ROLE_HR'))) return 'HR';
    return 'EMPLOYEE';
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    loginWithToken,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
