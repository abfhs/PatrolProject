import { useState } from 'react';
import { Button } from './Button';
import styles from './EmailVerificationModal.module.css';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendEmail: () => Promise<void>;
  onCheckVerification: () => Promise<boolean>;
  userEmail?: string;
}

export const EmailVerificationModal = ({ 
  isOpen, 
  onClose, 
  onSendEmail, 
  onCheckVerification,
  userEmail 
}: EmailVerificationModalProps) => {
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  if (!isOpen) return null;

  const handleSendEmail = async () => {
    try {
      setIsSending(true);
      await onSendEmail();
      setEmailSent(true);
      alert('인증 이메일이 발송되었습니다. 이메일을 확인하고 인증 링크를 클릭한 후 아래 "인증 확인" 버튼을 눌러주세요.');
    } catch (error: any) {
      console.error('이메일 발송 실패:', error);
      alert(error.response?.data?.message || '이메일 발송에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      setIsChecking(true);
      const isVerified = await onCheckVerification();
      if (isVerified) {
        alert('이메일 인증이 완료되었습니다! 이제 스케줄 등록이 가능합니다.');
        onClose();
        // 상태 초기화
        setEmailSent(false);
      } else {
        alert('아직 인증이 완료되지 않았습니다. 이메일의 인증 링크를 클릭한 후 다시 시도해주세요.');
      }
    } catch (error: any) {
      console.error('인증 상태 확인 실패:', error);
      alert('인증 상태 확인에 실패했습니다.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleClose = () => {
    setEmailSent(false);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            {emailSent ? '이메일 인증 확인' : '이메일 인증이 필요합니다'}
          </h3>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.iconSection}>
            <div className={styles.icon}>{emailSent ? '✉️' : '📧'}</div>
          </div>
          
          {!emailSent ? (
            <>
              <p className={styles.message}>
                등기정보 모니터링 스케줄을 등록하려면 이메일 인증이 필요합니다.
              </p>
              
              {userEmail && (
                <p className={styles.emailInfo}>
                  <strong>{userEmail}</strong>로 인증 이메일을 발송합니다.
                </p>
              )}
              
              <div className={styles.steps}>
                <div className={styles.step}>
                  <span className={styles.stepNumber}>1</span>
                  <span className={styles.stepText}>인증 이메일 발송 요청</span>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNumber}>2</span>
                  <span className={styles.stepText}>이메일에서 인증 링크 클릭</span>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNumber}>3</span>
                  <span className={styles.stepText}>인증 확인 후 스케줄 등록</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className={styles.message}>
                인증 이메일이 발송되었습니다!
              </p>
              
              {userEmail && (
                <p className={styles.emailInfo}>
                  <strong>{userEmail}</strong>로 발송된 이메일을 확인해주세요.
                </p>
              )}
              
              <div className={styles.steps}>
                <div className={`${styles.step} ${styles.completed}`}>
                  <span className={styles.stepNumber}>✓</span>
                  <span className={styles.stepText}>인증 이메일 발송 완료</span>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNumber}>2</span>
                  <span className={styles.stepText}>이메일에서 인증 링크 클릭</span>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNumber}>3</span>
                  <span className={styles.stepText}>아래 "인증 확인" 버튼 클릭</span>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className={styles.footer}>
          <Button 
            variant="secondary" 
            onClick={handleClose}
            className={styles.button}
          >
            취소
          </Button>
          {!emailSent ? (
            <Button 
              variant="primary" 
              onClick={handleSendEmail}
              disabled={isSending}
              className={styles.button}
            >
              {isSending ? '발송 중...' : '인증 이메일 발송'}
            </Button>
          ) : (
            <Button 
              variant="primary" 
              onClick={handleCheckVerification}
              disabled={isChecking}
              className={styles.button}
            >
              {isChecking ? '확인 중...' : '인증 확인'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};