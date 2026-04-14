import { useState, useEffect, useRef } from 'react';
import { Search, LogOut, X, Pencil, Check, Star, ChevronDown, Camera, Clock } from 'lucide-react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchProfileThunk, updateProfileThunk, uploadAvatarThunk } from '../store/slice/ProfileSlice';
import { fetchMyReviewHistoryThunk, clearUserReviews } from '../store/slice/UserReviewSlice';
import { fetchPreferencesThunk, updatePreferencesThunk } from '../store/slice/PreferencesSlice';
import { fetchCategoriesThunk } from '../store/slice/CategorySlice';
import { clearTokens } from '../utils/headerApi';
import { fetchPlacesPage2Thunk } from '../store/slice/PlacesSlice';
import { fetchRecommendPlacesThunk, fetchRecommendMixThunk } from '../store/slice/LocationRecommendSlice';
import { searchDiscoveryThunk, setDiscoveryType, setDiscoveryQuery, setDiscoveryRating, resetDiscovery } from '../store/slice/DiscoverySlice';
import type { Place } from '../services/PlacesServices';
import Swal from 'sweetalert2';
import { updateLocationThunk } from '../store/slice/LocationUserSlice';
import { ChatbotWidget } from '../components/ChatbotWidget';
import { CommunityChatWidget } from '../components/CommunityChatWidget';
import Footer from '../components/Footer';
import bannerImg from '../assets/images/banner.jpg';
import planeImg from '../assets/images/plane.png';
import chatbotImg from '../assets/images/image_chatbot.png';
import logoImg from '../assets/images/image_logo_vivu.png';
import profileImg from '../assets/images/image_profile.png';
import locationImg from '../assets/images/image_location.png';
import text1Img from '../assets/images/image_text1.png';
import text2Img from '../assets/images/image_text2.png';
import text3Img from '../assets/images/image_text3.png';

const TYPE_EMOJI: Record<string, string> = {
  theme: '🗺️', style: '✨', activity: '🏃', budget: '💰', companion: '👥',
  tourism: '🌏', food: '🍜', accommodation: '🏨', entertainment: '🎉',
  shopping: '🛍️', event: '🎊',
};

