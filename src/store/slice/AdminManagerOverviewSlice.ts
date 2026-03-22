import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import AdminManagerOverviewService, { type OverviewStats } from '../../services/AdminManagerOverviewService';

interface AdminOverviewState {
    stats: OverviewStats | null;
    loading: boolean;
    error: string | null;
}

const initialState: AdminOverviewState = {
    stats: null,
    loading: false,
    error: null,
};

export const fetchOverviewStatsThunk = createAsyncThunk(
    'adminOverview/fetch',
    async ({ fromUtc, toUtc }: { fromUtc?: string; toUtc?: string } = {}, { rejectWithValue }) => {
        try {
            const res = await AdminManagerOverviewService.getOverviewStats(fromUtc, toUtc);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi lấy dữ liệu thống kê');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

const adminOverviewSlice = createSlice({
    name: 'adminOverview',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOverviewStatsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOverviewStatsThunk.fulfilled, (state, action: PayloadAction<OverviewStats>) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchOverviewStatsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export default adminOverviewSlice.reducer;
