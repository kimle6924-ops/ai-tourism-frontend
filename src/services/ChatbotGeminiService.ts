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
        const res = await axiosInstance.post<CreateConversationResponse>('/api/chat/conversations', {
            title: 'Cuộc trò chuyện mới',
        });
        return res.data;
    },

    // Step 2: Send message to existing conversation
    sendMessage: async (conversationId: string, payload: SendMessageRequest): Promise<SendMessageResponse> => {
        const res = await axiosInstance.post<SendMessageResponse>(
            `/api/chat/conversations/${conversationId}/messages`,
            payload,
        );
        return res.data;
    },
};

export default ChatbotGeminiService;
