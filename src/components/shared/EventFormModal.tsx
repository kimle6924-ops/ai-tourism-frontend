import { useState } from 'react';
import type { EventItem, CreateEventPayload, UpdateEventPayload } from '../../services/AdminEventService';
import type { Category } from '../../services/CategoryService';
import Swal from 'sweetalert2';
import { X } from 'lucide-react';

interface EventFormModalProps {
    event: EventItem | null;
    categories: Category[];
    onClose: () => void;
    onSubmit: (data: CreateEventPayload | UpdateEventPayload) => void;
    loading: boolean;
    accentColor?: 'blue' | 'emerald';
}

export default function EventFormModal({ event, categories, onClose, onSubmit, loading, accentColor = 'blue' }: EventFormModalProps) {
    const [title, setTitle] = useState(event?.title || '');
    const [description, setDescription] = useState(event?.description || '');
    const [address, setAddress] = useState(event?.address || '');
    const [administrativeUnitId, setAdministrativeUnitId] = useState(event?.administrativeUnitId || '');
    const [latitude, setLatitude] = useState<string>(event?.latitude?.toString() || '');
    const [longitude, setLongitude] = useState<string>(event?.longitude?.toString() || '');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(event?.categoryIds || []);
    const [tags, setTags] = useState(event?.tags?.join(', ') || '');
    const [startAt, setStartAt] = useState(event?.startAt ? event.startAt.slice(0, 16) : '');
    const [endAt, setEndAt] = useState(event?.endAt ? event.endAt.slice(0, 16) : '');
    const [eventStatus, setEventStatus] = useState<number>(event?.eventStatus ?? 0);

    const accent = accentColor === 'emerald'
        ? { focus: 'focus:border-emerald-500 focus:ring-emerald-500', btn: 'bg-emerald-600 hover:bg-emerald-700', chip: 'bg-emerald-600 text-white' }
        : { focus: 'focus:border-blue-500 focus:ring-blue-500', btn: 'bg-blue-600 hover:bg-blue-700', chip: 'bg-blue-600 text-white' };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !address.trim() || !startAt || !endAt) {
            Swal.fire('Thiếu thông tin', 'Vui lòng điền đầy đủ các trường bắt buộc', 'warning');
            return;
        }
        const base = {
            title: title.trim(),
            description: description.trim(),
            address: address.trim(),
            administrativeUnitId: administrativeUnitId || '00000000-0000-0000-0000-000000000000',
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            categoryIds: selectedCategoryIds,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            startAt: new Date(startAt).toISOString(),
            endAt: new Date(endAt).toISOString(),
        };
        if (event) {
            onSubmit({ ...base, eventStatus });
        } else {
            onSubmit(base);
        }
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
                <h2 className="mb-6 text-xl font-bold text-gray-800">{event ? 'Sửa sự kiện' : 'Thêm sự kiện mới'}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Tên sự kiện *</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="VD: Lễ hội hoa Đà Lạt" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả *</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputCls} placeholder="Mô tả chi tiết về sự kiện..." />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Địa điểm tổ chức *</label>
                        <input value={address} onChange={e => setAddress(e.target.value)} className={inputCls} placeholder="VD: Quảng trường Lâm Viên, Đà Lạt" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Bắt đầu *</label>
                            <input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Kết thúc *</label>
                            <input type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)} className={inputCls} />
                        </div>
                    </div>
                    {event && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Trạng thái sự kiện</label>
                            <select value={eventStatus} onChange={e => setEventStatus(Number(e.target.value))} className={inputCls}>
                                <option value={0}>Sắp diễn ra</option>
                                <option value={1}>Đang diễn ra</option>
                                <option value={2}>Đã kết thúc</option>
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Mã đơn vị hành chính</label>
                        <input value={administrativeUnitId} onChange={e => setAdministrativeUnitId(e.target.value)} className={inputCls} placeholder="UUID đơn vị hành chính" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Vĩ độ</label>
                            <input value={latitude} onChange={e => setLatitude(e.target.value)} type="number" step="any" className={inputCls} />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Kinh độ</label>
                            <input value={longitude} onChange={e => setLongitude(e.target.value)} type="number" step="any" className={inputCls} />
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
                        <input value={tags} onChange={e => setTags(e.target.value)} className={inputCls} placeholder="VD: lễ hội, văn hóa, mùa xuân" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Hủy</button>
                        <button type="submit" disabled={loading} className={`rounded-lg ${accent.btn} px-6 py-2 text-sm font-medium text-white disabled:opacity-50 transition`}>
                            {loading ? 'Đang xử lý...' : event ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
