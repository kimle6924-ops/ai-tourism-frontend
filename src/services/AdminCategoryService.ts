import axiosInstance from '../utils/headerApi';
import type { ApiResponse, PaginatedResponse } from './AdminPlaceService';
import type { Category } from './CategoryService';

export interface CreateCategoryPayload {
    name: string;
    slug: string;
    type: string;
}

export interface UpdateCategoryPayload {
    name: string;
    slug: string;
    type: string;
    isActive: boolean;
}

const AdminCategoryService = {
    getAll: async (page: number = 1, size: number = 50): Promise<ApiResponse<PaginatedResponse<Category>>> => {
        const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Category>>>(
            `/api/categories?PageNumber=${page}&PageSize=${size}`
        );
        return response.data;
    },

    getById: async (id: string): Promise<ApiResponse<Category>> => {
        const response = await axiosInstance.get<ApiResponse<Category>>(`/api/categories/${id}`);
        return response.data;
    },

    create: async (payload: CreateCategoryPayload): Promise<ApiResponse<Category>> => {
        const response = await axiosInstance.post<ApiResponse<Category>>('/api/categories', payload);
        return response.data;
    },

    update: async (id: string, payload: UpdateCategoryPayload): Promise<ApiResponse<Category>> => {
        const response = await axiosInstance.put<ApiResponse<Category>>(`/api/categories/${id}`, payload);
        return response.data;
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const response = await axiosInstance.delete<ApiResponse<null>>(`/api/categories/${id}`);
        return response.data;
    },
};

export default AdminCategoryService;
