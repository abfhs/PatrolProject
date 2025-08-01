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
  CheckProcessResponse
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
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
      }
    );
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.client.post(
      '/auth/register/email',
      userData
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
}

export const apiClient = new ApiClient();