import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import RankService from '../../services/RankService';
import type { LeaderboardUser } from '../../services/RankService';

interface RankState {
  users: LeaderboardUser[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

const initialState: RankState = {
  users: [],
  loading: false,
  error: null,
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  pageSize: 10,
};

export const fetchLeaderboardUsersThunk = createAsyncThunk<
  { items: LeaderboardUser[]; totalCount: number; totalPages: number; pageNumber: number },
  { PageNumber?: number; PageSize?: number },
  { rejectValue: string }
>(
  'rank/fetchLeaderboardUsers',
  async (params = { PageNumber: 1, PageSize: 10 }, { rejectWithValue }) => {
    try {
      const res = await RankService.getLeaderboardUsers(params);
      if (!res.success) return rejectWithValue(res.error ?? 'Lỗi tải bảng xếp hạng');
      return {
        items: res.data.items,
        totalCount: res.data.totalCount,
        totalPages: res.data.totalPages,
        pageNumber: res.data.pageNumber,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải bảng xếp hạng');
    }
  }
);

const rankSlice = createSlice({
  name: 'rank',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboardUsersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboardUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.pageNumber;
      })
      .addCase(fetchLeaderboardUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentPage } = rankSlice.actions;
export default rankSlice.reducer;
