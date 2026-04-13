import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { searchDiscoveryThunk, setDiscoveryType, setDiscoveryRating, setDiscoveryQuery } from '../store/slice/DiscoverySlice';
import { ChevronDown, Search } from 'lucide-react';
import MainHeader from '../components/MainHeader';
import bannerImg from '../assets/images/banner.jpg';
import Footer from '../components/Footer';
import { DestinationCard, SkeletonCard } from '../components/DestinationCard';
import { ChatbotWidget } from '../components/ChatbotWidget';
import text2Img from '../assets/images/image_text2.png';

export default function TourismPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: discoveryItems, loading, type, currentRating, currentQuery, currentPage, totalPages } = useSelector((s: RootState) => s.discovery);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(setDiscoveryType('places'));
    dispatch(searchDiscoveryThunk({ type: 'places', search: currentQuery, rating: currentRating, page: 1 }));
  }, [dispatch]);

  const handleSearchClick = () => {
    dispatch(searchDiscoveryThunk({ type, search: currentQuery, rating: currentRating, page: 1 }));
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const newRating = val ? Number(val) : null;
    dispatch(setDiscoveryRating(newRating));
    dispatch(searchDiscoveryThunk({ type, search: currentQuery, rating: newRating, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(searchDiscoveryThunk({ type, search: currentQuery, rating: currentRating, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="mt-12 flex justify-center items-center gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === i + 1 ? 'bg-[#00008A] text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  };

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
        {/* Title & Description */}
        <div className="mb-12 text-center">
            <img src={text2Img} alt="Du lịch" className="h-16 mx-auto mb-6 object-contain drop-shadow-md" />
            <h1 className="text-3xl font-bold text-[#00008A]">Khám phá địa điểm du lịch</h1>
            <p className="mt-4 text-gray-700 max-w-2xl mx-auto">
                Tìm kiếm những địa danh nổi tiếng và những trải nghiệm tuyệt vời nhất gần bạn.
            </p>
        </div>

        {/* Search & Categories */}
        <div className="mx-auto mb-16 w-full max-w-4xl">
            <div className="relative mb-8 flex h-16 items-center overflow-hidden rounded-full border border-blue-900/20 bg-gray-50 shadow-sm transition-all focus-within:border-blue-900/40 focus-within:ring-4 focus-within:ring-blue-900/5">
                <Search className="ml-6 text-gray-400" size={24} />
                <input 
                    type="text"
                    placeholder="Tìm kiếm điểm đến, nhà hàng..."
                    value={currentQuery}
                    onChange={(e) => dispatch(setDiscoveryQuery(e.target.value))}
                    className="h-full w-full bg-transparent px-4 text-lg text-gray-800 outline-none"
                />
                <button 
                  onClick={handleSearchClick}
                  className="mr-3 rounded-full bg-[#00008A] px-8 py-3 font-bold text-white transition hover:bg-blue-800 active:scale-95"
                >
                    Tìm kiếm
                </button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap justify-center gap-4">
                {[
                    { label: '📍 Điểm đến', id: 'destination' },
                    { label: '🍴 Nhà hàng', id: 'restaurant' },
                    { label: '🍜 Ăn uống', id: 'food' }
                ].map(cat => (
                    <button
                        key={cat.id}
                        className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-[#00008A] shadow-sm ring-1 ring-blue-900/10 transition-all hover:bg-blue-50 hover:ring-blue-900/30 active:scale-95"
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Nearby Section */}
        <div className="mb-8 flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-orange-500" />
            <h2 className="text-2xl font-bold text-[#00008A]">Địa điểm gần bạn nhất</h2>
        </div>

        {/* Grid */}
        <div ref={resultsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : discoveryItems.length > 0 ? (
                discoveryItems.map((item, i) => (
                    <DestinationCard key={item.id} place={item} index={i} type="places" resourceType={0} />
                ))
            ) : (
                <div className="col-span-full py-20 text-center text-gray-500 font-medium">
                    Không tìm thấy địa điểm nào phù hợp.
                </div>
            )}
        </div>

        {renderPagination()}
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
