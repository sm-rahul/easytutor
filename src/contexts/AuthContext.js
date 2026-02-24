import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRegister, apiLogin, apiUpdateProfile } from '../services/api';

export const AuthContext = createContext({});

const SESSION_KEY = '@easytutor_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem(SESSION_KEY);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({ name, email, password, childName, childAge }) => {
    try {
      const res = await apiRegister({ name, email, password, childName, childAge });
      if (!res.success) {
        return { success: false, error: res.error };
      }
      // Save session locally
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
      setUser(res.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Could not connect to server. Please try again.' };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await apiLogin(email, password);
      if (!res.success) {
        return { success: false, error: res.error };
      }
      // Save session locally
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
      setUser(res.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Could not connect to server. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const res = await apiUpdateProfile(user.id, updates);
      if (!res.success) {
        return { success: false, error: res.error };
      }
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
      setUser(res.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Could not update profile' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
