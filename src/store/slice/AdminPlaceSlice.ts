import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import AdminPlaceService, { type PlaceItem, type PaginatedResponse, type CreatePlacePayload, type UpdatePlacePayload } from '../../services/AdminPlaceService';

interface AdminPlaceState {
    places: PlaceItem[];
    selectedPlace: PlaceItem | null;
    totalCount: number;
    pageNumber: number;
    totalPages: number;
    loading: boolean;
    actionLoading: boolean;
    error: string | null;
}

const initialState: AdminPlaceState = {
    places: [],
    selectedPlace: null,
    totalCount: 0,
    pageNumber: 1,
    totalPages: 1,
    loading: false,
    actionLoading: false,
    error: null,
};

export const fetchAdminPlacesThunk = createAsyncThunk(
    'adminPlaces/fetch',
    async ({ page, size }: { page: number; size: number }, { rejectWithValue }) => {
        try {
            const res = await AdminPlaceService.getAll(page, size);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi lấy danh sách địa điểm');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const fetchPlaceByIdThunk = createAsyncThunk(
    'adminPlaces/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await AdminPlaceService.getById(id);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi lấy chi tiết địa điểm');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const createPlaceThunk = createAsyncThunk(
    'adminPlaces/create',
    async (payload: CreatePlacePayload, { rejectWithValue }) => {
        try {
            const res = await AdminPlaceService.create(payload);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi tạo địa điểm');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const updatePlaceThunk = createAsyncThunk(
    'adminPlaces/update',
    async ({ id, payload }: { id: string; payload: UpdatePlacePayload }, { rejectWithValue }) => {
        try {
            const res = await AdminPlaceService.update(id, payload);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi cập nhật địa điểm');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const deletePlaceThunk = createAsyncThunk(
    'adminPlaces/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await AdminPlaceService.delete(id);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi xóa địa điểm');
            return id;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

const adminPlaceSlice = createSlice({
    name: 'adminPlaces',
    initialState,
    reducers: {
        setSelectedPlace: (state, action: PayloadAction<PlaceItem | null>) => {
            state.selectedPlace = action.payload;
        },
        clearPlaceError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all
            .addCase(fetchAdminPlacesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminPlacesThunk.fulfilled, (state, action: PayloadAction<PaginatedResponse<PlaceItem>>) => {
                state.loading = false;
                state.places = action.payload.items;
                state.totalCount = action.payload.totalCount;
                state.pageNumber = action.payload.pageNumber;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchAdminPlacesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch by ID
            .addCase(fetchPlaceByIdThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(fetchPlaceByIdThunk.fulfilled, (state, action: PayloadAction<PlaceItem>) => {
                state.actionLoading = false;
                state.selectedPlace = action.payload;
            })
            .addCase(fetchPlaceByIdThunk.rejected, (state) => { state.actionLoading = false; })

            // Create
            .addCase(createPlaceThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(createPlaceThunk.fulfilled, (state) => { state.actionLoading = false; })
            .addCase(createPlaceThunk.rejected, (state) => { state.actionLoading = false; })

            // Update
            .addCase(updatePlaceThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(updatePlaceThunk.fulfilled, (state) => { state.actionLoading = false; })
            .addCase(updatePlaceThunk.rejected, (state) => { state.actionLoading = false; })

            // Delete
            .addCase(deletePlaceThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(deletePlaceThunk.fulfilled, (state, action: PayloadAction<string>) => {
                state.actionLoading = false;
                state.places = state.places.filter(p => p.id !== action.payload);
                state.totalCount -= 1;
            })
            .addCase(deletePlaceThunk.rejected, (state) => { state.actionLoading = false; });
    },
});

export const { setSelectedPlace, clearPlaceError } = adminPlaceSlice.actions;
export default adminPlaceSlice.reducer;
