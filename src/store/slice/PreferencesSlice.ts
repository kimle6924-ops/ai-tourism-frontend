import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import PreferencesService from '../../services/PreferencesService';

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
interface PreferencesState {
    categoryIds: string[];
    loading: boolean;
    updating: boolean;
    error: string | null;
}

const initialState: PreferencesState = {
    categoryIds: [],
    loading: false,
    updating: false,
    error: null,
};

// ─────────────────────────────────────────────
// Thunks
// ─────────────────────────────────────────────
export const fetchPreferencesThunk = createAsyncThunk(
    'preferences/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const res = await PreferencesService.getPreferences();
            if (!res.success) return rejectWithValue(res.error ?? 'Không thể tải sở thích');
            return res.data.categoryIds;
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
                'Không thể tải sở thích';
            return rejectWithValue(message);
        }
    },
);

export const updatePreferencesThunk = createAsyncThunk(
    'preferences/update',
    async (categoryIds: string[], { rejectWithValue }) => {
        try {
            const res = await PreferencesService.updatePreferences(categoryIds);
            if (!res.success) return rejectWithValue(res.error ?? 'Cập nhật sở thích thất bại');
            return res.data.categoryIds;
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
                'Cập nhật sở thích thất bại';
            return rejectWithValue(message);
        }
    },
);

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────
const preferencesSlice = createSlice({
    name: 'preferences',
    initialState,
    reducers: {
        clearPreferences(state) {
            state.categoryIds = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPreferencesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPreferencesThunk.fulfilled, (state, action: PayloadAction<string[]>) => {
                state.loading = false;
                state.categoryIds = action.payload;
            })
            .addCase(fetchPreferencesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(updatePreferencesThunk.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updatePreferencesThunk.fulfilled, (state, action: PayloadAction<string[]>) => {
                state.updating = false;
                state.categoryIds = action.payload;
            })
            .addCase(updatePreferencesThunk.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearPreferences } = preferencesSlice.actions;
export default preferencesSlice.reducer;
