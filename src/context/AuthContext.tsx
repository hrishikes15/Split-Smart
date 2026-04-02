import { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for user object
    const storedUser = localStorage.getItem('splitSmartUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('splitSmartUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: any) => {
    const { data } = await api.post('/auth/login', credentials);
    setUser(data);
    localStorage.setItem('splitSmartUser', JSON.stringify(data));
    return data;
  };

  const register = async (userData: any) => {
    const { data } = await api.post('/auth/register', userData);
    setUser(data);
    localStorage.setItem('splitSmartUser', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('splitSmartUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
