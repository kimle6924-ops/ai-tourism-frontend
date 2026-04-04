import axiosInstance from '../utils/headerApi';

export interface CreateConversationResponse {
    data: {
        id: string;
        title: string;
        model: string;
        status: number;
        lastMessageAt: string;
        createdAt: string;
    };
    success: boolean;
    error: string | null;
    errorCode: string | null;
    statusCode: number;
    errors: unknown | null;
}

export interface SendMessageRequest {
    content: string;
}

export interface SendMessageResponse {
    data: {
        id: string;
        conversationId: string;
        role: number;
        content: string;
        tokenCount: number;
        citations: unknown[];
        createdAt: string;
    };
    success: boolean;
    error: string | null;
    errorCode: string | null;
    statusCode: number;
    errors: unknown | null;
}

const ChatbotGeminiService = {
    // Step 1: Create a new conversation
    createConversation: async (): Promise<CreateConversationResponse> => {
        try {
            console.log('[Chatbot] createConversation → POST /api/chat/conversations');
            const res = await axiosInstance.post<CreateConversationResponse>('/api/chat/conversations', {
                title: 'Cuộc trò chuyện mới',
            });
            console.log('[Chatbot] createConversation ← status:', res.status, 'data:', res.data);
            return res.data;
        } catch (err: any) {
            console.error('[Chatbot] createConversation ERROR:');
            console.error('  status :', err.response?.status);
            console.error('  body   :', err.response?.data);
            throw err;
        }
    },

    // Step 2: Send message to existing conversation
    sendMessage: async (conversationId: string, payload: SendMessageRequest): Promise<SendMessageResponse> => {
        try {
            console.log('[Chatbot] sendMessage → conversationId:', conversationId, 'payload:', payload);
            const res = await axiosInstance.post<SendMessageResponse>(
                `/api/chat/conversations/${conversationId}/messages`,
                payload,
                { timeout: 60_000 }, // AI cần nhiều thời gian hơn → 60s
            );
            console.log('[Chatbot] sendMessage ← status:', res.status, 'data:', res.data);
            return res.data;
        } catch (err: any) {
            const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
            console.error('[Chatbot] sendMessage ERROR:');
            console.error('  type   :', isTimeout ? '⏱️ TIMEOUT (AI mất quá lâu)' : 'Network/HTTP error');
            console.error('  status :', err.response?.status ?? '(no response)');
            console.error('  url    :', err.config?.url);
            console.error('  body   :', err.response?.data ?? '(no response body)');
            throw err;
        }
    },
};

export default ChatbotGeminiService;

