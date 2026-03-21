import axiosInstance from '../utils/headerApi';
import type { Place } from './PlacesServices';

export interface DiscoveryParams {
    Search?: string;
    SortBy?: string;
    AverageRating?: number;
    PageNumber?: number;
    PageSize?: number;
}

export interface DiscoveryListResponse {
    data: {
        items: Place[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        hasPreviousPage: boolean;
        hasNextPage: boolean;
    };
    success: boolean;
    error: string | null;
    errorCode: string | null;
    statusCode: number;
    errors: unknown | null;
}

const DiscoveryService = {
    getPlaces: async (params: DiscoveryParams): Promise<DiscoveryListResponse> => {
        const res = await axiosInstance.get<DiscoveryListResponse>('/api/discovery/search/places', {
            params,
        });
        return res.data;
    },
    getEvents: async (params: DiscoveryParams): Promise<DiscoveryListResponse> => {
        const res = await axiosInstance.get<DiscoveryListResponse>('/api/discovery/search/events', {
            params,
        });
        return res.data;
    },
};

export default DiscoveryService;
