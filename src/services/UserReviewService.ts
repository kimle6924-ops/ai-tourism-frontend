import axiosInstance from '../utils/headerApi';
import type { ApiResponse } from './AdminPlaceService';

export interface UserReviewItem {
  id: string;
  resourceType: 0 | 1;
  resourceId: string;
  userId: string;
  userFullName: string;
  userAvatarUrl: string;
  rating: number;
  comment: string;
  imageUrl: string | null;
  status: number;
  createdAt: string;
  updatedAt: string;
  resourceTitle: string;
  resourceAddress: string;
  resourceImageUrl: string;
}

export interface PaginatedReviews {
  items: UserReviewItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

const UserReviewService = {
  getHistory: async (resourceType: 0 | 1, page = 1, size = 10): Promise<ApiResponse<PaginatedReviews>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedReviews>>(
      `/api/reviews/me/history?PageNumber=${page}&PageSize=${size}&resourceType=${resourceType}`
    );
    return response.data;
  },
};

export default UserReviewService;
