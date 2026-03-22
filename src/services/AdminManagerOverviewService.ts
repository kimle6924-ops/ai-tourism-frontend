import axiosInstance from '../utils/headerApi';

export interface OverviewStats {
    generatedAtUtc: string;
    range: {
        fromUtc: string;
        toUtc: string;
        granularity: string;
    };
    users: {
        total: number;
        admins: number;
        contributors: number;
        regularUsers: number;
        active: number;
        locked: number;
        pendingApproval: number;
        byRole: Record<string, number>;
        byStatus: Record<string, number>;
    };
    places: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        byModerationStatus: Record<string, number>;
    };
    events: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        upcoming: number;
        ongoing: number;
        ended: number;
        byModerationStatus: Record<string, number>;
        byEventStatus: Record<string, number>;
    };
    reviews: {
        total: number;
        active: number;
        hidden: number;
        deleted: number;
        averageRating: number;
        byStatus: Record<string, number>;
    };
    moderation: {
        pendingPlaces: number;
        pendingEvents: number;
        totalPending: number;
    };
    chat: {
        totalConversations: number;
        totalMessages: number;
        newConversationsInRange: number;
        newMessagesInRange: number;
    };
    content: {
        categories: number;
        administrativeUnits: number;
        mediaAssets: number;
        totalMediaBytes: number;
    };
    timeSeries: {
        users: { date: string; count: number }[];
        places: { date: string; count: number }[];
        events: { date: string; count: number }[];
        reviews: { date: string; count: number }[];
    };
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    error: string | null;
    errorCode: string | null;
    statusCode: number;
    errors: any;
}

const AdminManagerOverviewService = {
    getOverviewStats: async (fromUtc?: string, toUtc?: string): Promise<ApiResponse<OverviewStats>> => {
        let url = `/api/Admin/stats/overview`;
        const params = new URLSearchParams();
        if (fromUtc) params.append('FromUtc', fromUtc);
        if (toUtc) params.append('ToUtc', toUtc);
        
        const query = params.toString();
        if (query) url += `?${query}`;

        const response = await axiosInstance.get<ApiResponse<OverviewStats>>(url);
        return response.data;
    }
};

export default AdminManagerOverviewService;
