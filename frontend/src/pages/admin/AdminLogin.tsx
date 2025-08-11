import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '../../components/ui';
import styles from './AdminLogin.module.css';
import { apiClient } from '../../services/api';

export const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.login(credentials);
      
      // 어드민 권한 확인 (ADMIN 또는 ADMIN_SUB)
      const isAdmin = response.user.role === 'ADMIN' || response.user.role === 'ADMIN_SUB';
      
      if (!isAdmin) {
        setError('관리자 권한이 필요합니다.');
        return;
      }

      // 토큰과 사용자 정보 저장
      localStorage.setItem('adminAccessToken', response.accessToken);
      localStorage.setItem('adminUser', JSON.stringify(response.user));
      document.cookie = `adminRefreshToken=${response.refreshToken}; path=/; max-age=${7*24*60*60}; Secure`;
      
      // 어드민 대시보드로 이동
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Admin login error:', error);
      setError(error.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.adminLoginContainer}>
      <div className={styles.adminLoginWrapper}>
        <Card variant="admin">
          <div className={styles.adminHeader}>
            <h1 className={styles.adminTitle}>관리자 로그인</h1>
            <p className={styles.adminSubtitle}>시스템 관리 페이지 접근</p>
          </div>
          
          <form onSubmit={handleSubmit} className={styles.adminForm}>
            <div className={styles.inputGroup}>
              <Input
                type="email"
                placeholder="관리자 이메일"
                value={credentials.email}
                onChange={(e) => 
                  setCredentials(prev => ({ ...prev, email: e.target.value }))
                }
                required
                className={styles.adminInput}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <Input
                type="password"
                placeholder="비밀번호"
                value={credentials.password}
                onChange={(e) => 
                  setCredentials(prev => ({ ...prev, password: e.target.value }))
                }
                required
                className={styles.adminInput}
              />
            </div>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading}
              className={styles.adminButton}
            >
              {isLoading ? '로그인 중...' : '관리자 로그인'}
            </Button>
          </form>

          <div className={styles.backToMain}>
            <button 
              type="button"
              onClick={() => navigate('/')}
              className={styles.backButton}
            >
              ← 메인 페이지로 돌아가기
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};