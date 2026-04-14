import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Send, Image as ImageIcon, Users, Camera, MapPin } from 'lucide-react';
import type { AppDispatch, RootState } from '../store';
// Giả sử bạn có slice mới cho community
// import { addMessageThunk } from '../store/slice/CommunitySlice'; 

import profileImg from '../assets/images/image_profile.png';

interface Message {
    id: string;
    user: string;
    avatar: string;
    text: string;
    image?: string;
    role: 'me' | 'other';
    timestamp: string;
}

export function CommunityChatWidget() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Giả lập dữ liệu cộng đồng
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            user: 'Hoàng Nam',
            avatar: profileImg,
            text: 'Chuyến đi Hà Giang của mình tuyệt quá mọi người ơi! 🏔️',
            image: 'https://images.unsplash.com/photo-1505993597083-3bd19fb75e57',
            role: 'other',
            timestamp: '10:30'
        }
    ]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (open) {
            setTimeout(() => scrollToBottom(), 100);
        }
    }, [messages, open]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSend = () => {
        if (!input.trim() && !selectedImage) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            user: 'Bạn',
            avatar: profileImg,
            text: input,
            image: previewUrl || undefined,
            role: 'me',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, newMessage]);
        setInput('');
        setSelectedImage(null);
        setPreviewUrl(null);
    };

    return (
        <>
            {/* Nút mở Chat */}
            <div className={`fixed bottom-[130px] right-6 z-50 flex flex-col items-center gap-2 transition-all duration-300 ${open ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {/* Tooltip */}
                <div className="relative flex items-center gap-1.5 rounded-2xl rounded-br-sm bg-white px-3 py-2 text-xs font-semibold text-indigo-600 shadow-lg border border-indigo-100 animate-pulse">
                    <span>🌍 Cộng đồng</span>
                    <span className="absolute -bottom-2 right-4 h-0 w-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white" />
                </div>
                <button
                    onClick={() => setOpen(true)}
                    className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)] transition-all hover:scale-110 active:scale-95"
                    title="Cộng đồng Du lịch"
                >
                    <Users className="text-white group-hover:scale-110 transition-transform" size={28} />
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[11px] text-white font-bold max-h-none border-2 border-white shadow-sm">12</span>
                </button>
            </div>

            {/* Khung Chat Cộng Đồng */}
            <div
                className={`fixed bottom-[130px] right-6 z-50 flex flex-col overflow-hidden rounded-3xl bg-[#f8fafc] shadow-2xl transition-all duration-300 origin-bottom-right ${open
                    ? 'w-[380px] h-[600px] max-h-[80vh] scale-100 opacity-100'
                    : 'w-16 h-16 scale-0 opacity-0 pointer-events-none'
                    }`}
                style={{ border: '1px solid #e2e8f0' }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 text-white flex items-center justify-between shadow-md z-10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                            <Users size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[15px] leading-tight">Cộng đồng Du lịch 🌍</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                <p className="text-[11px] text-indigo-100 font-medium">2,431 người đang online</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Danh sách tin nhắn */}
                <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 bg-slate-50/50 relative">
                    {/* Timestamp divider */}
                    <div className="flex items-center justify-center">
                        <span className="bg-gray-200/60 text-gray-500 text-[10px] font-medium px-3 py-1 rounded-full">Hôm nay</span>
                    </div>

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'me' ? 'flex-row-reverse' : ''}`}>
                            <div className="flex-shrink-0">
                                <img src={msg.avatar} className="h-8 w-8 rounded-full object-cover shadow-sm ring-2 ring-white" alt="avatar" />
                            </div>

                            <div className={`flex flex-col max-w-[75%] ${msg.role === 'me' ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    <span className="text-[11px] font-semibold text-gray-600">{msg.user}</span>
                                    {msg.role === 'other' && <span className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Top fan</span>}
                                </div>

                                <div className={`relative rounded-2xl p-3 shadow-sm ${msg.role === 'me'
                                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-sm'
                                    : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
                                    }`}>
                                    {msg.image && (
                                        <div className="relative mb-2 group rounded-xl overflow-hidden cursor-zoom-in">
                                            <img src={msg.image} className="w-full object-cover max-h-48 group-hover:scale-105 transition-transform duration-300" alt="post" />
                                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                    {msg.text && <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 font-medium">{msg.timestamp}</span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} className="h-2" />
                </div>

                {/* Khu vực xem trước ảnh khi chọn */}
                {previewUrl && (
                    <div className="px-4 py-3 bg-indigo-50/50 flex items-center gap-3 border-t border-indigo-100 flex-shrink-0">
                        <div className="relative h-14 w-14 group rounded-xl shadow-sm border-2 border-white overflow-hidden">
                            <img src={previewUrl} className="h-full w-full object-cover" alt="preview" />
                            <button
                                onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={16} className="text-white" />
                            </button>
                        </div>
                        <span className="text-xs text-indigo-700 font-medium bg-white px-3 py-1.5 rounded-full shadow-sm">Sẵn sàng gửi...</span>
                    </div>
                )}

                {/* Input area */}
                <div className="px-4 py-3 bg-white border-t flex items-center gap-2 flex-shrink-0">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                        title="Đính kèm ảnh"
                    >
                        <ImageIcon size={20} />
                    </button>

                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Chia sẻ khoảnh khắc..."
                        className="flex-1 bg-gray-100 border border-transparent rounded-full px-4 py-2.5 text-sm focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder-gray-400"
                    />

                    <button
                        onClick={handleSend}
                        disabled={!input.trim() && !selectedImage}
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md group pl-0.5"
                    >
                        <Send size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </>
    );
}