import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, Input, Loading } from '../components/ui';
import { apiClient } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import styles from './ResetPasswordConfirm.module.css';

export const ResetPasswordConfirm = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'loading' | 'form' | 'success' | 'error'>('loading');
  const navigate = useNavigate();
  const { login } = useAuth();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStep('error');
      setError('유효하지 않은 링크입니다.');
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.verifyResetToken(token!);
      
      if (response.isValid) {
        setStep('form');
      } else {
        setStep('error');
        setError('유효하지 않거나 만료된 링크입니다.');
      }
    } catch (error: any) {
      console.error('Token verification error:', error);
      setStep('error');
      setError('링크 확인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (password: string): string | null => {
    // 5가지 조건 검사
    const conditions = [
      password.length >= 8, // 8자 이상
      /(?=.*[a-z])/.test(password), // 소문자 포함
      /(?=.*[A-Z])/.test(password), // 대문자 포함
      /(?=.*\d)/.test(password), // 숫자 포함
      /(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password), // 특수문자 포함
    ];
    
    const satisfiedCount = conditions.filter(Boolean).length;
    
    if (satisfiedCount < 3) {
      return '비밀번호는 5가지 조건 중 최소 3가지 이상을 만족해야 합니다.';
    }
    
    return null;
  };

  // 각 조건 체크 함수
  const getPasswordConditions = (password: string) => ({
    length: password.length >= 8,
    lowercase: /(?=.*[a-z])/.test(password),
    uppercase: /(?=.*[A-Z])/.test(password),
    number: /(?=.*\d)/.test(password),
    special: /(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password),
  });

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('새 비밀번호를 입력해주세요.');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const resetResponse = await apiClient.resetPassword(token!, password);
      
      setStep('success');
      
      // 3초 후 자동 로그인 시도
      setTimeout(async () => {
        if (resetResponse.user?.email) {
          try {
            await login({ email: resetResponse.user.email, password });
          } catch (loginError) {
            console.error('Auto login failed:', loginError);
            navigate('/login');
          }
        } else {
          navigate('/login');
        }
      }, 3000);

    } catch (error: any) {
      console.error('Password reset error:', error);
      const errorMessage = error?.response?.data?.message || '비밀번호 재설정에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (step === 'loading') {
    return (
      <Layout>
        <Card variant="main">
          <div className={styles.loadingContainer}>
            <Loading show={true} />
            <p>링크를 확인하고 있습니다...</p>
          </div>
        </Card>
      </Layout>
    );
  }

  if (step === 'error') {
    return (
      <Layout>
        <Card variant="main">
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <h2 className={styles.errorTitle}>링크 오류</h2>
            <p className={styles.errorDescription}>
              {error || '유효하지 않은 비밀번호 재설정 링크입니다.'}
            </p>
            <p className={styles.errorSubtext}>
              링크가 만료되었거나 이미 사용된 링크일 수 있습니다.
              새로운 비밀번호 재설정을 요청해주세요.
            </p>
            <div className={styles.actionButtons}>
              <Button onClick={() => navigate('/reset-password')}>
                새로 재설정 요청
              </Button>
              <Button variant="secondary" onClick={handleBackToLogin}>
                로그인으로 돌아가기
              </Button>
            </div>
          </div>
        </Card>
      </Layout>
    );
  }

  if (step === 'success') {
    return (
      <Layout>
        <Card variant="main">
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>비밀번호 변경 완료!</h2>
            <p className={styles.successDescription}>
              비밀번호가 성공적으로 변경되었습니다.
              <br />
              잠시 후 자동으로 로그인되어 메인페이지로 이동합니다.
            </p>
            <div className={styles.autoLoginInfo}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill}></div>
              </div>
              <p>자동 로그인 중...</p>
            </div>
            <Button onClick={() => navigate('/login')} variant="secondary">
              수동으로 로그인하기
            </Button>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card variant="main">
        <h2 className={styles.title}>새 비밀번호 설정</h2>
        
        <p className={styles.description}>
          새로운 비밀번호를 입력해주세요. 아래 조건 중 3가지 이상 만족해야합니다.
        </p>

        <form onSubmit={handlePasswordReset} className={styles.form}>
          <div className={styles.inputGroup}>
            <Input
              type="password"
              placeholder="새 비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className={styles.passwordHints}>
              <p className={styles.hintTitle}>
                비밀번호 요구사항 (5개 중 3개 이상 필요):
              </p>
              <ul className={styles.hintList}>
                <li className={getPasswordConditions(password).length ? styles.valid : ''}>
                  8자 이상
                </li>
                <li className={getPasswordConditions(password).lowercase ? styles.valid : ''}>
                  소문자 포함
                </li>
                <li className={getPasswordConditions(password).uppercase ? styles.valid : ''}>
                  대문자 포함
                </li>
                <li className={getPasswordConditions(password).number ? styles.valid : ''}>
                  숫자 포함
                </li>
                <li className={getPasswordConditions(password).special ? styles.valid : ''}>
                  특수문자 포함
                </li>
              </ul>
              <div className={styles.conditionCounter}>
                {(() => {
                  const conditions = getPasswordConditions(password);
                  const count = Object.values(conditions).filter(Boolean).length;
                  const isValid = count >= 3;
                  return (
                    <p className={isValid ? styles.validCounter : styles.invalidCounter}>
                      {count}/5 조건 만족 {isValid ? '✓' : '(최소 3개 필요)'}
                    </p>
                  );
                })()}
              </div>
            </div>
          </div>

          <Input
            type="password"
            placeholder="새 비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {confirmPassword && password !== confirmPassword && (
            <div className={styles.mismatchWarning}>
              비밀번호가 일치하지 않습니다.
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading || password !== confirmPassword}
            className={styles.submitButton}
          >
            {isLoading ? '변경 중...' : '비밀번호 변경하기'}
          </Button>
        </form>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        
        <div className={styles.actionButtons}>
          <Button 
            variant="secondary" 
            onClick={handleBackToLogin}
            className={styles.backButton}
          >
            로그인으로 돌아가기
          </Button>
        </div>
      </Card>
    </Layout>
  );
};