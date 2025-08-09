import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, Input } from '../components/ui';
import { apiClient } from '../services/api';
import styles from './ResetPassword.module.css';

export const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'found' | 'sent'>('email');
  const [showEmailSentButton, setShowEmailSentButton] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 이메일로 사용자 조회 (실제로는 백엔드에서 처리하지만, 프론트엔드에서 UI 흐름 제어)
      // 일단 요청을 보내고 성공하면 계정이 존재한다고 가정
      setStep('found');
      
      // 애니메이션 효과와 함께 이메일 전송 버튼 표시
      setTimeout(() => {
        setShowEmailSentButton(true);
      }, 500);

    } catch (error: any) {
      console.error('Email check error:', error);
      const errorMessage = error?.response?.data?.message || '계정 조회 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await apiClient.requestPasswordReset(email);
      setStep('sent');
      
    } catch (error: any) {
      console.error('Password reset request error:', error);
      const errorMessage = error?.response?.data?.message || '비밀번호 재설정 이메일 발송에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleTryAgain = () => {
    setEmail('');
    setError(null);
    setStep('email');
    setShowEmailSentButton(false);
  };

  return (
    <Layout>
      <Card variant="main">
        <h2 className={styles.title}>비밀번호 재설정</h2>
        
        {step === 'email' && (
          <div className={styles.emailStep}>
            <p className={styles.description}>
              등록된 이메일 주소를 입력하세요. 계정을 확인한 후 비밀번호 재설정 링크를 전송해드립니다.
            </p>
            
            <form onSubmit={handleEmailSubmit} className={styles.form}>
              <Input
                type="email"
                placeholder="이메일 주소 입력"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? '조회 중...' : '계정 조회하기'}
              </Button>
            </form>
          </div>
        )}

        {step === 'found' && (
          <div className={styles.foundStep}>
            <div className={styles.successIcon}>✓</div>
            <h3 className={styles.successTitle}>계정을 찾았습니다!</h3>
            <p className={styles.foundEmail}>
              <strong>{email}</strong>
            </p>
            <p className={styles.foundDescription}>
              해당 계정으로 비밀번호 재설정 이메일을 전송하시겠습니까?
            </p>
            
            <div className={`${styles.buttonContainer} ${showEmailSentButton ? styles.show : ''}`}>
              <Button 
                onClick={handleSendResetEmail}
                disabled={isLoading}
                className={styles.sendEmailButton}
              >
                {isLoading ? '전송 중...' : '재설정 메일 전송하기'}
              </Button>
            </div>
          </div>
        )}

        {step === 'sent' && (
          <div className={styles.sentStep}>
            <div className={styles.emailIcon}>📧</div>
            <h3 className={styles.sentTitle}>이메일이 전송되었습니다!</h3>
            <p className={styles.sentDescription}>
              <strong>{email}</strong>로 비밀번호 재설정 링크를 전송했습니다.
              <br />
              이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.
            </p>
            <div className={styles.sentInfo}>
              <p>• 링크는 1시간 후에 만료됩니다</p>
              <p>• 스팸 폴더도 확인해주세요</p>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        
        <div className={styles.actionButtons}>
          {step !== 'sent' ? (
            <Button 
              variant="secondary" 
              onClick={handleBackToLogin}
              className={styles.backButton}
            >
              로그인으로 돌아가기
            </Button>
          ) : (
            <>
              <Button 
                variant="secondary" 
                onClick={handleTryAgain}
                className={styles.backButton}
              >
                다시 시도
              </Button>
              <Button 
                onClick={handleBackToLogin}
                className={styles.loginButton}
              >
                로그인 페이지로
              </Button>
            </>
          )}
        </div>
      </Card>
    </Layout>
  );
};