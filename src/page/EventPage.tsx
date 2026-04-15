import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchEventTimelineThunk, setTimeline } from '../store/slice/EventSlice';
import type { TimelineFilter } from '../services/EventService';
import { Calendar, Clock, Flame, Loader2, AlertCircle } from 'lucide-react';
import MainHeader from '../components/MainHeader';
import bannerImg from '../assets/images/banner.jpg';
import Footer from '../components/Footer';
import { ChatbotWidget } from '../components/ChatbotWidget';
import { useNavigate } from '@tanstack/react-router';
import { Star } from 'lucide-react';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=400',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=400',
  'https://images.unsplash.com/photo-1504280741564-f20387431e67?q=80&w=400',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=400',
];

const TIMELINE_OPTIONS: { label: string; value: TimelineFilter; icon: React.ReactNode; color: string }[] = [
  { label: 'Tất cả', value: 'both', icon: <Calendar size={16} />, color: 'bg-[#00008A] text-white' },
  { label: '🔥 Đang diễn ra', value: 'ongoing', icon: <Flame size={16} />, color: 'bg-orange-500 text-white' },
  { label: '📅 Sắp diễn ra', value: 'upcoming', icon: <Clock size={16} />, color: 'bg-blue-500 text-white' },
];

function EventStatusBadge({ status }: { status: number }) {
  if (status === 1) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        Đang diễn ra
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 rounded-full bg-blue-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
      <Clock size={10} />
      Sắp diễn ra
    </span>
  );
}

function EventCard({ event, index }: { event: import('../services/EventService').EventItem; index: number }) {
  const navigate = useNavigate();
  const imgUrl = event.images?.[0]?.url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  const startDate = event.startAt ? new Date(event.startAt) : null;
  const endDate = event.endAt ? new Date(event.endAt) : null;

  const formatDate = (d: Date) =>
    d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div
      onClick={() => navigate({ to: `/places/${event.id}`, search: { resourceType: 1 } })}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-lg hover:ring-orange-100 cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imgUrl}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3 z-10">
          <EventStatusBadge status={event.eventStatus} />
        </div>

        {/* Rating */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
          <Star size={11} fill="#FFD700" className="text-[#FFD700]" />
          <span className="text-xs font-bold text-yellow-300">{event.averageRating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-bold text-[#00008A] line-clamp-2 text-sm leading-snug group-hover:text-orange-600 transition-colors">
          {event.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{event.description}</p>

        {/* Date */}
        {startDate && (
          <div className="mt-auto flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
            <Calendar size={11} className="text-orange-400 flex-shrink-0" />
            <span>{formatDate(startDate)}{endDate && endDate.getTime() !== startDate.getTime() ? ` – ${formatDate(endDate)}` : ''}</span>
          </div>
        )}

        {/* Address */}
        <p className="text-[11px] text-gray-400 line-clamp-1">{event.address}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-1">
          {event.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-600">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EventPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error, timeline, currentPage, totalPages, totalCount } = useSelector(
    (s: RootState) => s.event
  );

  useEffect(() => {
    dispatch(fetchEventTimelineThunk({ timeline: 'both', page: 1 }));
  }, [dispatch]);

  const handleTimelineChange = (tl: TimelineFilter) => {
    dispatch(setTimeline(tl));
    dispatch(fetchEventTimelineThunk({ timeline: tl, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(fetchEventTimelineThunk({ timeline, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          backgroundRepeat: 'no-repeat',
        }}
      >
        <MainHeader transparent={true} />
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12">
        {/* Title */}
        <div className="mb-10 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 mb-6 shadow-sm">
            <Calendar size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#00008A]">Sự kiện nổi bật</h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Tham gia các lễ hội, triển lãm và sự kiện văn hóa nghệ thuật đặc sắc đang và sắp diễn ra gần bạn.
          </p>
        </div>

        {/* Timeline Filter Tabs */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {TIMELINE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleTimelineChange(opt.value)}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold shadow-sm transition-all active:scale-95 ${timeline === opt.value
                ? opt.color + ' shadow-md ring-2 ring-offset-1 ring-current'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Section header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-orange-500" />
            <h2 className="text-2xl font-bold text-[#00008A]">
              {timeline === 'ongoing' ? 'Đang diễn ra' : timeline === 'upcoming' ? 'Sắp diễn ra' : 'Tất cả sự kiện'}
            </h2>
          </div>
          {!loading && totalCount > 0 && (
            <span className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {totalCount} sự kiện
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-orange-500" size={40} />
            <p className="text-gray-500 font-medium">Đang tải sự kiện...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
              <AlertCircle size={28} />
            </div>
            <p className="font-bold text-red-500">{error}</p>
            <button
              onClick={() => dispatch(fetchEventTimelineThunk({ timeline, page: 1 }))}
              className="mt-2 rounded-xl bg-[#00008A] px-6 py-2 text-sm font-bold text-white hover:bg-blue-900 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <>
            {items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item, i) => (
                  <EventCard key={item.id} event={item} index={i} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-24 text-center">
                <div className="h-16 w-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-300">
                  <Calendar size={32} />
                </div>
                <p className="text-gray-500 font-medium">Không có sự kiện nào trong khoảng thời gian này.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all bg-white text-[#00008A] shadow-sm ring-1 ring-[#00008A]/20 hover:bg-[#00008A] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === i + 1
                      ? 'bg-[#00008A] text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all bg-white text-[#00008A] shadow-sm ring-1 ring-[#00008A]/20 hover:bg-[#00008A] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
