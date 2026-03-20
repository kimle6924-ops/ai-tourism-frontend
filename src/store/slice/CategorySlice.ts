import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import CategoryService, { type Category } from '../../services/CategoryService';

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
interface CategoryState {
    items: Category[];
    loading: boolean;
    error: string | null;
}

const initialState: CategoryState = {
    items: [],
    loading: false,
    error: null,
};

// ─────────────────────────────────────────────
// Thunk
// ─────────────────────────────────────────────
export const fetchCategoriesThunk = createAsyncThunk(
    'category/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const res = await CategoryService.getCategories(1, 50);
            if (!res.success) return rejectWithValue(res.error ?? 'Không thể tải danh mục');
            return res.data.items;
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
                'Không thể tải danh mục';
            return rejectWithValue(message);
        }
    },
);

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────
const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategoriesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategoriesThunk.fulfilled, (state, action: PayloadAction<Category[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchCategoriesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default categorySlice.reducer;
