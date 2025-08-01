import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, Input, Loading } from '../components/ui';
import { useCrawl } from '../hooks/useCrawl';
import type { AddressItem, CheckProcessResponse } from '../types/api';
import styles from './Main.module.css';

export const Main = () => {
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [processCompleted, setProcessCompleted] = useState(false);
  
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
      navigate('/');
    }
  }, [navigate]);

  const handleAddressSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      await findAddress(address);
      setShowResults(true);
      setShowNameInput(false);
      setProcessCompleted(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleAddressClick = async (addressData: AddressItem) => {
    try {
      await findProcess(addressData);
      setShowNameInput(true);
      setProcessCompleted(true);
      alert('프로세스 크롤링이 완료되었습니다.');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleNameSubmit = async () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    try {
      const result = await checkProcess(name);
      console.log('CheckProcess result:', result);
      console.log('CheckProcessResult state:', checkProcessResult);
    } catch (error) {
      console.error('CheckProcess error:', error);
      // Error handling is done in the hook
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    }
  };

  return (
    <Layout showMyPageBtn>
      <Card variant="main">
        <h2>Report Information</h2>
        <form onSubmit={handleAddressSubmit}>
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
        
        {error && (
          <div style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        {showResults && (
          <div className={styles.resultSection}>
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
            
            {processCompleted && processResult && (
              <>
                <div className={styles.resultHeader}>프로세스 결과</div>
                <div className={styles.addressList}>
                  <div className={styles.addressItem}>
                    <div className={styles.addressDetail}>
                      부동산 고유번호: {processResult.a301pin || 'N/A'}
                    </div>
                    <div className={styles.addressDetail}>
                      부동산 소재지번: {localStorage.getItem('real_indi_cont_detail') || 'N/A'}
                    </div>
                    <div className={styles.addressDetail}>
                      소유자: {processResult.a318nomprs_name || 'N/A'}
                    </div>
                    <div className={styles.addressDetail}>
                      등기상태: {processResult.a301use_cls_cd_nm || 'N/A'}
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {showNameInput && (
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

            {checkProcessResult && (
              <>
                <div className={styles.resultHeader}>등기 정보 확인 결과</div>
                <div className={styles.addressList}>
                  <div className={styles.addressItem}>
                    <div className={styles.addressDetail}>
                      <strong>디버그 - 전체 응답:</strong> {JSON.stringify(checkProcessResult, null, 2)}
                    </div>
                    {Object.entries(checkProcessResult)
                      .filter(([key, value]) => {
                        const isValidValue = value !== null && value !== undefined && value !== '';
                        const isImportantKey = ['a101rel_charge_cd', 'a101recev_date', 'regt_name', 'e033rgs_sel_name', 
                         'a101recev_no', 'recev_regt_name', 'a105real_indi_cont', 'a105_pin',
                         'e008cd_name', 'court_name', 'a101appl_year', 'a101recev_seq', 'statlin'].includes(key);
                        console.log(`Key: ${key}, Value: ${value}, Valid: ${isValidValue}, Important: ${isImportantKey}`);
                        return isValidValue && isImportantKey;
                      })
                      .map(([key, value]) => (
                        <div key={key} className={styles.addressDetail}>
                          <strong>{getKoreanLabel(key)}:</strong>{' '}
                          {key === 'a101recev_date' ? formatDate(String(value)) : String(value)}
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Card>
      <Loading show={isLoading} />
    </Layout>
  );
};