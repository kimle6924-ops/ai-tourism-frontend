import { useEffect, useState } from 'react';
import type { PlaceItem, CreatePlacePayload } from '../../services/AdminPlaceService';
import type { Category } from '../../services/CategoryService';
import AdministrativeUnitService, { type AdministrativeUnit } from '../../services/AdministrativeUnitService';
import Swal from 'sweetalert2';
import { X } from 'lucide-react';

interface PlaceFormModalProps {
    place: PlaceItem | null;
    categories: Category[];
    onClose: () => void;
    onSubmit: (data: CreatePlacePayload) => void;
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
    const [title, setTitle] = useState(place?.title || '');
    const [description, setDescription] = useState(place?.description || '');
    const [address, setAddress] = useState(place?.address || '');
    const [latitude, setLatitude] = useState<string>(place?.latitude?.toString() || '');
    const [longitude, setLongitude] = useState<string>(place?.longitude?.toString() || '');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(place?.categoryIds || []);
    const [tags, setTags] = useState(place?.tags?.join(', ') || '');

    const [provinces, setProvinces] = useState<AdministrativeUnit[]>([]);
    const [wards, setWards] = useState<AdministrativeUnit[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedWardId, setSelectedWardId] = useState('');

    const isForcedArea = !!forcedAdministrativeUnitId;

    const accent = accentColor === 'emerald'
        ? { focus: 'focus:border-emerald-500 focus:ring-emerald-500', btn: 'bg-emerald-600 hover:bg-emerald-700', chip: 'bg-emerald-600 text-white' }
        : { focus: 'focus:border-blue-500 focus:ring-blue-500', btn: 'bg-blue-600 hover:bg-blue-700', chip: 'bg-blue-600 text-white' };

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
        if (!selectedProvinceId) {
            setWards([]);
            setSelectedWardId('');
            return;
        }

        const loadWards = async () => {
            const res = await AdministrativeUnitService.getChildren(selectedProvinceId);
            if (!res.success) {
                setWards([]);
                return;
            }
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
            if (unit.level === 0) {
                setSelectedProvinceId(unit.id);
                setSelectedWardId('');
                return;
            }

            if (unit.parentId) {
                setSelectedProvinceId(unit.parentId);
                setSelectedWardId(unit.id);
            }
        };

        hydrateArea();
    }, [place?.administrativeUnitId, isForcedArea]);

    const handleSubmit = (e: React.FormEvent) => {
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

        onSubmit({
            title: title.trim(),
            description: description.trim(),
            address: address.trim(),
            administrativeUnitId,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            categoryIds: selectedCategoryIds,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        });
    };

    const toggleCategory = (id: string) => {
        setSelectedCategoryIds(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const inputCls = `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${accent.focus}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
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
                                <select
                                    value={selectedProvinceId}
                                    onChange={e => setSelectedProvinceId(e.target.value)}
                                    className={inputCls}
                                >
                                    <option value="">Chọn tỉnh/thành</option>
                                    {provinces.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Xã/Phường (tuỳ chọn)</label>
                                <select
                                    value={selectedWardId}
                                    onChange={e => setSelectedWardId(e.target.value)}
                                    className={inputCls}
                                    disabled={!selectedProvinceId}
                                >
                                    <option value="">Không chọn (dùng UID tỉnh)</option>
                                    {wards.map((w) => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
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
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Hủy</button>
                        <button type="submit" disabled={loading} className={`rounded-lg ${accent.btn} px-6 py-2 text-sm font-medium text-white disabled:opacity-50 transition`}>
                            {loading ? 'Đang xử lý...' : place ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
