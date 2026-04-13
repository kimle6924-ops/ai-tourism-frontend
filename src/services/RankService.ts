import axiosInstance from '../utils/headerApi';

export interface LeaderboardUser {
  rank: number;
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  totalScore: number;
  totalReviews: number;
  avgScorePerReview: number;
}

export interface LeaderboardParams {
  PageNumber?: number;
  PageSize?: number;
}

export interface LeaderboardResponse {
  data: {
    items: LeaderboardUser[];
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

const RankService = {
  getLeaderboardUsers: async (
    params: LeaderboardParams = { PageNumber: 1, PageSize: 10 }
  ): Promise<LeaderboardResponse> => {
    try {
      console.log('[RankService] getLeaderboardUsers → params:', params);
      const res = await axiosInstance.get<LeaderboardResponse>('/api/leaderboard/users', { params });
      console.log('[RankService] getLeaderboardUsers ← status:', res.status, 'data:', res.data);
      return res.data;
    } catch (err: any) {
      console.error('[RankService] getLeaderboardUsers ERROR:');
      console.error('  status :', err.response?.status);
      console.error('  url    :', err.config?.url);
      console.error('  params :', err.config?.params);
      console.error('  body   :', err.response?.data);
      throw err;
    }
  },
};

export default RankService;
