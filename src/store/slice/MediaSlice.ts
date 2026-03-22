import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import MediaService, { type MediaAssetFull } from '../../services/MediaService';
import type { ResourceType } from '../../services/ModerationService';

interface MediaState {
    mediaList: MediaAssetFull[];
    loading: boolean;
    uploading: boolean;
    actionLoading: boolean;
    error: string | null;
}

const initialState: MediaState = {
    mediaList: [],
    loading: false,
    uploading: false,
    actionLoading: false,
    error: null,
};

export const fetchMediaThunk = createAsyncThunk(
    'media/fetch',
    async ({ resourceType, resourceId }: { resourceType: ResourceType; resourceId: string }, { rejectWithValue }) => {
        try {
            const res = await MediaService.getByResource(resourceType, resourceId);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi lấy hình ảnh');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const uploadMediaThunk = createAsyncThunk(
    'media/upload',
    async ({ file, resourceType, resourceId }: { file: File; resourceType: ResourceType; resourceId: string }, { rejectWithValue }) => {
        try {
            // Step 1: Get signature
            const sigRes = await MediaService.getSignature(resourceType, resourceId);
            if (!sigRes.success) return rejectWithValue(sigRes.error || 'Lỗi lấy chữ ký upload');

            // Step 2: Upload to Cloudinary
            const cloudRes = await MediaService.uploadToCloudinary(file, sigRes.data);
            if (cloudRes.error) return rejectWithValue(cloudRes.error.message || 'Lỗi upload Cloudinary');

            // Step 3: Finalize
            const finalRes = await MediaService.finalize({
                resourceType,
                resourceId,
                publicId: cloudRes.public_id,
                url: cloudRes.url,
                secureUrl: cloudRes.secure_url,
                format: cloudRes.format,
                mimeType: `image/${cloudRes.format}`,
                bytes: cloudRes.bytes,
                width: cloudRes.width,
                height: cloudRes.height,
            });
            if (!finalRes.success) return rejectWithValue(finalRes.error || 'Lỗi lưu hình ảnh');
            return finalRes.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || err?.message || 'Lỗi upload');
        }
    }
);

export const setPrimaryThunk = createAsyncThunk(
    'media/setPrimary',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await MediaService.setPrimary(id);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi');
            return id;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const deleteMediaThunk = createAsyncThunk(
    'media/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await MediaService.delete(id);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi xóa');
            return id;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

const mediaSlice = createSlice({
    name: 'media',
    initialState,
    reducers: {
        clearMedia: (state) => { state.mediaList = []; state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMediaThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchMediaThunk.fulfilled, (state, action: PayloadAction<MediaAssetFull[]>) => {
                state.loading = false;
                state.mediaList = action.payload;
            })
            .addCase(fetchMediaThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(uploadMediaThunk.pending, (state) => { state.uploading = true; })
            .addCase(uploadMediaThunk.fulfilled, (state, action: PayloadAction<MediaAssetFull>) => {
                state.uploading = false;
                state.mediaList.push(action.payload);
            })
            .addCase(uploadMediaThunk.rejected, (state) => { state.uploading = false; })

            .addCase(setPrimaryThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(setPrimaryThunk.fulfilled, (state, action: PayloadAction<string>) => {
                state.actionLoading = false;
                state.mediaList.forEach(m => { m.isPrimary = m.id === action.payload; });
            })
            .addCase(setPrimaryThunk.rejected, (state) => { state.actionLoading = false; })

            .addCase(deleteMediaThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(deleteMediaThunk.fulfilled, (state, action: PayloadAction<string>) => {
                state.actionLoading = false;
                state.mediaList = state.mediaList.filter(m => m.id !== action.payload);
            })
            .addCase(deleteMediaThunk.rejected, (state) => { state.actionLoading = false; });
    },
});

export const { clearMedia } = mediaSlice.actions;
export default mediaSlice.reducer;
