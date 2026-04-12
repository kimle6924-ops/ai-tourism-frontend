import { useState, useEffect, useRef } from 'react';
import { LogOut, X, Pencil, Check } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchProfileThunk, updateProfileThunk } from '../store/slice/ProfileSlice';
import { fetchPreferencesThunk, updatePreferencesThunk } from '../store/slice/PreferencesSlice';
import { fetchCategoriesThunk } from '../store/slice/CategorySlice';
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
  const { profile, updating } = useSelector((s: RootState) => s.profile);
  const { categoryIds: savedCatIds, loading: prefLoading } = useSelector((s: RootState) => s.preferences);
  const { items: allCategories, loading: catLoading } = useSelector((s: RootState) => s.category);

  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    const [profResult, prefResult] = await Promise.all([
      dispatch(updateProfileThunk({ fullName, phone })),
      dispatch(updatePreferencesThunk(Array.from(selected))),
    ]);
    if (updateProfileThunk.fulfilled.match(profResult) && updatePreferencesThunk.fulfilled.match(prefResult)) {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
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

        <div className="px-6 py-5 flex flex-col gap-5">
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
                  value={profile?.email ?? ''}
                  disabled
                  className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 outline-none cursor-not-allowed"
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

        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100">
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
// Profile Dropdown
// ─────────────────────────────────────────────
export default function ProfileDropdown() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
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
    </>
  );
}
