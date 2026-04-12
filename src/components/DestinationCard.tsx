import { Star } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { Place } from '../services/PlacesServices';

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
