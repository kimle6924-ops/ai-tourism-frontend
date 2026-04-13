import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import DiscoveryTagService from '../../services/DiscoveryTagService';

interface DiscoveryTagState {
    tags: string[];
    loading: boolean;
    error: string | null;
}

const initialState: DiscoveryTagState = {
    tags: [],
    loading: false,
    error: null,
};

export const fetchDiscoveryTagsThunk = createAsyncThunk<
    string[],
    void,
    { rejectValue: string }
>(
    'discoveryTag/fetchTags',
    async (_, { rejectWithValue }) => {
        try {
            const res = await DiscoveryTagService.getTags();
            if (!res.success) return rejectWithValue(res.error ?? 'Lỗi tải danh sách thẻ (tags)');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Lỗi tải danh sách thẻ (tags)');
        }
    }
);

const discoveryTagSlice = createSlice({
    name: 'discoveryTag',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDiscoveryTagsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDiscoveryTagsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.tags = action.payload;
            })
            .addCase(fetchDiscoveryTagsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default discoveryTagSlice.reducer;
