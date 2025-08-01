import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import type { LoginRequest, RegisterRequest } from '../types/api';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.login(credentials);
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      document.cookie = `refreshToken=${response.refreshToken}; path=/; max-age=${7*24*60*60}; Secure`;
      
      // Navigate to main page
      navigate('/main');
    } catch (error: any) {
      setError(error.response?.data?.message || '로그인에 실패했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.register(userData);
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      document.cookie = `refreshToken=${response.refreshToken}; path=/; max-age=${7*24*60*60}; Secure`;
      
      // Navigate to main page
      navigate('/main');
    } catch (error: any) {
      setError(error.response?.data?.message || '회원가입에 실패했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    navigate('/');
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('accessToken');
  };

  return {
    login,
    register,
    logout,
    isAuthenticated,
    isLoading,
    error,
  };
};