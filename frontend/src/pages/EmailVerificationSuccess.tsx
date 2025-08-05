import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button } from '../components/ui';
import styles from './EmailVerificationSuccess.module.css';

export const EmailVerificationSuccess = () => {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const messageParam = searchParams.get('message');
    if (messageParam) {
      setMessage(decodeURIComponent(messageParam));
    } else {
      setMessage('이메일 인증이 완료되었습니다!');
    }
  }, [searchParams]);

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
            <div className={styles.successIcon}>✅</div>
          </div>
          
          <div className={styles.content}>
            <h2 className={styles.title}>이메일 인증 완료!</h2>
            <p className={styles.message}>{message}</p>
            <p className={styles.subMessage}>
              이제 등기정보 모니터링 스케줄을 등록할 수 있습니다.
            </p>
          </div>

          <div className={styles.buttonGroup}>
            <Button 
              variant="primary" 
              onClick={handleGoToMain}
              className={styles.button}
            >
              메인 페이지로
            </Button>
            <Button 
              variant="secondary" 
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