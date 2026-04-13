import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchLeaderboardUsersThunk } from '../store/slice/RankSlice';
import { Trophy, Star, TrendingUp, Info, Award, Image, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import MainHeader from '../components/MainHeader';
import bannerImg from '../assets/images/banner.jpg';
import Footer from '../components/Footer';
import { ChatbotWidget } from '../components/ChatbotWidget';

function getAvatarUrl(avatarUrl: string, seed: string) {
  if (avatarUrl && avatarUrl.trim() !== '') return avatarUrl;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

export default function RankPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error, totalCount } = useSelector((state: RootState) => state.rank);

  useEffect(() => {
    dispatch(fetchLeaderboardUsersThunk({ PageNumber: 1, PageSize: 10 }));
  }, [dispatch]);

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="min-h-screen bg-white font-['Inter']">
      {/* Header Banner */}
      <div
        className="w-full h-32 relative shadow-md"
        style={{
          backgroundImage: `url(${bannerImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <MainHeader transparent={true} />
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12">
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

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-[#00008A]" size={40} />
            <p className="text-gray-500 font-medium">Đang tải bảng xếp hạng...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mx-auto max-w-md flex flex-col items-center gap-4 py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
              <AlertCircle size={28} />
            </div>
            <p className="font-bold text-red-500">{error}</p>
            <button
              onClick={() => dispatch(fetchLeaderboardUsersThunk({ PageNumber: 1, PageSize: 10 }))}
              className="mt-2 rounded-xl bg-[#00008A] px-6 py-2 text-sm font-bold text-white hover:bg-blue-900 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Podium for Top 3 */}
        {!loading && !error && users.length > 0 && (
          <>
            <div className="mb-20 flex flex-col md:flex-row items-end justify-center gap-4 md:gap-0">
              {/* 2nd Place */}
              {top3[1] && (
                <div className="order-2 md:order-1 flex w-full md:w-56 flex-col items-center">
                  <div className="relative mb-4">
                    <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-gray-200 shadow-lg">
                      <img
                        src={getAvatarUrl(top3[1].avatarUrl, top3[1].userId)}
                        alt={top3[1].fullName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-400 text-white rounded-full px-3 py-0.5 text-xs font-bold ring-2 ring-white">
                      #2
                    </div>
                  </div>
                  <p className="font-bold text-[#00008A] mb-1 text-center px-2 truncate max-w-full">{top3[1].fullName}</p>
                  <p className="text-sm font-bold text-orange-600 mb-1">{top3[1].totalScore} đ</p>
                  <p className="text-[11px] text-gray-400 mb-4">{top3[1].totalReviews} đánh giá</p>
                  <div className="h-24 w-full bg-gradient-to-t from-gray-100 to-white rounded-t-3xl border-x border-t border-gray-100 flex items-center justify-center">
                    <Award className="text-gray-300" size={32} />
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {top3[0] && (
                <div className="order-1 md:order-2 z-10 flex w-full md:w-64 flex-col items-center">
                  <div className="relative mb-6">
                    <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-yellow-400 shadow-2xl ring-4 ring-yellow-100">
                      <img
                        src={getAvatarUrl(top3[0].avatarUrl, top3[0].userId)}
                        alt={top3[0].fullName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-white rounded-full px-4 py-1 text-sm font-bold ring-2 ring-white shadow-md">
                      #1
                    </div>
                  </div>
                  <p className="text-xl font-black text-[#00008A] mb-1 text-center px-2 truncate max-w-full">{top3[0].fullName}</p>
                  <p className="text-lg font-black text-orange-600 mb-1">{top3[0].totalScore} đ</p>
                  <p className="text-[11px] text-gray-400 mb-6">{top3[0].totalReviews} đánh giá</p>
                  <div className="h-40 w-full bg-gradient-to-t from-yellow-50 to-white rounded-t-3xl border-x border-t border-yellow-100 flex items-center justify-center">
                    <Trophy className="text-yellow-400" size={48} />
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <div className="order-3 md:order-3 flex w-full md:w-56 flex-col items-center">
                  <div className="relative mb-4">
                    <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-orange-200 shadow-lg">
                      <img
                        src={getAvatarUrl(top3[2].avatarUrl, top3[2].userId)}
                        alt={top3[2].fullName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-white rounded-full px-3 py-0.5 text-xs font-bold ring-2 ring-white">
                      #3
                    </div>
                  </div>
                  <p className="font-bold text-[#00008A] mb-1 text-center px-2 truncate max-w-full">{top3[2].fullName}</p>
                  <p className="text-sm font-bold text-orange-600 mb-1">{top3[2].totalScore} đ</p>
                  <p className="text-[11px] text-gray-400 mb-4">{top3[2].totalReviews} đánh giá</p>
                  <div className="h-20 w-full bg-gradient-to-t from-orange-50 to-white rounded-t-3xl border-x border-t border-orange-50 flex items-center justify-center">
                    <Award className="text-orange-200" size={32} />
                  </div>
                </div>
              )}
            </div>

            {/* List for rank 4+ */}
            {rest.length > 0 && (
              <div className="mx-auto max-w-4xl flex flex-col gap-4">
                {rest.map((user) => (
                  <div
                    key={user.userId}
                    className="group flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-blue-100"
                  >
                    <div className="w-10 text-center font-bold text-gray-400">#{user.rank}</div>
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100 flex-shrink-0">
                      <img
                        src={getAvatarUrl(user.avatarUrl, user.userId)}
                        alt={user.fullName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#00008A] truncate">{user.fullName}</p>
                      <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                        {user.totalReviews} đánh giá
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-black text-[#00008A]">{user.totalScore}</div>
                      <div className="text-[11px] font-bold text-orange-600 uppercase tracking-tighter">Điểm tích lũy</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state - only 1 or 2 users (no rank 4+) */}
            {users.length > 0 && rest.length === 0 && (
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <TrendingUp size={18} />
                  <span className="text-sm font-medium">Chưa có thêm thành viên nào trong bảng xếp hạng.</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty state - no users at all */}
        {!loading && !error && users.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300">
              <Trophy size={32} />
            </div>
            <p className="text-gray-500 font-medium">Chưa có dữ liệu bảng xếp hạng.</p>
          </div>
        )}
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
