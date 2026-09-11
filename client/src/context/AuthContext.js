import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
    // Safety guard to prevent any indefinite spinner or blank state
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@anand_auth_token');
      const storedUser = await AsyncStorage.getItem('@anand_auth_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load auth credentials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: authUser, token: authToken } = res.data;

      await AsyncStorage.setItem('@anand_auth_token', authToken);
      await AsyncStorage.setItem('@anand_auth_user', JSON.stringify(authUser));

      setUser(authUser);
      setToken(authToken);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      const { user: authUser, token: authToken } = res.data;

      await AsyncStorage.setItem('@anand_auth_token', authToken);
      await AsyncStorage.setItem('@anand_auth_user', JSON.stringify(authUser));

      setUser(authUser);
      setToken(authToken);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@anand_auth_token');
      await AsyncStorage.removeItem('@anand_auth_user');
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const loginAsDemo = async (role = 'STUDENT') => {
    setIsLoading(true);
    const demoUsers = {
      STUDENT: {
        id: 'demo-student-01',
        name: 'Rahul Verma (Demo Student)',
        email: 'student@anand.edu',
        role: 'STUDENT',
      },
      TEACHER: {
        id: 'demo-teacher-01',
        name: 'Dr. Anand Sharma (Demo Teacher)',
        email: 'teacher@anand.edu',
        role: 'TEACHER',
      },
      ADMIN: {
        id: 'demo-admin-01',
        name: 'System Administrator (Demo Admin)',
        email: 'admin@anand.edu',
        role: 'ADMIN',
      },
    };

    const authUser = demoUsers[role] || demoUsers.STUDENT;
    const authToken = `demo-token-${role.toLowerCase()}`;

    try {
      await AsyncStorage.setItem('@anand_auth_token', authToken);
      await AsyncStorage.setItem('@anand_auth_user', JSON.stringify(authUser));
      setUser(authUser);
      setToken(authToken);
      return { success: true };
    } catch (e) {
      console.error('Demo login error:', e);
      return { success: false, message: 'Could not activate demo mode' };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        loginAsDemo,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
