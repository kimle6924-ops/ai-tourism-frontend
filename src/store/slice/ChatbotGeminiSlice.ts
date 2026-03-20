import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import ChatbotGeminiService from '../../services/ChatbotGeminiService';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface ChatMessage {
    role: 'user' | 'bot';
    text: string;
}

interface ChatbotState {
    messages: ChatMessage[];
    loading: boolean;
    error: string | null;
}

const initialState: ChatbotState = {
    messages: [
        {
            role: 'bot',
            text: 'Hi 👋, mình là AI du lịch của bạn! Hãy chọn những gì bạn thích, mình sẽ giúp bạn tìm ra điểm đến phù hợp và thú vị nhất ✨',
        },
    ],
    loading: false,
    error: null,
};

// ─────────────────────────────────────────────
// Thunk
// ─────────────────────────────────────────────
export const askChatbotThunk = createAsyncThunk(
    'chatbot/ask',
    async (question: string, { rejectWithValue }) => {
        try {
            const res = await ChatbotGeminiService.ask({ question });
            if (!res.success) return rejectWithValue(res.error ?? 'Chatbot không phản hồi');
            return res.data.answer;
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
                'Chatbot không phản hồi';
            return rejectWithValue(message);
        }
    },
);

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────
const chatbotSlice = createSlice({
    name: 'chatbot',
    initialState,
    reducers: {
        addUserMessage(state, action: PayloadAction<string>) {
            state.messages.push({ role: 'user', text: action.payload });
        },
        clearChatbot(state) {
            state.messages = initialState.messages;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(askChatbotThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(askChatbotThunk.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.messages.push({ role: 'bot', text: action.payload });
            })
            .addCase(askChatbotThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.messages.push({
                    role: 'bot',
                    text: '⚠️ Xin lỗi, mình không thể kết nối lúc này. Vui lòng thử lại!',
                });
            });
    },
});

export const { addUserMessage, clearChatbot } = chatbotSlice.actions;
export default chatbotSlice.reducer;
