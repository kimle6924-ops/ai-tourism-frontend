import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import ReviewService from '../../services/ReviewService';
import type { ReviewItem } from '../../services/ReviewService';

interface AdminReviewState {
    reviews: ReviewItem[];
    totalCount: number;
    pageNumber: number;
    totalPages: number;
    loading: boolean;
    actionLoading: boolean;
    error: string | null;
    statusFilter: number | undefined; // undefined = all, 0 = Pending, 1 = Active, 2 = Hidden
}

const initialState: AdminReviewState = {
    reviews: [],
    totalCount: 0,
    pageNumber: 1,
    totalPages: 1,
    loading: false,
    actionLoading: false,
    error: null,
    statusFilter: undefined,
};

export const fetchAdminReviewsThunk = createAsyncThunk(
    'adminReviews/fetch',
    async ({ page, size, status }: { page: number; size: number; status?: number }, { rejectWithValue }) => {
        try {
            const res = await ReviewService.getAllReviews(page, size, status);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi lấy danh sách đánh giá');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const approveReviewThunk = createAsyncThunk(
    'adminReviews/approve',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await ReviewService.approveReview(id);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi duyệt đánh giá');
            return id;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const hideReviewThunk = createAsyncThunk(
    'adminReviews/hide',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await ReviewService.hideReview(id);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi ẩn đánh giá');
            return id;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

const adminReviewSlice = createSlice({
    name: 'adminReviews',
    initialState,
    reducers: {
        setReviewStatusFilter: (state, action: PayloadAction<number | undefined>) => {
            state.statusFilter = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminReviewsThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAdminReviewsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload.items;
                state.totalCount = action.payload.totalCount;
                state.pageNumber = action.payload.pageNumber;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchAdminReviewsThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(approveReviewThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(approveReviewThunk.fulfilled, (state, action: PayloadAction<string>) => {
                state.actionLoading = false;
                const review = state.reviews.find(r => r.id === action.payload);
                if (review) review.status = 1; // Active
            })
            .addCase(approveReviewThunk.rejected, (state) => { state.actionLoading = false; })

            .addCase(hideReviewThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(hideReviewThunk.fulfilled, (state, action: PayloadAction<string>) => {
                state.actionLoading = false;
                const review = state.reviews.find(r => r.id === action.payload);
                if (review) review.status = 2; // Hidden
            })
            .addCase(hideReviewThunk.rejected, (state) => { state.actionLoading = false; });
    },
});

export const { setReviewStatusFilter } = adminReviewSlice.actions;
export default adminReviewSlice.reducer;
