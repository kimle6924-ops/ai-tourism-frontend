import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import AdminEventService, { type EventItem, type CreateEventPayload, type UpdateEventPayload } from '../../services/AdminEventService';
import type { PaginatedResponse } from '../../services/AdminPlaceService';

interface AdminEventState {
    events: EventItem[];
    selectedEvent: EventItem | null;
    totalCount: number;
    pageNumber: number;
    totalPages: number;
    loading: boolean;
    actionLoading: boolean;
    error: string | null;
}

const initialState: AdminEventState = {
    events: [],
    selectedEvent: null,
    totalCount: 0,
    pageNumber: 1,
    totalPages: 1,
    loading: false,
    actionLoading: false,
    error: null,
};

export const fetchAdminEventsThunk = createAsyncThunk(
    'adminEvents/fetch',
    async ({ page, size }: { page: number; size: number }, { rejectWithValue }) => {
        try {
            const res = await AdminEventService.getAll(page, size);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi lấy danh sách sự kiện');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const createEventThunk = createAsyncThunk(
    'adminEvents/create',
    async (payload: CreateEventPayload, { rejectWithValue }) => {
        try {
            const res = await AdminEventService.create(payload);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi tạo sự kiện');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const updateEventThunk = createAsyncThunk(
    'adminEvents/update',
    async ({ id, payload }: { id: string; payload: UpdateEventPayload }, { rejectWithValue }) => {
        try {
            const res = await AdminEventService.update(id, payload);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi cập nhật sự kiện');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const deleteEventThunk = createAsyncThunk(
    'adminEvents/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await AdminEventService.delete(id);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi xóa sự kiện');
            return id;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

const adminEventSlice = createSlice({
    name: 'adminEvents',
    initialState,
    reducers: {
        setSelectedEvent: (state, action: PayloadAction<EventItem | null>) => {
            state.selectedEvent = action.payload;
        },
        clearEventError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminEventsThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAdminEventsThunk.fulfilled, (state, action: PayloadAction<PaginatedResponse<EventItem>>) => {
                state.loading = false;
                state.events = action.payload.items;
                state.totalCount = action.payload.totalCount;
                state.pageNumber = action.payload.pageNumber;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchAdminEventsThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(createEventThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(createEventThunk.fulfilled, (state) => { state.actionLoading = false; })
            .addCase(createEventThunk.rejected, (state) => { state.actionLoading = false; })

            .addCase(updateEventThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(updateEventThunk.fulfilled, (state) => { state.actionLoading = false; })
            .addCase(updateEventThunk.rejected, (state) => { state.actionLoading = false; })

            .addCase(deleteEventThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(deleteEventThunk.fulfilled, (state, action: PayloadAction<string>) => {
                state.actionLoading = false;
                state.events = state.events.filter(e => e.id !== action.payload);
                state.totalCount -= 1;
            })
            .addCase(deleteEventThunk.rejected, (state) => { state.actionLoading = false; });
    },
});

export const { setSelectedEvent, clearEventError } = adminEventSlice.actions;
export default adminEventSlice.reducer;
