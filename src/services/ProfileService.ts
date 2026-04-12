import axiosInstance from '../utils/headerApi';
import type { ApiResponse } from './LoginService';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  role: number;
  status: number;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdateProfileRequest {
  email?: string;
  fullName?: string;
  phone?: string;
}

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────
const ProfileService = {
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await axiosInstance.get<ApiResponse<UserProfile>>('/api/User/me');
    return response.data;
  },

  updateProfile: async (payload: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> => {
    const response = await axiosInstance.put<ApiResponse<UserProfile>>('/api/User/me/account', payload);
    return response.data;
  },
};

export default ProfileService;
