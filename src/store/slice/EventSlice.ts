import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import EventService from '../../services/EventService';
import type { EventItem, TimelineFilter } from '../../services/EventService';

interface EventState {
  items: EventItem[];
  loading: boolean;
  error: string | null;
  timeline: TimelineFilter;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

const initialState: EventState = {
  items: [],
  loading: false,
  error: null,
  timeline: 'both',
  currentPage: 1,
  pageSize: 16,
  totalCount: 0,
  totalPages: 1,
};

export const fetchEventTimelineThunk = createAsyncThunk<
  { items: EventItem[]; totalCount: number; totalPages: number; pageNumber: number },
  { timeline?: TimelineFilter; page?: number; pageSize?: number },
  { rejectValue: string }
>(
  'event/fetchTimeline',
  async ({ timeline = 'both', page = 1, pageSize = 16 }, { rejectWithValue }) => {
    try {
      const res = await EventService.getTimeline({
        Timeline: timeline,
        RadiusKm: 3000,
        PageNumber: page,
        PageSize: pageSize,
      });
      if (!res.success) return rejectWithValue(res.error ?? 'Lỗi tải sự kiện');
      return {
        items: res.data.items,
        totalCount: res.data.totalCount,
        totalPages: res.data.totalPages,
        pageNumber: res.data.pageNumber,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi tải sự kiện');
    }
  }
);

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    setTimeline(state, action: PayloadAction<TimelineFilter>) {
      state.timeline = action.payload;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventTimelineThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventTimelineThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.pageNumber;
      })
      .addCase(fetchEventTimelineThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTimeline } = eventSlice.actions;
export default eventSlice.reducer;
