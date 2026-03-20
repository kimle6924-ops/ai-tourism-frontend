import axiosInstance from '../utils/headerApi';

export interface ChatbotAskRequest {
    question: string;
}

export interface ChatbotAskResponse {
    data: {
        question: string;
        answer: string;
    };
    success: boolean;
    error: string | null;
    errorCode: string | null;
    statusCode: number;
    errors: unknown | null;
}

const ChatbotGeminiService = {
    ask: async (payload: ChatbotAskRequest): Promise<ChatbotAskResponse> => {
        const res = await axiosInstance.post<ChatbotAskResponse>(
            '/api/GeminiTest/ask-api',
            payload,
        );
        return res.data;
    },
};

export default ChatbotGeminiService;
