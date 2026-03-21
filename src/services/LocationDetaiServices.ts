import axiosInstance from '../utils/headerApi';
import type { Place } from './PlacesServices';

export interface LocationDetailResponse {
    data: Place;
    success: boolean;
    error: string | null;
}

const LocationDetaiServices = {
    getPlaceDetail: async (id: string): Promise<LocationDetailResponse> => {
        const res = await axiosInstance.get<LocationDetailResponse>(`/api/places/${id}`);
        return res.data;
    },
    getEventDetail: async (id: string): Promise<LocationDetailResponse> => {
        const res = await axiosInstance.get<LocationDetailResponse>(`/api/events/${id}`);
        return res.data;
    }
};

export default LocationDetaiServices;
