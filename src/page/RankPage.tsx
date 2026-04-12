import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { Trophy, Star, TrendingUp, Info, Award, Image, MessageSquare } from 'lucide-react';
import MainHeader from '../components/MainHeader';
import Footer from '../components/Footer';
import { ChatbotWidget } from '../components/ChatbotWidget';

// Mock data for user rankings
const MOCK_USERS = [
    { id: '1', fullName: 'Nguyễn Văn A', avatarUrl: null, score: 250, reviews: 85 },
    { id: '2', fullName: 'Trần Thị B', avatarUrl: null, score: 245, reviews: 82 },
    { id: '3', fullName: 'Lê Hoàng C', avatarUrl: null, score: 230, reviews: 78 },
    { id: '4', fullName: 'Phạm Minh D', avatarUrl: null, score: 210, reviews: 70 },
    { id: '5', fullName: 'Hoàng Kim E', avatarUrl: null, score: 195, reviews: 65 },
    { id: '6', fullName: 'Đặng Bảo F', avatarUrl: null, score: 180, reviews: 60 },
    { id: '7', fullName: 'Vũ Mạnh G', avatarUrl: null, score: 165, reviews: 55 },
    { id: '8', fullName: 'Bùi Tuyết H', avatarUrl: null, score: 150, reviews: 50 },
];

export default function RankPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'places'>('users');

  return (
    <div className="min-h-screen bg-white font-['Inter']">
      <MainHeader />
      
      <main className="mx-auto max-w-7xl px-4 py-12 pt-32">
        {/* Header Section */}
        <div className="mb-12 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600 mb-6 shadow-sm">
                <Trophy size={32} />
            </div>
            <h1 className="text-3xl font-bold text-[#00008A]">Bảng xếp hạng tài khoản</h1>
            <p className="mt-4 text-gray-700 max-w-2xl mx-auto">
                Vinh danh những thành viên có đóng góp tích cực nhất cho cộng đồng Vivu.
            </p>
        </div>

        {/* Scoring Logic Info */}
        <div className="mx-auto mb-16 max-w-4xl rounded-3xl bg-blue-50 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border border-blue-100 shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-[#00008A] shadow-sm flex-shrink-0">
                <Info size={28} />
            </div>
            <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-bold text-[#00008A] mb-2">Quy tắc tính điểm Vivu AI</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                    Hệ thống AI của chúng tôi sẽ chấm điểm dựa trên mỗi đánh giá:
                    <span className="mx-1 inline-flex items-center gap-1 font-bold text-[#00008A]">
                        <Image size={14} /> Ảnh
                    </span> + 
                    <span className="mx-1 inline-flex items-center gap-1 font-bold text-[#00008A]">
                        <Star size={14} /> Rating
                    </span> + 
                    <span className="mx-1 inline-flex items-center gap-1 font-bold text-[#00008A]">
                        <MessageSquare size={14} /> Bình luận
                    </span> = 
                    <span className="ml-1 font-bold text-orange-600 text-base">3 điểm</span>.
                    Thiếu 1 trong 3 yếu tố trên sẽ bị trừ 1 điểm.
                </p>
            </div>
            <div className="flex gap-2">
                <div className="bg-white rounded-2xl px-4 py-2 text-center shadow-sm">
                    <span className="block text-xl font-bold text-[#00008A]">Top 1%</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Expert</span>
                </div>
            </div>
        </div>

        {/* Podium for Top 3 */}
        <div className="mb-20 flex flex-col md:flex-row items-end justify-center gap-4 md:gap-0">
            {/* 2nd Place */}
            <div className="order-2 md:order-1 flex w-full md:w-56 flex-col items-center">
                <div className="relative mb-4">
                    <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-gray-200 shadow-lg">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${MOCK_USERS[1].id}`} alt={MOCK_USERS[1].fullName} className="h-full w-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-400 text-white rounded-full px-3 py-0.5 text-xs font-bold ring-2 ring-white">#2</div>
                </div>
                <p className="font-bold text-[#00008A] mb-1">{MOCK_USERS[1].fullName}</p>
                <p className="text-sm font-bold text-orange-600 mb-4">{MOCK_USERS[1].score} đ</p>
                <div className="h-24 w-full bg-gradient-to-t from-gray-100 to-white rounded-t-3xl border-x border-t border-gray-100 flex items-center justify-center">
                    <Award className="text-gray-300" size={32} />
                </div>
            </div>

            {/* 1st Place */}
            <div className="order-1 md:order-2 z-10 flex w-full md:w-64 flex-col items-center">
                <div className="relative mb-6">
                    <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-yellow-400 shadow-2xl ring-4 ring-yellow-100">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${MOCK_USERS[0].id}`} alt={MOCK_USERS[0].fullName} className="h-full w-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-white rounded-full px-4 py-1 text-sm font-bold ring-2 ring-white shadow-md">#1</div>
                </div>
                <p className="text-xl font-black text-[#00008A] mb-1">{MOCK_USERS[0].fullName}</p>
                <p className="text-lg font-black text-orange-600 mb-6">{MOCK_USERS[0].score} đ</p>
                <div className="h-40 w-full bg-gradient-to-t from-yellow-50 to-white rounded-t-3xl border-x border-t border-yellow-100 flex items-center justify-center">
                    <Trophy className="text-yellow-400" size={48} />
                </div>
            </div>

            {/* 3rd Place */}
            <div className="order-3 md:order-3 flex w-full md:w-56 flex-col items-center">
                <div className="relative mb-4">
                    <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-orange-200 shadow-lg">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${MOCK_USERS[2].id}`} alt={MOCK_USERS[2].fullName} className="h-full w-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-white rounded-full px-3 py-0.5 text-xs font-bold ring-2 ring-white">#3</div>
                </div>
                <p className="font-bold text-[#00008A] mb-1">{MOCK_USERS[2].fullName}</p>
                <p className="text-sm font-bold text-orange-600 mb-4">{MOCK_USERS[2].score} đ</p>
                <div className="h-20 w-full bg-gradient-to-t from-orange-50 to-white rounded-t-3xl border-x border-t border-orange-50 flex items-center justify-center">
                    <Award className="text-orange-200" size={32} />
                </div>
            </div>
        </div>

        {/* List for others */}
        <div className="mx-auto max-w-4xl flex flex-col gap-4">
            {MOCK_USERS.slice(3).map((user, i) => (
                <div 
                    key={user.id}
                    className="group flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-blue-100"
                >
                    <div className="w-10 text-center font-bold text-gray-400">#{i + 4}</div>
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt={user.fullName} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-[#00008A]">{user.fullName}</p>
                        <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">{user.reviews} đánh giá</p>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-black text-[#00008A]">{user.score}</div>
                        <div className="text-[11px] font-bold text-orange-600 uppercase tracking-tighter">Điểm tích lũy</div>
                    </div>
                </div>
            ))}
        </div>
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}

