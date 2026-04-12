import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Send } from 'lucide-react';
import type { AppDispatch, RootState } from '../store';
import { addUserMessage, askChatbotThunk } from '../store/slice/ChatbotGeminiSlice';
import chatbotImg from '../assets/images/image_chatbot.png';
import profileImg from '../assets/images/image_profile.png';

export function ChatbotWidget() {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, loading } = useSelector((s: RootState) => s.chatbot);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, open]);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    dispatch(addUserMessage(text));
    dispatch(askChatbotThunk(text));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Periodic tooltip: show every 5s for 2s
  const [showTooltip, setShowTooltip] = useState(false);
  useEffect(() => {
    if (open) return;
    const cycle = () => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    };
    cycle(); // show immediately on mount
    const id = setInterval(cycle, 5000);
    return () => clearInterval(id);
  }, [open]);

  return (
    <>
      {/* Floating chatbot button + tooltip */}
      <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2 transition-all duration-300 ${open ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Tooltip bubble */}
        <div
          className={`relative flex items-center gap-1.5 rounded-2xl rounded-br-sm bg-white px-3 py-2 text-xs font-semibold text-[#00008A] shadow-lg border border-[#FFD700]/60 transition-all duration-300 ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
        >
          <span>💬 Chat với tôi</span>
          {/* Little triangle pointer at bottom-right */}
          <span className="absolute -bottom-2 right-4 h-0 w-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white drop-shadow-sm" />
        </div>

        {/* Button with bounce */}
        <button
          onClick={() => setOpen(true)}
          className="animate-bounce flex h-16 w-16 items-center justify-center rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-150"
          title="Mở chatbot AI du lịch"
        >
          <img src={chatbotImg} alt="AI Chatbot" className="h-14 w-14 object-contain drop-shadow-md" />
        </button>
      </div>

      {/* Chat panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 origin-bottom-right ${open
          ? 'w-[420px] h-[600px] scale-100 opacity-100'
          : 'w-16 h-16 scale-0 opacity-0 pointer-events-none'
          }`}
        style={{ border: '1.5px solid #f0e9c5' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/30 backdrop-blur-sm">
              <img src={chatbotImg} alt="bot" className="h-7 w-7 object-contain" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">AI Du lịch</p>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
                <span className="text-white/80 text-xs">Đang hoạt động</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: '#fafaf7' }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {msg.role === 'bot' && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FFD700] shadow-sm">
                  <img src={chatbotImg} alt="bot" className="h-5 w-5 object-contain" />
                </div>
              )}
              {msg.role === 'user' && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-500 overflow-hidden shadow-sm">
                  <img src={profileImg} alt="user" className="h-full w-full object-cover" />
                </div>
              )}

              {/* Bubble */}
              <div
                className={`max-w-[220px] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${msg.role === 'bot'
                  ? 'bg-[#FFF9DB] text-gray-800 rounded-bl-sm'
                  : 'bg-[#00008A] text-white rounded-br-sm'
                  }`}
                style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-end gap-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FFD700] shadow-sm">
                <img src={chatbotImg} alt="bot" className="h-5 w-5 object-contain" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-[#FFF9DB] px-4 py-3 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#FFA500] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-[#FFA500] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-[#FFA500] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex items-center gap-2 border-t border-gray-100 bg-white px-3 py-3 flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập thông tin..."
            disabled={loading}
            className="flex-1 rounded-full border border-[#FFD700] bg-white px-4 py-2.5 text-sm text-gray-800 outline-none placeholder-gray-400 focus:border-[#FFA500] focus:ring-2 focus:ring-[#FFD700]/30 disabled:opacity-60 transition"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FFD700] text-[#00008A] shadow-md transition-all hover:brightness-110 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
