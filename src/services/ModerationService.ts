import axiosInstance from '../utils/headerApi';
import type { ApiResponse } from './AdminPlaceService';

// ResourceType: 0 = Place, 1 = Event
export type ResourceType = 0 | 1;

export interface ModerationLog {
    id: string;
    resourceType: ResourceType;
    resourceId: string;
    action: string;
    note: string;
    actedBy: string;
    actedAt: string;
}

export interface ModerationActionPayload {
    note: string;
}

const ModerationService = {
    approve: async (resourceType: ResourceType, id: string, payload: ModerationActionPayload): Promise<ApiResponse<null>> => {
        const response = await axiosInstance.patch<ApiResponse<null>>(
            `/api/moderation/${resourceType}/${id}/approve`, payload
        );
        return response.data;
    },

    reject: async (resourceType: ResourceType, id: string, payload: ModerationActionPayload): Promise<ApiResponse<null>> => {
        const response = await axiosInstance.patch<ApiResponse<null>>(
            `/api/moderation/${resourceType}/${id}/reject`, payload
        );
        return response.data;
    },

    getLogs: async (resourceType: ResourceType, id: string): Promise<ApiResponse<ModerationLog[]>> => {
        const response = await axiosInstance.get<ApiResponse<ModerationLog[]>>(
            `/api/moderation/${resourceType}/${id}/logs`
        );
        return response.data;
    },
};

export default ModerationService;
