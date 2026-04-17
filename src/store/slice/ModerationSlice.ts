import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import AdminPlaceService from '../../services/AdminPlaceService';
import AdminEventService from '../../services/AdminEventService';
import ModerationService, { type ModerationLog, type ResourceType, type ModerationActionPayload } from '../../services/ModerationService';
import type { PlaceItem, PaginatedResponse } from '../../services/AdminPlaceService';
import type { EventItem } from '../../services/AdminEventService';

interface ModerationState {
    pendingPlaces: PlaceItem[];
    pendingEvents: EventItem[];
    placesTotalCount: number;
    eventsTotalCount: number;
    placesPage: number;
    eventsPage: number;
    placesTotalPages: number;
    eventsTotalPages: number;
    logs: ModerationLog[];
    logsLoading: boolean;
    loading: boolean;
    actionLoading: boolean;
    error: string | null;
}

const initialState: ModerationState = {
    pendingPlaces: [],
    pendingEvents: [],
    placesTotalCount: 0,
    eventsTotalCount: 0,
    placesPage: 1,
    eventsPage: 1,
    placesTotalPages: 1,
    eventsTotalPages: 1,
    logs: [],
    logsLoading: false,
    loading: false,
    actionLoading: false,
    error: null,
};

export const fetchPendingPlacesThunk = createAsyncThunk(
    'moderation/fetchPendingPlaces',
    async ({ page, size }: { page: number; size: number }, { rejectWithValue }) => {
        try {
            const res = await AdminPlaceService.getAll({ page, size });
            if (!res.success) return rejectWithValue(res.error || 'Lỗi');
            // Filter pending (moderationStatus === 0) client-side
            const filteredItems = res.data.items.filter(p => p.moderationStatus === 0);
            const filtered = {
                ...res.data,
                items: filteredItems,
            };
            return { data: filtered, totalPending: filteredItems.length };
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const fetchPendingEventsThunk = createAsyncThunk(
    'moderation/fetchPendingEvents',
    async ({ page, size }: { page: number; size: number }, { rejectWithValue }) => {
        try {
            const res = await AdminEventService.getAll({ page, size });
            if (!res.success) return rejectWithValue(res.error || 'Lỗi');
            const filteredItems = res.data.items.filter(e => e.moderationStatus === 0);
            const filtered = {
                ...res.data,
                items: filteredItems,
            };
            return { data: filtered, totalPending: filteredItems.length };
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const approveResourceThunk = createAsyncThunk(
    'moderation/approve',
    async ({ resourceType, id, payload }: { resourceType: ResourceType; id: string; payload: ModerationActionPayload }, { rejectWithValue }) => {
        try {
            const res = await ModerationService.approve(resourceType, id, payload);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi duyệt');
            return { resourceType, id };
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const rejectResourceThunk = createAsyncThunk(
    'moderation/reject',
    async ({ resourceType, id, payload }: { resourceType: ResourceType; id: string; payload: ModerationActionPayload }, { rejectWithValue }) => {
        try {
            const res = await ModerationService.reject(resourceType, id, payload);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi từ chối');
            return { resourceType, id };
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const fetchLogsThunk = createAsyncThunk(
    'moderation/fetchLogs',
    async ({ resourceType, id }: { resourceType: ResourceType; id: string }, { rejectWithValue }) => {
        try {
            const res = await ModerationService.getLogs(resourceType, id);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi lấy logs');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

const moderationSlice = createSlice({
    name: 'moderation',
    initialState,
    reducers: {
        clearLogs: (state) => { state.logs = []; },
    },
    extraReducers: (builder) => {
        builder
            // Pending places
            .addCase(fetchPendingPlacesThunk.pending, (state) => { state.loading = true; })
            .addCase(fetchPendingPlacesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingPlaces = action.payload.data.items;
                state.placesTotalCount = action.payload.totalPending;
                state.placesPage = action.payload.data.pageNumber;
                state.placesTotalPages = action.payload.data.totalPages;
            })
            .addCase(fetchPendingPlacesThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            // Pending events
            .addCase(fetchPendingEventsThunk.pending, (state) => { state.loading = true; })
            .addCase(fetchPendingEventsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingEvents = action.payload.data.items;
                state.eventsTotalCount = action.payload.totalPending;
                state.eventsPage = action.payload.data.pageNumber;
                state.eventsTotalPages = action.payload.data.totalPages;
            })
            .addCase(fetchPendingEventsThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            // Approve
            .addCase(approveResourceThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(approveResourceThunk.fulfilled, (state, action) => {
                state.actionLoading = false;
                if (action.payload.resourceType === 0) {
                    state.pendingPlaces = state.pendingPlaces.filter(p => p.id !== action.payload.id);
                    state.placesTotalCount -= 1;
                } else {
                    state.pendingEvents = state.pendingEvents.filter(e => e.id !== action.payload.id);
                    state.eventsTotalCount -= 1;
                }
            })
            .addCase(approveResourceThunk.rejected, (state) => { state.actionLoading = false; })

            // Reject
            .addCase(rejectResourceThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(rejectResourceThunk.fulfilled, (state, action) => {
                state.actionLoading = false;
                if (action.payload.resourceType === 0) {
                    state.pendingPlaces = state.pendingPlaces.filter(p => p.id !== action.payload.id);
                    state.placesTotalCount -= 1;
                } else {
                    state.pendingEvents = state.pendingEvents.filter(e => e.id !== action.payload.id);
                    state.eventsTotalCount -= 1;
                }
            })
            .addCase(rejectResourceThunk.rejected, (state) => { state.actionLoading = false; })

            // Logs
            .addCase(fetchLogsThunk.pending, (state) => { state.logsLoading = true; })
            .addCase(fetchLogsThunk.fulfilled, (state, action: PayloadAction<ModerationLog[]>) => {
                state.logsLoading = false;
                state.logs = action.payload;
            })
            .addCase(fetchLogsThunk.rejected, (state) => { state.logsLoading = false; });
    },
});

export const { clearLogs } = moderationSlice.actions;
export default moderationSlice.reducer;
