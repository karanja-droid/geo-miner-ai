import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export interface User {
  userId: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user data for testing
const DEMO_USERS: Record<string, User> = {
  'demo@geovision.com': {
    userId: 'demo-1',
    email: 'demo@geovision.com',
    roles: ['Geologist', 'Administrator']
  },
  'geologist@geovision.com': {
    userId: 'geo-1',
    email: 'geologist@geovision.com',
    roles: ['Geologist']
  },
  'manager@geovision.com': {
    userId: 'mgr-1',
    email: 'manager@geovision.com',
    roles: ['Executive/Manager']
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // Initialize user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      // For demo purposes, check against demo users
      if (email === 'demo@geovision.com' && password === 'demo123') {
        const demoUser = DEMO_USERS[email];
        const demoToken = 'demo-token-' + Date.now();
        
        setToken(demoToken);
        setUser(demoUser);
        
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        return;
      }

      // For other demo users, allow any password
      if (DEMO_USERS[email]) {
        const demoUser = DEMO_USERS[email];
        const demoToken = 'demo-token-' + Date.now();
        
        setToken(demoToken);
        setUser(demoUser);
        
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        return;
      }

      // Real API call (commented out for demo)
      // const response = await axios.post('/auth/login', { email, password });
      // const { token: apiToken, user: apiUser } = response.data;
      
      // setToken(apiToken);
      // setUser(apiUser);
      // localStorage.setItem('token', apiToken);
      // localStorage.setItem('user', JSON.stringify(apiUser));

      // For now, throw an error for non-demo users
      throw new Error('Invalid credentials');
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        throw error;
      }
      // Handle network errors
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}; 