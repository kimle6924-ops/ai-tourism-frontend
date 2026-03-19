import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import RegisterService, { type RegisterRequest } from '../../services/RegisterService';
import type { LoginResponseData } from '../../services/LoginService';
import { saveTokens } from '../../utils/headerApi';

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
interface RegisterState {
    user: LoginResponseData['user'] | null;
    accessToken: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: RegisterState = {
    user: null,
    accessToken: null,
    loading: false,
    error: null,
};

// ─────────────────────────────────────────────
// Thunk
// ─────────────────────────────────────────────
export const registerThunk = createAsyncThunk(
    'auth/register',
    async (payload: RegisterRequest, { rejectWithValue }) => {
        try {
            const res = await RegisterService.register(payload);
            if (!res.success) return rejectWithValue(res.error ?? 'Đăng ký thất bại');
            return res.data;
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
                'Đăng ký thất bại';
            return rejectWithValue(message);
        }
    },
);

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────
const registerSlice = createSlice({
    name: 'register',
    initialState,
    reducers: {
        clearRegisterState(state) {
            state.user = null;
            state.accessToken = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerThunk.fulfilled, (state, action: PayloadAction<LoginResponseData>) => {
                state.loading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                // Persist tokens to localStorage via helper
                saveTokens({
                    accessToken: action.payload.accessToken,
                    refreshToken: action.payload.refreshToken,
                    expiresAt: action.payload.expiresAt,
                });
            })
            .addCase(registerThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearRegisterState } = registerSlice.actions;
export default registerSlice.reducer;
