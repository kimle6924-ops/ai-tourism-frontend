import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchMediaThunk, uploadMediaThunk, setPrimaryThunk, deleteMediaThunk, clearMedia } from '../../store/slice/MediaSlice';
import type { PlaceItem, CreatePlacePayload } from '../../services/AdminPlaceService';
import type { Category } from '../../services/CategoryService';
import AdministrativeUnitService, { type AdministrativeUnit } from '../../services/AdministrativeUnitService';
import Swal from 'sweetalert2';
import { X, Upload, Star, Trash2, Image, Plus } from 'lucide-react';

interface PlaceFormModalProps {
    place: PlaceItem | null;
    categories: Category[];
    onClose: () => void;
    /** Returns the created/updated resource ID on success, or null on failure */
    onSubmit: (data: CreatePlacePayload) => Promise<string | null>;
    loading: boolean;
    accentColor?: 'blue' | 'emerald';
    forcedAdministrativeUnitId?: string | null;
    forcedAdministrativeUnitLabel?: string;
}

export default function PlaceFormModal({
    place,
    categories,
    onClose,
    onSubmit,
    loading,
    accentColor = 'blue',
    forcedAdministrativeUnitId,
    forcedAdministrativeUnitLabel,
}: PlaceFormModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { mediaList, loading: mediaLoading, uploading, actionLoading } = useSelector((state: RootState) => state.media);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pendingFileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState(place?.title || '');
    const [description, setDescription] = useState(place?.description || '');
    const [address, setAddress] = useState(place?.address || '');
    const [latitude, setLatitude] = useState<string>(place?.latitude?.toString() || '');
    const [longitude, setLongitude] = useState<string>(place?.longitude?.toString() || '');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(place?.categoryIds || []);
    const [tags, setTags] = useState(place?.tags?.join(', ') || '');

    // Pending files for create mode (no ID yet)
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [provinces, setProvinces] = useState<AdministrativeUnit[]>([]);
    const [wards, setWards] = useState<AdministrativeUnit[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedWardId, setSelectedWardId] = useState('');

    const isForcedArea = !!forcedAdministrativeUnitId;
    const isEdit = !!place;

    const accent = accentColor === 'emerald'
        ? { focus: 'focus:border-emerald-500 focus:ring-emerald-500', btn: 'bg-emerald-600 hover:bg-emerald-700', chip: 'bg-emerald-600 text-white' }
        : { focus: 'focus:border-blue-500 focus:ring-blue-500', btn: 'bg-blue-600 hover:bg-blue-700', chip: 'bg-blue-600 text-white' };

    useEffect(() => {
        if (isEdit) {
            dispatch(fetchMediaThunk({ resourceType: 0, resourceId: place.id }));
        }
        return () => { dispatch(clearMedia()); };
    }, [dispatch, isEdit, place?.id]);

    // Cleanup pending previews on unmount
    useEffect(() => {
        return () => { pendingPreviews.forEach(url => URL.revokeObjectURL(url)); };
    }, [pendingPreviews]);

    useEffect(() => {
        if (isForcedArea) return;
        const loadProvinces = async () => {
            const res = await AdministrativeUnitService.getByLevel(0);
            if (!res.success) return;
            setProvinces(res.data);
        };
        loadProvinces();
    }, [isForcedArea]);

    useEffect(() => {
        if (isForcedArea) return;
        if (!selectedProvinceId) { setWards([]); setSelectedWardId(''); return; }
        const loadWards = async () => {
            const res = await AdministrativeUnitService.getChildren(selectedProvinceId);
            if (!res.success) { setWards([]); return; }
            setWards(res.data.filter((u) => u.level === 1));
        };
        loadWards();
    }, [selectedProvinceId, isForcedArea]);

    useEffect(() => {
        if (isForcedArea || !place?.administrativeUnitId) return;
        const hydrateArea = async () => {
            const res = await AdministrativeUnitService.getById(place.administrativeUnitId);
            if (!res.success) return;
            const unit = res.data;
            if (unit.level === 0) { setSelectedProvinceId(unit.id); setSelectedWardId(''); return; }
            if (unit.parentId) { setSelectedProvinceId(unit.parentId); setSelectedWardId(unit.id); }
        };
        hydrateArea();
    }, [place?.administrativeUnitId, isForcedArea]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !address.trim()) {
            Swal.fire('Thiếu thông tin', 'Vui lòng điền đầy đủ các trường bắt buộc', 'warning');
            return;
        }

        const administrativeUnitId = isForcedArea
            ? forcedAdministrativeUnitId!
            : (selectedWardId || selectedProvinceId);

        if (!administrativeUnitId) {
            Swal.fire('Thiếu khu vực', 'Vui lòng chọn Tỉnh/Thành hoặc Xã/Phường', 'warning');
            return;
        }

        setIsSubmitting(true);

        const resourceId = await onSubmit({
            title: title.trim(),
            description: description.trim(),
            address: address.trim(),
            administrativeUnitId,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            categoryIds: selectedCategoryIds,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        });

        // Upload pending files after creation
        if (resourceId && pendingFiles.length > 0) {
            for (const file of pendingFiles) {
                await dispatch(uploadMediaThunk({ file, resourceType: 0, resourceId }));
            }
        }

        setIsSubmitting(false);
    };

    const toggleCategory = (id: string) => {
        setSelectedCategoryIds(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    // ── Pending files (create mode) ──
    const handlePendingFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newFiles: File[] = [];
        const newPreviews: string[] = [];

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
            newFiles.push(file);
            newPreviews.push(URL.createObjectURL(file));
        }

        setPendingFiles(prev => [...prev, ...newFiles]);
        setPendingPreviews(prev => [...prev, ...newPreviews]);
        if (pendingFileInputRef.current) pendingFileInputRef.current.value = '';
    };

    const removePendingFile = (index: number) => {
        URL.revokeObjectURL(pendingPreviews[index]);
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
        setPendingPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // ── Edit mode image handlers ──
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!place) return;
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
            const res = await dispatch(uploadMediaThunk({ file, resourceType: 0, resourceId: place.id }));
            if (uploadMediaThunk.rejected.match(res)) {
                Swal.fire('Lỗi upload', res.payload as string, 'error');
            }
        }
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

    const handleDeleteMedia = async (id: string) => {
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

    const inputCls = `w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${accent.focus}`;
    const isBusy = loading || isSubmitting;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                <h2 className="mb-6 text-xl font-bold text-gray-800">{place ? 'Sửa địa điểm' : 'Thêm địa điểm mới'}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Tên địa điểm *</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="VD: Bãi biển Mỹ Khê" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả *</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputCls} placeholder="Mô tả chi tiết về địa điểm..." />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Địa chỉ *</label>
                        <input value={address} onChange={e => setAddress(e.target.value)} className={inputCls} placeholder="VD: 123 Đường ABC, Quận XYZ" />
                    </div>

                    {isForcedArea ? (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Khu vực quản lý</label>
                            <div className="rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                {forcedAdministrativeUnitLabel || 'Theo tài khoản Contributor'}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Tỉnh/Thành phố *</label>
                                <select value={selectedProvinceId} onChange={e => setSelectedProvinceId(e.target.value)} className={inputCls}>
                                    <option value="">Chọn tỉnh/thành</option>
                                    {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Xã/Phường (tuỳ chọn)</label>
                                <select value={selectedWardId} onChange={e => setSelectedWardId(e.target.value)} className={inputCls} disabled={!selectedProvinceId}>
                                    <option value="">Không chọn (dùng UID tỉnh)</option>
                                    {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Vĩ độ (Latitude)</label>
                            <input value={latitude} onChange={e => setLatitude(e.target.value)} type="number" step="any" className={inputCls} placeholder="VD: 16.0544" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Kinh độ (Longitude)</label>
                            <input value={longitude} onChange={e => setLongitude(e.target.value)} type="number" step="any" className={inputCls} placeholder="VD: 108.2022" />
                        </div>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Danh mục</label>
                        <div className="flex flex-wrap gap-2 rounded-lg border p-3 max-h-36 overflow-y-auto">
                            {categories.map(cat => (
                                <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}
                                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${selectedCategoryIds.includes(cat.id) ? accent.chip : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                    {cat.name}
                                </button>
                            ))}
                            {categories.length === 0 && <span className="text-xs text-gray-400">Không có danh mục</span>}
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Tags (phân cách bằng dấu phẩy)</label>
                        <input value={tags} onChange={e => setTags(e.target.value)} className={inputCls} placeholder="VD: biển, du lịch, gia đình" />
                    </div>

                    {/* ── Image Section ── */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Hình ảnh</label>

                        {isEdit ? (
                            /* ── EDIT MODE: live upload/manage ── */
                            <div className="rounded-lg border p-3 space-y-3">
                                <div>
                                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                                        className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition disabled:opacity-50">
                                        <Upload size={16} />
                                        {uploading ? 'Đang upload...' : 'Chọn ảnh để upload'}
                                    </button>
                                </div>

                                {(mediaLoading || uploading || actionLoading) && (
                                    <div className="flex items-center justify-center py-2">
                                        <div className="h-6 w-6 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
                                    </div>
                                )}

                                {!mediaLoading && mediaList.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                                        <Image size={36} />
                                        <p className="mt-1 text-xs">Chưa có hình ảnh nào</p>
                                    </div>
                                )}

                                {!mediaLoading && mediaList.length > 0 && (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {mediaList.map((media) => (
                                            <div key={media.id} className={`group relative rounded-lg overflow-hidden border-2 transition ${media.isPrimary ? 'border-yellow-400 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <div className="aspect-square">
                                                    <img src={media.secureUrl || media.url} alt="" className="h-full w-full object-cover" />
                                                </div>
                                                {media.isPrimary && (
                                                    <div className="absolute top-1 left-1 flex items-center gap-0.5 rounded-full bg-yellow-400 px-1.5 py-0.5 text-[10px] font-bold text-yellow-900">
                                                        <Star size={8} className="fill-yellow-900" /> Chính
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-end justify-center opacity-0 group-hover:opacity-100 pb-1.5 gap-1">
                                                    {!media.isPrimary && (
                                                        <button type="button" onClick={() => handleSetPrimary(media.id)} className="flex items-center gap-0.5 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-yellow-700 hover:bg-yellow-50 transition">
                                                            <Star size={10} /> Chính
                                                        </button>
                                                    )}
                                                    <button type="button" onClick={() => handleDeleteMedia(media.id)} className="flex items-center gap-0.5 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-red-600 hover:bg-red-50 transition">
                                                        <Trash2 size={10} /> Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ── CREATE MODE: pick files, upload after save ── */
                            <div className="rounded-lg border p-3 space-y-3">
                                <div>
                                    <input ref={pendingFileInputRef} type="file" accept="image/*" multiple onChange={handlePendingFiles} className="hidden" />
                                    <button type="button" onClick={() => pendingFileInputRef.current?.click()}
                                        className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition">
                                        <Plus size={16} /> Chọn ảnh
                                    </button>
                                </div>

                                {pendingFiles.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                                        <Image size={36} />
                                        <p className="mt-1 text-xs">Chưa chọn hình ảnh nào</p>
                                    </div>
                                )}

                                {pendingFiles.length > 0 && (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {pendingPreviews.map((url, idx) => (
                                            <div key={idx} className="group relative rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition">
                                                <div className="aspect-square">
                                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                                </div>
                                                <button type="button" onClick={() => removePendingFile(idx)}
                                                    className="absolute top-1 right-1 rounded-full bg-red-500 p-0.5 text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-600">
                                                    <X size={12} />
                                                </button>
                                                <div className="px-1.5 py-1 text-[10px] text-gray-500 truncate">
                                                    {pendingFiles[idx].name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Hủy</button>
                        <button type="submit" disabled={isBusy} className={`rounded-lg ${accent.btn} px-6 py-2 text-sm font-medium text-white disabled:opacity-50 transition`}>
                            {isSubmitting ? 'Đang lưu & upload ảnh...' : loading ? 'Đang xử lý...' : place ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
