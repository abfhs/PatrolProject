import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, Input, Loading } from '../components/ui';
import { useCrawl } from '../hooks/useCrawl';
import { apiClient } from '../services/api';
import type { AddressItem } from '../types/api';
import styles from './Main.module.css';

export const Main = () => {
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [processCompleted, setProcessCompleted] = useState(false);
  const [isFormHiding, setIsFormHiding] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [checkProcessCompleted, setCheckProcessCompleted] = useState(false);
  const [showSaveOption, setShowSaveOption] = useState(false);
  
  const navigate = useNavigate();
  const { findAddress, findProcess, checkProcess, addressList, processResult, checkProcessResult, isLoading, error } = useCrawl();

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

  useEffect(() => {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  }, [navigate]);

  const handleAddressSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      await findAddress(address);
      
      // 검색 성공 애니메이션 시작
      setIsFormHiding(true);
      setShowSuccessMessage(true);
      
      // 2초 후 결과 표시
      setTimeout(() => {
        setShowSuccessMessage(false);
        setShowResults(true);
        setShowNameInput(false);
        setProcessCompleted(false);
      }, 2000);
    } catch {
      // Error handling is done in the hook
      setIsFormHiding(false);
    }
  };

  const handleAddressClick = async (addressData: AddressItem) => {
    try {
      await findProcess(addressData);
      setShowNameInput(true);
      setProcessCompleted(true);
      alert('프로세스 크롤링이 완료되었습니다.');
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleNameSubmit = async () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    try {
      // 이름을 브라우저 DB에 ownerName으로 저장
      localStorage.setItem('ownerName', name.trim());
      
      await checkProcess(name);
      // 성공 시 checkProcess 완료 상태로 변경
      setCheckProcessCompleted(true);
      setShowSaveOption(true);
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    }
  };

  const handleSaveResult = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.email) {
        alert('로그인 정보가 없습니다.');
        return;
      }

      // 등기정보를 사용자 결과에만 저장 (스케줄 등록은 별도로)
      await apiClient.addUserResult(user.email, checkProcessResult);

      alert('등기정보가 성공적으로 저장되었습니다.');
      setShowSaveOption(false);
      // 저장 성공 후 마이페이지로 이동
      navigate('/mypage');
    } catch (error: any) {
      console.error('저장 오류:', error);
      alert(error.response?.data?.message || '저장에 실패했습니다.');
    }
  };

  const handleNewSearch = () => {
    setShowResults(false);
    setShowNameInput(false);
    setProcessCompleted(false);
    setIsFormHiding(false);
    setShowSuccessMessage(false);
    setCheckProcessCompleted(false);
    setShowSaveOption(false);
    setAddress('');
    setName('');
  };

  return (
    <Layout showMyPageBtn>
      <Card variant="main">
        <h2>Report Information</h2>
        {!showResults && (
          <>
            <form 
              onSubmit={handleAddressSubmit} 
              className={`${styles.searchForm} ${isFormHiding ? styles.hiding : ''}`}
            >
              <Input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <Button type="submit" disabled={isLoading}>
                Submit
              </Button>
            </form>
            {showSuccessMessage && (
              <div className={styles.successMessage}>
                검색 성공!
              </div>
            )}
          </>
        )}
        
        {error && (
          <div style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        {showResults && (
          <div className={styles.resultSection}>
            <Button 
              variant="secondary" 
              onClick={handleNewSearch}
              style={{ marginBottom: '20px' }}
            >
              새 검색
            </Button>
            {!processCompleted && (
              <>
                <div className={styles.resultHeader}>검색 결과</div>
                <div className={styles.addressList}>
                  {addressList.length > 0 ? (
                    addressList.map((address, index) => (
                      <div
                        key={index}
                        className={styles.addressItem}
                        onClick={() => handleAddressClick(address)}
                      >
                        <div className={styles.addressDetail}>
                          {address.real_indi_cont_detail}
                        </div>
                        <div className={styles.addressPin}>
                          PIN: {address.pin}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.noResults}>
                      검색 결과가 없습니다.
                    </div>
                  )}
                </div>
              </>
            )}
            
            {processCompleted && processResult && !checkProcessCompleted && (
              <>
                <div className={styles.resultHeader}>프로세스 결과</div>
                <table className={styles.resultTable}>
                  <tbody>
                    <tr>
                      <th>부동산 고유번호</th>
                      <td>{processResult.a301pin || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>부동산 소재지번</th>
                      <td>{localStorage.getItem('real_indi_cont_detail') || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>소유자</th>
                      <td>{processResult.a318nomprs_name || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>등기상태</th>
                      <td>{processResult.a301use_cls_cd_nm || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
            
            {showNameInput && !checkProcessCompleted && (
              <div className={styles.nameInputSection}>
                <div className={styles.resultHeader}>이름 입력</div>
                <div className={styles.nameInputContainer}>
                  <Input
                    variant="inline"
                    type="text"
                    placeholder="이름을 입력하세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button
                    size="small"
                    isInline
                    onClick={handleNameSubmit}
                    disabled={isLoading}
                  >
                    확인
                  </Button>
                </div>
              </div>
            )}

            {checkProcessCompleted && checkProcessResult && (
              <>
                <div className={styles.resultHeader}>등기 정보 확인 결과</div>
                <table className={styles.resultTable}>
                  <tbody>
                    {Object.entries(checkProcessResult)
                      .filter(([key, value]) => 
                        value !== null && 
                        value !== undefined && 
                        value !== '' && 
                        value !== 0 &&
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
                
                {showSaveOption && (
                  <div className={styles.saveSection}>
                    <p className={styles.saveMessage}>해당 등기정보결과를 저장하겠습니까?</p>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={handleSaveResult}
                      disabled={isLoading}
                    >
                      저장하기
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Card>
      <Loading show={isLoading} />
    </Layout>
  );
};