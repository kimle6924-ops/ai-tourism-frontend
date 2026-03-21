import axiosInstance from '../utils/headerApi';

export interface ReviewItem {
    id: string;
    resourceType: number;
    resourceId: string;
    userId: string;
    userFullName?: string;
    rating: number;
    comment: string;
    createdAt: string;
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
    }
}

export default ReviewService;
