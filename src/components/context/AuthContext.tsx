import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  joinDate: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => void;
  logout: () => void;
  register: (username: string, password: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user exists in localStorage on app start
    const storedUser = localStorage.getItem('demoUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const register = (username: string, password: string) => {
    const userData = {
      username,
      joinDate: new Date().toISOString(),
    };
    
    // Store the password separately for login verification
    localStorage.setItem('demoUser', JSON.stringify(userData));
    localStorage.setItem('demoPassword', password); // In a real app, this should be hashed
    setUser(userData);
    setIsAuthenticated(true);
  };

  const login = (username: string, password: string) => {
    const storedUser = localStorage.getItem('demoUser');
    const storedPassword = localStorage.getItem('demoPassword');
    
    if (storedUser && storedPassword) {
      const userData = JSON.parse(storedUser);
      if (userData.username === username && storedPassword === password) {
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Optionally clear stored credentials
    // localStorage.removeItem('demoPassword'); // Keep if we want to allow auto-login
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};