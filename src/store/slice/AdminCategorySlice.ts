import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import AdminCategoryService, { type CreateCategoryPayload, type UpdateCategoryPayload } from '../../services/AdminCategoryService';
import type { Category } from '../../services/CategoryService';
import type { PaginatedResponse } from '../../services/AdminPlaceService';

interface AdminCategoryState {
    categories: Category[];
    totalCount: number;
    pageNumber: number;
    totalPages: number;
    loading: boolean;
    actionLoading: boolean;
    error: string | null;
}

const initialState: AdminCategoryState = {
    categories: [],
    totalCount: 0,
    pageNumber: 1,
    totalPages: 1,
    loading: false,
    actionLoading: false,
    error: null,
};

export const fetchAdminCategoriesThunk = createAsyncThunk(
    'adminCategories/fetch',
    async ({ page, size }: { page: number; size: number }, { rejectWithValue }) => {
        try {
            const res = await AdminCategoryService.getAll(page, size);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi lấy danh mục');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const createCategoryThunk = createAsyncThunk(
    'adminCategories/create',
    async (payload: CreateCategoryPayload, { rejectWithValue }) => {
        try {
            const res = await AdminCategoryService.create(payload);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi tạo danh mục');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const updateCategoryThunk = createAsyncThunk(
    'adminCategories/update',
    async ({ id, payload }: { id: string; payload: UpdateCategoryPayload }, { rejectWithValue }) => {
        try {
            const res = await AdminCategoryService.update(id, payload);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi cập nhật danh mục');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

export const deleteCategoryThunk = createAsyncThunk(
    'adminCategories/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await AdminCategoryService.delete(id);
            if (!res.success) return rejectWithValue(res.error || 'Lỗi xóa danh mục');
            return id;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.error || 'Lỗi server');
        }
    }
);

const adminCategorySlice = createSlice({
    name: 'adminCategories',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminCategoriesThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAdminCategoriesThunk.fulfilled, (state, action: PayloadAction<PaginatedResponse<Category>>) => {
                state.loading = false;
                state.categories = action.payload.items;
                state.totalCount = action.payload.totalCount;
                state.pageNumber = action.payload.pageNumber;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchAdminCategoriesThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(createCategoryThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(createCategoryThunk.fulfilled, (state) => { state.actionLoading = false; })
            .addCase(createCategoryThunk.rejected, (state) => { state.actionLoading = false; })

            .addCase(updateCategoryThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(updateCategoryThunk.fulfilled, (state) => { state.actionLoading = false; })
            .addCase(updateCategoryThunk.rejected, (state) => { state.actionLoading = false; })

            .addCase(deleteCategoryThunk.pending, (state) => { state.actionLoading = true; })
            .addCase(deleteCategoryThunk.fulfilled, (state, action: PayloadAction<string>) => {
                state.actionLoading = false;
                state.categories = state.categories.filter(c => c.id !== action.payload);
                state.totalCount -= 1;
            })
            .addCase(deleteCategoryThunk.rejected, (state) => { state.actionLoading = false; });
    },
});

export default adminCategorySlice.reducer;
