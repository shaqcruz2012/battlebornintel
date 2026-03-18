import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';

const TOKEN_KEY = 'bbi_token';
const AuthContext = createContext(null);

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  // Add 10s buffer
  return decoded.exp * 1000 < Date.now() + 10000;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && !isTokenExpired(token)) {
      return decodeJWT(token);
    }
    // Clean up expired token
    if (token) localStorage.removeItem(TOKEN_KEY);
    return null;
  });

  // Check token expiry periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && isTokenExpired(token)) {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      }
    }, 60000); // check every minute
    return () => clearInterval(interval);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || 'Login failed');

    localStorage.setItem(TOKEN_KEY, body.data.token);
    setUser(decodeJWT(body.data.token));
    return body.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    login,
    logout,
    isAuthenticated: !!user,
    token: localStorage.getItem(TOKEN_KEY),
  }), [user, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
