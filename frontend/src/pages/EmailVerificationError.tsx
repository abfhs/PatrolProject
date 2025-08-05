import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button } from '../components/ui';
import { apiClient } from '../services/api';
import styles from './EmailVerificationError.module.css';

export const EmailVerificationError = () => {
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    } else {
      setError('이메일 인증에 실패했습니다.');
    }
  }, [searchParams]);

  const handleResendEmail = async () => {
    try {
      setIsResending(true);
      await apiClient.sendVerificationEmail();
      alert('인증 이메일이 다시 발송되었습니다. 이메일을 확인해주세요.');
    } catch (error: any) {
      console.error('이메일 재발송 실패:', error);
      alert(error.response?.data?.message || '이메일 재발송에 실패했습니다.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToMain = () => {
    navigate('/main');
  };

  const handleGoToMyPage = () => {
    navigate('/mypage');
  };

  return (
    <Layout>
      <Card variant="main">
        <div className={styles.container}>
          <div className={styles.iconSection}>
            <div className={styles.errorIcon}>❌</div>
          </div>
          
          <div className={styles.content}>
            <h2 className={styles.title}>이메일 인증 실패</h2>
            <p className={styles.message}>{error}</p>
            <p className={styles.subMessage}>
              인증 링크가 만료되었거나 유효하지 않을 수 있습니다.
            </p>
          </div>

          <div className={styles.buttonGroup}>
            <Button 
              variant="primary" 
              onClick={handleResendEmail}
              disabled={isResending}
              className={styles.button}
            >
              {isResending ? '발송 중...' : '인증 이메일 재발송'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleGoToMain}
              className={styles.button}
            >
              메인 페이지로
            </Button>
            <Button 
              variant="outline" 
              onClick={handleGoToMyPage}
              className={styles.button}
            >
              마이페이지로
            </Button>
          </div>
        </div>
      </Card>
    </Layout>
  );
};