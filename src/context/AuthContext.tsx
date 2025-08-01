import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/auth';
import { API_BASE, withBaseUrl } from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  refreshUser: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('smartschool_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('❌ Backend login failed:', data.error);
        return false;
      }

      const normalizedUser = {
        ...data.user,
        avatar: withBaseUrl(data.user.avatar)
      };
      localStorage.setItem('smartschool_user', JSON.stringify(normalizedUser));
      localStorage.setItem('smartschool_token', data.token);
      setUser(normalizedUser);
      return true;
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartschool_user');
    localStorage.removeItem('smartschool_token');
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    const token = localStorage.getItem('smartschool_token');
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (!res.ok) {
        console.error('❌ Update user failed:', await res.text());
        return false;
      }

      // Refresh user details from server
      const meRes = await fetch(`${API_BASE}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (meRes.ok) {
        const updated = await meRes.json();
        const normalized = { ...updated, avatar: withBaseUrl(updated.avatar) };
        setUser(normalized);
        localStorage.setItem('smartschool_user', JSON.stringify(normalized));
      }

      return true;
    } catch (error) {
      console.error('❌ Update user error:', error);
      return false;
    }
  };

  const refreshUser = async (): Promise<boolean> => {
    const token = localStorage.getItem('smartschool_token');
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        console.error('❌ Refresh user failed:', await res.text());
        return false;
      }
      const data = await res.json();
      const normalized = { ...data, avatar: withBaseUrl(data.avatar) };
      setUser(normalized);
      localStorage.setItem('smartschool_user', JSON.stringify(normalized));
      return true;
    } catch (error) {
      console.error('❌ Refresh user error:', error);
      return false;
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
