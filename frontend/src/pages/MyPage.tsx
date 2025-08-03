import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button } from '../components/ui';
import { apiClient } from '../services/api';
import styles from './MyPage.module.css';

export const MyPage = () => {
  const [user, setUser] = useState<any>(null);
  const [savedResults, setSavedResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // 저장된 등기정보 가져오기
    loadSavedResults(parsedUser.email);
  }, [navigate]);

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

  const handleBackToMain = () => {
    navigate('/main');
  };

  return (
    <Layout>
      <Card variant="main">
        <div className={styles.header}>
          <h2>마이페이지</h2>
          <Button 
            variant="secondary" 
            onClick={handleBackToMain}
            className={styles.backButton}
          >
            메인으로
          </Button>
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
            </div>
          </div>
        )}

        <div className={styles.savedResults}>
          <h3>저장된 등기정보</h3>
          {isLoading ? (
            <div className={styles.loading}>로딩 중...</div>
          ) : savedResults.length > 0 ? (
            <div className={styles.resultsList}>
              {savedResults.map((result, index) => (
                <div key={result.id || index} className={styles.resultItem}>
                  <div className={styles.resultHeader}>
                    <span className={styles.resultTitle}>등기정보 #{index + 1}</span>
                    <span className={styles.resultTimestamp}>
                      {formatTimestamp(result.timestamp)}
                    </span>
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
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              저장된 등기정보가 없습니다.
            </div>
          )}
        </div>
      </Card>
    </Layout>
  );
};