import axiosInstance from '../utils/headerApi';

export type TimelineFilter = 'ongoing' | 'upcoming' | 'both';

export interface EventImage {
  id: string;
  resourceType: number;
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

export interface EventItem {
  id: string;
  title: string;
  description: string;
  address: string;
  administrativeUnitId: string;
  latitude: number;
  longitude: number;
  categoryIds: string[];
  tags: string[];
  scheduleType: number;
  startAt: string | null;
  endAt: string | null;
  startMonth: number | null;
  startDay: number | null;
  endMonth: number | null;
  endDay: number | null;
  eventStatus: number; // 0 = upcoming, 1 = ongoing
  moderationStatus: number;
  createdBy: string;
  approvedBy: string;
  approvedAt: string;
  averageRating: number;
  distanceKm: number;
  images: EventImage[];
  createdAt: string;
  updatedAt: string;
}

export interface EventTimelineParams {
  Timeline?: TimelineFilter;
  RadiusKm?: number;
  PageNumber?: number;
  PageSize?: number;
}

export interface EventTimelineResponse {
  data: {
    items: EventItem[];
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

const EventService = {
  getTimeline: async (
    params: EventTimelineParams = { Timeline: 'both', RadiusKm: 3000, PageNumber: 1, PageSize: 16 }
  ): Promise<EventTimelineResponse> => {
    try {
      console.log('[EventService] getTimeline → params:', params);
      const res = await axiosInstance.get<EventTimelineResponse>('/api/discovery/events/timeline', { params });
      console.log('[EventService] getTimeline ← status:', res.status, 'totalCount:', res.data?.data?.totalCount);
      return res.data;
    } catch (err: any) {
      console.error('[EventService] getTimeline ERROR:');
      console.error('  status :', err.response?.status);
      console.error('  url    :', err.config?.url);
      console.error('  params :', err.config?.params);
      console.error('  body   :', err.response?.data);
      throw err;
    }
  },
};

export default EventService;
