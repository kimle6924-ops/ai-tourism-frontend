import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from '@tanstack/react-router';
import { useRef } from 'react';
import { Star, Send, MapPin, User, ArrowLeft, Camera, X } from 'lucide-react';
import type { AppDispatch, RootState } from '../store';
import { fetchLocationDetailThunk, clearLocationDetail } from '../store/slice/LocationDetaiSlice';
import { fetchReviewsThunk, createReviewThunk, clearReviews } from '../store/slice/ReviewSlice';
import { Link } from '@tanstack/react-router';
import { ProfileDropdown, DestinationCard, SkeletonCard } from './HomePage';
import bannerImg from '../assets/images/banner.jpg';
import logoImg from '../assets/images/image_logo_vivu.png';
import { fetchPlacesPage1Thunk } from '../store/slice/PlacesSlice';
import { ChatbotWidget } from '../components/ChatbotWidget';
import Footer from '../components/Footer';
import MediaService from '../services/MediaService';

export function LocationDetailPage({ type, id, resourceType }: { type: 'places' | 'events', id: string, resourceType: number }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { detail, loading: detailLoading, error: detailError } = useSelector((s: RootState) => s.locationDetail);
    const { items: reviews, loading: reviewsLoading, posting, currentPage, totalPages } = useSelector((s: RootState) => s.reviews);
    const authUser = useSelector((s: RootState) => s.login.user);
    const { page1, loading1 } = useSelector((s: RootState) => s.places);

    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Review upload state
    const [reviewImageFile, setReviewImageFile] = useState<File | null>(null);
    const [reviewImagePreview, setReviewImagePreview] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        dispatch(fetchLocationDetailThunk({ id, type }));
        dispatch(fetchReviewsThunk({ resourceType, resourceId: id, page: 1 }));
        dispatch(fetchPlacesPage1Thunk());
        setSelectedImage(null); // reset ảnh chọn khi đổi địa điểm

        return () => {
            dispatch(clearLocationDetail());
            dispatch(clearReviews());
        };
    }, [dispatch, id, type, resourceType]);

    const handleLoadMore = () => {
        if (currentPage < totalPages && !reviewsLoading) {
            dispatch(fetchReviewsThunk({ resourceType, resourceId: id, page: currentPage + 1 }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setReviewImageFile(file);
            setReviewImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setReviewImageFile(null);
        if (reviewImagePreview) URL.revokeObjectURL(reviewImagePreview);
        setReviewImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmitReview = async () => {
        if (!authUser) {
            alert('Vui lòng đăng nhập để đánh giá!');
            return;
        }

        setIsUploadingImage(true);
        let uploadedImageUrl = undefined;

        if (reviewImageFile) {
            try {
                const sigRes = await MediaService.getReviewSignature();
                if (sigRes.success) {
                    const uploadRes = await MediaService.uploadToCloudinary(reviewImageFile, sigRes.data);
                    uploadedImageUrl = uploadRes.secure_url;
                } else {
                    alert('Không thể lấy chữ ký upload ảnh.');
                    setIsUploadingImage(false);
                    return;
                }
            } catch (err) {
                alert('Lỗi khi upload ảnh.');
                setIsUploadingImage(false);
                return;
            }
        }

        const res = await dispatch(createReviewThunk({
            resourceType,
            resourceId: id,
            rating,
            comment,
            imageUrl: uploadedImageUrl
        }));

        if (createReviewThunk.fulfilled.match(res)) {
            setComment('');
            setRating(5);
            handleRemoveImage();
            dispatch(fetchLocationDetailThunk({ id, type }));
        } else {
            alert('Có lỗi xảy ra khi thêm đánh giá!');
        }
        setIsUploadingImage(false);
    };

    if (detailLoading && !detail) {
        return <div className="min-h-screen flex text-[#00008A] items-center justify-center font-bold text-xl">Đang tải chi tiết...</div>;
    }

    if (detailError || !detail) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-red-500 font-['Inter']">
                <p className="mb-4 text-lg font-medium">Không tìm thấy thông tin hoặc có lỗi xảy ra.</p>
                <button onClick={() => router.history.back()} className="text-[#00008A] font-bold hover:underline flex items-center gap-2">
                    <ArrowLeft size={16} /> Quay lại
                </button>
            </div>
        );
    }

    const FALLBACK = "https://images.unsplash.com/photo-1541432901042-2b8bd6f8892d?q=80&w=800";
    const allImages: string[] = detail.images?.length
        ? detail.images.map((img: any) => img.url)
        : [FALLBACK];
    const mainImage = selectedImage ?? allImages[0];
    const thumbCount = allImages.length;

    return (
        <div className="w-full bg-white font-['Inter'] min-h-screen flex flex-col">
            {/* Header Banner */}
            <div
                className="w-full h-32 relative flex items-center justify-between px-4 sm:px-8 shadow-md"
                style={{
                    backgroundImage: `url(${bannerImg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 20%',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                <div className="flex-1 relative z-10" />
                <div className="flex-1 flex justify-center relative z-10">
                    <Link to="/">
                        <img src={logoImg} alt="Vivu Logo" className="h-[80px] drop-shadow-md hover:scale-105 transition-transform" />
                    </Link>
                </div>
                <div className="flex-1 flex justify-end relative z-10">
                    <ProfileDropdown />
                </div>
            </div>

            <div className="max-w-6xl mx-auto w-full px-4 mt-8 flex-1">

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left side: Images & Description */}
                    <div className="lg:w-[55%] flex flex-col gap-6">
                        {/* Main Image */}
                        <div className="w-full h-80 sm:h-96 md:h-[450px] overflow-hidden rounded-3xl shadow-lg bg-gray-100 relative group">
                            <img
                                src={mainImage}
                                alt={detail.title || (detail as any).name}
                                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                            />
                        </div>

                        {/* Thumbnails — center if ≤3, scroll if ≥4 */}
                        {thumbCount <= 3 ? (
                            <div
                                className="flex gap-3 justify-center p-2"
                            >
                                {allImages.map((src, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedImage(src)}
                                        className={`h-24 sm:h-28 w-24 sm:w-28 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-200 cursor-pointer shadow-sm transition-all duration-200 ${mainImage === src
                                            ? 'ring-2 ring-[#00008A] shadow-md brightness-110'
                                            : 'hover:ring-2 hover:ring-[#00008A]/50'
                                            }`}
                                    >
                                        <img src={src} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex gap-3 overflow-x-auto p-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {allImages.map((src, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedImage(src)}
                                        className={`flex-shrink-0 h-24 sm:h-28 w-36 sm:w-40 rounded-2xl overflow-hidden bg-gray-200 cursor-pointer shadow-sm transition-all duration-200 ${mainImage === src
                                            ? 'ring-2 ring-[#00008A] shadow-md brightness-110'
                                            : 'hover:ring-2 hover:ring-[#00008A]/50'
                                            }`}
                                    >
                                        <img src={src} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <div className="rounded-3xl mt-4 border border-gray-100 shadow-sm p-6 sm:p-8">
                            <h3 className="text-xl font-bold text-[#00008A] mb-4">Giới thiệu</h3>
                            <p className="text-gray-700 leading-relaxed text-[15px] md:text-base whitespace-pre-line">
                                {detail.description}
                            </p>
                        </div>
                    </div>

                    {/* Right side: Info & Reviews */}
                    <div className="lg:w-[45%] flex flex-col gap-6">
                        {/* Title and Rating boxed */}
                        <div className="border-2 border-blue-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10"></div>
                            <h1 className="text-3xl font-extrabold text-[#00008A] mb-3 pr-8 leading-tight">{detail.title || (detail as any).name}</h1>
                            <div className="flex items-center gap-2 mb-4 bg-yellow-50 inline-flex px-3 py-1.5 rounded-xl border border-yellow-200">
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} size={20} fill={star <= Math.round(detail.averageRating) ? '#FFD700' : 'transparent'} className={star <= Math.round(detail.averageRating) ? 'text-[#FFD700]' : 'text-yellow-200'} />
                                    ))}
                                </div>
                                <span className="text-lg font-extrabold text-[#00008A] ml-2">{detail.averageRating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-start gap-3 text-gray-700 text-[15px] font-medium mt-2">
                                <MapPin size={22} className="mt-0 flex-shrink-0 text-red-500 drop-shadow-sm" />
                                <span className="leading-snug">{detail.address}</span>
                            </div>
                            <div className="mt-6 flex flex-wrap gap-2">
                                {detail.tags.map((t: string) => (
                                    <span key={t} className="px-3.5 py-1.5 bg-[#E0FAFA] text-[#00008A] rounded-full text-xs font-bold shadow-sm border border-cyan-100">#{t}</span>
                                ))}
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-[#FFF9DB]/30 rounded-3xl p-6 sm:p-8 border border-yellow-200/50 flex-1 flex flex-col shadow-sm">
                            <h2 className="text-xl font-extrabold text-[#00008A] mb-6 flex items-center gap-2">
                                Đánh giá từ cộng đồng
                            </h2>

                            {/* Write review form (Moved to top of reviews for better UX) */}
                            <div className="mb-8 bg-white rounded-2xl p-5 shadow-sm border border-yellow-100">
                                <p className="text-sm font-bold text-gray-700 mb-3">Đánh giá của bạn</p>
                                <div className="flex items-center gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-125"
                                        >
                                            <Star size={26} fill={star <= rating ? '#FFD700' : 'transparent'} className={star <= rating ? 'text-[#FFD700]' : 'text-gray-200'} strokeWidth={1.5} />
                                        </button>
                                    ))}
                                    <span className="ml-3 font-extrabold text-[#00008A] bg-yellow-100 px-2 py-0.5 rounded-md text-sm">{rating}.0 Sao</span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                                        <div className="flex-1 w-full bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[#00008A] focus-within:ring-2 focus-within:ring-[#00008A]/20 transition-all flex flex-col">
                                            <textarea
                                                value={comment}
                                                onChange={e => setComment(e.target.value)}
                                                placeholder="Viết đánh giá của bạn (tuỳ chọn)..."
                                                className="w-full bg-transparent px-4 py-3 text-sm text-black font-medium placeholder-gray-500 outline-none resize-none min-h-[56px]"
                                                rows={2}
                                            />
                                            {reviewImagePreview && (
                                                <div className="px-4 pb-3 relative">
                                                    <div className="relative inline-block mt-2">
                                                        <img src={reviewImagePreview} alt="Preview" className="h-24 w-auto rounded-lg border border-gray-200" />
                                                        <button onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition">
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center px-3 py-2 border-t border-gray-200">
                                                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageChange} />
                                                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-[#00008A] hover:bg-blue-50 rounded-lg transition" title="Đính kèm ảnh">
                                                    <Camera size={20} />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSubmitReview}
                                            disabled={posting || isUploadingImage}
                                            className="bg-[#FFD700] text-[#00008A] font-extrabold px-6 rounded-xl hover:brightness-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm h-[56px] flex items-center justify-center gap-2 flex-shrink-0 whitespace-nowrap"
                                        >
                                            {isUploadingImage || posting ? (
                                                <div className="w-5 h-5 border-2 border-[#00008A] border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <><Send size={18} /> <span>Gửi</span></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Reviews list */}
                            <div className="flex-1 overflow-y-auto pr-2 max-h-[600px] scrollbar-hide hover:scrollbar-default transition-all">
                                <div className="flex flex-col space-y-4">
                                    {reviews.length === 0 && !reviewsLoading && (
                                        <div className="text-center py-10 bg-white/50 rounded-2xl border border-dashed border-gray-300">
                                            <p className="text-sm text-gray-500 font-medium">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                                        </div>
                                    )}
                                    {reviews.map((rev: any) => (
                                        <div key={rev.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 mb-3">
                                                {rev.userAvatarUrl ? (
                                                    <div className="w-11 h-11 rounded-full overflow-hidden shadow-inner flex-shrink-0">
                                                        <img src={rev.userAvatarUrl} alt={rev.userFullName || 'User'} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E0FAFA] to-blue-200 flex items-center justify-center text-[#00008A] font-bold shadow-inner flex-shrink-0">
                                                        <User size={20} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-extrabold text-sm text-[#00008A]">{rev.userFullName || 'Người dùng Ẩn danh'}</p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star key={star} size={11} fill={star <= rev.rating ? '#FFD700' : 'transparent'} className={star <= rev.rating ? 'text-[#FFD700]' : 'text-gray-200'} />
                                                        ))}
                                                        <span className="text-[11px] font-bold text-yellow-600 ml-1.5">{rev.rating}.0</span>
                                                    </div>
                                                </div>
                                                <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            {rev.comment && (
                                                <p className="text-[14px] text-gray-700 leading-relaxed ml-14 mb-2">
                                                    {rev.comment}
                                                </p>
                                            )}
                                            {rev.imageUrl && (
                                                <div className="ml-14 mt-2 h-32 w-48 rounded-xl overflow-hidden border border-gray-200">
                                                    <img src={rev.imageUrl} alt="Review" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {reviewsLoading && (
                                        <div className="py-6 flex justify-center">
                                            <div className="w-8 h-8 border-4 border-[#FFD700] border-t-white rounded-full animate-spin drop-shadow-md"></div>
                                        </div>
                                    )}

                                    {currentPage < totalPages && !reviewsLoading && (
                                        <button onClick={handleLoadMore} className="w-full py-3 mt-2 bg-white rounded-xl border-2 border-dashed border-[#00008A]/30 text-sm font-bold text-[#00008A] hover:bg-[#00008A] hover:text-white transition-all">
                                            Xem thêm đánh giá cũ hơn
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

                {/* Đề xuất section */}
                <div className="mt-16 mb-12">
                    <h2 className="text-2xl font-extrabold text-[#00008A] mb-6">
                        Địa điểm đề xuất
                    </h2>
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
                        {loading1 ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : page1.filter(p => p.id !== id).slice(0, 4).map((place, i) => (
                            <DestinationCard key={place.id} place={place} index={i} type="places" resourceType={0} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />

            <ChatbotWidget />
        </div>
    );
}
