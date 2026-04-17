import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Camera, Check, ArrowLeft, User, Mail, Phone, Heart, Star, Clock, LogOut } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { AppDispatch, RootState } from '../store';
import { fetchProfileThunk, updateProfileThunk, uploadAvatarThunk } from '../store/slice/ProfileSlice';
import { fetchPreferencesThunk, updatePreferencesThunk } from '../store/slice/PreferencesSlice';
import { fetchCategoriesThunk } from '../store/slice/CategorySlice';
import { fetchMyReviewHistoryThunk, clearUserReviews } from '../store/slice/UserReviewSlice';
import { clearTokens } from '../utils/headerApi';
import MainHeader from '../components/MainHeader';
import Footer from '../components/Footer';

const TYPE_EMOJI: Record<string, string> = {
  theme: '🗺️', style: '✨', activity: '🏃', budget: '💰', companion: '👥',
  tourism: '🌏', food: '🍜', accommodation: '🏨', entertainment: '🎉',
  shopping: '🛍️', event: '🎊',
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, updating, uploadingAvatar } = useSelector((s: RootState) => s.profile);
  const { categoryIds: savedCatIds, loading: prefLoading } = useSelector((s: RootState) => s.preferences);
  const { items: allCategories, loading: catLoading } = useSelector((s: RootState) => s.category);
  const { items: reviewItems, loading: reviewsLoading } = useSelector((s: RootState) => s.userReview);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');

  useEffect(() => {
    dispatch(fetchProfileThunk());
    dispatch(fetchCategoriesThunk());
    dispatch(fetchPreferencesThunk());
    dispatch(fetchMyReviewHistoryThunk());
    return () => {
      dispatch(clearUserReviews());
    };
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? '');
      setEmail(profile.email ?? '');
      setPhone(profile.phone ?? '');
    }
  }, [profile]);

  useEffect(() => {
    if (savedCatIds.length > 0) {
      setSelected(new Set(savedCatIds));
    }
  }, [savedCatIds]);

  const toggleCat = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setSaveError(null);
    const [profResult, prefResult] = await Promise.all([
      dispatch(updateProfileThunk({ fullName, email, phone })),
      dispatch(updatePreferencesThunk(Array.from(selected))),
    ]);
    if (updateProfileThunk.rejected.match(profResult)) {
      const errPayload = profResult.payload as string;
      if (errPayload?.includes('EMAIL_ALREADY_EXISTS') || errPayload?.includes('Email already exists')) {
        setSaveError('Email này đã được sử dụng bởi tài khoản khác.');
      } else {
        setSaveError(errPayload ?? 'Cập nhật thất bại, vui lòng thử lại.');
      }
      return;
    }
    if (updateProfileThunk.fulfilled.match(profResult) && updatePreferencesThunk.fulfilled.match(prefResult)) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    setAvatarSuccess(false);
    setAvatarPreview(URL.createObjectURL(file));
    const result = await dispatch(uploadAvatarThunk(file));
    if (uploadAvatarThunk.fulfilled.match(result)) {
      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 3000);
    } else {
      setAvatarError(result.payload as string ?? 'Upload avatar thất bại');
      setAvatarPreview(null);
    }
  };

  const handleLogout = () => {
    clearTokens();
    sessionStorage.removeItem('hasAskedLocationSession');
    navigate({ to: '/' });
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={14}
          fill={s <= rating ? '#FFD700' : 'transparent'}
          className={s <= rating ? 'text-[#FFD700]' : 'text-gray-300'}
        />
      ))}
    </div>
  );

  const isLoading = catLoading || prefLoading || updating;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter']">
      <MainHeader />

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Header Section */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#00008A]">Trang cá nhân</h1>
            <p className="text-gray-500">Quản lý thông tin và sở thích du lịch của bạn</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Avatar & Summary */}
          <div className="flex flex-col gap-6">
            <div className="rounded-[32px] bg-white p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col items-center">
                <div className="relative group mb-6">
                  <div className="h-40 w-40 rounded-full overflow-hidden border-8 border-[#00008A]/5 shadow-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    {uploadingAvatar ? (
                      <div className="h-full w-full flex items-center justify-center bg-black/20 backdrop-blur-sm">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
                      </div>
                    ) : (avatarPreview ?? profile?.avatarUrl) ? (
                      <img
                        src={avatarPreview ?? profile?.avatarUrl}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl font-black text-indigo-600">
                        {profile?.fullName?.charAt(0) ?? '?'}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={uploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#00008A] text-white shadow-lg border-4 border-white transition hover:scale-110 active:scale-95 disabled:opacity-50"
                  >
                    <Camera size={18} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />
                </div>

                <h2 className="text-2xl font-bold text-[#00008A] text-center mb-1">{profile?.fullName}</h2>
                <p className="text-gray-400 text-sm mb-6">{profile?.email}</p>

                <div className="w-full grid grid-cols-1 gap-3">
                  <div className="rounded-2xl bg-indigo-50/50 p-4 text-center">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Đánh giá</p>
                    <p className="text-xl font-black text-[#00008A]">{reviewItems.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-3 rounded-2xl text-sm font-bold transition ${activeTab === 'info' ? 'bg-[#00008A] text-white shadow-md shadow-indigo-100' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                Thông tin cá nhân
              </button>
              {profile?.role === 2 && (
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-6 py-3 rounded-2xl text-sm font-bold transition ${activeTab === 'reviews' ? 'bg-[#00008A] text-white shadow-md shadow-indigo-100' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  Lịch sử đánh giá
                </button>
              )}
            </div>

            {activeTab === 'info' ? (
              <div className="flex flex-col gap-6">
                {/* ... existing info code ... */}
                <div className="rounded-[32px] bg-white p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-[#00008A] flex items-center gap-2">
                      <User size={20} className="text-indigo-500" /> Hồ sơ cá nhân
                    </h3>
                    {avatarSuccess && <span className="text-xs font-bold text-green-600 animate-pulse">✓ Ảnh đã cập nhật</span>}
                    {saveSuccess && <span className="text-xs font-bold text-green-600 animate-pulse">✓ Đã lưu thay đổi</span>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                        Họ và tên
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder="Nguyễn Văn A"
                          className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-3.5 pl-12 pr-4 
        text-sm font-medium text-gray-800 placeholder-gray-500
        outline-none transition focus:border-[#00008A] focus:bg-white focus:ring-4 focus:ring-indigo-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                        Địa chỉ Email
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          value={email}
                          onChange={e => {
                            setEmail(e.target.value);
                            setSaveError(null);
                          }}
                          type="email"
                          placeholder="example@gmail.com"
                          className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-3.5 pl-12 pr-4 
        text-sm font-medium text-gray-800 placeholder-gray-500
        outline-none transition focus:border-[#00008A] focus:bg-white focus:ring-4 focus:ring-indigo-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <Phone
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="09xx xxx xxx"
                          className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-3.5 pl-12 pr-4 
        text-sm font-medium text-gray-800 placeholder-gray-500
        outline-none transition focus:border-[#00008A] focus:bg-white focus:ring-4 focus:ring-indigo-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[32px] bg-white p-8 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-[#00008A] mb-8 flex items-center gap-2">
                    <Heart size={20} className="text-red-500" /> Sở thích du lịch
                  </h3>

                  {catLoading || prefLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00008A] border-t-transparent" />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {allCategories.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCat(cat.id)}
                          className={`group relative flex items-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-bold transition-all ${selected.has(cat.id)
                            ? 'border-[#00008A] bg-indigo-50 text-[#00008A] shadow-md shadow-indigo-100'
                            : 'border-gray-50 bg-gray-50/50 text-gray-600 hover:border-indigo-200 hover:bg-white'
                            }`}
                        >
                          <span className="text-lg">{TYPE_EMOJI[cat.type] ?? '📌'}</span>
                          {cat.name}
                          {selected.has(cat.id) && (
                            <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#00008A] text-white">
                              <Check size={10} strokeWidth={4} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex flex-col gap-4">
                  {saveError && (
                    <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm font-bold text-red-600">
                      ⚠️ {saveError}
                    </div>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={isLoading || saveSuccess}
                    className={`flex items-center justify-center gap-3 rounded-[24px] py-4 text-lg font-black text-white transition-all ${saveSuccess
                      ? 'bg-green-500'
                      : 'bg-[#00008A] hover:bg-[#0000aa] hover:scale-[1.02] active:scale-95 shadow-xl shadow-indigo-100'
                      } disabled:opacity-70`}
                  >
                    {saveSuccess ? (
                      <><Check size={24} /> Đã cập nhật thành công!</>
                    ) : updating ? (
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Đang lưu...
                      </div>
                    ) : (
                      'Lưu thay đổi hồ sơ'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-[32px] bg-white p-8 shadow-sm border border-gray-100 min-h-[500px]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-[#00008A] flex items-center gap-2">
                    <Clock size={20} className="text-yellow-500" /> Hoạt động gần đây
                  </h3>
                  {!reviewsLoading && (
                    <span className="bg-yellow-50 border border-yellow-100 text-yellow-700 text-xs font-black px-3 py-1 rounded-full">
                      {reviewItems.length} bài viết
                    </span>
                  )}
                </div>

                {reviewsLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00008A] border-t-transparent" />
                  </div>
                ) : reviewItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-6 rounded-full bg-gray-50 p-10 text-gray-200">
                      <Star size={60} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      Chưa có đánh giá nào
                    </h4>
                    <p className="text-gray-400 max-w-xs">
                      Hãy trải nghiệm các địa điểm và chia sẻ cảm nghĩ của bạn với cộng đồng nhé!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 max-h-[700px] overflow-y-auto pr-2">
                    {reviewItems.map(item => (
                      <div
                        key={item.id}
                        className="group relative flex gap-6 rounded-3xl border border-gray-50 bg-[#F8FAFC]/50 p-5 transition hover:bg-white hover:border-[#00008A]/10 hover:shadow-xl hover:shadow-indigo-50"
                      >
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm ring-4 ring-white">
                          {item.resourceImageUrl ? (
                            <img
                              src={item.resourceImageUrl}
                              alt={item.resourceTitle}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-100">
                              <Star size={30} fill="currentColor" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="min-w-0">
                              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                <span
                                  className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${item.resourceType === 1
                                    ? 'bg-orange-100 text-orange-600'
                                    : 'bg-blue-100 text-blue-600'
                                    }`}
                                >
                                  {item.resourceType === 1 ? '🎊 Sự kiện' : '📍 Địa điểm'}
                                </span>
                                <span className="text-[10px] font-bold text-gray-300">•</span>
                                <span className="text-[10px] font-bold text-gray-400">
                                  {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                              <h4 className="text-lg font-black text-[#00008A] truncate leading-tight">
                                {item.resourceTitle}
                              </h4>
                            </div>
                          </div>

                          <div className="mb-3">{renderStars(item.rating)}</div>
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 italic">
                            "{item.comment}"
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            navigate({
                              to: `/${item.resourceType === 1 ? 'events' : 'places'
                                }/${item.resourceId}`,
                              search: { resourceType: item.resourceType },
                            })
                          }
                          className="absolute bottom-5 right-5 h-10 w-10 flex items-center justify-center rounded-full bg-white text-[#00008A] shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition hover:bg-[#00008A] hover:text-white"
                        >
                          <ArrowLeft className="rotate-135" size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
