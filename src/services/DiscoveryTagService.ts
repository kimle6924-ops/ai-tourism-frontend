import axiosInstance from '../utils/headerApi';

export interface DiscoveryTagResponse {
    data: string[];
    success: boolean;
    error: string | null;
    errorCode: string | null;
    statusCode: number;
    errors: unknown | null;
}

const DiscoveryTagService = {
    getTags: async (): Promise<DiscoveryTagResponse> => {
        try {
            console.log('[DiscoveryTagService] getTags');
            const res = await axiosInstance.get<DiscoveryTagResponse>('/api/discovery/tags');
            console.log('[DiscoveryTagService] getTags ← status:', res.status, 'tags count:', res.data?.data?.length);
            return res.data;
        } catch (err: any) {
            console.error('[DiscoveryTagService] getTags ERROR:');
            console.error('  status :', err.response?.status);
            console.error('  url    :', err.config?.url);
            console.error('  body   :', err.response?.data);
            throw err;
        }
    },
};

export default DiscoveryTagService;
