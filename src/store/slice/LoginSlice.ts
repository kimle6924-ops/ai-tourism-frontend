import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import LoginService, { type LoginRequest, type LoginResponseData } from '../../services/LoginService';
import { saveTokens, getTokens, saveUser, getUser } from '../../utils/headerApi';

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
interface LoginState {
    user: LoginResponseData['user'] | null;
    accessToken: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: LoginState = {
    user: getUser(),
    accessToken: getTokens()?.accessToken ?? null,
    loading: false,
    error: null,
};

// ─────────────────────────────────────────────
// Thunk
// ─────────────────────────────────────────────
export const loginThunk = createAsyncThunk(
    'auth/login',
    async (payload: LoginRequest, { rejectWithValue }) => {
        try {
            const res = await LoginService.login(payload);
            if (!res.success) return rejectWithValue(res.error ?? 'Đăng nhập thất bại');
            return res.data;
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
                'Đăng nhập thất bại';
            return rejectWithValue(message);
        }
    },
);

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────
const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
            state.accessToken = null;
            state.error = null;
        },
        clearLoginError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action: PayloadAction<LoginResponseData>) => {
                state.loading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                // Persist tokens to localStorage via helper
                saveTokens({
                    accessToken: action.payload.accessToken,
                    refreshToken: action.payload.refreshToken,
                    expiresAt: action.payload.expiresAt,
                });
                saveUser(action.payload.user);
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { logout, clearLoginError } = loginSlice.actions;
export default loginSlice.reducer;
