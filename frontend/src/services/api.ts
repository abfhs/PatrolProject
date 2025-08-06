import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  FindAddressRequest,
  FindAddressResponse,
  FindProcessRequest,
  ProcessResult,
  CheckProcessRequest,
  CheckProcessResponse,
  CreateScheduleRequest,
  ScheduleResponse
} from '../types/api';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    // 환경에 따른 API URL 설정
    this.baseURL = this.getApiBaseUrl();
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      // 로그인/회원가입 요청에서는 Bearer 토큰을 추가하지 않음
      if (!config.skipAuthInterceptor) {
        const token = localStorage.getItem('accessToken');
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - only redirect for non-admin pages
          const currentPath = window.location.pathname;
          
          // Admin 로그인 페이지에서는 리다이렉트하지 않음
          if (!currentPath.startsWith('/admin/login')) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('adminAccessToken');
            
            // Admin 페이지에서 401 발생 시 admin 로그인으로, 일반 페이지에서는 일반 로그인으로
            if (currentPath.startsWith('/admin')) {
              window.location.href = '/admin/login';
            } else {
              window.location.href = '/';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getApiBaseUrl(): string {
    // Vite 환경 변수 사용 (VITE_ 접두사 필요)
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl) {
      console.log('API Base URL from env:', envUrl);
      return envUrl;
    }

    // 환경 변수가 없는 경우 자동 감지
    if (typeof window !== 'undefined') {
      const { protocol, hostname, port } = window.location;
      
      // 개발 환경 감지 (localhost, 127.0.0.1, 또는 특정 포트)
      if (hostname === 'localhost' || hostname === '127.0.0.1' || port === '5173') {
        console.log('Development environment detected');
        return 'http://localhost:3000';
      }
      
      // 배포 환경 - 현재 호스트 사용
      const baseUrl = port && port !== '80' && port !== '443' 
        ? `${protocol}//${hostname}:${port}` 
        : `${protocol}//${hostname}`;
      
      console.log('Production environment detected, using:', baseUrl);
      return baseUrl;
    }
    
    // SSR 환경에서의 fallback
    return 'http://localhost:3000';
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const token = btoa(`${credentials.email}:${credentials.password}`);
    const response: AxiosResponse<AuthResponse> = await this.client.post(
      '/auth/login/email',
      {},
      {
        headers: {
          Authorization: `Basic ${token}`,
        },
        // 로그인 요청에서는 인터셉터의 Bearer 토큰을 무시
        skipAuthInterceptor: true,
      }
    );
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.client.post(
      '/auth/register/email',
      userData,
      {
        // 회원가입 요청에서는 인터셉터의 Bearer 토큰을 무시
        skipAuthInterceptor: true,
      }
    );
    return response.data;
  }

  // Crawl methods
  async findAddress(request: FindAddressRequest): Promise<FindAddressResponse> {
    const response: AxiosResponse<FindAddressResponse> = await this.client.post(
      '/crawl/find',
      request
    );
    return response.data;
  }

  async findProcess(request: FindProcessRequest): Promise<ProcessResult> {
    const response: AxiosResponse<ProcessResult> = await this.client.post(
      '/crawl/findProcess',
      request
    );
    return response.data;
  }

  async checkProcess(request: CheckProcessRequest): Promise<CheckProcessResponse> {
    const response: AxiosResponse<CheckProcessResponse> = await this.client.post(
      '/crawl/checkProcess',
      request
    );
    return response.data;
  }

  // User result methods
  async addUserResult(email: string, result: any): Promise<any> {
    const response: AxiosResponse<any> = await this.client.post(
      '/users/add-result',
      { email, result }
    );
    return response.data;
  }

  async getUserResults(email: string): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.client.get(
      `/users/results/${email}`
    );
    return response.data;
  }

  // Schedule methods
  async createSchedule(scheduleData: CreateScheduleRequest): Promise<ScheduleResponse> {
    const response: AxiosResponse<ScheduleResponse> = await this.client.post(
      '/schedule',
      scheduleData
    );
    return response.data;
  }

  async getSchedules(): Promise<ScheduleResponse[]> {
    const response: AxiosResponse<ScheduleResponse[]> = await this.client.get(
      '/schedule'
    );
    return response.data;
  }

  async getSchedulesByEmail(email: string): Promise<ScheduleResponse[]> {
    const response: AxiosResponse<ScheduleResponse[]> = await this.client.get(
      `/schedule/email/${email}`
    );
    return response.data;
  }

  async deleteSchedule(id: number): Promise<void> {
    await this.client.delete(`/schedule/${id}`);
  }

  async runScheduleManually(): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.post(
      '/schedule/run-manual'
    );
    return response.data;
  }

  async saveCrawlResult(scheduleId: number, crawlResult: any): Promise<any> {
    const response: AxiosResponse<any> = await this.client.put(
      `/schedule/${scheduleId}/crawl-result`,
      { crawlResult }
    );
    return response.data;
  }

  // Admin methods
  async getAdminDashboard(): Promise<any> {
    const response: AxiosResponse<any> = await this.client.get(
      '/admin/dashboard',
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`,
        },
      }
    );
    return response.data;
  }

  async getAdminUsers(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.client.get(
      '/admin/users',
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`,
        },
      }
    );
    return response.data;
  }

  async deleteAdminUser(userId: number): Promise<void> {
    await this.client.delete(`/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`,
      },
    });
  }

  async getAdminSchedules(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.client.get(
      '/admin/schedules',
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`,
        },
      }
    );
    return response.data;
  }

  async deleteAdminSchedule(scheduleId: number): Promise<void> {
    await this.client.delete(`/admin/schedules/${scheduleId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`,
      },
    });
  }

  async runAdminScheduler(): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.post(
      '/admin/scheduler/run',
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`,
        },
      }
    );
    return response.data;
  }

  async getAdminSchedulerLogs(page: number, limit: number, date?: string): Promise<any> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (date) {
      params.append('date', date);
    }

    const response: AxiosResponse<any> = await this.client.get(
      `/admin/scheduler/logs?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`,
        },
      }
    );
    return response.data;
  }

  async getAdminSchedulerStats(days: number): Promise<any> {
    const response: AxiosResponse<any> = await this.client.get(
      `/admin/scheduler/stats?days=${days}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`,
        },
      }
    );
    return response.data;
  }

  // Email verification methods
  async sendVerificationEmail(): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.post(
      '/auth/send-verification-email'
    );
    return response.data;
  }

  async getVerificationStatus(): Promise<{
    isVerified: boolean;
    hasActiveToken: boolean;
    expiresAt?: string;
  }> {
    const response: AxiosResponse<{
      isVerified: boolean;
      hasActiveToken: boolean;
      expiresAt?: string;
    }> = await this.client.get('/auth/verification-status');
    return response.data;
  }
}

export const apiClient = new ApiClient();