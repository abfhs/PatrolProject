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
      
      // 기존 토큰 정리 (혹시 남아있는 잘못된 토큰 제거)
      localStorage.removeItem('accessToken');
      
      const response = await apiClient.login(credentials);
      
      // Store tokens and user info
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      document.cookie = `refreshToken=${response.refreshToken}; path=/; max-age=${7*24*60*60}; Secure`;
      
      // Navigate to main page only on success
      navigate('/main');
    } catch (error: unknown) {
      console.error('Login error:', error);
      let errorMessage = '로그인에 실패했습니다.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 401) {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
        } else if (axiosError.response?.status === 500) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }
      
      setError(errorMessage);
      // 에러 발생 시 로그인 페이지에 머무르도록 navigate 제거
      // throw error도 제거하여 Login 컴포넌트에서 추가 처리 방지
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.register(userData);
      
      // Store tokens and user info
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      document.cookie = `refreshToken=${response.refreshToken}; path=/; max-age=${7*24*60*60}; Secure`;
      
      // Navigate to main page
      navigate('/main');
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as any).response?.data?.message || '회원가입에 실패했습니다.'
        : '회원가입에 실패했습니다.';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      navigate('/');
    }
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