// ─────────────────────────────────────────────
// Edit Profile Modal
// ─────────────────────────────────────────────
function EditProfileModal({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, updating, uploadingAvatar } = useSelector((s: RootState) => s.profile);
  const { categoryIds: savedCatIds, loading: prefLoading } = useSelector((s: RootState) => s.preferences);
  const { items: allCategories, loading: catLoading } = useSelector((s: RootState) => s.category);

  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load categories + preferences on open
  useEffect(() => {
    dispatch(fetchCategoriesThunk());
    dispatch(fetchPreferencesThunk());
  }, [dispatch]);

  // Pre-check saved preferences once loaded
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
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    setAvatarSuccess(false);
    // Show preview immediately
    setAvatarPreview(URL.createObjectURL(file));
    const result = await dispatch(uploadAvatarThunk(file));
    if (uploadAvatarThunk.fulfilled.match(result)) {
      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 2500);
    } else {
      setAvatarError(result.payload as string ?? 'Upload avatar thất bại');
      setAvatarPreview(null);
    }
  };

  const isLoading = catLoading || prefLoading || updating;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#00008A]">Chỉnh sửa thông tin</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Avatar Upload */}
        <div className="px-6 pt-5 flex flex-col items-center gap-3">
          <div className="relative group">
            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-[#00008A]/20 shadow-lg bg-purple-100 flex items-center justify-center">
              {uploadingAvatar ? (
                <div className="h-full w-full flex items-center justify-center bg-black/30">
                  <div className="h-7 w-7 animate-spin rounded-full border-4 border-white border-t-transparent" />
                </div>
              ) : (avatarPreview ?? profile?.avatarUrl) ? (
                <img
                  src={avatarPreview ?? profile?.avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-purple-600">
                  {profile?.fullName?.charAt(0) ?? '?'}
                </span>
              )}
            </div>
            {/* Camera overlay */}
            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#00008A] text-white shadow-md border-2 border-white transition hover:bg-blue-900 disabled:opacity-50"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
          </div>
          {avatarSuccess && (
            <p className="text-xs font-bold text-green-600 flex items-center gap-1">
              <Check size={12} /> Cập nhật ảnh đại diện thành công!
            </p>
          )}
          {avatarError && (
            <p className="text-xs font-bold text-red-500">⚠️ {avatarError}</p>
          )}
          {uploadingAvatar && (
            <p className="text-xs text-gray-500">Đang tải ảnh lên...</p>
          )}
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Basic info */}
          <div>
            <p className="mb-3 text-sm font-bold text-[#00008A]">Thông tin cá nhân</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Họ tên</label>
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#00008A] focus:ring-2 focus:ring-[#00008A]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Email</label>
                <input
                  value={email}
                  onChange={e => { setEmail(e.target.value); setSaveError(null); }}
                  type="email"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#00008A] focus:ring-2 focus:ring-[#00008A]/20"
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Số điện thoại</label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#00008A] focus:ring-2 focus:ring-[#00008A]/20"
                />
              </div>
            </div>
          </div>

          {/* Category interests */}
          <div>
            <p className="mb-3 text-sm font-bold text-[#00008A]">Sở thích du lịch</p>
            {(catLoading || prefLoading) ? (
              <div className="flex justify-center py-6">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00008A] border-t-transparent" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allCategories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCat(cat.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 ${selected.has(cat.id)
                      ? 'border-[#00008A] bg-[#00008A] text-white shadow-md'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-[#00008A] hover:text-[#00008A]'
                      }`}
                  >
                    {TYPE_EMOJI[cat.type] ?? '📌'} {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100">
          {saveError && (
            <p className="mb-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600 font-medium">
              ⚠️ {saveError}
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={isLoading || saveSuccess}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-white transition ${saveSuccess
              ? 'bg-green-500'
              : 'bg-[#00008A] hover:bg-[#0000aa] active:scale-95'
              } disabled:opacity-60`}
          >
            {saveSuccess ? (
              <><Check size={16} /> Đã lưu!</>
            ) : updating ? (
              'Đang lưu...'
            ) : (
              'Cập nhật thông tin'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Review History Modal
// ─────────────────────────────────────────────
function ReviewHistoryModal({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((s: RootState) => s.userReview);

  useEffect(() => {
    dispatch(fetchMyReviewHistoryThunk());
    return () => { dispatch(clearUserReviews()); };
  }, [dispatch]);

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={12}
          fill={s <= rating ? '#FFD700' : 'transparent'}
          className={s <= rating ? 'text-[#FFD700]' : 'text-gray-300'}
        />
      ))}
      <span className="ml-1 text-xs font-bold text-yellow-600">{rating}.0</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-yellow-500" />
            <h2 className="text-xl font-bold text-[#00008A]">Lịch sử đánh giá</h2>
            {!loading && <span className="ml-1 text-xs font-medium bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{items.length} bài</span>}
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00008A] border-t-transparent" />
            </div>
          )}
          {!loading && error && (
            <p className="text-center text-sm text-red-500 py-8">{error}</p>
          )}
          {!loading && !error && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Star size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">Bạn chưa có đánh giá nào.</p>
            </div>
          )}
          {!loading && items.length > 0 && (
            <div className="flex flex-col gap-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow bg-white">
                  {/* Resource thumbnail */}
                  <div className="h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {item.resourceImageUrl ? (
                      <img src={item.resourceImageUrl} alt={item.resourceTitle} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300">
                        <Star size={24} />
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {/* Type badge */}
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${item.resourceType === 1 ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                          {item.resourceType === 1 ? '🎊 Sự kiện' : '📍 Địa điểm'}
                        </span>
                        <h3 className="font-bold text-sm text-[#00008A] line-clamp-1">{item.resourceTitle}</h3>
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.resourceAddress}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="mt-2">{renderStars(item.rating)}</div>
                    <p className="mt-1.5 text-sm text-gray-700 line-clamp-2 italic">"{item.comment}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Profile Dropdown
// ─────────────────────────────────────────────
export function ProfileDropdown() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reviewHistoryOpen, setReviewHistoryOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { profile, loading: profileLoading, error: profileError } = useSelector((s: RootState) => s.profile);
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
      setOpen(prev => !prev);
    }
  };

  const handleLogout = () => {
    clearTokens();
    sessionStorage.removeItem('hasAskedLocationSession');
    setOpen(false);
    navigate({ to: '/' });
  };

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={handleProfileClick}
          className="flex h-12 w-12 items-center justify-center rounded-full overflow-hidden border-2 border-white/50 shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <img src={profileImg} alt="User profile" className="h-full w-full object-cover" />
        </button>

        {open && isLoggedIn && (
          <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-2xl bg-white shadow-2xl border border-blue-100">
            {profile ? (
              <>
                {/* Avatar + name */}
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
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-[#00008A] truncate">{profile.fullName}</h3>
                    <p className="text-xs text-gray-400 truncate">{profile.email}</p>
                  </div>
                </div>

                {/* Info rows */}
                <div className="px-4 pb-2">
                  <p className="mb-3 text-sm font-bold text-[#00008A]">Thông tin cá nhân:</p>
                  {[
                    { label: 'Tên tài khoản', value: profile.fullName },
                    { label: 'Email', value: profile.email },
                    { label: 'Số điện thoại', value: profile.phone || '—' },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex w-full items-center justify-between border-b border-gray-100 py-3 text-sm px-1"
                    >
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-800 max-w-[160px] truncate">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2 p-4">
                  <button
                    onClick={() => { setOpen(false); setEditOpen(true); }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#00008A] py-2.5 font-bold text-[#00008A] transition hover:bg-[#00008A]/5 active:scale-95"
                  >
                    <Pencil size={15} />
                    Chỉnh sửa thông tin
                  </button>
                  <button
                    onClick={() => { setOpen(false); setReviewHistoryOpen(true); }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-400 py-2.5 font-bold text-yellow-700 transition hover:bg-yellow-50 active:scale-95"
                  >
                    <Clock size={15} />
                    Lịch sử đánh giá
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00008A] py-2.5 font-bold text-white transition hover:bg-[#0000aa] active:scale-95"
                  >
                    <LogOut size={15} />
                    Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4">
                <p className="text-sm text-gray-600">
                  {profileLoading ? 'Đang tải thông tin người dùng...' : 'Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.'}
                </p>
                {!!profileError && <p className="mt-2 text-xs text-red-500">{profileError}</p>}
                <button
                  onClick={handleLogout}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00008A] py-2.5 font-bold text-white transition hover:bg-[#0000aa] active:scale-95"
                >
                  <LogOut size={15} />
                  Đăng nhập lại
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}

      {/* Review History modal */}
      {reviewHistoryOpen && <ReviewHistoryModal onClose={() => setReviewHistoryOpen(false)} />}
    </>
  );
}


// ─────────────────────────────────────────────
// Destination Card
// ─────────────────────────────────────────────
const PLACE_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1541432901042-2b8bd6f8892d?q=80&w=400',
  'https://images.unsplash.com/photo-1603566234586-22a3d0628e35?q=80&w=400',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=400',
  'https://images.unsplash.com/photo-1504280741564-f20387431e67?q=80&w=400',
  'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?q=80&w=400',
  'https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=400',
  'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?q=80&w=400',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=400',
];

export const DestinationCard = ({ place, index, type = 'places', resourceType = 0, ribbonTag }: { place: Place; index: number; type?: 'places' | 'events'; resourceType?: number; ribbonTag?: string }) => {
  const navigate = useNavigate();
  const imgUrl = place.images?.[0]?.url || PLACE_FALLBACK_IMAGES[index % PLACE_FALLBACK_IMAGES.length];
  const displayName = place.title || (place as any).name || "Chưa có tên";

  return (
    <div
      onClick={() => navigate({ to: `/${type}/${place.id}`, search: { resourceType } })}
      className="relative h-72 w-full overflow-hidden rounded-2xl shadow-lg md:h-80 group cursor-pointer"
    >
      <img src={imgUrl} alt={displayName} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
      {/* Resource type badge */}
      <div className="absolute top-3 left-3 z-20">
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-sm ${type === 'events' ? 'bg-orange-500/90 text-white' : 'bg-blue-600/90 text-white'}`}>
          {resourceType === 1 ? '🎊 Sự kiện' : '📍 Địa điểm'}
        </div>
      </div>
      {ribbonTag && (
        <div className="absolute top-3 right-0 z-20">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-l-full shadow-lg transform translate-x-1 group-hover:translate-x-0 transition-transform duration-300 flex items-center gap-1">
            <Star size={10} fill="currentColor" />
            {ribbonTag}
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 p-4 w-full">
        <h3 className="text-base font-bold text-white drop-shadow-lg line-clamp-1">{displayName}</h3>
        {/* Star rating */}
        <div className="mt-1 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              size={12}
              fill={star <= Math.round(place.averageRating || 0) ? '#FFD700' : 'transparent'}
              className={star <= Math.round(place.averageRating || 0) ? 'text-[#FFD700]' : 'text-white/40'}
            />
          ))}
          {(place.averageRating || 0) > 0 && (
            <span className="ml-1 text-[10px] text-yellow-300 font-semibold">{(place.averageRating || 0).toFixed(1)}</span>
          )}
        </div>
        <p className="mt-1 text-[11px] leading-snug text-gray-200 pr-2 line-clamp-2">{place.description}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {(place.tags || []).slice(0, 3).map((tag, idx) => (
            <span key={`${tag}-${idx}`} className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="h-72 w-full overflow-hidden rounded-2xl bg-gray-200 md:h-80 animate-pulse">
    <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300" />
  </div>
);

export function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { page2, loading2 } = useSelector((s: RootState) => s.places);
  const { recommendMix, loadingMix } = useSelector((s: RootState) => s.locationRecommend);
  const { items: discoveryItems, loading: discoveryLoading, isSearched, type: discoveryType, currentRating, currentQuery, currentPage, totalPages } = useSelector((s: RootState) => s.discovery);

  const { profile } = useSelector((s: RootState) => s.profile);
  const loginUser = useSelector((s: RootState) => s.login.user);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchRecommendMixThunk());
    dispatch(fetchRecommendPlacesThunk());
    dispatch(fetchPlacesPage2Thunk());
  }, [dispatch]);

  // Reset discovery state khi VÀO (mount) và RỜI KHỎI (unmount) HomePage
  // → luôn hiển thị home view đúng, không bị cache state search cũ
  useEffect(() => {
    dispatch(resetDiscovery());
    dispatch(setDiscoveryQuery(''));
    return () => {
      dispatch(resetDiscovery());
      dispatch(setDiscoveryQuery(''));
    };
  }, [dispatch]);

  // Handle location prompt
  useEffect(() => {
    if (loginUser && profile) {
      const hasAskedLocation = sessionStorage.getItem('hasAskedLocationSession');
      if (!hasAskedLocation) {
        sessionStorage.setItem('hasAskedLocationSession', 'true');

        // Kiểm tra quyền vị trí trước
        if (navigator.permissions && navigator.permissions.query) {
          navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
            if (permissionStatus.state === 'denied') {
              // Quyền đã bị từ chối trước đó, không làm phiền người dùng nữa
              return;
            }

            // Hỏi để cập nhật lại vị trí hiện tại
            Swal.fire({
              title: 'Cập nhật vị trí?',
              text: 'Vivu muốn lấy vị trí hiện tại của bạn để đề xuất các địa điểm du lịch phù hợp nhất!',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#00008A',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Đồng ý',
              cancelButtonText: 'Lúc khác'
            }).then((result) => {
              if (result.isConfirmed) {
                Swal.fire({
                  title: 'Đang lấy vị trí mới...',
                  allowOutsideClick: false,
                  didOpen: () => {
                    Swal.showLoading();
                  }
                });
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    dispatch(updateLocationThunk({ latitude: lat, longitude: lng }))
                      .unwrap()
                      .then(() => {
                        Swal.fire('Thành công', 'Đã cập nhật vị trí mới nhất của bạn.', 'success');
                        dispatch(fetchProfileThunk());
                      })
                      .catch((err) => {
                        Swal.fire('Lỗi', typeof err === 'string' ? err : 'Không thể cập nhật vị trí', 'error');
                      });
                  },
                  (error) => {
                    Swal.fire('Không thể lấy vị trí', error.message, 'error');
                  }
                );
              }
            });
          });
        }
      }
    }
  }, [profile, loginUser, dispatch]);

  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleGoHome = () => {
    dispatch(resetDiscovery());
    dispatch(setDiscoveryQuery(''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchClick = () => {
    if (!currentQuery.trim()) {
      // Nếu query trống, reset về home view
      handleGoHome();
      return;
    }
    dispatch(searchDiscoveryThunk({ type: discoveryType, search: currentQuery, rating: currentRating, page: 1 }));
    scrollToResults();
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'places' | 'events';
    dispatch(setDiscoveryType(newType));
    dispatch(searchDiscoveryThunk({ type: newType, search: currentQuery, rating: currentRating, page: 1 }));
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const newRating = val ? Number(val) : null;
    dispatch(setDiscoveryRating(newRating));
    dispatch(searchDiscoveryThunk({ type: discoveryType, search: currentQuery, rating: newRating, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(searchDiscoveryThunk({ type: discoveryType, search: currentQuery, rating: currentRating, page }));
    scrollToResults();
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    let pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, 5, '...', totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
      }
    }

    return (
      <div className="col-span-full mt-8 flex justify-center items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || discoveryLoading}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentPage === 1 || discoveryLoading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-[#00008A] hover:bg-[#00008A] hover:text-white shadow-sm ring-1 ring-[#00008A]/20'
            }`}
        >
          Trước
        </button>
        <div className="flex gap-1 items-center">
          {pages.map((p, idx) => (
            p === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 font-bold">...</span>
            ) : (
              <button
                key={p}
                onClick={() => handlePageChange(p as number)}
                disabled={discoveryLoading || currentPage === p}
                className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${currentPage === p
                  ? 'bg-[#00008A] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-[#00008A]/10 ring-1 ring-gray-200'
                  }`}
              >
                {p}
              </button>
            )
          ))}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || discoveryLoading}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentPage === totalPages || discoveryLoading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-[#00008A] hover:bg-[#00008A] hover:text-white shadow-sm ring-1 ring-[#00008A]/20'
            }`}
        >
          Sau
        </button>
      </div>
    );
  };

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
            {/* Left: Logo */}
            <button onClick={handleGoHome} className="flex items-center">
              <img
                src={logoImg}
                alt="vivu logo"
                className="h-20 object-contain drop-shadow-md"
              />
            </button>

            {/* Right: Menu + User */}
            <div className="flex items-center gap-6 font-bold text-[#002B6B]">
              <button onClick={handleGoHome} className="cursor-pointer hover:text-blue-600">Trang chủ</button>
              <Link to="/tourism" className="cursor-pointer hover:text-blue-600">Du lịch</Link>
              <Link to="/events" className="cursor-pointer hover:text-blue-600">Sự Kiện</Link>
              <Link to="/ranks" className="cursor-pointer hover:text-blue-600">Xếp hạng</Link>

              {/* User Icon */}
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
                  value={currentQuery}
                  onChange={(e) => dispatch(setDiscoveryQuery(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchClick();
                  }}
                  className="h-full w-full bg-transparent px-8 text-lg text-[#002B6B] placeholder-[#002B6B]/60 outline-none"
                />
                <button onClick={handleSearchClick} className="flex h-full items-center justify-center px-6 text-[#002B6B] transition-colors hover:text-blue-900">
                  <Search size={28} />
                </button>
              </div>
            </div>

            {/* CTA Button */}
            <button onClick={handleSearchClick} className="group mt-4 flex items-center justify-center gap-3 rounded-full bg-[#E0F7FA] px-8 py-4 font-bold text-[#002B6B] shadow-lg transition-all hover:-translate-y-1 hover:bg-white hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] active:translate-y-0 disabled:opacity-70">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm overflow-hidden">
                <img src={locationImg} alt="location" className="h-7 w-7 object-contain" />
              </div>
              <span className="text-xl">Khám phá ngay</span>
            </button>

          </main>
        </div>
      </div>

      <div ref={resultsRef} className="scroll-mt-10">
        {isSearched ? (
          <section className="mx-auto mt-16 max-w-7xl px-4 py-8 flex flex-col md:flex-row gap-8 min-h-[50vh]">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="bg-[#E0FAFA] rounded-3xl p-6 flex flex-col gap-6 sticky top-24">
                <div>
                  <label className="block text-[15px] font-bold text-[#00008A] mb-3">Loại hình</label>
                  <div className="relative">
                    <select
                      value={discoveryType}
                      onChange={handleTypeChange}
                      className="w-full appearance-none rounded-xl border-none bg-white px-5 py-3.5 text-sm font-bold text-gray-800 shadow-sm outline-none ring-1 ring-white focus:ring-2 focus:ring-[#00008A]/30 transition-all cursor-pointer"
                    >
                      <option value="places">Địa điểm</option>
                      <option value="events">Sự kiện</option>
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                      <ChevronDown size={18} className="text-[#00008A]" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[15px] font-bold text-[#00008A] mb-3">Đánh giá</label>
                  <div className="relative">
                    <select
                      value={currentRating || ''}
                      onChange={handleRatingChange}
                      className="w-full appearance-none rounded-xl border-none bg-white px-5 py-3.5 text-sm font-bold text-gray-800 shadow-sm outline-none ring-1 ring-white focus:ring-2 focus:ring-[#00008A]/30 transition-all cursor-pointer"
                    >
                      <option value="">Tất cả</option>
                      <option value="5">5 ⭐</option>
                      <option value="4">4 ⭐</option>
                      <option value="3">3 ⭐</option>
                      <option value="2">2 ⭐</option>
                      <option value="1">1 ⭐</option>
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                      <ChevronDown size={18} className="text-[#00008A]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 min-h-[500px] content-start">
                {discoveryLoading ? (
                  Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
                ) : discoveryItems.length > 0 ? (
                  discoveryItems.map((place, i) => <DestinationCard key={place.id || `discovery-${i}`} place={place} index={i} type="places" resourceType={discoveryType === 'places' ? 0 : 1} />)
                ) : (
                  <div className="col-span-full py-12 text-center text-gray-500 font-medium">Không tìm thấy kết quả nào.</div>
                )}
                {!discoveryLoading && renderPagination()}
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Nào mình cùng vi vu — Page 1 */}
            <section className="mx-auto mt-16 max-w-6xl px-4 py-8">
              <div className="mb-12 flex items-center justify-center gap-4">
                <img src={text2Img} alt="Nào mình cùng vi vu" className="h-16 object-contain drop-shadow-md" />
                <div className="animate-bounce">
                  <img src={chatbotImg} alt="chatbot" className="h-16 w-16 object-contain" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
                {loadingMix
                  ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
                  : recommendMix.slice(0, 12).map((item, i) => {
                    const bestSellerTags = [
                      "Đi ngay thôi",
                      "Xách balo lên",
                      "Đi liền kẻo lỡ",
                      "Chốt lịch ngay",
                      "Lên đường thôi"
                    ];

                    // Map RecommendMixItem to DestinationCard compatible structure
                    const adaptedPlace: any = {
                      id: item.resourceId,
                      title: item.title,
                      description: "",
                      averageRating: item.averageRating,
                      images: item.primaryImageUrl ? [{ url: item.primaryImageUrl }] : [],
                      tags: []
                    };

                    return (
                      <DestinationCard
                        key={item.resourceId || `recommend-${i}`}
                        place={adaptedPlace}
                        index={i}
                        type="places"
                        resourceType={item.resourceType}
                        ribbonTag={i < 5 ? bestSellerTags[i] : undefined}
                      />
                    );
                  })
                }
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

            {/* Bạn thích trải nghiệm — Page 2 */}
            <section className="mx-auto mt-8 max-w-6xl px-4 py-16">
              <div className="mb-12 flex justify-center">
                <img src={text3Img} alt="Bạn thích trải nghiệm" className="h-16 object-contain drop-shadow-md" />
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
                {loading2
                  ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                  : page2.map((place, i) => <DestinationCard key={place.id} place={place} index={i} type="places" resourceType={0} />)
                }
              </div>
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Chatbot Widget — fixed bottom-right over all content */}
      <ChatbotWidget />
      <CommunityChatWidget />
    </div>
  );
}
