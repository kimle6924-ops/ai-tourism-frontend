import axiosInstance from '../utils/headerApi';
import type { Place } from './PlacesServices';

export interface LocationRecommendParams {
  MaxDistanceKm?: number;
  PageNumber?: number;
  PageSize?: number;
}

export interface LocationRecommendResponse {
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

const LocationRecommendService = {
  getRecommendPlaces: async (params: LocationRecommendParams = { MaxDistanceKm: 3000, PageNumber: 1, PageSize: 8 }): Promise<LocationRecommendResponse> => {
    const res = await axiosInstance.get<LocationRecommendResponse>('/api/discovery/recommend/places', { params });
    return res.data;
  },
  getRecommendEvents: async (params: LocationRecommendParams = { MaxDistanceKm: 3000, PageNumber: 1, PageSize: 8 }): Promise<LocationRecommendResponse> => {
    const res = await axiosInstance.get<LocationRecommendResponse>('/api/discovery/recommend/events', { params });
    return res.data;
  }
};

export default LocationRecommendService;
