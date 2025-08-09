import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, EmailVerificationModal } from '../components/ui';
import { apiClient } from '../services/api';
import styles from './MyPage.module.css';

export const MyPage = () => {
  const [user, setUser] = useState<any>(null);
  const [savedResults, setSavedResults] = useState<any[]>([]);
  const [userSchedules, setUserSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    isVerified: boolean;
    hasActiveToken: boolean;
    expiresAt?: string;
  } | null>(null);
  const navigate = useNavigate();

  // 한국어 라벨 매핑 함수
  const getKoreanLabel = (key: string): string => {
    const labelMap: Record<string, string> = {
      'a101rel_charge_cd': '담당계',
      'a101recev_date': '접수일자',
      'regt_name': '접수등기소',
      'e033rgs_sel_name': '등기목적',
      'a101recev_no': '접수번호',
      'recev_regt_name': '처리등기소',
      'a105real_indi_cont': '부동산 소재지번',
      'a105_pin': '주소번호',
      'e008cd_name': '처리상태',
      'court_name': '법원명',
      'a101appl_year': '신청년도',
      'a101recev_seq': '접수순번',
      'statlin': '상태',
    };
    return labelMap[key] || key;
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string): string => {
    if (!dateString || dateString.length !== 8) return dateString;
    return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
  };

  // 타임스탬프 포맷팅 함수
  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  useEffect(() => {
    // 로그인 확인 및 사용자 정보 가져오기
    const accessToken = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (!accessToken || !userData) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // 이메일 인증 상태 확인
    checkVerificationStatus();
    
    // 저장된 등기정보 가져오기
    loadSavedResults(parsedUser.email);
    
    // 사용자 스케줄 가져오기
    loadUserSchedules(parsedUser.email);
  }, [navigate]);

  const checkVerificationStatus = async () => {
    try {
      const status = await apiClient.getVerificationStatus();
      setVerificationStatus(status);
    } catch (error: any) {
      console.error('인증 상태 확인 실패:', error);
    }
  };

  const handleSendVerificationEmail = async () => {
    await apiClient.sendVerificationEmail();
    // 이메일 발송 후 상태 다시 확인
    await checkVerificationStatus();
  };

  const handleCheckVerification = async (): Promise<boolean> => {
    try {
      // 인증 상태를 다시 확인
      await checkVerificationStatus();
      
      // 최신 인증 상태 확인
      const status = await apiClient.getVerificationStatus();
      
      if (status.isVerified) {
        // 인증 완료된 경우 사용자 스케줄도 다시 로드
        if (user?.email) {
          await loadUserSchedules(user.email);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('인증 상태 확인 중 오류:', error);
      return false;
    }
  };

  const loadSavedResults = async (email: string) => {
    try {
      setIsLoading(true);
      const results = await apiClient.getUserResults(email);
      setSavedResults(results);
    } catch (error: any) {
      console.error('저장된 결과를 불러오는데 실패했습니다:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserSchedules = async (email: string) => {
    try {
      const schedules = await apiClient.getSchedulesByEmail(email);
      setUserSchedules(schedules);
    } catch (error: any) {
      console.error('사용자 스케줄을 불러오는데 실패했습니다:', error);
    }
  };

  // 해당 주소가 이미 스케줄에 등록되어 있는지 확인
  const isScheduleRegistered = (result: any): boolean => {
    if (!userSchedules || userSchedules.length === 0) return false;
    
    const addressPin = result.a105_pin;
    const address = result.a105real_indi_cont;
    
    return userSchedules.some(schedule => 
      schedule.addressPin === addressPin && schedule.address === address
    );
  };

  const handleBackToMain = () => {
    navigate('/main');
  };

  const handleScheduleRegister = async (result: any) => {
    try {
      if (!user?.email) {
        alert('로그인 정보가 없습니다.');
        return;
      }

      // 이메일 인증 상태 확인
      if (verificationStatus && !verificationStatus.isVerified) {
        setShowVerificationModal(true);
        return;
      }

      // localStorage에서 추가 정보 확인 (없으면 사용자에게 입력 받을 수도 있음)
      const addressPin = result.a105_pin;
      let ownerName = localStorage.getItem('ownerName'); // 마지막 입력값 사용
      const address = result.a105real_indi_cont;

      // 필수 정보가 없는 경우 사용자에게 알림
      if (!addressPin || !address) {
        alert('등기정보에 주소 정보가 부족합니다. 다시 검색해주세요.');
        return;
      }

      // ownerName이 없으면 간단히 입력받기
      if (!ownerName) {
        ownerName = prompt('소유자 이름을 입력해주세요:');
        if (!ownerName) {
          return;
        }
      }

      const scheduleData = {
        addressPin,
        ownerName,
        email: user.email,
        address,
      };

      setIsLoading(true);
      
      // 스케줄 생성
      const createdSchedule = await apiClient.createSchedule(scheduleData);
      
      // 생성된 스케줄에 crawlResult 저장
      if (createdSchedule && createdSchedule.id) {
        await apiClient.saveCrawlResult(createdSchedule.id, result);
      }

      alert('등기정보가 스케줄에 성공적으로 등록되었습니다.');
      
      // 스케줄 등록 후 사용자 스케줄 목록 다시 로드
      await loadUserSchedules(user.email);
    } catch (error: any) {
      console.error('스케줄 등록 오류:', error);
      if (error.response?.data?.message?.includes('이미 등록된')) {
        alert('이미 등록된 주소와 이메일 조합입니다.');
      } else {
        alert(error.response?.data?.message || '스케줄 등록에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout showLogoutBtn>
      {/* 메인으로 버튼을 Card 밖에 배치 */}
      <button 
        onClick={handleBackToMain}
        className={styles.backButton}
      >
        메인으로
      </button>
      
      <Card variant="main">
        <div className={styles.header}>
          <h2>마이페이지</h2>
        </div>

        {user && (
          <div className={styles.userInfo}>
            <h3>사용자 정보</h3>
            <div className={styles.userCard}>
              <div className={styles.userDetail}>
                <span className={styles.label}>이메일:</span>
                <span className={styles.value}>{user.email}</span>
              </div>
              <div className={styles.userDetail}>
                <span className={styles.label}>닉네임:</span>
                <span className={styles.value}>{user.nickname}</span>
              </div>
              <div className={styles.userDetail}>
                <span className={styles.label}>인증 상태:</span>
                <span className={`${styles.value} ${
                  verificationStatus?.isVerified ? styles.verified : styles.unverified
                }`}>
                  {verificationStatus?.isVerified ? '✅ 인증 완료' : '❌ 이메일 인증 필요'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.savedResults}>
          <h3>저장된 등기정보</h3>
          {isLoading ? (
            <div className={styles.loading}>로딩 중...</div>
          ) : savedResults.length > 0 ? (
            <div className={styles.resultsList}>
              {savedResults.map((result, index) => {
                const isRegistered = isScheduleRegistered(result);
                return (
                <div 
                  key={result.id || index} 
                  className={`${styles.resultItem} ${isRegistered ? styles.registeredItem : ''}`}
                >
                  <div className={styles.resultHeader}>
                    <div className={styles.resultTitleSection}>
                      <span className={styles.resultTitle}>등기정보 #{index + 1}</span>
                      <span className={styles.resultTimestamp}>
                        {formatTimestamp(result.timestamp)}
                      </span>
                    </div>
                    {isRegistered ? (
                      <div className={styles.registeredBadge}>
                        ✅ 스케줄 등록됨
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => handleScheduleRegister(result)}
                        disabled={isLoading}
                        className={styles.scheduleButton}
                      >
                        스케줄 등록하기
                      </Button>
                    )}
                  </div>
                  
                  <table className={styles.resultTable}>
                    <tbody>
                      {Object.entries(result)
                        .filter(([key, value]) => 
                          value !== null && 
                          value !== undefined && 
                          value !== '' && 
                          value !== 0 &&
                          key !== 'timestamp' &&
                          key !== 'id' &&
                          ['a101rel_charge_cd', 'a101recev_date', 'regt_name', 'e033rgs_sel_name', 
                           'a101recev_no', 'recev_regt_name', 'a105real_indi_cont', 'a105_pin',
                           'e008cd_name', 'court_name', 'a101appl_year', 'a101recev_seq', 'statlin'].includes(key)
                        )
                        .map(([key, value]) => (
                          <tr key={key}>
                            <th>{getKoreanLabel(key)}</th>
                            <td>{key === 'a101recev_date' ? formatDate(String(value)) : String(value)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              );
              })}
            </div>
          ) : (
            <div className={styles.noResults}>
              저장된 등기정보가 없습니다.
            </div>
          )}
        </div>
      </Card>

      {/* 이메일 인증 모달 */}
      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSendEmail={handleSendVerificationEmail}
        onCheckVerification={handleCheckVerification}
        userEmail={user?.email}
      />
    </Layout>
  );
};