import { useState, useEffect, useRef } from 'react';
import { Search, LogOut, X, Pencil, Check, Star, ChevronDown, Camera, Clock } from 'lucide-react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchProfileThunk, updateProfileThunk, uploadAvatarThunk } from '../store/slice/ProfileSlice';
import { fetchMyReviewHistoryThunk, clearUserReviews } from '../store/slice/UserReviewSlice';
import { fetchPreferencesThunk, updatePreferencesThunk } from '../store/slice/PreferencesSlice';
import { fetchCategoriesThunk } from '../store/slice/CategorySlice';
import { clearTokens } from '../utils/headerApi';
import { fetchPlacesPage2Thunk } from '../store/slice/PlacesSlice';
import { fetchRecommendPlacesThunk, fetchRecommendMixThunk } from '../store/slice/LocationRecommendSlice';
import { searchDiscoveryThunk, setDiscoveryType, setDiscoveryQuery, setDiscoveryRating, resetDiscovery } from '../store/slice/DiscoverySlice';
import type { Place } from '../services/PlacesServices';
import Swal from 'sweetalert2';
import { updateLocationThunk } from '../store/slice/LocationUserSlice';
import { ChatbotWidget } from '../components/ChatbotWidget';
import { CommunityChatWidget } from '../components/CommunityChatWidget';
import Footer from '../components/Footer';
import MainHeader from '../components/MainHeader';
import bannerImg from '../assets/images/banner.jpg';
import planeImg from '../assets/images/plane.png';
import chatbotImg from '../assets/images/image_chatbot.png';
import locationImg from '../assets/images/image_location.png';
import text1Img from '../assets/images/image_text1.png';
import text2Img from '../assets/images/image_text2.png';
import text3Img from '../assets/images/image_text3.png';

// ─────────────────────────────────────────────
// Destination Card
// ─────────────────────────────────────────────
const PLACE_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1541432901042-2b8bd6f8892d?q=80&w=400',
  'https://images.unsplash.com/photo-1603566234586-22a3d0628e35?q=80&w=400',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=400',
  'https://images.unsplash.com/photo-1504280741564-f20387431e67?q=80&w=400',
  'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?q=80&w=400',
  'https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=400',
  'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?q=80&w=400',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=400',
];

