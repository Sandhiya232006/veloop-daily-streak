import React, { createContext, useContext, useState, useCallback } from 'react';
import * as authApi from '../services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('veloop_token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('veloop_user');
    return stored ? JSON.parse(stored) : null;
  });

  const persistSession = useCallback((newToken, newUser) => {
    localStorage.setItem('veloop_token', newToken);
    localStorage.setItem('veloop_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await authApi.login(credentials);
      persistSession(data.token, data.user);
      return data;
    },
    [persistSession]
  );

  const register = useCallback(
    async (details) => {
      const data = await authApi.register(details);
      persistSession(data.token, data.user);
      return data;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('veloop_token');
    localStorage.removeItem('veloop_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
