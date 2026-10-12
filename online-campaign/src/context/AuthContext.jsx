import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loginUser, registerUser, loginWithGoogle, updateAccountProfile } from '../utils/storage';

const AuthContext = createContext(null);
const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const readToken = () => localStorage.getItem('campaign_token') || sessionStorage.getItem('campaign_token');
const readStoredUser = () => {
  try {
    const store = localStorage.getItem('campaign_token') ? localStorage : sessionStorage;
    const savedUser = JSON.parse(store.getItem('campaign_user') || 'null');
    return savedUser?.id ? savedUser : null;
  } catch {
    return null;
  }
};
const persistUser = (user) => {
  try {
    const store = localStorage.getItem('campaign_token') ? localStorage : sessionStorage;
    store.setItem('campaign_user', JSON.stringify(user));
  } catch {
    // Keep the in-memory session working if browser storage is unavailable.
  }
};
const clearStoredAuth = () => {
  localStorage.removeItem('campaign_token');
  localStorage.removeItem('campaign_user');
  sessionStorage.removeItem('campaign_token');
  sessionStorage.removeItem('campaign_user');
};
const storeAuth = (token, user, remember = true) => {
  clearStoredAuth();
  const store = remember ? localStorage : sessionStorage;
  store.setItem('campaign_token', token);
  store.setItem('campaign_user', JSON.stringify(user));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = readToken();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const nextUser = { id: data._id, name: data.username, email: data.email, authProvider: data.authProvider || 'local', isAdmin: data.role === 'admin' };
          persistUser(nextUser);
          setUser(nextUser);
        } else if (res.status === 401) {
          clearStoredAuth();
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const register = async ({ name, email, password }) => {
    try {
      const data = await registerUser({ name, email, password });
      const nextUser = { id: data._id, name: data.username, email: data.email, authProvider: data.authProvider || 'local', isAdmin: data.role === 'admin' };
      storeAuth(data.token, nextUser);
      setUser(nextUser);
      return { user: nextUser };
    } catch (error) {
      return { error: error.message };
    }
  };

  const login = async ({ email, identifier, password, rememberMe = true }) => {
    try {
      const data = await loginUser({ identifier: identifier || email, password });
      const nextUser = { id: data._id, name: data.username, email: data.email, authProvider: data.authProvider || 'local', isAdmin: data.role === 'admin' };
      storeAuth(data.token, nextUser, rememberMe);
      setUser(nextUser);
      return { user: nextUser };
    } catch (error) {
      return { error: error.message };
    }
  };

  const googleLogin = async (credential) => {
    try {
      const data = await loginWithGoogle(credential);
      const nextUser = { id: data._id, name: data.username, email: data.email, authProvider: data.authProvider || 'google', isAdmin: data.role === 'admin' };
      storeAuth(data.token, nextUser);
      setUser(nextUser);
      return { user: nextUser };
    } catch (error) {
      const message = error instanceof TypeError
        ? `Could not reach the sign-in server at ${API_URL}. Start the backend and try again.`
        : error.message;
      return { error: message };
    }
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
  };

  const updateName = useCallback(async (name) => {
    const data = await updateAccountProfile(name);
    const updatedUser = { ...user, name: data.username, email: data.email || user?.email, authProvider: data.authProvider || user?.authProvider };
    persistUser(updatedUser);
    setUser(updatedUser);
    return updatedUser;
  }, [user]);

  const value = useMemo(() => ({ user, register, login, googleLogin, logout, updateName, isLoading }), [user, isLoading, updateName]);
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
