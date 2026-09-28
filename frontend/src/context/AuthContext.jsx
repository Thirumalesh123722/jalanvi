import React, { createContext, useContext, useState, useEffect } from 'react';
import MarineApi from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('marine_ai_token') : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: 'login', // 'login' | 'register' | 'forgot' | 'profile'
    targetScreen: null,
    message: null,
  });

  // Verify authenticated session on app initialization
  useEffect(() => {
    let isMounted = true;

    async function checkAuthSession() {
      const storedToken = localStorage.getItem('marine_ai_token');
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await MarineApi.getMe();
        if (isMounted) {
          if (res && res.user) {
            setUser(res.user);
          } else {
            // Invalid session
            localStorage.removeItem('marine_ai_token');
            setUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        console.warn('Session verification failed, resetting token:', err);
        if (isMounted) {
          localStorage.removeItem('marine_ai_token');
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkAuthSession();
    return () => { isMounted = false; };
  }, []);

  const login = async (email, password) => {
    const res = await MarineApi.login({ email, password });
    if (res && res.token && res.user) {
      localStorage.setItem('marine_ai_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res?.detail || 'Authentication failed');
  };

  const register = async (formData) => {
    const res = await MarineApi.register(formData);
    if (res && res.token && res.user) {
      localStorage.setItem('marine_ai_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res?.detail || 'Registration failed');
  };

  const logout = async () => {
    try {
      await MarineApi.logout();
    } finally {
      localStorage.removeItem('marine_ai_token');
      setToken(null);
      setUser(null);
      setAuthModal({ isOpen: false, mode: 'login', targetScreen: null, message: null });
    }
  };

  const updateProfile = async (profileData) => {
    const res = await MarineApi.updateProfile(profileData);
    if (res && res.user) {
      setUser(res.user);
      return res;
    }
    throw new Error(res?.detail || 'Profile update failed');
  };

  const openLogin = (targetScreen = null, message = null) => {
    setAuthModal({
      isOpen: true,
      mode: 'login',
      targetScreen,
      message,
    });
  };

  const openRegister = (targetScreen = null) => {
    setAuthModal({
      isOpen: true,
      mode: 'register',
      targetScreen,
      message: null,
    });
  };

  const openProfile = () => {
    setAuthModal({
      isOpen: true,
      mode: 'profile',
      targetScreen: null,
      message: null,
    });
  };

  const openForgotPassword = () => {
    setAuthModal(prev => ({
      ...prev,
      isOpen: true,
      mode: 'forgot',
    }));
  };

  const openAuthorityAuth = (targetScreen = 'screen-authority') => {
    setAuthModal({
      isOpen: true,
      mode: 'authority',
      targetScreen,
      message: 'Maritime Authority Command Portal (Coast Guard, INCOIS, SDMA)',
    });
  };

  const closeAuthModal = () => {
    setAuthModal(prev => ({ ...prev, isOpen: false }));
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    authModal,
    openLogin,
    openRegister,
    openAuthorityAuth,
    openProfile,
    openForgotPassword,
    closeAuthModal,
    setAuthModal,
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

export default AuthContext;
