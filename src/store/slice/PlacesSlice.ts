import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import PlacesService, { type Place } from '../../services/PlacesServices';

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
interface PlacesState {
    page1: Place[];      // PageNumber=1, PageSize=8 — under text2Img
    page2: Place[];      // PageNumber=2, PageSize=8 — under text3Img
    loading1: boolean;
    loading2: boolean;
    error: string | null;
}

const initialState: PlacesState = {
    page1: [],
    page2: [],
    loading1: false,
    loading2: false,
    error: null,
};

// ─────────────────────────────────────────────
// Thunks
// ─────────────────────────────────────────────
export const fetchPlacesPage1Thunk = createAsyncThunk(
    'places/fetchPage1',
    async (_, { rejectWithValue }) => {
        try {
            const res = await PlacesService.getPlaces(1, 8);
            if (!res.success) return rejectWithValue(res.error ?? 'Không thể tải địa điểm');
            return res.data.items;
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
                'Không thể tải địa điểm';
            return rejectWithValue(message);
        }
    },
);

export const fetchPlacesPage2Thunk = createAsyncThunk(
    'places/fetchPage2',
    async (_, { rejectWithValue }) => {
        try {
            const res = await PlacesService.getPlaces(2, 8);
            if (!res.success) return rejectWithValue(res.error ?? 'Không thể tải địa điểm');
            return res.data.items;
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
                'Không thể tải địa điểm';
            return rejectWithValue(message);
        }
    },
);

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────
const placesSlice = createSlice({
    name: 'places',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Page 1
            .addCase(fetchPlacesPage1Thunk.pending, (state) => {
                state.loading1 = true;
                state.error = null;
            })
            .addCase(fetchPlacesPage1Thunk.fulfilled, (state, action: PayloadAction<Place[]>) => {
                state.loading1 = false;
                state.page1 = action.payload;
            })
            .addCase(fetchPlacesPage1Thunk.rejected, (state, action) => {
                state.loading1 = false;
                state.error = action.payload as string;
            })
            // Page 2
            .addCase(fetchPlacesPage2Thunk.pending, (state) => {
                state.loading2 = true;
                state.error = null;
            })
            .addCase(fetchPlacesPage2Thunk.fulfilled, (state, action: PayloadAction<Place[]>) => {
                state.loading2 = false;
                state.page2 = action.payload;
            })
            .addCase(fetchPlacesPage2Thunk.rejected, (state, action) => {
                state.loading2 = false;
                state.error = action.payload as string;
            });
    },
});

export default placesSlice.reducer;
