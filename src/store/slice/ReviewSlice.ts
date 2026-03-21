import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ReviewService from '../../services/ReviewService';
import type { ReviewItem, CreateReviewData } from '../../services/ReviewService';

interface ReviewState {
    items: ReviewItem[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
    posting: boolean;
    postError: string | null;
}

const initialState: ReviewState = {
    items: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    loading: false,
    error: null,
    posting: false,
    postError: null,
};

export const fetchReviewsThunk = createAsyncThunk(
    'reviews/fetch',
    async ({ resourceType, resourceId, page = 1 }: { resourceType: number, resourceId: string, page?: number }, { rejectWithValue }) => {
        try {
            return await ReviewService.getReviews(resourceType, resourceId, page, 10);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi tải đánh giá');
        }
    }
);

export const createReviewThunk = createAsyncThunk(
    'reviews/create',
    async (data: CreateReviewData, { rejectWithValue, dispatch }) => {
        try {
            const res = await ReviewService.createReview(data);
            if (res.success) {
                await dispatch(fetchReviewsThunk({ resourceType: data.resourceType, resourceId: data.resourceId, page: 1 }));
                return res.data;
            }
            return rejectWithValue('Lỗi thêm đánh giá');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi thêm đánh giá');
        }
    }
);

const reviewSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        clearReviews: (state) => {
            state.items = [];
            state.totalCount = 0;
            state.currentPage = 1;
            state.totalPages = 1;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReviewsThunk.pending, (state, action) => {
                state.loading = true;
                if (action.meta.arg.page === 1) {
                    state.items = [];
                }
            })
            .addCase(fetchReviewsThunk.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.success) {
                    const reviewData = action.payload.data.reviews;
                    if (reviewData.pageNumber === 1) {
                        state.items = reviewData.items;
                    } else {
                        state.items = [...state.items, ...reviewData.items];
                    }
                    state.totalCount = reviewData.totalCount;
                    state.totalPages = reviewData.totalPages;
                    state.currentPage = reviewData.pageNumber;
                }
            })
            .addCase(fetchReviewsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createReviewThunk.pending, (state) => {
                state.posting = true;
                state.postError = null;
            })
            .addCase(createReviewThunk.fulfilled, (state) => {
                state.posting = false;
                state.postError = null;
            })
            .addCase(createReviewThunk.rejected, (state, action) => {
                state.posting = false;
                state.postError = action.payload as string;
            });
    }
});

export const { clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
