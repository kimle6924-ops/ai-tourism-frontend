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

export interface AvatarUploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export interface FinalizeAvatarRequest {
  publicId: string;
  url: string;
  secureUrl: string;
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

  getAvatarUploadSignature: async (): Promise<ApiResponse<AvatarUploadSignature>> => {
    const response = await axiosInstance.post<ApiResponse<AvatarUploadSignature>>('/api/user/me/avatar/upload-signature');
    return response.data;
  },

  finalizeAvatarUpload: async (payload: FinalizeAvatarRequest): Promise<ApiResponse<UserProfile>> => {
    const response = await axiosInstance.post<ApiResponse<UserProfile>>('/api/user/me/avatar/finalize', payload);
    return response.data;
  },
};

export default ProfileService;
