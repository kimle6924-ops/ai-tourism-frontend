import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import AdminManagerUserService, { type AdminUser, type PaginatedUsersResponse } from '../../services/AdminManagerUserService';

interface AdminUserManagerState {
    users: AdminUser[];
    totalCount: number;
    pageNumber: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
    actionLoading: boolean; 
}

const initialState: AdminUserManagerState = {
    users: [],
    totalCount: 0,
    pageNumber: 1,
    totalPages: 1,
    loading: false,
    error: null,
    actionLoading: false,
};

export const fetchAdminUsersThunk = createAsyncThunk(
    'adminUsers/fetch',
    async ({ page, size }: { page: number; size: number }, { rejectWithValue }) => {
        try {
            const res = await AdminManagerUserService.getUsers(page, size);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi lấy danh sách người dùng');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const lockUserThunk = createAsyncThunk(
    'adminUsers/lock',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await AdminManagerUserService.lockUser(id);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi khóa người dùng');
            return id; 
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const unlockUserThunk = createAsyncThunk(
    'adminUsers/unlock',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await AdminManagerUserService.unlockUser(id);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi mở khóa người dùng');
            return id; 
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const approveUserThunk = createAsyncThunk(
    'adminUsers/approve',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await AdminManagerUserService.approveUser(id);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi duyệt người dùng');
            return id; 
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

const adminManagerUserSlice = createSlice({
    name: 'adminUsers',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch users
            .addCase(fetchAdminUsersThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminUsersThunk.fulfilled, (state, action: PayloadAction<PaginatedUsersResponse>) => {
                state.loading = false;
                state.users = action.payload.items;
                state.totalCount = action.payload.totalCount;
                state.pageNumber = action.payload.pageNumber;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchAdminUsersThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            
            // Lock User Actions
            .addCase(lockUserThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(lockUserThunk.fulfilled, (state, action: PayloadAction<string>) => {
                state.actionLoading = false;
                const user = state.users.find(u => u.id === action.payload);
                if (user) user.status = 1; // Assuming 1 means Locked
            })
            .addCase(lockUserThunk.rejected, (state) => { state.actionLoading = false; })

            // Unlock User Actions
            .addCase(unlockUserThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(unlockUserThunk.fulfilled, (state, action: PayloadAction<string>) => {
                state.actionLoading = false;
                const user = state.users.find(u => u.id === action.payload);
                if (user) user.status = 0; // Assuming 0 means Active
            })
            .addCase(unlockUserThunk.rejected, (state) => { state.actionLoading = false; })

            // Approve User Actions
            .addCase(approveUserThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(approveUserThunk.fulfilled, (state) => {
                state.actionLoading = false;
                // Assuming approval might change status or role, but let's just leave it or you can refetch
            })
            .addCase(approveUserThunk.rejected, (state) => { state.actionLoading = false; });
    }
});

export default adminManagerUserSlice.reducer;
