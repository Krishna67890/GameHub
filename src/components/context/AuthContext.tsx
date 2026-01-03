import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  joinDate: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string) => boolean;
  logout: () => void;
  register: (username: string) => void;
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
    
    // Clean up old password storage if it exists
    localStorage.removeItem('demoPassword');
  }, []);

  const register = (username: string) => {
    const userData = {
      username,
      joinDate: new Date().toISOString(),
    };
    
    localStorage.setItem('demoUser', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const login = (username: string): boolean => {
    const storedUser = localStorage.getItem('demoUser');
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.username === username) {
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
    localStorage.removeItem('demoPassword'); // Remove the stored password since we no longer use it
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