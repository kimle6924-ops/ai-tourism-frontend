import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchMediaThunk, uploadMediaThunk, setPrimaryThunk, deleteMediaThunk, clearMedia } from '../store/slice/MediaSlice';
import type { ResourceType } from '../services/ModerationService';
import Swal from 'sweetalert2';
import { X, Upload, Star, Trash2, Image } from 'lucide-react';

interface MediaManagerProps {
    resourceType: ResourceType; // 0 = Place, 1 = Event
    resourceId: string;
    resourceTitle: string;
    onClose: () => void;
}

export default function MediaManager({ resourceType, resourceId, resourceTitle, onClose }: MediaManagerProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { mediaList, loading, uploading, actionLoading } = useSelector((state: RootState) => state.media);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        dispatch(fetchMediaThunk({ resourceType, resourceId }));
        return () => { dispatch(clearMedia()); };
    }, [dispatch, resourceType, resourceId]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) {
                Swal.fire('Lỗi', `"${file.name}" không phải file ảnh`, 'error');
                continue;
            }
            if (file.size > 10 * 1024 * 1024) {
                Swal.fire('Lỗi', `"${file.name}" vượt quá 10MB`, 'error');
                continue;
            }
            const res = await dispatch(uploadMediaThunk({ file, resourceType, resourceId }));
            if (uploadMediaThunk.rejected.match(res)) {
                Swal.fire('Lỗi upload', res.payload as string, 'error');
            }
        }

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSetPrimary = async (id: string) => {
        const res = await dispatch(setPrimaryThunk(id));
        if (setPrimaryThunk.fulfilled.match(res)) {
            Swal.fire({ title: 'Thành công', text: 'Đã đặt ảnh chính', icon: 'success', timer: 1500, showConfirmButton: false });
        } else {
            Swal.fire('Lỗi', res.payload as string, 'error');
        }
    };

    const handleDelete = async (id: string) => {
        const confirm = await Swal.fire({ title: 'Xóa ảnh?', text: 'Ảnh sẽ bị xóa vĩnh viễn', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#6c757d', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy' });
        if (confirm.isConfirmed) {
            const res = await dispatch(deleteMediaThunk(id));
            if (deleteMediaThunk.fulfilled.match(res)) {
                Swal.fire({ title: 'Đã xóa', icon: 'success', timer: 1500, showConfirmButton: false });
            } else {
                Swal.fire('Lỗi', res.payload as string, 'error');
            }
        }
    };

    const isLoading = loading || uploading || actionLoading;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>

                <div className="mb-5">
                    <h2 className="text-lg font-bold text-gray-800">Quản lý hình ảnh</h2>
                    <p className="text-sm text-gray-500 mt-1">{resourceTitle}</p>
                </div>

                {/* Upload button */}
                <div className="mb-5">
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-6 py-3 text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition disabled:opacity-50"
                    >
                        <Upload size={18} />
                        {uploading ? 'Đang upload...' : 'Chọn ảnh để upload'}
                    </button>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-4">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    </div>
                )}

                {/* Media grid */}
                {!loading && mediaList.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Image size={48} />
                        <p className="mt-2 text-sm">Chưa có hình ảnh nào</p>
                    </div>
                )}

                {!loading && mediaList.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {mediaList.map((media) => (
                            <div key={media.id} className={`group relative rounded-xl overflow-hidden border-2 transition ${media.isPrimary ? 'border-yellow-400 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                                <div className="aspect-square">
                                    <img src={media.secureUrl || media.url} alt="" className="h-full w-full object-cover" />
                                </div>

                                {/* Primary badge */}
                                {media.isPrimary && (
                                    <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-yellow-900">
                                        <Star size={10} className="fill-yellow-900" /> Chính
                                    </div>
                                )}

                                {/* Actions overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-end justify-center opacity-0 group-hover:opacity-100 pb-2 gap-1">
                                    {!media.isPrimary && (
                                        <button onClick={() => handleSetPrimary(media.id)} className="flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-50 transition" title="Đặt ảnh chính">
                                            <Star size={12} /> Đặt chính
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(media.id)} className="flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition" title="Xóa">
                                        <Trash2 size={12} /> Xóa
                                    </button>
                                </div>

                                {/* File info */}
                                <div className="px-2 py-1.5 text-xs text-gray-500 truncate">
                                    {media.width}x{media.height} &middot; {(media.bytes / 1024).toFixed(0)}KB
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
