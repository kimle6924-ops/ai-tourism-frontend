import { Link } from '@tanstack/react-router';
import logoImg from '../assets/images/image_logo_vivu.png';
import ProfileDropdown from './ProfileDropdown';

interface MainHeaderProps {
  transparent?: boolean;
}

export default function MainHeader({ transparent = false }: MainHeaderProps) {
  return (
    <header className={`flex w-full items-center justify-between px-4 sm:px-12 py-6 ${transparent ? 'absolute top-0 left-0 z-50 bg-transparent' : 'bg-white shadow-sm'}`}>
      {/* Left: Logo */}
      <Link to="/" className="flex items-center">
        <img
          src={logoImg}
          alt="vivu logo"
          className="h-16 sm:h-20 object-contain drop-shadow-md transition-transform hover:scale-105"
        />
      </Link>

      {/* Right: Menu + User */}
      <div className="flex items-center gap-4 sm:gap-8">
        <nav className={`hidden md:flex items-center gap-8 text-[15px] ${transparent ? 'font-extrabold drop-shadow-md text-[#000033]' : 'font-bold text-[#00008A]'}`}>
          <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
          <Link to="/tourism" className="hover:text-blue-600 transition-colors">Du lịch</Link>
          <Link to="/events" className="hover:text-blue-600 transition-colors">Sự Kiện</Link>
          <Link to="/ranks" className="hover:text-blue-600 transition-colors">Xếp hạng</Link>
          <Link to="/community" className="hover:text-blue-600 transition-colors">Cộng đồng</Link>
        </nav>

        {/* User Icon */}
        <ProfileDropdown />
      </div>
    </header>
  );
}
