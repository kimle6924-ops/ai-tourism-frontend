import axiosInstance from '../utils/headerApi';

export interface LocationRequest {
  latitude: number | string;
  longitude: number | string;
}

export interface LocationUserResponse {
    data: {
        id: string;
        email: string;
        fullName: string;
        phone: string;
        avatarUrl: string;
        role: number;
        status: number;
        latitude: number;
        longitude: number;
    };
    success: boolean;
    error: string | null;
    errorCode: string | null;
    statusCode: number;
    errors: unknown | null;
}

const LocationUserService = {
  updateLocation: async (payload: LocationRequest): Promise<LocationUserResponse> => {
    const response = await axiosInstance.put<LocationUserResponse>('/api/User/me/location', payload);
    return response.data;
  },
};

export default LocationUserService;
