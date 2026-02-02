import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Credenciais padrão
  const CREDENTIALS = {
    username: 'anaclara',
    password: 'anaclara'
  };

  useEffect(() => {
    // Verificar se há sessão salva no localStorage
    const savedUser = localStorage.getItem('pacd_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (username, password) => {
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
      const userData = { username, loginTime: new Date().toISOString() };
      setUser(userData);
      localStorage.setItem('pacd_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: 'Usuário ou senha incorretos' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pacd_user');
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
