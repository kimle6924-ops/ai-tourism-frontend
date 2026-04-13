import axiosInstance from '../utils/headerApi';
import type { Place } from './PlacesServices';

export interface TourismTagParams {
  Tag?: string[];
  RadiusKm?: number;
  PageNumber?: number;
  PageSize?: number;
}

export interface TourismPlacesResponse {
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

const TourismService = {
  getPlacesByTag: async (params: TourismTagParams): Promise<TourismPlacesResponse> => {
    try {
      console.log('[TourismService] getPlacesByTag → params:', params);
      const queryParams = new URLSearchParams();
      if (params.Tag && params.Tag.length > 0) {
        params.Tag.forEach(tag => queryParams.append('Tag', tag));
      }
      // Provide default RadiusKm if none given, or omit to rely on backend
      const radius = params.RadiusKm ?? 3000;
      queryParams.append('RadiusKm', radius.toString());
      if (params.PageNumber) queryParams.append('PageNumber', params.PageNumber.toString());
      if (params.PageSize) queryParams.append('PageSize', params.PageSize.toString());

      const res = await axiosInstance.get<TourismPlacesResponse>(`/api/discovery/places/by-location-tag?${queryParams.toString()}`);
      return res.data;
    } catch (err: any) {
      console.error('[TourismService] getPlacesByTag ERROR:', err);
      throw err;
    }
  }
};

export default TourismService;
