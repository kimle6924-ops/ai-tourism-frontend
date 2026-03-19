import axiosInstance from '../utils/headerApi';

// ─────────────────────────────────────────────
// Request / Response types
// ─────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  role: number;
  status: number;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfo;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error: string | null;
  statusCode: number;
}

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────
const LoginService = {
  login: async (payload: LoginRequest): Promise<ApiResponse<LoginResponseData>> => {
    const response = await axiosInstance.post<ApiResponse<LoginResponseData>>(
      '/api/Auth/login',
      payload,
    );
    return response.data;
  },
};

export default LoginService;
