"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // { username, role, clientId }
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      const data = await response.json();

      setIsAuthenticated(data.authenticated);
      if (data.authenticated) {
        setUser({
          username: data.username,
          role: data.role,
          clientId: data.clientId,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setUser({
          username: data.username,
          role: data.role,
          clientId: data.clientId || null,
        });
        return { success: true, role: data.role };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, message: 'An error occurred. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      router.push('/login');
    }
  };

  const requireAuth = useCallback(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return false;
    }
    return true;
  }, [loading, isAuthenticated, router]);

  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isSuperAdmin = () => user?.role === 'super_admin';
  const isManager = () => ['super_admin', 'manager'].includes(user?.role);
  const isViewer = () => ['super_admin', 'manager', 'viewer'].includes(user?.role);

  const value = {
    isAuthenticated,
    loading,
    user,
    login,
    logout,
    requireAuth,
    checkAuthStatus,
    hasRole,
    isSuperAdmin,
    isManager,
    isViewer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
