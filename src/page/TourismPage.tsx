import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchDiscoveryTagsThunk } from '../store/slice/DiscoveryTagSlice';
import { fetchTourismPlacesThunk, fetchRecommendedTourismPlacesThunk, setSelectedTags } from '../store/slice/TourismSlice';
import { Loader2, Tag, X, Filter } from 'lucide-react';
import MainHeader from '../components/MainHeader';
import bannerImg from '../assets/images/banner.jpg';
import Footer from '../components/Footer';
import { DestinationCard, SkeletonCard } from '../components/DestinationCard';
import { ChatbotWidget } from '../components/ChatbotWidget';
import locationImg from '../assets/images/image_location.png';
import text1Img from '../assets/images/image_text1.png';
import text2Img from '../assets/images/image_text2.png';
import { CommunityChatWidget } from '#/components/CommunityChatWidget';

export default function TourismPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, currentPage, totalPages, totalCount, selectedTags } = useSelector((s: RootState) => s.tourism);
  const { tags: availableTags, loading: tagLoading } = useSelector((s: RootState) => s.discoveryTag);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempTags, setTempTags] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchDiscoveryTagsThunk());
    if (selectedTags.length > 0) {
      dispatch(fetchTourismPlacesThunk({ tags: selectedTags, PageNumber: 1, PageSize: 16 }));
    } else {
      dispatch(fetchRecommendedTourismPlacesThunk({ MaxDistanceKm: 3000, PageNumber: 1, PageSize: 16 }));
    }
  }, [dispatch]);

  const handlePageChange = (page: number) => {
    if (selectedTags.length > 0) {
      dispatch(fetchTourismPlacesThunk({ tags: selectedTags, PageNumber: page, PageSize: 16 }));
    } else {
      dispatch(fetchRecommendedTourismPlacesThunk({ MaxDistanceKm: 3000, PageNumber: page, PageSize: 16 }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDialog = () => {
    setTempTags([...selectedTags]);
    setIsDialogOpen(true);
  };

  const toggleTag = (tag: string) => {
    setTempTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleApplyTags = () => {
    dispatch(setSelectedTags(tempTags));
    if (tempTags.length > 0) {
      dispatch(fetchTourismPlacesThunk({ tags: tempTags, PageNumber: 1, PageSize: 16 }));
    } else {
      dispatch(fetchRecommendedTourismPlacesThunk({ MaxDistanceKm: 3000, PageNumber: 1, PageSize: 16 }));
    }
    setIsDialogOpen(false);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearTags = () => setTempTags([]);

  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag);
    dispatch(setSelectedTags(newTags));
    if (newTags.length > 0) {
      dispatch(fetchTourismPlacesThunk({ tags: newTags, PageNumber: 1, PageSize: 16 }));
    } else {
      dispatch(fetchRecommendedTourismPlacesThunk({ MaxDistanceKm: 3000, PageNumber: 1, PageSize: 16 }));
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="mt-12 flex justify-center items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-xl text-sm font-bold transition-all bg-white text-[#00008A] shadow-sm ring-1 ring-[#00008A]/20 hover:bg-[#00008A] hover:text-white disabled:opacity-40"
        >
          Trước
        </button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === page ? 'bg-[#00008A] text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
              >
                {page}
              </button>
            );
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return <span key={page} className="px-2 text-gray-400 font-bold">...</span>;
          }
          return null;
        })}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-xl text-sm font-bold transition-all bg-white text-[#00008A] shadow-sm ring-1 ring-[#00008A]/20 hover:bg-[#00008A] hover:text-white disabled:opacity-40"
        >
          Sau
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white font-['Inter'] relative">
      <MainHeader />

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <div
          className="relative min-h-[600px] w-full overflow-hidden rounded-[40px] shadow-xl"
          style={{
            backgroundImage: `url(${bannerImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="relative z-10 mx-auto flex h-full flex-col items-center px-4 py-8">
            <main className="flex w-full flex-1 flex-col items-center justify-center py-20">
              <div className="mb-12">
                <img src={text1Img} alt="Hôm nay đi đâu ?" className="max-w-2xl w-full drop-shadow-2xl" />
              </div>
              <div className="mb-12 text-center">
                {/* Tăng từ text-3xl lên text-5xl (to rõ rệt) và thêm tracking-tight để chữ trông gọn hơn khi to */}
                <h1 className="text-5xl font-extrabold text-[#00008A] tracking-tight md:text-6xl">
                  Khám phá điểm đến
                </h1>

                {/* Tăng từ mặc định lên text-xl, thêm leading-relaxed để dãn dòng cho dễ đọc */}
                <p className="mt-6 text-xl leading-relaxed text-gray-700 max-w-3xl mx-auto">
                  Tìm kiếm những địa danh nổi tiếng và những trải nghiệm tuyệt vời nhất dựa trên các chủ đề du lịch yêu thích.
                </p>
              </div>

              <button onClick={scrollToResults} className="group mt-4 flex items-center justify-center gap-3 rounded-full bg-[#E0F7FA] px-8 py-4 font-bold text-[#002B6B] shadow-lg transition-all hover:-translate-y-1 hover:bg-white active:translate-y-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm overflow-hidden">
                  <img src={locationImg} alt="location" className="h-7 w-7 object-contain" />
                </div>
                <span className="text-xl">Khám phá ngay</span>
              </button>
            </main>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12">

        {/* Filter Bar */}
        <div className="mx-auto mb-10 w-full max-w-6xl flex flex-col md:flex-row gap-4 items-center justify-between border-b border-gray-100 pb-6">
          <div className="flex-1 flex flex-wrap gap-2 items-center">
            {selectedTags.length > 0 ? (
              selectedTags.map(tag => (
                <span key={tag} className="flex items-center gap-1.5 bg-blue-50 text-[#00008A] px-3 py-1.5 rounded-full text-sm font-bold border border-blue-200 shadow-sm">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="bg-white rounded-full p-0.5 text-blue-600 hover:text-red-500 transition-colors ml-1">
                    <X size={12} strokeWidth={3} />
                  </button>
                </span>
              ))
            ) : (
              <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 italic text-sm">
                <Tag size={16} /> Chưa chọn tag. Lọc ngay để khám phá tốt hơn!
              </div>
            )}
          </div>

          <button
            onClick={handleOpenDialog}
            className="flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-[#00008A] px-6 py-3 font-bold text-white transition hover:bg-blue-800 shadow-lg"
          >
            <Filter size={18} /> Lọc theo Tags
          </button>
        </div>

        {/* Nearby Section Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-orange-500" />
            <h2 className="text-2xl font-bold text-[#00008A]">
              {selectedTags.length > 0 ? "Kết quả khám phá" : "Gợi ý địa điểm gần bạn"}
            </h2>
          </div>
          {!loading && totalCount > 0 && (
            <span className="text-sm font-bold text-gray-500 bg-gray-100 border border-gray-200 px-4 py-1.5 rounded-full shadow-inner">
              {totalCount} địa điểm
            </span>
          )}
        </div>

        {/* Results Grid */}
        <div ref={resultsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[400px] content-start scroll-mt-24">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : items.length > 0 ? (
            items.map((item, i) => (
              <DestinationCard key={item.id} place={item} index={i} type="places" resourceType={0} />
            ))
          ) : (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-300">
              <Filter size={32} className="text-[#00008A]/40 mb-4" />
              <h3 className="text-xl font-bold text-[#00008A] mb-2">Không tìm thấy địa điểm nào</h3>
              <p className="text-gray-500 max-w-sm mb-6 text-sm">Rất tiếc! Chúng tôi không tìm thấy địa điểm nào phù hợp.</p>
              <button
                onClick={handleOpenDialog}
                className="px-6 py-2.5 bg-white border border-[#00008A]/20 text-[#00008A] rounded-xl font-bold hover:bg-[#00008A] hover:text-white transition-colors"
              >
                Thay đổi lọc
              </button>
            </div>
          )}
        </div>

        {!loading && renderPagination()}
      </main>

      <Footer />
      <ChatbotWidget />
      <CommunityChatWidget />

      {/* Tags Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#00008A]/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-8 pt-8 pb-5">
              <div>
                <h2 className="text-2xl font-extrabold text-[#00008A] flex items-center gap-2">
                  <Tag size={24} className="text-orange-500" /> Lọc theo Tags
                </h2>
                <p className="text-sm font-medium text-gray-500 mt-2">Chọn các từ khóa để khám phá những địa điểm phù hợp.</p>
              </div>
              <button onClick={() => setIsDialogOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 hover:text-red-500 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#FAFAFA] border-y border-gray-100">
              {tagLoading ? (
                <div className="flex flex-col justify-center items-center py-20 gap-4">
                  <Loader2 size={40} className="animate-spin text-[#00008A]" />
                  <p className="font-bold text-[#00008A]/60">Đang tải...</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {availableTags.map((tag) => {
                    const isSelected = tempTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${isSelected
                          ? 'bg-[#00008A] text-white border-[#00008A]'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50'
                          }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-8 py-5 bg-white flex items-center justify-between">
              <button onClick={clearTags} className="text-gray-400 font-bold text-sm hover:text-red-500 flex items-center gap-1.5">
                <X size={16} /> Bỏ chọn tất cả
              </button>
              <div className="flex gap-3">
                <button onClick={() => setIsDialogOpen(false)} className="px-6 py-3 rounded-xl text-sm font-bold bg-gray-100">Đóng</button>
                <button onClick={handleApplyTags} className="px-8 py-3 rounded-xl text-sm font-extrabold bg-[#FFD700] text-[#00008A] hover:bg-yellow-400 shadow-lg">
                  Áp dụng ({tempTags.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}