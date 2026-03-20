import { useState, useEffect, useRef } from 'react';
import { Search, Star, ChevronRight, LogOut, X, Send } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { logout } from '../store/slice/LoginSlice';
import { fetchProfileThunk, resetProfile } from '../store/slice/ProfileSlice';
import { clearTokens } from '../utils/headerApi';
import { addUserMessage, askChatbotThunk } from '../store/slice/ChatbotGeminiSlice';
import bannerImg from '../assets/images/banner.jpg';
import planeImg from '../assets/images/plane.png';
import chatbotImg from '../assets/images/image_chatbot.png';
import logoImg from '../assets/images/image_logo_vivu.png';
import profileImg from '../assets/images/image_profile.png';
import locationImg from '../assets/images/image_location.png';
import text1Img from '../assets/images/image_text1.png';
import text2Img from '../assets/images/image_text2.png';
import text3Img from '../assets/images/image_text3.png';

// ─────────────────────────────────────────────
// Profile Dropdown
// ─────────────────────────────────────────────
function ProfileDropdown() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { profile } = useSelector((s: RootState) => s.profile);
  const loginUser = useSelector((s: RootState) => s.login.user);
  const isLoggedIn = !!loginUser;

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchProfileThunk());
    }
  }, [isLoggedIn, loginUser?.id, dispatch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleProfileClick = () => {
    if (!isLoggedIn) {
      navigate({ to: '/auth' });
    } else {
      setOpen((prev) => !prev);
    }
  };

  const handleLogout = () => {
    clearTokens();
    dispatch(logout());
    dispatch(resetProfile());
    setOpen(false);
    navigate({ to: '/' });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleProfileClick}
        className="flex h-12 w-12 items-center justify-center rounded-full overflow-hidden border-2 border-white/50 shadow-lg transition-all hover:scale-105 active:scale-95"
      >
        <img src={profileImg} alt="User profile" className="h-full w-full object-cover" />
      </button>

      {open && isLoggedIn && profile && (
        <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-2xl bg-white shadow-2xl border border-blue-100 animate-fade-in">
          <div className="flex items-center gap-4 border border-dashed border-blue-300 m-3 rounded-xl p-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-purple-100 flex-shrink-0">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-purple-600">
                  {profile.fullName.charAt(0)}
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-[#00008A]">{profile.fullName}</h3>
          </div>

          <div className="px-4 pb-2">
            <p className="mb-3 text-sm font-bold text-[#00008A]">Thông tin cá nhân:</p>
            {[
              { label: 'Tên tài khoản', value: profile.fullName },
              { label: 'Email', value: profile.email },
              { label: 'Số điện thoại', value: profile.phone || '—' },
            ].map(({ label, value }) => (
              <button
                key={label}
                className="flex w-full items-center justify-between border-b border-gray-100 py-3 text-sm text-gray-700 hover:bg-gray-50 px-1 rounded transition"
              >
                <span className="text-gray-600">{label}</span>
                <span className="flex items-center gap-1 font-medium text-gray-800 max-w-[160px] truncate">
                  {value}
                  <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                </span>
              </button>
            ))}
          </div>

          <div className="p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00008A] py-3 font-bold text-white transition hover:bg-[#0000aa] active:scale-95"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Chatbot Widget
// ─────────────────────────────────────────────
function ChatbotWidget() {
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
          className={`relative flex items-center gap-1.5 rounded-2xl rounded-br-sm bg-white px-3 py-2 text-xs font-semibold text-[#00008A] shadow-lg border border-[#FFD700]/60 transition-all duration-300 ${
            showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
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
          ? 'w-[360px] h-[520px] scale-100 opacity-100'
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

// ─────────────────────────────────────────────
// Destination Card
// ─────────────────────────────────────────────
const DestinationCard = ({ imageUrl }: { imageUrl: string }) => (
  <div className="relative h-72 w-full overflow-hidden rounded-2xl shadow-lg md:h-80 group">
    <img src={imageUrl} alt="Destination" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>
    <div className="absolute bottom-0 left-0 p-4">
      <h3 className="text-xl font-bold text-white drop-shadow-lg">Bản cát cát</h3>
      <p className="mt-1 text-[11px] leading-snug text-gray-200 pr-2">
        Bản làng du lịch nổi tiếng gần Sa Pa, thu hút du khách bởi cảnh đẹp núi rừng và văn hóa người H'Mông.
      </p>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={14} fill="#FFD700" className="text-[#FFD700]" />
        ))}
      </div>
    </div>
  </div>
);

const mockImages = [
  'https://images.unsplash.com/photo-1541432901042-2b8bd6f8892d?q=80&w=400',
  'https://images.unsplash.com/photo-1603566234586-22a3d0628e35?q=80&w=400',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=400',
  'https://images.unsplash.com/photo-1504280741564-f20387431e67?q=80&w=400',
  'https://images.unsplash.com/photo-1541432901042-2b8bd6f8892d?q=80&w=400',
  'https://images.unsplash.com/photo-1603566234586-22a3d0628e35?q=80&w=400',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=400',
  'https://images.unsplash.com/photo-1504280741564-f20387431e67?q=80&w=400',
];

export function HomePage() {
  return (
    <div className="w-full bg-white font-['Inter']">
      {/* Hero Section */}
      <div
        className="relative min-h-screen w-full overflow-hidden"
        style={{
          backgroundImage: `url(${bannerImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="relative z-10 mx-auto flex h-full min-h-screen max-w-7xl flex-col items-center px-4 pt-8">

          {/* Header */}
          <header className="flex w-full items-center justify-between px-2 sm:px-8">
            <div className="flex-1"></div>
            {/* Logo */}
            <div className="flex-1 flex justify-center">
              <img src={logoImg} alt="vivu logo" className="h-40 object-contain drop-shadow-md" />
            </div>
            {/* User Icon */}
            <div className="flex flex-1 justify-end">
              <ProfileDropdown />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex w-full flex-1 flex-col items-center justify-center pb-32">

            {/* Hero image text */}
            <div className="mb-12">
              <img src={text1Img} alt="Hôm nay đi đâu ?" className="max-w-2xl w-full drop-shadow-2xl" />
            </div>

            {/* Search Bar */}
            <div className="relative mb-8 w-full max-w-2xl px-4 sm:px-0">
              <div className="relative flex h-16 items-center overflow-hidden rounded-full border border-blue-900/40 bg-white/20 shadow-lg backdrop-blur-md transition-all focus-within:border-white/60 focus-within:bg-white/40 focus-within:shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:bg-white/30 hover:shadow-xl">
                <input
                  type="text"
                  placeholder="Tìm kiếm ngay"
                  className="h-full w-full bg-transparent px-8 text-lg text-[#002B6B] placeholder-[#002B6B]/60 outline-none"
                />
                <button className="flex h-full items-center justify-center px-6 text-[#002B6B] transition-colors hover:text-blue-900">
                  <Search size={28} />
                </button>
              </div>
            </div>

            {/* CTA Button */}
            <button className="group mt-4 flex items-center justify-center gap-3 rounded-full bg-[#E0F7FA] px-8 py-4 font-bold text-[#002B6B] shadow-lg transition-all hover:-translate-y-1 hover:bg-white hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] active:translate-y-0 disabled:opacity-70">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm overflow-hidden">
                <img src={locationImg} alt="location" className="h-7 w-7 object-contain" />
              </div>
              <span className="text-xl">Khám phá ngay</span>
            </button>

          </main>
        </div>
      </div>

      {/* Nào mình cùng vi vu */}
      <section className="mx-auto mt-16 max-w-6xl px-4 py-8">
        <div className="mb-12 flex items-center justify-center gap-4">
          <img src={text2Img} alt="Nào mình cùng vi vu" className="h-16 object-contain drop-shadow-md" />
          <div className="animate-bounce">
            <img src={chatbotImg} alt="chatbot" className="h-16 w-16 object-contain" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {mockImages.map((img, i) => (
            <DestinationCard key={i} imageUrl={img} />
          ))}
        </div>
      </section>

      {/* Airplane Info Section */}
      <section className="relative mt-8 mb-8 overflow-hidden py-32 sm:py-40">
        <div
          className="absolute inset-0 bg-gradient-to-b from-white to-[#D6FFFC]"
          style={{ clipPath: 'polygon(0% 50%, 8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%)' }}
        ></div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 md:flex-row md:gap-8">
          <div className="w-full flex-1 mb-8 md:mb-0 transform transition-transform duration-1000 hover:scale-105">
            <img src={planeImg} alt="Airplane graphic" className="w-[130%] -ml-[15%] scale-125 drop-shadow-2xl md:w-[150%] md:-ml-[25%]" />
          </div>
          <div className="flex-1 px-4 md:pl-12">
            <p className="text-left font-medium text-[#00008A] text-lg md:text-xl leading-[1.8] max-w-md">
              Tại đây, bạn có thể khám phá các địa điểm nổi bật, trải nghiệm văn hóa – ẩm thực đặc sắc, xem đánh giá thực tế từ cộng đồng và dễ dàng lựa chọn hành trình phù hợp với sở thích của mình.
            </p>
          </div>
        </div>
      </section>

      {/* Bạn thích trải nghiệm */}
      <section className="mx-auto mt-8 max-w-6xl px-4 py-16">
        <div className="mb-12 flex justify-center">
          <img src={text3Img} alt="Bạn thích trải nghiệm" className="h-16 object-contain drop-shadow-md" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {mockImages.map((img, i) => (
            <DestinationCard key={i} imageUrl={img} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 h-20 w-full bg-[#00008A]"></footer>

      {/* Chatbot Widget — fixed bottom-right over all content */}
      <ChatbotWidget />
    </div>
  );
}
