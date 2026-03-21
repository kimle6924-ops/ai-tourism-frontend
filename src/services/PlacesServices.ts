import axiosInstance from '../utils/headerApi';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface PlaceImage {
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

export interface Place {
    id: string;
    title: string;
    description: string;
    address: string;
    administrativeUnitId: string;
    latitude: number;
    longitude: number;
    categoryIds: string[];
    tags: string[];
    moderationStatus: number;
    averageRating: number;
    distanceKm?: number | null;
    images?: PlaceImage[];
    createdBy: string;
    approvedBy: string;
    approvedAt: string;
    createdAt: string;
    updatedAt: string;
}

interface PlaceListResponse {
    data: {
        items: Place[];
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

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────
const PlacesService = {
    getPlaces: async (pageNumber = 1, pageSize = 8): Promise<PlaceListResponse> => {
        const res = await axiosInstance.get<PlaceListResponse>('/api/places', {
            params: { PageNumber: pageNumber, PageSize: pageSize },
        });
        return res.data;
    },
};

export default PlacesService;
