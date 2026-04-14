import axiosInstance from '../utils/headerApi';

export interface ReviewItem {
    id: string;
    resourceType: number;
    resourceId: string;
    userId: string;
    userFullName?: string;
    userAvatarUrl?: string;
    rating: number;
    comment: string;
    imageUrl?: string;
    status: number;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewListResponse {
    data: {
        averageRating: number;
        totalReviews: number;
        reviews: {
            items: ReviewItem[];
            totalCount: number;
            pageNumber: number;
            pageSize: number;
            totalPages: number;
            hasPreviousPage: boolean;
            hasNextPage: boolean;
        };
    };
    success: boolean;
}

export interface CreateReviewData {
    resourceType: number;
    resourceId: string;
    rating: number;
    comment: string;
    imageUrl?: string;
}

export interface AdminReviewListResponse {
    data: {
        items: ReviewItem[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        hasPreviousPage: boolean;
        hasNextPage: boolean;
    };
    success: boolean;
    error: string | null;
}

const ReviewService = {
    getReviews: async (resourceType: number, resourceId: string, pageNumber: number = 1, pageSize: number = 10) => {
        const res = await axiosInstance.get<ReviewListResponse>(`/api/reviews`, {
            params: { resourceType, resourceId, PageNumber: pageNumber, PageSize: pageSize }
        });
        return res.data;
    },
    createReview: async (data: CreateReviewData) => {
        const res = await axiosInstance.post<{ success: boolean; data: ReviewItem }>(`/api/reviews`, data);
        return res.data;
    },
    getAllReviews: async (pageNumber: number = 1, pageSize: number = 10, status?: number) => {
        const params: any = { PageNumber: pageNumber, PageSize: pageSize };
        if (status !== undefined) params.status = status;
        const res = await axiosInstance.get<AdminReviewListResponse>(`/api/reviews/all`, { params });
        return res.data;
    },
    approveReview: async (id: string) => {
        const res = await axiosInstance.patch<{ success: boolean; error: string | null }>(`/api/reviews/${id}/approve`);
        return res.data;
    },
    hideReview: async (id: string) => {
        const res = await axiosInstance.patch<{ success: boolean; error: string | null }>(`/api/reviews/${id}/hide`);
        return res.data;
    },
    deleteReview: async (id: string) => {
        const res = await axiosInstance.delete<{ success: boolean; error: string | null }>(`/api/reviews/${id}`);
        return res.data;
    },
}

export default ReviewService;
