import { useState, useEffect, useRef } from 'react';
import { LogOut, Pencil, Clock } from 'lucide-react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchProfileThunk } from '../store/slice/ProfileSlice';
import { clearTokens } from '../utils/headerApi';
import profileImg from '../assets/images/image_profile.png';

export default function ProfileDropdown() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { profile, loading: profileLoading, error: profileError } = useSelector((s: RootState) => s.profile);
  const loginUser = useSelector((s: RootState) => s.login.user);
  const isLoggedIn = !!loginUser;

  const isProfilePage = location.pathname === '/profile';

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
    } else if (profile?.role === 2 && !isProfilePage) {
      navigate({ to: '/profile' });
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
                {!isProfilePage && (
                  <button
                    onClick={() => { setOpen(false); navigate({ to: '/profile' }); }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#00008A] py-2.5 font-bold text-[#00008A] transition hover:bg-[#00008A]/5 active:scale-95"
                  >
                    <Pencil size={15} />
                    Chỉnh sửa thông tin
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
  );
}
