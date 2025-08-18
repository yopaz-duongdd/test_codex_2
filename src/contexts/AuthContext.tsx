import React, { createContext, useContext, useState, useEffect } from 'react';
import { TestAutomationAPI } from '../utils/api';

interface AuthContextType {
  isAuthenticated: boolean;
  apiKey: string;
  login: (key: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('test-automation-auth-key');
    if (savedKey) {
      const validation = TestAutomationAPI.validateApiKey(savedKey);
      if (validation.isValid) {
        setIsAuthenticated(true);
        setApiKey(savedKey);
      }
    }
  }, []);

  const login = (key: string): boolean => {
    const validation = TestAutomationAPI.validateApiKey(key);
    if (validation.isValid) {
      setIsAuthenticated(true);
      setApiKey(key);
      localStorage.setItem('test-automation-auth-key', key);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setApiKey('');
    localStorage.removeItem('test-automation-auth-key');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, apiKey, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};