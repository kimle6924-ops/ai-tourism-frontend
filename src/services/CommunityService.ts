import axiosInstance from '../utils/headerApi';
import type { ApiResponse, PaginatedResponse } from './AdminPlaceService';

export interface CommunityGroupResponse {
    id: string;
    name: string;
    slug: string;
    description: string;
    isPublic: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CommunityPostMediaResponse {
    id: string;
    postId: string;
    url: string;
    secureUrl: string;
    publicId: string;
    format: string;
    mimeType: string;
    bytes: number;
    width: number;
    height: number;
    sortOrder: number;
    createdAt: string;
}

export interface CommunityCommentResponse {
    id: string;
    postId: string;
    userId: string;
    userFullName: string;
    userAvatarUrl: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface CommunityPostResponse {
    id: string;
    groupId: string;
    userId: string;
    userFullName: string;
    userAvatarUrl: string;
    content: string;
    reactionCount: number;
    commentCount: number;
    media: CommunityPostMediaResponse[];
    comments: CommunityCommentResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface CommunityPostUploadSignatureResponse {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
}

export interface FinalizeCommunityPostMediaPayload {
    postId: string;
    publicId: string;
    url: string;
    secureUrl: string;
    format: string;
    mimeType: string;
    bytes: number;
    width: number;
    height: number;
}

export interface CloudinaryUploadResponse {
    public_id: string;
    url: string;
    secure_url: string;
    format: string;
    bytes: number;
    width: number;
    height: number;
    resource_type: string;
    error?: {
        message?: string;
    };
}

const CommunityService = {
    getPublicGroup: async (): Promise<ApiResponse<CommunityGroupResponse>> => {
        const response = await axiosInstance.get<ApiResponse<CommunityGroupResponse>>('/api/community/group/public');
        return response.data;
    },

    getPublicPosts: async (pageNumber: number, pageSize: number): Promise<ApiResponse<PaginatedResponse<CommunityPostResponse>>> => {
        const response = await axiosInstance.get<ApiResponse<PaginatedResponse<CommunityPostResponse>>>(
            `/api/community/group/public/posts?PageNumber=${pageNumber}&PageSize=${pageSize}`,
        );
        return response.data;
    },

    getPostById: async (postId: string): Promise<ApiResponse<CommunityPostResponse>> => {
        const response = await axiosInstance.get<ApiResponse<CommunityPostResponse>>(`/api/community/posts/${postId}`);
        return response.data;
    },

    createPublicPost: async (content: string): Promise<ApiResponse<CommunityPostResponse>> => {
        const response = await axiosInstance.post<ApiResponse<CommunityPostResponse>>('/api/community/group/public/posts', {
            content,
        });
        return response.data;
    },

    getPostUploadSignature: async (postId: string): Promise<ApiResponse<CommunityPostUploadSignatureResponse>> => {
        const response = await axiosInstance.post<ApiResponse<CommunityPostUploadSignatureResponse>>('/api/community/posts/upload-signature', {
            postId,
        });
        return response.data;
    },

    uploadToCloudinary: async (file: File, signature: CommunityPostUploadSignatureResponse): Promise<CloudinaryUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signature.apiKey);
        formData.append('timestamp', signature.timestamp.toString());
        formData.append('signature', signature.signature);
        formData.append('folder', signature.folder);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
            { method: 'POST', body: formData },
        );

        return response.json() as Promise<CloudinaryUploadResponse>;
    },

    finalizePostMedia: async (payload: FinalizeCommunityPostMediaPayload): Promise<ApiResponse<CommunityPostMediaResponse>> => {
        const response = await axiosInstance.post<ApiResponse<CommunityPostMediaResponse>>('/api/community/posts/finalize-media', payload);
        return response.data;
    },

    addComment: async (postId: string, content: string): Promise<ApiResponse<CommunityCommentResponse>> => {
        const response = await axiosInstance.post<ApiResponse<CommunityCommentResponse>>(`/api/community/posts/${postId}/comments`, {
            content,
        });
        return response.data;
    },
};

export default CommunityService;
