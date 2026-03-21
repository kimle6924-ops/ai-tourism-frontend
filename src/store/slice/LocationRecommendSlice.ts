import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import LocationRecommendService from '../../services/LocationRecommendService';
import type { Place } from '../../services/PlacesServices';

interface LocationRecommendState {
  recommendPlaces: Place[];
  recommendEvents: Place[];
  loadingPlaces: boolean;
  loadingEvents: boolean;
  error: string | null;
}

const initialState: LocationRecommendState = {
  recommendPlaces: [],
  recommendEvents: [],
  loadingPlaces: false,
  loadingEvents: false,
  error: null,
};

export const fetchRecommendPlacesThunk = createAsyncThunk(
  'locationRecommend/fetchPlaces',
  async (_, { rejectWithValue }) => {
    try {
      const res = await LocationRecommendService.getRecommendPlaces();
      if (!res.success) return rejectWithValue(res.error ?? 'Lỗi tải địa điểm đề xuất');
      return res.data.items;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải địa điểm đề xuất');
    }
  }
);

export const fetchRecommendEventsThunk = createAsyncThunk(
  'locationRecommend/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const res = await LocationRecommendService.getRecommendEvents();
      if (!res.success) return rejectWithValue(res.error ?? 'Lỗi tải sự kiện đề xuất');
      return res.data.items;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải sự kiện đề xuất');
    }
  }
);

const locationRecommendSlice = createSlice({
  name: 'locationRecommend',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendPlacesThunk.pending, (state) => {
        state.loadingPlaces = true;
        state.error = null;
      })
      .addCase(fetchRecommendPlacesThunk.fulfilled, (state, action: PayloadAction<Place[]>) => {
        state.loadingPlaces = false;
        state.recommendPlaces = action.payload;
      })
      .addCase(fetchRecommendPlacesThunk.rejected, (state, action) => {
        state.loadingPlaces = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRecommendEventsThunk.pending, (state) => {
        state.loadingEvents = true;
        state.error = null;
      })
      .addCase(fetchRecommendEventsThunk.fulfilled, (state, action: PayloadAction<Place[]>) => {
        state.loadingEvents = false;
        state.recommendEvents = action.payload;
      })
      .addCase(fetchRecommendEventsThunk.rejected, (state, action) => {
        state.loadingEvents = false;
        state.error = action.payload as string;
      });
  }
});

export default locationRecommendSlice.reducer;
