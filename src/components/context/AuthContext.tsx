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
    // Initialize default demo accounts first
    const storedDemoAccounts = localStorage.getItem('demoAccounts');
    if (!storedDemoAccounts) {
      // Add default demo accounts
      const defaultDemoAccounts = [
        { username: 'KRISHNA PATIL RAJPUT', joinDate: new Date().toISOString() },
        { username: 'Om Khapote', joinDate: new Date().toISOString() },
        { username: 'Gunjan Pande', joinDate: new Date().toISOString() },
      ];
      localStorage.setItem('demoAccounts', JSON.stringify(defaultDemoAccounts));
    } else {
      // Ensure default demo accounts exist even if some are missing
      const existingDemoAccounts = JSON.parse(storedDemoAccounts);
      const defaultDemoAccounts = [
        { username: 'KRISHNA PATIL RAJPUT', joinDate: new Date().toISOString() },
        { username: 'Om Khapote', joinDate: new Date().toISOString() },
        { username: 'Gunjan Pande', joinDate: new Date().toISOString() },
      ];
      
      let hasUpdates = false;
      const updatedAccounts = [...existingDemoAccounts];
      
      defaultDemoAccounts.forEach(defaultAccount => {
        const exists = existingDemoAccounts.some((account: User) => account.username === defaultAccount.username);
        if (!exists) {
          updatedAccounts.push(defaultAccount);
          hasUpdates = true;
        }
      });
      
      if (hasUpdates) {
        localStorage.setItem('demoAccounts', JSON.stringify(updatedAccounts));
      }
    }
    
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
    
    // Add to demo accounts list
    const storedDemoAccounts = localStorage.getItem('demoAccounts');
    let demoAccounts = [];
    if (storedDemoAccounts) {
      demoAccounts = JSON.parse(storedDemoAccounts);
    }
    
    // Check if user already exists in the list
    const existingUserIndex = demoAccounts.findIndex((account: User) => account.username === username);
    if (existingUserIndex === -1) {
      demoAccounts.push(userData);
      localStorage.setItem('demoAccounts', JSON.stringify(demoAccounts));
    }
    
    setUser(userData);
    setIsAuthenticated(true);
  };

  const login = (username: string): boolean => {
    // First check if it's the currently logged in user
    const storedUser = localStorage.getItem('demoUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.username === username) {
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
    }
    
    // Check in demo accounts list
    const storedDemoAccounts = localStorage.getItem('demoAccounts');
    if (storedDemoAccounts) {
      const demoAccounts = JSON.parse(storedDemoAccounts);
      const foundUser = demoAccounts.find((account: User) => account.username === username);
      if (foundUser) {
        // Set this user as the current user
        localStorage.setItem('demoUser', JSON.stringify(foundUser));
        setUser(foundUser);
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
    
    // Keep demo accounts list but clear current user
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