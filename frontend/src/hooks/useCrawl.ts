import { useState } from 'react';
import { apiClient } from '../services/api';
import type { AddressItem, ProcessResult, CheckProcessResponse } from '../types/api';

export const useCrawl = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressList, setAddressList] = useState<AddressItem[]>([]);
  const [processResult, setProcessResult] = useState<ProcessResult | null>(null);
  const [checkProcessResult, setCheckProcessResult] = useState<CheckProcessResponse | null>(null);

  const findAddress = async (address: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.findAddress({ address });
      
      // Store session data
      if (response.crypted_id) {
        localStorage.setItem('crypted_id', response.crypted_id);
      }
      if (response.id) {
        localStorage.setItem('user_id', response.id);
      }
      if (response.cookieString) {
        localStorage.setItem('cookieString', response.cookieString);
      }
      
      setAddressList(response.addressList || []);
      return response;
    } catch (error: any) {
      setError(error.response?.data?.message || '주소 검색에 실패했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const findProcess = async (addressData: AddressItem) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const crypted_id = localStorage.getItem('crypted_id');
      const user_id = localStorage.getItem('user_id');
      const cookieString = localStorage.getItem('cookieString');

      if (!crypted_id || !user_id || !cookieString) {
        throw new Error('세션 정보가 없습니다. 다시 주소를 검색해주세요.');
      }

      // Store address data for checkProcess
      localStorage.setItem('real_indi_cont_detail', addressData.real_indi_cont_detail);
      localStorage.setItem('pin', addressData.pin);

      const response = await apiClient.findProcess({
        real_indi_cont_detail: addressData.real_indi_cont_detail,
        crypted_id,
        id: user_id,
        cookieString,
        pin: addressData.pin,
      });

      setProcessResult(response);
      return response;
    } catch (error: any) {
      setError(error.response?.data?.message || '프로세스 크롤링에 실패했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkProcess = async (name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const crypted_id = localStorage.getItem('crypted_id');
      const user_id = localStorage.getItem('user_id');
      const cookieString = localStorage.getItem('cookieString');
      const real_indi_cont_detail = localStorage.getItem('real_indi_cont_detail');
      const pin = localStorage.getItem('pin');

      if (!crypted_id || !user_id || !cookieString || !real_indi_cont_detail || !pin) {
        throw new Error('세션 정보가 없습니다. 다시 주소를 검색해주세요.');
      }

      const response = await apiClient.checkProcess({
        real_indi_cont_detail,
        crypted_id,
        id: user_id,
        cookieString,
        pin,
        name,
      });

      // 브라우저에 결과 저장
      const resultWithTimestamp = {
        ...response,
        timestamp: new Date().toISOString(),
        id: Date.now()
      };
      
      // 기존 결과 가져오기
      const existingResults = JSON.parse(localStorage.getItem('result') || '[]');
      existingResults.push(resultWithTimestamp);
      localStorage.setItem('result', JSON.stringify(existingResults));

      setCheckProcessResult(response);
      return response;
    } catch (error: any) {
      setError(error.response?.data?.message || '프로세스 확인에 실패했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    findAddress,
    findProcess,
    checkProcess,
    addressList,
    processResult,
    checkProcessResult,
    isLoading,
    error,
  };
};