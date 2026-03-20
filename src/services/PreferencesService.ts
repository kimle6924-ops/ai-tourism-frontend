import axiosInstance from '../utils/headerApi';

export interface PreferencesData {
    categoryIds: string[];
}

interface PreferencesResponse {
    data: PreferencesData;
    success: boolean;
    error: string | null;
    errorCode: string | null;
    statusCode: number;
    errors: unknown | null;
}

const PreferencesService = {
    getPreferences: async (): Promise<PreferencesResponse> => {
        const res = await axiosInstance.get<PreferencesResponse>('/api/User/me/preferences');
        return res.data;
    },

    updatePreferences: async (categoryIds: string[]): Promise<PreferencesResponse> => {
        const res = await axiosInstance.put<PreferencesResponse>('/api/User/me/preferences', {
            categoryIds,
        });
        return res.data;
    },
};

export default PreferencesService;
