import { Link } from '@tanstack/react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import logoImg from '../assets/images/image_logo_vivu.png';
import ProfileDropdown from './ProfileDropdown';

interface MainHeaderProps {
  transparent?: boolean;
}

export default function MainHeader({ transparent = false }: MainHeaderProps) {
  const { profile } = useSelector((s: RootState) => s.profile);
  const user = useSelector((s: RootState) => s.login.user);

  return (
    <header className={`flex w-full items-center justify-between px-4 sm:px-12 py-4 ${transparent ? 'absolute top-0 left-0 z-50 bg-transparent' : 'bg-white shadow-sm'}`}>
      {/* Left: Logo */}
      <Link to="/" className="flex items-center">
        <img
          src={logoImg}
          alt="vivu logo"
          className="h-10 sm:h-14 object-contain transition-transform hover:scale-105"
        />
      </Link>

      {/* Right: Menu + User */}
      <div className="flex items-center gap-4 sm:gap-12">
        {((profile?.role === 2 || !user)) && (
          <nav className={`hidden md:flex items-center gap-10 text-[16px] ${transparent ? 'font-black drop-shadow-md text-white' : 'font-extrabold !text-[#000054]'}`}>
          <Link
            to="/"
            activeProps={{
              className: 'border-b-2 border-[#000054] !text-[#000054]'
            }}
            inactiveProps={{
              className: 'border-b-2 border-transparent !text-[#000054] hover:!text-[#1A2EA0]'
            }}
            activeOptions={{ exact: true }}
            className="pb-1 transition-all duration-300"
          >
            Trang chủ
          </Link>
          <Link
            to="/tourism"
            activeProps={{ className: 'border-b-2 border-[#000054] !text-[#000054]' }}
            inactiveProps={{ className: 'border-b-2 border-transparent !text-[#000054] hover:!text-[#1A2EA0]' }}
            className="pb-1 transition-all duration-300"
          >
            Du lịch
          </Link>
          <Link
            to="/events"
            activeProps={{ className: 'border-b-2 border-[#000054] !text-[#000054]' }}
            inactiveProps={{ className: 'border-b-2 border-transparent !text-[#000054] hover:!text-[#1A2EA0]' }}
            className="pb-1 transition-all duration-300"
          >
            Sự kiện
          </Link>
          <Link
            to="/ranks"
            activeProps={{ className: 'border-b-2 border-[#000054] !text-[#000054]' }}
            inactiveProps={{ className: 'border-b-2 border-transparent !text-[#000054] hover:!text-[#1A2EA0]' }}
            className="pb-1 transition-all duration-300"
          >
            Xếp hạng
          </Link>
        </nav>
        )}

        {/* User Icon */}
        <ProfileDropdown />
      </div>
    </header>
  );
}
