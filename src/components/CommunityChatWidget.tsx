import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch, useSelector } from 'react-redux';
import { X, Send, Image as ImageIcon, Users } from 'lucide-react';
import type { AppDispatch, RootState } from '../store';
import {
    clearCommunityError,
    createCommunityPostThunk,
    fetchCommunityGroupThunk,
    fetchCommunityPostsThunk,
} from '../store/slice/CommunitySlice';
import profileImg from '../assets/images/image_profile.png';

const PAGE_SIZE = 20;

const formatTime = (value: string): string =>
    new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

export function CommunityChatWidget() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { user } = useSelector((state: RootState) => state.login);
    const { group, posts, loadingList, creatingPost, error } = useSelector((state: RootState) => state.community);

    const messages = useMemo(() => [...posts].reverse(), [posts]);
    const previews = useMemo(
        () => selectedFiles.map((file) => ({ key: `${file.name}-${file.lastModified}`, file, url: URL.createObjectURL(file) })),
        [selectedFiles],
    );

    useEffect(() => {
        if (!open) return;
        dispatch(fetchCommunityGroupThunk());
        dispatch(fetchCommunityPostsThunk({ pageNumber: 1, pageSize: PAGE_SIZE }));
    }, [open, dispatch]);

    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        return () => clearTimeout(timer);
    }, [messages, open]);

    useEffect(() => {
        return () => {
            previews.forEach((item) => URL.revokeObjectURL(item.url));
        };
    }, [previews]);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        if (files.length === 0) return;
        setSelectedFiles((prev) => [...prev, ...files]);
        event.target.value = '';
    };

    const handleRemoveFile = (target: File) => {
        setSelectedFiles((prev) => prev.filter((file) => file !== target));
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        if (!user) {
            navigate({ to: '/auth' });
            return;
        }

        try {
            await dispatch(createCommunityPostThunk({ content: input, files: selectedFiles })).unwrap();
            setInput('');
            setSelectedFiles([]);
            dispatch(fetchCommunityPostsThunk({ pageNumber: 1, pageSize: PAGE_SIZE }));
        } catch {
            // handled by slice
        }
    };

    return (
        <>
            <div className={`fixed bottom-[130px] right-6 z-50 flex flex-col items-center gap-2 transition-all duration-300 ${open ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="relative flex items-center gap-1.5 rounded-2xl rounded-br-sm bg-white px-3 py-2 text-xs font-semibold text-indigo-600 shadow-lg border border-indigo-100">
                    <span>{group?.name ?? 'Cộng đồng'}</span>
                    <span className="absolute -bottom-2 right-4 h-0 w-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white" />
                </div>
                <button
                    onClick={() => setOpen(true)}
                    className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)] transition-all hover:scale-110 active:scale-95"
                    title="Cộng đồng Du lịch"
                >
                    <Users className="text-white group-hover:scale-110 transition-transform" size={28} />
                </button>
            </div>

            <div
                className={`fixed bottom-[130px] right-6 z-50 flex flex-col overflow-hidden rounded-3xl bg-[#f8fafc] shadow-2xl transition-all duration-300 origin-bottom-right ${open
                    ? 'w-[380px] h-[600px] max-h-[80vh] scale-100 opacity-100'
                    : 'w-16 h-16 scale-0 opacity-0 pointer-events-none'
                    }`}
                style={{ border: '1px solid #e2e8f0' }}
            >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 text-white flex items-center justify-between shadow-md z-10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                            <Users size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[15px] leading-tight">{group?.name ?? 'Cộng đồng Du lịch'}</h3>
                            <p className="text-[11px] text-indigo-100 font-medium">
                                {group?.description ?? 'Chia sẻ trải nghiệm cùng mọi người'}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 bg-slate-50/50">
                    {loadingList ? (
                        <p className="text-center text-sm text-gray-500">Đang tải hội thoại...</p>
                    ) : messages.length === 0 ? (
                        <p className="text-center text-sm text-gray-500">Chưa có tin nhắn nào.</p>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.userId === user?.id;
                            return (
                                <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <div className="flex-shrink-0">
                                        <img src={msg.userAvatarUrl || profileImg} className="h-8 w-8 rounded-full object-cover shadow-sm ring-2 ring-white" alt="avatar" />
                                    </div>
                                    <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            <span className="text-[11px] font-semibold text-gray-600">{msg.userFullName}</span>
                                        </div>
                                        <div className={`relative rounded-2xl p-3 shadow-sm ${isMe
                                            ? 'bg-gradient-to-br from-indigo-400 to-indigo-500 text-white rounded-tr-sm'
                                            : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
                                            }`}>
                                            {msg.media.length > 0 && (
                                                <div className="mb-2 grid grid-cols-1 gap-2">
                                                    {msg.media.map((media) => (
                                                        <img
                                                            key={media.id}
                                                            src={media.secureUrl || media.url}
                                                            className="w-full object-cover max-h-48 rounded-lg"
                                                            alt="post"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                            {msg.content && <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 font-medium">{formatTime(msg.createdAt)}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} className="h-2" />
                </div>

                {previews.length > 0 && (
                    <div className="px-4 py-3 bg-indigo-50/50 border-t border-indigo-100 flex-shrink-0">
                        <div className="grid grid-cols-4 gap-2">
                            {previews.map((item) => (
                                <div key={item.key} className="relative h-14 w-full rounded-lg overflow-hidden">
                                    <img src={item.url} className="h-full w-full object-cover" alt="preview" />
                                    <button
                                        onClick={() => handleRemoveFile(item.file)}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} className="text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100 flex items-center justify-between">
                        <span className="truncate pr-2">{error}</span>
                        <button onClick={() => dispatch(clearCommunityError())} className="font-semibold underline">Ẩn</button>
                    </div>
                )}

                <div className="px-4 py-3 bg-white border-t flex items-center gap-2 flex-shrink-0">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
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
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && void handleSend()}
                        placeholder={user ? 'Chia sẻ khoảnh khắc...' : 'Đăng nhập để gửi tin nhắn'}
                        className="flex-1 bg-gray-100 border border-transparent rounded-full px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder-gray-400"
                    />

                    <button
                        onClick={() => void handleSend()}
                        disabled={creatingPost || !input.trim()}
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md group pl-0.5"
                    >
                        <Send size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </>
    );
}

