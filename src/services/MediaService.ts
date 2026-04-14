import axiosInstance from '../utils/headerApi';
import type { ApiResponse } from './AdminPlaceService';
import type { ResourceType } from './ModerationService';

export interface UploadSignatureResponse {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
}

export interface FinalizeUploadPayload {
    resourceType: ResourceType;
    resourceId: string;
    publicId: string;
    url: string;
    secureUrl: string;
    format: string;
    mimeType: string;
    bytes: number;
    width: number;
    height: number;
}

export interface MediaAssetFull {
    id: string;
    resourceType: ResourceType;
    resourceId: string;
    url: string;
    secureUrl: string;
    publicId: string;
    format: string;
    mimeType: string;
    bytes: number;
    width: number;
    height: number;
    isPrimary: boolean;
    sortOrder: number;
    uploadedBy: string;
    createdAt: string;
}

const MediaService = {
    getSignature: async (resourceType: ResourceType, resourceId: string): Promise<ApiResponse<UploadSignatureResponse>> => {
        const response = await axiosInstance.post<ApiResponse<UploadSignatureResponse>>(
            '/api/media/upload-signature',
            { resourceType, resourceId }
        );
        return response.data;
    },

    getReviewSignature: async (): Promise<ApiResponse<UploadSignatureResponse>> => {
        const response = await axiosInstance.post<ApiResponse<UploadSignatureResponse>>(
            '/api/reviews/upload-signature'
        );
        return response.data;
    },

    finalize: async (payload: FinalizeUploadPayload): Promise<ApiResponse<MediaAssetFull>> => {
        const response = await axiosInstance.post<ApiResponse<MediaAssetFull>>(
            '/api/media/finalize', payload
        );
        return response.data;
    },

    getByResource: async (resourceType: ResourceType, resourceId: string): Promise<ApiResponse<MediaAssetFull[]>> => {
        const response = await axiosInstance.get<ApiResponse<MediaAssetFull[]>>(
            `/api/media/by-resource?resourceType=${resourceType}&resourceId=${resourceId}`
        );
        return response.data;
    },

    setPrimary: async (id: string): Promise<ApiResponse<null>> => {
        const response = await axiosInstance.patch<ApiResponse<null>>(`/api/media/${id}/set-primary`);
        return response.data;
    },

    reorder: async (orderedIds: string[]): Promise<ApiResponse<null>> => {
        const response = await axiosInstance.patch<ApiResponse<null>>(
            '/api/media/reorder',
            { orderedIds }
        );
        return response.data;
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const response = await axiosInstance.delete<ApiResponse<null>>(`/api/media/${id}`);
        return response.data;
    },

    // Upload file trực tiếp lên Cloudinary (client-side)
    uploadToCloudinary: async (file: File, sig: UploadSignatureResponse): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', sig.apiKey);
        formData.append('timestamp', sig.timestamp.toString());
        formData.append('signature', sig.signature);
        formData.append('folder', sig.folder);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
            { method: 'POST', body: formData }
        );
        return response.json();
    },
};

export default MediaService;
