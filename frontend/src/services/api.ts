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
  private baseURL = 'http://localhost:3000';

  constructor() {
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
          // Handle unauthorized - redirect to login
          localStorage.removeItem('accessToken');
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
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
}

export const apiClient = new ApiClient();