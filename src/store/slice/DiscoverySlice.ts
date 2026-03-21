import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import DiscoveryService from '../../services/DiscoveryServices';
import type { DiscoveryParams, DiscoveryListResponse } from '../../services/DiscoveryServices';
import type { Place } from '../../services/PlacesServices';

interface DiscoveryState {
    items: Place[];
    loading: boolean;
    error: string | null;
    totalCount: number;
    totalPages: number;
    currentPage: number;
    type: 'places' | 'events';
    currentQuery: string;
    currentRating: number | null;
    isSearched: boolean;
}

const initialState: DiscoveryState = {
    items: [],
    loading: false,
    error: null,
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    type: 'places',
    currentQuery: '',
    currentRating: null,
    isSearched: false,
};

export const searchDiscoveryThunk = createAsyncThunk<
    DiscoveryListResponse,
    { type: 'places' | 'events'; search: string; rating: number | null; page?: number },
    { rejectValue: string }
>('discovery/search', async ({ type, search, rating, page = 1 }, { rejectWithValue }) => {
    try {
        const params: DiscoveryParams = {
            Search: search,
            PageNumber: page,
            PageSize: 12,
            SortBy: 'rating',
        };

        if (rating !== null && rating > 0) {
            params.AverageRating = rating;
        }

        if (type === 'places') {
            return await DiscoveryService.getPlaces(params);
        } else {
            return await DiscoveryService.getEvents(params);
        }
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Lỗi lấy dữ liệu');
    }
});

const discoverySlice = createSlice({
    name: 'discovery',
    initialState,
    reducers: {
        setDiscoveryType: (state, action: PayloadAction<'places' | 'events'>) => {
            state.type = action.payload;
        },
        setDiscoveryQuery: (state, action: PayloadAction<string>) => {
            state.currentQuery = action.payload;
        },
        setDiscoveryRating: (state, action: PayloadAction<number | null>) => {
            state.currentRating = action.payload;
        },
        resetDiscovery: (state) => {
            state.items = [];
            state.totalCount = 0;
            state.totalPages = 1;
            state.currentPage = 1;
            state.isSearched = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchDiscoveryThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchDiscoveryThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.isSearched = true;
                if (action.payload.success) {
                    state.items = action.payload.data.items;
                    state.totalCount = action.payload.data.totalCount;
                    state.totalPages = action.payload.data.totalPages;
                    state.currentPage = action.payload.data.pageNumber;
                } else {
                    state.error = action.payload.error || 'Lỗi tải dữ liệu';
                }
            })
            .addCase(searchDiscoveryThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setDiscoveryType, setDiscoveryQuery, setDiscoveryRating, resetDiscovery } = discoverySlice.actions;
export default discoverySlice.reducer;
