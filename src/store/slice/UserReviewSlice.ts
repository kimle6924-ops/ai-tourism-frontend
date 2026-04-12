import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import UserReviewService, { type UserReviewItem } from '../../services/UserReviewService';

interface UserReviewState {
  items: UserReviewItem[];
  loading: boolean;
  error: string | null;
}

const initialState: UserReviewState = {
  items: [],
  loading: false,
  error: null,
};

// Fetch cả resourceType=0 (places) và resourceType=1 (events), gộp lại và sắp theo ngày mới nhất
export const fetchMyReviewHistoryThunk = createAsyncThunk(
  'userReview/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const [placesRes, eventsRes] = await Promise.all([
        UserReviewService.getHistory(0, 1, 50),
        UserReviewService.getHistory(1, 1, 50),
      ]);

      const places = placesRes.success ? placesRes.data.items : [];
      const events = eventsRes.success ? eventsRes.data.items : [];

      const merged = [...places, ...events].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return merged;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Không thể tải lịch sử đánh giá';
      return rejectWithValue(message);
    }
  }
);

const userReviewSlice = createSlice({
  name: 'userReview',
  initialState,
  reducers: {
    clearUserReviews(state) {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyReviewHistoryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyReviewHistoryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyReviewHistoryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserReviews } = userReviewSlice.actions;
export default userReviewSlice.reducer;
