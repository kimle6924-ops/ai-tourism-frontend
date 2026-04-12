import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { searchDiscoveryThunk, setDiscoveryType, setDiscoveryRating, setDiscoveryQuery } from '../store/slice/DiscoverySlice';
import { ChevronDown, Search, Calendar } from 'lucide-react';
import MainHeader from '../components/MainHeader';
import Footer from '../components/Footer';
import { DestinationCard, SkeletonCard } from '../components/DestinationCard';
import { ChatbotWidget } from '../components/ChatbotWidget';

export default function EventPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: discoveryItems, loading, type, currentRating, currentQuery, currentPage, totalPages } = useSelector((s: RootState) => s.discovery);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(setDiscoveryType('events'));
    dispatch(searchDiscoveryThunk({ type: 'events', search: currentQuery, rating: currentRating, page: 1 }));
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

  return (
    <div className="min-h-screen bg-white font-['Inter']">
      <MainHeader />
      
      <main className="mx-auto max-w-7xl px-4 py-12 pt-32">
        {/* Title & Description */}
        <div className="mb-12 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 mb-6 shadow-sm">
                <Calendar size={32} />
            </div>
            <h1 className="text-3xl font-bold text-[#00008A]">Sự kiện nổi bật</h1>
            <p className="mt-4 text-gray-700 max-w-2xl mx-auto">
                Tham gia các lễ hội, triển lãm và sự kiện văn hóa nghệ thuật đặc sắc đang và sắp diễn ra gần bạn.
            </p>
        </div>

        {/* Search & Status Filters */}
        <div className="mx-auto mb-16 w-full max-w-4xl">
            <div className="relative mb-8 flex h-16 items-center overflow-hidden rounded-full border border-blue-900/20 bg-gray-50 shadow-sm transition-all focus-within:border-blue-900/40 focus-within:ring-4 focus-within:ring-blue-900/5">
                <Search className="ml-6 text-gray-400" size={24} />
                <input 
                    type="text"
                    placeholder="Tìm kiếm sự kiện, lễ hội..."
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
                    { label: '🔥 Đang diễn ra', id: 'ongoing' },
                    { label: '📅 Sắp diễn ra', id: 'upcoming' }
                ].map(status => (
                    <button
                        key={status.id}
                        className="rounded-full bg-white px-8 py-2.5 text-sm font-bold text-[#00008A] shadow-sm ring-1 ring-blue-900/10 transition-all hover:bg-blue-50 hover:ring-blue-900/30 active:scale-95"
                    >
                        {status.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Nearby Section */}
        <div className="mb-8 flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-orange-500" />
            <h2 className="text-2xl font-bold text-[#00008A]">Sự kiện gần bạn nhất</h2>
        </div>

        {/* Grid */}
        <div ref={resultsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : discoveryItems.length > 0 ? (
                discoveryItems.map((item, i) => (
                    <DestinationCard key={item.id} place={item} index={i} type="events" resourceType={1} />
                ))
            ) : (
                <div className="col-span-full py-20 text-center text-gray-500 font-medium">
                    Không tìm thấy sự kiện nào phù hợp.
                </div>
            )}
        </div>

        {totalPages > 1 && (
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
        )}
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
