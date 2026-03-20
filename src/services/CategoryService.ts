import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export interface Category {
    id: string;
    name: string;
    slug: string;
    type: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface CategoryListResponse {
    data: {
        items: Category[];
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

const CategoryService = {
    getCategories: async (pageNumber = 1, pageSize = 50): Promise<CategoryListResponse> => {
        const res = await axios.get<CategoryListResponse>(
            `${BASE_URL}/api/categories`,
            { params: { PageNumber: pageNumber, PageSize: pageSize } },
        );
        return res.data;
    },
};

export default CategoryService;