export const DestinationCard = ({ place, index, type = 'places', resourceType = 0, ribbonTag }: { place: Place; index: number; type?: 'places' | 'events'; resourceType?: number; ribbonTag?: string }) => {
  const navigate = useNavigate();
  const imgUrl = place.images?.[0]?.url || PLACE_FALLBACK_IMAGES[index % PLACE_FALLBACK_IMAGES.length];
  const displayName = place.title || (place as any).name || "Chưa có tên";

  return (
    <div
      onClick={() => navigate({ to: `/${type}/${place.id}`, search: { resourceType } })}
      className="relative h-72 w-full overflow-hidden rounded-2xl shadow-lg md:h-80 group cursor-pointer"
    >
      <img src={imgUrl} alt={displayName} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
      {/* Resource type badge */}
      <div className="absolute top-3 left-3 z-20">
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-sm ${type === 'events' ? 'bg-orange-500/90 text-white' : 'bg-blue-600/90 text-white'}`}>
          {resourceType === 1 ? '🎊 Sự kiện' : '📍 Địa điểm'}
        </div>
      </div>
      {ribbonTag && (
        <div className="absolute top-3 right-0 z-20">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-l-full shadow-lg transform translate-x-1 group-hover:translate-x-0 transition-transform duration-300 flex items-center gap-1">
            <Star size={10} fill="currentColor" />
            {ribbonTag}
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 p-4 w-full">
        <h3 className="text-base font-bold text-white drop-shadow-lg line-clamp-1">{displayName}</h3>
        {/* Star rating */}
        <div className="mt-1 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              size={12}
              fill={star <= Math.round(place.averageRating || 0) ? '#FFD700' : 'transparent'}
              className={star <= Math.round(place.averageRating || 0) ? 'text-[#FFD700]' : 'text-white/40'}
            />
          ))}
          {(place.averageRating || 0) > 0 && (
            <span className="ml-1 text-[10px] text-yellow-300 font-semibold">{(place.averageRating || 0).toFixed(1)}</span>
          )}
        </div>
        <p className="mt-1 text-[11px] leading-snug text-gray-200 pr-2 line-clamp-2">{place.description}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {(place.tags || []).slice(0, 3).map((tag, idx) => (
            <span key={`${tag}-${idx}`} className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="h-72 w-full overflow-hidden rounded-2xl bg-gray-200 md:h-80 animate-pulse">
    <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300" />
  </div>
);

export function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { page2, loading2 } = useSelector((s: RootState) => s.places);
  const { recommendMix, loadingMix } = useSelector((s: RootState) => s.locationRecommend);
  const { items: discoveryItems, loading: discoveryLoading, isSearched, type: discoveryType, currentRating, currentQuery, currentPage, totalPages } = useSelector((s: RootState) => s.discovery);

  const { profile } = useSelector((s: RootState) => s.profile);
  const loginUser = useSelector((s: RootState) => s.login.user);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchRecommendMixThunk());
    dispatch(fetchRecommendPlacesThunk());
    dispatch(fetchPlacesPage2Thunk());
  }, [dispatch]);

  // Reset discovery state khi VÀO (mount) và RỜI KHỎI (unmount) HomePage
  // → luôn hiển thị home view đúng, không bị cache state search cũ
  useEffect(() => {
    dispatch(resetDiscovery());
    dispatch(setDiscoveryQuery(''));
    return () => {
      dispatch(resetDiscovery());
      dispatch(setDiscoveryQuery(''));
    };
  }, [dispatch]);

  // Handle location prompt
  useEffect(() => {
    if (loginUser && profile) {
      const hasAskedLocation = sessionStorage.getItem('hasAskedLocationSession');
      if (!hasAskedLocation) {
        sessionStorage.setItem('hasAskedLocationSession', 'true');

        // Kiểm tra quyền vị trí trước
        if (navigator.permissions && navigator.permissions.query) {
          navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
            if (permissionStatus.state === 'denied') {
              // Quyền đã bị từ chối trước đó, không làm phiền người dùng nữa
              return;
            }

            // Hỏi để cập nhật lại vị trí hiện tại
            Swal.fire({
              title: 'Cập nhật vị trí?',
              text: 'Vivu muốn lấy vị trí hiện tại của bạn để đề xuất các địa điểm du lịch phù hợp nhất!',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#00008A',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Đồng ý',
              cancelButtonText: 'Lúc khác'
            }).then((result) => {
              if (result.isConfirmed) {
                Swal.fire({
                  title: 'Đang lấy vị trí mới...',
                  allowOutsideClick: false,
                  didOpen: () => {
                    Swal.showLoading();
                  }
                });
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    dispatch(updateLocationThunk({ latitude: lat, longitude: lng }))
                      .unwrap()
                      .then(() => {
                        Swal.fire('Thành công', 'Đã cập nhật vị trí mới nhất của bạn.', 'success');
                        dispatch(fetchProfileThunk());
                      })
                      .catch((err) => {
                        Swal.fire('Lỗi', typeof err === 'string' ? err : 'Không thể cập nhật vị trí', 'error');
                      });
                  },
                  (error) => {
                    Swal.fire('Không thể lấy vị trí', error.message, 'error');
                  }
                );
              }
            });
          });
        }
      }
    }
  }, [profile, loginUser, dispatch]);

  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleGoHome = () => {
    dispatch(resetDiscovery());
    dispatch(setDiscoveryQuery(''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchClick = () => {
    if (!currentQuery.trim()) {
      // Nếu query trống, reset về home view
      handleGoHome();
      return;
    }
    dispatch(searchDiscoveryThunk({ type: discoveryType, search: currentQuery, rating: currentRating, page: 1 }));
    scrollToResults();
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'places' | 'events';
    dispatch(setDiscoveryType(newType));
    dispatch(searchDiscoveryThunk({ type: newType, search: currentQuery, rating: currentRating, page: 1 }));
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const newRating = val ? Number(val) : null;
    dispatch(setDiscoveryRating(newRating));
    dispatch(searchDiscoveryThunk({ type: discoveryType, search: currentQuery, rating: newRating, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(searchDiscoveryThunk({ type: discoveryType, search: currentQuery, rating: currentRating, page }));
    scrollToResults();
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    let pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, 5, '...', totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
      }
    }

    return (
      <div className="col-span-full mt-8 flex justify-center items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || discoveryLoading}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentPage === 1 || discoveryLoading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-[#00008A] hover:bg-[#00008A] hover:text-white shadow-sm ring-1 ring-[#00008A]/20'
            }`}
        >
          Trước
        </button>
        <div className="flex gap-1 items-center">
          {pages.map((p, idx) => (
            p === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 font-bold">...</span>
            ) : (
              <button
                key={p}
                onClick={() => handlePageChange(p as number)}
                disabled={discoveryLoading || currentPage === p}
                className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${currentPage === p
                  ? 'bg-[#00008A] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-[#00008A]/10 ring-1 ring-gray-200'
                  }`}
              >
                {p}
              </button>
            )
          ))}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || discoveryLoading}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentPage === totalPages || discoveryLoading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-[#00008A] hover:bg-[#00008A] hover:text-white shadow-sm ring-1 ring-[#00008A]/20'
            }`}
        >
          Sau
        </button>
      </div>
    );
  };

  return (
    <div className="w-full bg-white font-['Inter']">
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
            {/* Main Content inside rounded banner */}
            <main className="flex w-full flex-1 flex-col items-center justify-center py-20">

              {/* Hero image text */}
              <div className="mb-12">
                <img src={text1Img} alt="Hôm nay đi đâu ?" className="max-w-2xl w-full drop-shadow-2xl" />
              </div>

              {/* Search Bar */}
              <div className="relative mb-8 w-full max-w-2xl px-4 sm:px-0">
                <div className="relative flex h-16 items-center overflow-hidden rounded-full border border-blue-900/40 bg-white/20 shadow-lg backdrop-blur-md transition-all focus-within:border-white/60 focus-within:bg-white/40 focus-within:shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:bg-white/30 hover:shadow-xl">
                  <input
                    type="text"
                    placeholder="Tìm kiếm ngay"
                    value={currentQuery}
                    onChange={(e) => dispatch(setDiscoveryQuery(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearchClick();
                    }}
                    className="h-full w-full bg-transparent px-8 text-lg text-[#002B6B] placeholder-[#002B6B]/60 outline-none"
                  />
                  <button onClick={handleSearchClick} className="flex h-full items-center justify-center px-6 text-[#002B6B] transition-colors hover:text-blue-900">
                    <Search size={28} />
                  </button>
                </div>
              </div>

              {/* CTA Button */}
              <button onClick={handleSearchClick} className="group mt-4 flex items-center justify-center gap-3 rounded-full bg-[#E0F7FA] px-8 py-4 font-bold text-[#002B6B] shadow-lg transition-all hover:-translate-y-1 hover:bg-white hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] active:translate-y-0 disabled:opacity-70">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm overflow-hidden">
                  <img src={locationImg} alt="location" className="h-7 w-7 object-contain" />
                </div>
                <span className="text-xl">Khám phá ngay</span>
              </button>
            </main>
          </div>
        </div>

        <div ref={resultsRef} className="scroll-mt-10">
          {isSearched ? (
            <section className="mx-auto mt-16 max-w-7xl px-4 py-8 flex flex-col md:flex-row gap-8 min-h-[50vh]">
              {/* Sidebar */}
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="bg-[#E0FAFA] rounded-3xl p-6 flex flex-col gap-6 sticky top-24">
                  <div>
                    <label className="block text-[15px] font-bold text-[#00008A] mb-3">Loại hình</label>
                    <div className="relative">
                      <select
                        value={discoveryType}
                        onChange={handleTypeChange}
                        className="w-full appearance-none rounded-xl border-none bg-white px-5 py-3.5 text-sm font-bold text-gray-800 shadow-sm outline-none ring-1 ring-white focus:ring-2 focus:ring-[#00008A]/30 transition-all cursor-pointer"
                      >
                        <option value="places">Địa điểm</option>
                        <option value="events">Sự kiện</option>
                      </select>
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                        <ChevronDown size={18} className="text-[#00008A]" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[15px] font-bold text-[#00008A] mb-3">Đánh giá</label>
                    <div className="relative">
                      <select
                        value={currentRating || ''}
                        onChange={handleRatingChange}
                        className="w-full appearance-none rounded-xl border-none bg-white px-5 py-3.5 text-sm font-bold text-gray-800 shadow-sm outline-none ring-1 ring-white focus:ring-2 focus:ring-[#00008A]/30 transition-all cursor-pointer"
                      >
                        <option value="">Tất cả</option>
                        <option value="5">5 ⭐</option>
                        <option value="4">4 ⭐</option>
                        <option value="3">3 ⭐</option>
                        <option value="2">2 ⭐</option>
                        <option value="1">1 ⭐</option>
                      </select>
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                        <ChevronDown size={18} className="text-[#00008A]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 min-h-[500px] content-start">
                  {discoveryLoading ? (
                    Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
                  ) : discoveryItems.length > 0 ? (
                    discoveryItems.map((place, i) => <DestinationCard key={place.id || `discovery-${i}`} place={place} index={i} type="places" resourceType={discoveryType === 'places' ? 0 : 1} />)
                  ) : (
                    <div className="col-span-full py-12 text-center text-gray-500 font-medium">Không tìm thấy kết quả nào.</div>
                  )}
                  {!discoveryLoading && renderPagination()}
                </div>
              </div>
            </section>
          ) : (
            <>
              {/* Nào mình cùng vi vu — Page 1 */}
              <section className="mx-auto mt-16 max-w-6xl px-4 py-8">
                <div className="mb-12 flex items-center justify-center gap-4">
                  <img src={text2Img} alt="Nào mình cùng vi vu" className="h-16 object-contain drop-shadow-md" />
                  <div className="animate-bounce">
                    <img src={chatbotImg} alt="chatbot" className="h-16 w-16 object-contain" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
                  {loadingMix
                    ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
                    : recommendMix.slice(0, 12).map((item, i) => {
                      const bestSellerTags = [
                        "Đi ngay thôi",
                        "Xách balo lên",
                        "Đi liền kẻo lỡ",
                        "Chốt lịch ngay",
                        "Lên đường thôi"
                      ];

                      // Map RecommendMixItem to DestinationCard compatible structure
                      const adaptedPlace: any = {
                        id: item.resourceId,
                        title: item.title,
                        description: item.description,
                        averageRating: item.averageRating,
                        images: item.primaryImageUrl ? [{ url: item.primaryImageUrl }] : [],
                        tags: item.tags || []
                      };

                      return (
                        <DestinationCard
                          key={item.resourceId || `recommend-${i}`}
                          place={adaptedPlace}
                          index={i}
                          type="places"
                          resourceType={item.resourceType}
                          ribbonTag={i < 5 ? bestSellerTags[i] : undefined}
                        />
                      );
                    })
                  }
                </div>
              </section>

              {/* Airplane Info Section */}
              <section className="relative mt-8 mb-8 overflow-hidden py-32 sm:py-40">
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

              {/* Bạn thích trải nghiệm — Page 2 */}
              <section className="mx-auto mt-8 max-w-6xl px-4 py-16">
                <div className="mb-12 flex justify-center">
                  <img src={text3Img} alt="Bạn thích trải nghiệm" className="h-16 object-contain drop-shadow-md" />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
                  {loading2
                    ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                    : page2.map((place, i) => <DestinationCard key={place.id} place={place} index={i} type="places" resourceType={0} />)
                  }
                </div>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <Footer />

        {/* Chatbot Widget — fixed bottom-right over all content */}
        <ChatbotWidget />
        <CommunityChatWidget />
      </div>
      );
    </div>
  )
}
