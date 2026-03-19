import { Search, Star } from 'lucide-react';
import bannerImg from '../assets/images/banner.jpg';
import planeImg from '../assets/images/plane.png';
import chatbotImg from '../assets/images/image_chatbot.png';
import logoImg from '../assets/images/image_logo_vivu.png';
import profileImg from '../assets/images/image_profile.png';
import locationImg from '../assets/images/image_location.png';
import text1Img from '../assets/images/image_text1.png';
import text2Img from '../assets/images/image_text2.png';
import text3Img from '../assets/images/image_text3.png';

const DestinationCard = ({ imageUrl }: { imageUrl: string }) => (
    <div className="relative h-72 w-full overflow-hidden rounded-2xl shadow-lg md:h-80 group">
        <img src={imageUrl} alt="Destination" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 p-4">
            <h3 className="text-xl font-bold text-white drop-shadow-lg">Bản cát cát</h3>
            <p className="mt-1 text-[11px] leading-snug text-gray-200 pr-2">
                Bản làng du lịch nổi tiếng gần Sa Pa, thu hút du khách bởi cảnh đẹp núi rừng và văn hóa người H'Mông.
            </p>
            <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={14} fill="#FFD700" className="text-[#FFD700]" />
                ))}
            </div>
        </div>
    </div>
);

const mockImages = [
    'https://images.unsplash.com/photo-1541432901042-2b8bd6f8892d?q=80&w=400',
    'https://images.unsplash.com/photo-1603566234586-22a3d0628e35?q=80&w=400',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=400',
    'https://images.unsplash.com/photo-1504280741564-f20387431e67?q=80&w=400',
    'https://images.unsplash.com/photo-1541432901042-2b8bd6f8892d?q=80&w=400',
    'https://images.unsplash.com/photo-1603566234586-22a3d0628e35?q=80&w=400',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=400',
    'https://images.unsplash.com/photo-1504280741564-f20387431e67?q=80&w=400',
];

export function HomePage() {
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
                        <div className="flex-1"></div>
                        {/* Logo */}
                        <div className="flex-1 flex justify-center">
                            <img src={logoImg} alt="vivu logo" className="h-40 object-contain drop-shadow-md" />
                        </div>
                        {/* User Icon */}
                        <div className="flex flex-1 justify-end">
                            <button className="flex h-12 w-12 items-center justify-center rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95">
                                <img src={profileImg} alt="User profile" className="h-full w-full object-cover" />
                            </button>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex w-full flex-1 flex-col items-center justify-center pb-32">

                        {/* Hero image text: Hôm nay đi đâu ? */}
                        <div className="mb-12">
                            <img src={text1Img} alt="Hôm nay đi đâu ?" className="max-w-2xl w-full drop-shadow-2xl" />
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-8 w-full max-w-2xl px-4 sm:px-0">
                            <div className="relative flex h-16 items-center overflow-hidden rounded-full border border-blue-900/40 bg-white/20 shadow-lg backdrop-blur-md transition-all focus-within:border-white/60 focus-within:bg-white/40 focus-within:shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:bg-white/30 hover:shadow-xl">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm ngay"
                                    className="h-full w-full bg-transparent px-8 text-lg text-[#002B6B] placeholder-[#002B6B]/60 outline-none"
                                />
                                <button className="flex h-full items-center justify-center px-6 text-[#002B6B] transition-colors hover:text-blue-900">
                                    <Search size={28} />
                                </button>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <button className="group mt-4 flex items-center justify-center gap-3 rounded-full bg-[#E0F7FA] px-8 py-4 font-bold text-[#002B6B] shadow-lg transition-all hover:-translate-y-1 hover:bg-white hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] active:translate-y-0 disabled:opacity-70">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm overflow-hidden">
                                <img src={locationImg} alt="location" className="h-7 w-7 object-contain" />
                            </div>
                            <span className="text-xl">Khám phá ngay</span>
                        </button>

                    </main>
                </div>
            </div>

            {/* Nào mình cùng vi vu */}
            <section className="mx-auto mt-16 max-w-6xl px-4 py-8">
                <div className="mb-12 flex items-center justify-center gap-4">
                    <img src={text2Img} alt="Nào mình cùng vi vu" className="h-16 object-contain drop-shadow-md" />
                    <div className="animate-bounce">
                        <img src={chatbotImg} alt="chatbot" className="h-16 w-16 object-contain" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
                    {mockImages.map((img, i) => (
                        <DestinationCard key={i} imageUrl={img} />
                    ))}
                </div>
            </section>

            {/* Airplane Info Section */}
            <section className="relative mt-8 mb-8 overflow-hidden py-32 sm:py-40">
                {/* Background slanted block - hexagon shape, both sides taper inward */}
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

            {/* Bạn thích trải nghiệm */}
            <section className="mx-auto mt-8 max-w-6xl px-4 py-16">
                <div className="mb-12 flex justify-center">
                    <img src={text3Img} alt="Bạn thích trải nghiệm" className="h-16 object-contain drop-shadow-md" />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
                    {mockImages.map((img, i) => (
                        <DestinationCard key={i} imageUrl={img} />
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-8 h-20 w-full bg-[#00008A]"></footer>
        </div>
    );
}
