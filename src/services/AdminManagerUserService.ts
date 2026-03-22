import axiosInstance from '../utils/headerApi';

export interface AdminUser {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    avatarUrl: string;
    role: number;
    status: number;
    latitude: number | null;
    longitude: number | null;
}

export interface PaginatedUsersResponse {
    items: AdminUser[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    error: string | null;
    errorCode: string | null;
    statusCode: number;
    errors: any;
}

const AdminManagerUserService = {
    getUsers: async (pageNumber: number = 1, pageSize: number = 50): Promise<ApiResponse<PaginatedUsersResponse>> => {
        const response = await axiosInstance.get<ApiResponse<PaginatedUsersResponse>>(
            `/api/Admin/users?PageNumber=${pageNumber}&PageSize=${pageSize}`
        );
        return response.data;
    },

    lockUser: async (id: string): Promise<ApiResponse<null>> => {
        const response = await axiosInstance.patch<ApiResponse<null>>(`/api/Admin/users/${id}/lock`);
        return response.data;
    },

    unlockUser: async (id: string): Promise<ApiResponse<null>> => {
        const response = await axiosInstance.patch<ApiResponse<null>>(`/api/Admin/users/${id}/unlock`);
        return response.data;
    },

    approveUser: async (id: string): Promise<ApiResponse<null>> => {
        const response = await axiosInstance.patch<ApiResponse<null>>(`/api/Admin/users/${id}/approve`);
        return response.data;
    }
};

export default AdminManagerUserService;
