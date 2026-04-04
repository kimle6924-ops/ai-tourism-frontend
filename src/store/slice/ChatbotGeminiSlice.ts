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
    conversationId: string | null;
    messages: ChatMessage[];
    loading: boolean;
    error: string | null;
}

const initialState: ChatbotState = {
    conversationId: null,
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
// Thunks
// ─────────────────────────────────────────────

// Creates a conversation if none exists, then sends the message.
export const askChatbotThunk = createAsyncThunk(
    'chatbot/ask',
    async (content: string, { getState, rejectWithValue, dispatch }) => {
        const state = getState() as any;
        let convId = state.chatbot.conversationId;

        try {
            // 1. Create conversation if not exists
            if (!convId) {
                const createRes = await ChatbotGeminiService.createConversation();
                if (!createRes.success) return rejectWithValue(createRes.error ?? 'Không thể tạo cuộc trò chuyện mới');
                convId = createRes.data.id;
                // Dispatch action to save the new conversation ID
                dispatch(setConversationId(convId));
            }

            // 2. Send message
            const sendRes = await ChatbotGeminiService.sendMessage(convId as string, { content });
            if (!sendRes.success) return rejectWithValue(sendRes.error ?? 'Chatbot không phản hồi');
            
            return sendRes.data.content;
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
        setConversationId(state, action: PayloadAction<string>) {
            state.conversationId = action.payload;
        },
        addUserMessage(state, action: PayloadAction<string>) {
            state.messages.push({ role: 'user', text: action.payload });
        },
        clearChatbot(state) {
            state.conversationId = null;
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
                const isTimeout = typeof action.payload === 'string' && action.payload.includes('timeout');
                state.messages.push({
                    role: 'bot',
                    text: isTimeout
                        ? '⏱️ AI đang xử lý mất nhiều thời gian quá. Vui lòng thử lại!'
                        : '⚠️ Xin lỗi, mình không thể kết nối lúc này. Vui lòng thử lại!',
                });
            });
    },
});

export const { addUserMessage, clearChatbot, setConversationId } = chatbotSlice.actions;
export default chatbotSlice.reducer;
