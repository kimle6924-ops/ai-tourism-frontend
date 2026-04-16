import axiosInstance from '../utils/headerApi';
import type { MediaAsset, PaginatedResponse, ApiResponse, AdminPlaceListParams } from './AdminPlaceService';

export interface EventItem {
    id: string;
    title: string;
    description: string;
    address: string;
    administrativeUnitId: string;
    latitude: number | null;
    longitude: number | null;
    categoryIds: string[];
    tags: string[];
    startAt: string;
    endAt: string;
    scheduleType: number;
    startMonth: number | null;
    startDay: number | null;
    endMonth: number | null;
    endDay: number | null;
    eventStatus: number;
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

export interface CreateEventPayload {
    title: string;
    description: string;
    address: string;
    administrativeUnitId: string;
    latitude: number | null;
    longitude: number | null;
    categoryIds: string[];
    tags: string[];
    startAt: string;
    endAt: string;
    scheduleType: number;
    startMonth: number | null;
    startDay: number | null;
    endMonth: number | null;
    endDay: number | null;
}

export interface UpdateEventPayload extends CreateEventPayload {
    eventStatus: number;
}

const AdminEventService = {
    getAll: async ({
        page = 1,
        size = 10,
        provinceId,
        wardId,
        q,
    }: AdminPlaceListParams = {}): Promise<ApiResponse<PaginatedResponse<EventItem>>> => {
        const response = await axiosInstance.get<ApiResponse<PaginatedResponse<EventItem>>>(
            '/api/events/all',
            {
                params: {
                    PageNumber: page,
                    PageSize: size,
                    ProvinceId: provinceId || undefined,
                    WardId: wardId || undefined,
                    Q: q?.trim() || undefined,
                },
            }
        );
        return response.data;
    },

    getById: async (id: string): Promise<ApiResponse<EventItem>> => {
        const response = await axiosInstance.get<ApiResponse<EventItem>>(`/api/events/${id}`);
        return response.data;
    },

    create: async (payload: CreateEventPayload): Promise<ApiResponse<EventItem>> => {
        const response = await axiosInstance.post<ApiResponse<EventItem>>('/api/events', payload);
        return response.data;
    },

    update: async (id: string, payload: UpdateEventPayload): Promise<ApiResponse<EventItem>> => {
        const response = await axiosInstance.put<ApiResponse<EventItem>>(`/api/events/${id}`, payload);
        return response.data;
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const response = await axiosInstance.delete<ApiResponse<null>>(`/api/events/${id}`);
        return response.data;
    },
};

export default AdminEventService;
