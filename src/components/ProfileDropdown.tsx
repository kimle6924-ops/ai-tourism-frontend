import { useState, useEffect, useRef } from 'react';
import { LogOut, X, Pencil, Check, Camera, Star, Clock } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchProfileThunk, updateProfileThunk, uploadAvatarThunk } from '../store/slice/ProfileSlice';
import { fetchPreferencesThunk, updatePreferencesThunk } from '../store/slice/PreferencesSlice';
import { fetchCategoriesThunk } from '../store/slice/CategorySlice';
import { fetchMyReviewHistoryThunk, clearUserReviews } from '../store/slice/UserReviewSlice';
import { clearTokens } from '../utils/headerApi';
import profileImg from '../assets/images/image_profile.png';

const TYPE_EMOJI: Record<string, string> = {
  theme: '🗺️', style: '✨', activity: '🏃', budget: '💰', companion: '👥',
  tourism: '🌏', food: '🍜', accommodation: '🏨', entertainment: '🎉',
  shopping: '🛍️', event: '🎊',
};

// ─────────────────────────────────────────────
// Edit Profile Modal
// ─────────────────────────────────────────────
export function EditProfileModal({ onClose }: { onClose: () => void }) {
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
export function ReviewHistoryModal({ onClose }: { onClose: () => void }) {
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
export default function ProfileDropdown() {
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

                <div className="flex flex-col gap-2 p-4">
                  <button
                    onClick={() => { setOpen(false); setEditOpen(true); }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#00008A] py-2.5 font-bold text-[#00008A] transition hover:bg-[#00008A]/5 active:scale-95"
                  >
                    <Pencil size={15} />
                    Chỉnh sửa thông tin
                  </button>
                  {profile.role === 2 && (
                    <button
                      onClick={() => { setOpen(false); setReviewHistoryOpen(true); }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-400 py-2.5 font-bold text-yellow-700 transition hover:bg-yellow-50 active:scale-95"
                    >
                      <Clock size={15} />
                      Lịch sử đánh giá
                    </button>
                  )}
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

      {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}
      {reviewHistoryOpen && <ReviewHistoryModal onClose={() => setReviewHistoryOpen(false)} />}
    </>
  );
}
