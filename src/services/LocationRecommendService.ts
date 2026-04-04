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
    try {
      console.log('[LocationRecommend] getRecommendPlaces → params:', params);
      const res = await axiosInstance.get<LocationRecommendResponse>('/api/discovery/recommend/places', { params });
      console.log('[LocationRecommend] getRecommendPlaces ← status:', res.status, 'data:', res.data);
      return res.data;
    } catch (err: any) {
      console.error('[LocationRecommend] getRecommendPlaces ERROR:');
      console.error('  status :', err.response?.status);
      console.error('  url    :', err.config?.url);
      console.error('  params :', err.config?.params);
      console.error('  body   :', err.response?.data);
      throw err;
    }
  },
  getRecommendEvents: async (params: LocationRecommendParams = { MaxDistanceKm: 3000, PageNumber: 1, PageSize: 8 }): Promise<LocationRecommendResponse> => {
    try {
      console.log('[LocationRecommend] getRecommendEvents → params:', params);
      const res = await axiosInstance.get<LocationRecommendResponse>('/api/discovery/recommend/events', { params });
      console.log('[LocationRecommend] getRecommendEvents ← status:', res.status, 'data:', res.data);
      return res.data;
    } catch (err: any) {
      console.error('[LocationRecommend] getRecommendEvents ERROR:');
      console.error('  status :', err.response?.status);
      console.error('  url    :', err.config?.url);
      console.error('  params :', err.config?.params);
      console.error('  body   :', err.response?.data);
      throw err;
    }
  }
};

export default LocationRecommendService;

