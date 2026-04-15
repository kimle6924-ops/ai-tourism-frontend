import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import TourismService from '../../services/TourismService';
import LocationRecommendService, { type LocationRecommendParams } from '../../services/LocationRecommendService';
import type { TourismTagParams } from '../../services/TourismService';
import type { Place } from '../../services/PlacesServices';

interface TourismState {
  items: Place[];
  loading: boolean;
  error: string | null;
  selectedTags: string[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

const initialState: TourismState = {
  items: [],
  loading: false,
  error: null,
  selectedTags: [],
  currentPage: 1,
  pageSize: 16,
  totalCount: 0,
  totalPages: 1,
};

export const fetchTourismPlacesThunk = createAsyncThunk<
  { items: Place[]; totalCount: number; totalPages: number; pageNumber: number },
  TourismTagParams,
  { rejectValue: string }
>(
  'tourism/fetchPlaces',
  async (params, { rejectWithValue }) => {
    try {
      const res = await TourismService.getPlacesByTag(params);
      if (!res.success) return rejectWithValue(res.error ?? 'Lỗi tải địa điểm du lịch');
      return {
        items: res.data.items,
        totalCount: res.data.totalCount,
        totalPages: res.data.totalPages,
        pageNumber: res.data.pageNumber,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi tải địa điểm du lịch');
    }
  }
);

export const fetchRecommendedTourismPlacesThunk = createAsyncThunk<
  { items: Place[]; totalCount: number; totalPages: number; pageNumber: number },
  LocationRecommendParams,
  { rejectValue: string }
>(
  'tourism/fetchRecommendedPlaces',
  async (params, { rejectWithValue }) => {
    try {
      const res = await LocationRecommendService.getRecommendPlaces(params);
      if (!res.success) return rejectWithValue(res.error ?? 'Lỗi tải địa điểm đề xuất');
      return {
        items: res.data.items,
        totalCount: res.data.totalCount,
        totalPages: res.data.totalPages,
        pageNumber: res.data.pageNumber,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi tải địa điểm đề xuất');
    }
  }
);

const tourismSlice = createSlice({
  name: 'tourism',
  initialState,
  reducers: {
    setSelectedTags(state, action) {
      state.selectedTags = action.payload;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTourismPlacesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTourismPlacesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.pageNumber;
      })
      .addCase(fetchTourismPlacesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRecommendedTourismPlacesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendedTourismPlacesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.pageNumber;
      })
      .addCase(fetchRecommendedTourismPlacesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedTags } = tourismSlice.actions;
export default tourismSlice.reducer;
