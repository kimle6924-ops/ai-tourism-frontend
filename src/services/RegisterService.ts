import axiosInstance from '../utils/headerApi';
import type { ApiResponse, LoginResponseData } from './LoginService';

// ─────────────────────────────────────────────
// Request type
// ─────────────────────────────────────────────
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: number;
  contributorType?: number;
  administrativeUnitId?: string;
  categoryIds: string[];
}

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────
const RegisterService = {
  register: async (payload: RegisterRequest): Promise<ApiResponse<LoginResponseData>> => {
    const response = await axiosInstance.post<ApiResponse<LoginResponseData>>(
      '/api/Auth/register',
      payload,
    );
    return response.data;
  },
};

export default RegisterService;
