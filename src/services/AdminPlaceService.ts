import axiosInstance from '../utils/headerApi';

export interface PlaceItem {
    id: string;
    title: string;
    description: string;
    address: string;
    administrativeUnitId: string;
    latitude: number | null;
    longitude: number | null;
    categoryIds: string[];
    tags: string[];
    moderationStatus: number;
    createdBy: string;
    approvedBy: string | null;
    approvedAt: string | null;
    averageRating: number;
    distanceKm: number | null;
    images: MediaAsset[];
    createdAt: string;
    updatedAt: string;
}

export interface MediaAsset {
    id: string;
    url: string;
    publicId: string;
    isPrimary: boolean;
    sortOrder: number;
}

export interface CreatePlacePayload {
    title: string;
    description: string;
    address: string;
    administrativeUnitId: string;
    latitude: number | null;
    longitude: number | null;
    categoryIds: string[];
    tags: string[];
}

export interface UpdatePlacePayload extends CreatePlacePayload {}

export interface PaginatedResponse<T> {
    items: T[];
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

const AdminPlaceService = {
    getAll: async (page: number = 1, size: number = 10): Promise<ApiResponse<PaginatedResponse<PlaceItem>>> => {
        const response = await axiosInstance.get<ApiResponse<PaginatedResponse<PlaceItem>>>(
            `/api/places/all?PageNumber=${page}&PageSize=${size}`
        );
        return response.data;
    },

    getById: async (id: string): Promise<ApiResponse<PlaceItem>> => {
        const response = await axiosInstance.get<ApiResponse<PlaceItem>>(`/api/places/${id}`);
        return response.data;
    },

    create: async (payload: CreatePlacePayload): Promise<ApiResponse<PlaceItem>> => {
        const response = await axiosInstance.post<ApiResponse<PlaceItem>>('/api/places', payload);
        return response.data;
    },

    update: async (id: string, payload: UpdatePlacePayload): Promise<ApiResponse<PlaceItem>> => {
        const response = await axiosInstance.put<ApiResponse<PlaceItem>>(`/api/places/${id}`, payload);
        return response.data;
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const response = await axiosInstance.delete<ApiResponse<null>>(`/api/places/${id}`);
        return response.data;
    },
};

export default AdminPlaceService;
