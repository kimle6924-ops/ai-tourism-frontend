import hhtImg from '../assets/images/image_hht.png';
import logoHhtImg from '../assets/images/image_logo_hht.png';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left: Logo + Contact Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* HHT Logo */}
          <img
            src={logoHhtImg}
            alt="Logo HHT"
            className="h-24 w-auto object-contain flex-shrink-0"
          />
          {/* Contact details */}
          <div className="flex flex-col gap-2 text-sm text-gray-600 text-center sm:text-left justify-center">
            <p className="font-bold text-[#00008A] text-base mb-1">
              TRƯỜNG CAO ĐẲNG CÔNG NGHỆ CAO HÀ NỘI
            </p>
            <p className="flex items-start gap-2">
              <span className="font-semibold text-gray-700 whitespace-nowrap">Địa chỉ:</span>
              <span>Phường Tây Mỗ, Quận Nam Từ Liêm, Thành phố Hà Nội</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-gray-700 whitespace-nowrap">Email:</span>
              <a href="mailto:contact@hht.edu.vn" className="text-[#00008A] hover:underline">
                contact@hht.edu.vn
              </a>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-gray-700 whitespace-nowrap">Số điện thoại:</span>
              <a href="tel:+842437653687" className="text-[#00008A] hover:underline">
                (84-24) 3765 3687
              </a>
            </p>
          </div>
        </div>

        {/* Right: HHT Image */}
        <div className="flex-shrink-0">
          <img
            src={hhtImg}
            alt="HHT"
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100 py-3 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Trường Cao Đẳng Công Nghệ Cao Hà Nội. All rights reserved.
      </div>
    </footer>
  );
}
