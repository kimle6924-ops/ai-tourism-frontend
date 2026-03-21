import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import LocationUserService, { type LocationRequest } from '../../services/LocationUserService';

interface LocationUserState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: LocationUserState = {
  loading: false,
  error: null,
  success: false,
};

export const updateLocationThunk = createAsyncThunk(
  'locationUser/updateLocation',
  async (payload: LocationRequest, { rejectWithValue }) => {
    try {
      const res = await LocationUserService.updateLocation(payload);
      if (!res.success) return rejectWithValue(res.error ?? 'Lỗi cập nhật vị trí');
      return res.data;
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.error ??
        (err as any)?.response?.data?.message ??
        'Lỗi cập nhật vị trí';
      return rejectWithValue(message);
    }
  }
);

const locationUserSlice = createSlice({
  name: 'locationUser',
  initialState,
  reducers: {
    resetLocationStatus(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateLocationThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateLocationThunk.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateLocationThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetLocationStatus } = locationUserSlice.actions;
export default locationUserSlice.reducer;
