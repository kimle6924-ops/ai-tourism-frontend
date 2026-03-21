import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import LocationDetaiServices from '../../services/LocationDetaiServices';
import type { Place } from '../../services/PlacesServices';

interface LocationDetailState {
    detail: Place | null;
    loading: boolean;
    error: string | null;
}

const initialState: LocationDetailState = {
    detail: null,
    loading: false,
    error: null,
};

export const fetchLocationDetailThunk = createAsyncThunk<
    Place,
    { id: string; type: 'places' | 'events' },
    { rejectValue: string }
>('locationDetail/fetch', async ({ id, type }, { rejectWithValue }) => {
    try {
        const res = type === 'places' 
            ? await LocationDetaiServices.getPlaceDetail(id)
            : await LocationDetaiServices.getEventDetail(id);
        
        if (res.success) {
            return res.data;
        }
        return rejectWithValue(res.error || 'Lỗi tải chi tiết');
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Lỗi tải chi tiết');
    }
});

const locationDetailSlice = createSlice({
    name: 'locationDetail',
    initialState,
    reducers: {
        clearLocationDetail: (state) => {
            state.detail = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLocationDetailThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLocationDetailThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.detail = action.payload;
            })
            .addCase(fetchLocationDetailThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { clearLocationDetail } = locationDetailSlice.actions;
export default locationDetailSlice.reducer;
