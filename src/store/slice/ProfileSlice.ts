import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ProfileService from '../../services/ProfileService';
import type { UserProfile, UpdateProfileRequest } from '../../services/ProfileService';

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  updating: false,
  error: null,
};

// ─────────────────────────────────────────────
// Thunks
// ─────────────────────────────────────────────
export const fetchProfileThunk = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await ProfileService.getProfile();
      if (!res.success) return rejectWithValue(res.error ?? 'Không thể tải thông tin người dùng');
      return res.data;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Không thể tải thông tin người dùng';
      return rejectWithValue(message);
    }
  },
);

export const updateProfileThunk = createAsyncThunk(
  'profile/updateProfile',
  async (payload: UpdateProfileRequest, { rejectWithValue }) => {
    try {
      const res = await ProfileService.updateProfile(payload);
      if (!res.success) return rejectWithValue(res.error ?? 'Cập nhật thất bại');
      return res.data;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Cập nhật thất bại';
      return rejectWithValue(message);
    }
  },
);

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError(state) {
      state.error = null;
    },
    resetProfile(state) {
      state.profile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchProfile
    builder
      .addCase(fetchProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateProfile
    builder
      .addCase(updateProfileThunk.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload; // sync updated data back to store
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfileError, resetProfile } = profileSlice.actions;
export default profileSlice.reducer;
