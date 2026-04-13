import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ProfileService from '../../services/ProfileService';
import type { UserProfile, UpdateProfileRequest } from '../../services/ProfileService';
import { saveUser } from '../../utils/headerApi';

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  updating: boolean;
  uploadingAvatar: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  updating: false,
  uploadingAvatar: false,
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
      const data = (err as any)?.response?.data;
      const message = data?.errorCode || data?.error || 'Cập nhật thất bại';
      return rejectWithValue(message);
    }
  },
);

export const uploadAvatarThunk = createAsyncThunk(
  'profile/uploadAvatar',
  async (file: File, { rejectWithValue }) => {
    try {
      // Step 1: Get upload signature from backend
      const sigRes = await ProfileService.getAvatarUploadSignature();
      if (!sigRes.success) return rejectWithValue(sigRes.error ?? 'Không thể lấy chữ ký upload');
      const { signature, timestamp, apiKey, cloudName, folder } = sigRes.data;

      // Step 2: Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', String(timestamp));
      formData.append('api_key', apiKey);
      formData.append('folder', folder);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      if (!cloudRes.ok) {
        const err = await cloudRes.json().catch(() => ({}));
        return rejectWithValue(err?.error?.message ?? 'Upload Cloudinary thất bại');
      }
      const cloudData = await cloudRes.json();
      const { public_id, url, secure_url } = cloudData;

      // Step 3: Finalize with backend
      const finalRes = await ProfileService.finalizeAvatarUpload({
        publicId: public_id,
        url,
        secureUrl: secure_url,
      });
      if (!finalRes.success) return rejectWithValue(finalRes.error ?? 'Cập nhật avatar thất bại');
      return finalRes.data;
    } catch (err: unknown) {
      const data = (err as any)?.response?.data;
      return rejectWithValue(data?.error ?? 'Upload avatar thất bại');
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
        saveUser(action.payload);
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
        saveUser(action.payload);
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // uploadAvatar
    builder
      .addCase(uploadAvatarThunk.pending, (state) => {
        state.uploadingAvatar = true;
        state.error = null;
      })
      .addCase(uploadAvatarThunk.fulfilled, (state, action) => {
        state.uploadingAvatar = false;
        state.profile = action.payload;
        saveUser(action.payload);
      })
      .addCase(uploadAvatarThunk.rejected, (state, action) => {
        state.uploadingAvatar = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfileError, resetProfile } = profileSlice.actions;
export default profileSlice.reducer;
