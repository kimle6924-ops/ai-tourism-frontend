import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ProfileDropdown } from './HomePage';
import type { AppDispatch, RootState } from '../store';
import { fetchAdminPlacesThunk, createPlaceThunk, updatePlaceThunk, deletePlaceThunk, setSelectedPlace } from '../store/slice/AdminPlaceSlice';
import { fetchAdminEventsThunk, createEventThunk, updateEventThunk, deleteEventThunk, setSelectedEvent } from '../store/slice/AdminEventSlice';
import { fetchPendingPlacesThunk, fetchPendingEventsThunk, approveResourceThunk, rejectResourceThunk, fetchLogsThunk, clearLogs } from '../store/slice/ModerationSlice';
import type { PlaceItem, CreatePlacePayload } from '../services/AdminPlaceService';
import type { EventItem, CreateEventPayload, UpdateEventPayload } from '../services/AdminEventService';
import type { ResourceType } from '../services/ModerationService';
import CategoryService, { type Category } from '../services/CategoryService';
import MediaManager from '../components/MediaManager';
import Swal from 'sweetalert2';
import { MapPin, Calendar, Star, Plus, Pencil, Trash2, ExternalLink, X, Clock, CheckCircle, XCircle, FileText, ImageIcon } from 'lucide-react';

type ContributorTab = 'overview' | 'places' | 'events' | 'moderation';

// ─── Badges ──────────────────────────────────────────
const ModerationBadge = ({ status }: { status: number }) => {
    switch (status) {
        case 0: return <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">Chờ duyệt</span>;
        case 1: return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Đã duyệt</span>;
        case 2: return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Từ chối</span>;
        default: return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">—</span>;
    }
};

const EventStatusBadge = ({ status }: { status: number }) => {
    switch (status) {
        case 0: return <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">Sắp diễn ra</span>;
        case 1: return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Đang diễn ra</span>;
        case 2: return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">Đã kết thúc</span>;
        default: return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">—</span>;
    }
};

// ─── Place Form Modal ────────────────────────────────
function PlaceFormModal({ place, categories, onClose, onSubmit, loading }: { place: PlaceItem | null; categories: Category[]; onClose: () => void; onSubmit: (data: CreatePlacePayload) => void; loading: boolean }) {
    const [title, setTitle] = useState(place?.title || '');
    const [description, setDescription] = useState(place?.description || '');
    const [address, setAddress] = useState(place?.address || '');
    const [administrativeUnitId, setAdministrativeUnitId] = useState(place?.administrativeUnitId || '');
    const [latitude, setLatitude] = useState<string>(place?.latitude?.toString() || '');
    const [longitude, setLongitude] = useState<string>(place?.longitude?.toString() || '');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(place?.categoryIds || []);
    const [tags, setTags] = useState(place?.tags?.join(', ') || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !address.trim()) { Swal.fire('Thiếu thông tin', 'Vui lòng điền đầy đủ các trường bắt buộc', 'warning'); return; }
        onSubmit({ title: title.trim(), description: description.trim(), address: address.trim(), administrativeUnitId: administrativeUnitId || '00000000-0000-0000-0000-000000000000', latitude: latitude ? parseFloat(latitude) : null, longitude: longitude ? parseFloat(longitude) : null, categoryIds: selectedCategoryIds, tags: tags.split(',').map(t => t.trim()).filter(Boolean) });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                <h2 className="mb-6 text-xl font-bold text-gray-800">{place ? 'Sửa địa điểm' : 'Thêm địa điểm mới'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="mb-1 block text-sm font-medium text-gray-700">Tên địa điểm *</label><input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" /></div>
                    <div><label className="mb-1 block text-sm font-medium text-gray-700">Mô tả *</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" /></div>
                    <div><label className="mb-1 block text-sm font-medium text-gray-700">Địa chỉ *</label><input value={address} onChange={e => setAddress(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" /></div>
                    <div><label className="mb-1 block text-sm font-medium text-gray-700">Mã đơn vị hành chính</label><input value={administrativeUnitId} onChange={e => setAdministrativeUnitId(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="mb-1 block text-sm font-medium text-gray-700">Vĩ độ</label><input value={latitude} onChange={e => setLatitude(e.target.value)} type="number" step="any" className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" /></div>
                        <div><label className="mb-1 block text-sm font-medium text-gray-700">Kinh độ</label><input value={longitude} onChange={e => setLongitude(e.target.value)} type="number" step="any" className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" /></div>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Danh mục</label>
                        <div className="flex flex-wrap gap-2 rounded-lg border p-3 max-h-36 overflow-y-auto">
                            {categories.map(cat => (<button key={cat.id} type="button" onClick={() => setSelectedCategoryIds(prev => prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id])} className={`rounded-full px-3 py-1 text-xs font-medium transition ${selectedCategoryIds.includes(cat.id) ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat.name}</button>))}
                            {categories.length === 0 && <span className="text-xs text-gray-400">Không có danh mục</span>}
                        </div>
                    </div>
                    <div><label className="mb-1 block text-sm font-medium text-gray-700">Tags (phân cách bằng dấu phẩy)</label><input value={tags} onChange={e => setTags(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" /></div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Hủy</button>
                        <button type="submit" disabled={loading} className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition">{loading ? 'Đang xử lý...' : place ? 'Cập nhật' : 'Tạo mới'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Event Form Modal ────────────────────────────────
function EventFormModal({ event, categories, onClose, onSubmit, loading }: { event: EventItem | null; categories: Category[]; onClose: () => void; onSubmit: (data: CreateEventPayload | UpdateEventPayload) => void; loading: boolean }) {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !address.trim() || !startAt || !endAt) { Swal.fire('Thiếu thông tin', 'Vui lòng điền đầy đủ các trường bắt buộc', 'warning'); return; }
        const base = { title: title.trim(), description: description.trim(), address: address.trim(), administrativeUnitId: administrativeUnitId || '00000000-0000-0000-0000-000000000000', latitude: latitude ? parseFloat(latitude) : null, longitude: longitude ? parseFloat(longitude) : null, categoryIds: selectedCategoryIds, tags: tags.split(',').map(t => t.trim()).filter(Boolean), startAt: new Date(startAt).toISOString(), endAt: new Date(endAt).toISOString() };
        event ? onSubmit({ ...base, eventStatus }) : onSubmit(base);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                <h2 className="mb-6 text-xl font-bold text-gray-800">{event ? 'Sửa sự kiện' : 'Thêm sự kiện mới'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="mb-1 block text-sm font-medium text-gray-700">Tên sự kiện *</label><input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" /></div>
                    <div><label className="mb-1 block text-sm font-medium text-gray-700">Mô tả *</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" /></div>
                    <div><label className="mb-1 block text-sm font-medium text-gray-700">Địa điểm tổ chức *</label><input value={address} onChange={e => setAddress(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="mb-1 block text-sm font-medium text-gray-700">Bắt đầu *</label><input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" /></div>
                        <div><label className="mb-1 block text-sm font-medium text-gray-700">Kết thúc *</label><input type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" /></div>
                    </div>
                    {event && (
                        <div><label className="mb-1 block text-sm font-medium text-gray-700">Trạng thái sự kiện</label>
                            <select value={eventStatus} onChange={e => setEventStatus(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                                <option value={0}>Sắp diễn ra</option><option value={1}>Đang diễn ra</option><option value={2}>Đã kết thúc</option>
                            </select>
                        </div>
                    )}
                    <div><label className="mb-1 block text-sm font-medium text-gray-700">Mã đơn vị hành chính</label><input value={administrativeUnitId} onChange={e => setAdministrativeUnitId(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="mb-1 block text-sm font-medium text-gray-700">Vĩ độ</label><input value={latitude} onChange={e => setLatitude(e.target.value)} type="number" step="any" className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" /></div>
                        <div><label className="mb-1 block text-sm font-medium text-gray-700">Kinh độ</label><input value={longitude} onChange={e => setLongitude(e.target.value)} type="number" step="any" className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" /></div>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Danh mục</label>
                        <div className="flex flex-wrap gap-2 rounded-lg border p-3 max-h-36 overflow-y-auto">
                            {categories.map(cat => (<button key={cat.id} type="button" onClick={() => setSelectedCategoryIds(prev => prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id])} className={`rounded-full px-3 py-1 text-xs font-medium transition ${selectedCategoryIds.includes(cat.id) ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat.name}</button>))}
                        </div>
                    </div>
                    <div><label className="mb-1 block text-sm font-medium text-gray-700">Tags</label><input value={tags} onChange={e => setTags(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" /></div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Hủy</button>
                        <button type="submit" disabled={loading} className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition">{loading ? 'Đang xử lý...' : event ? 'Cập nhật' : 'Tạo mới'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main Contributor Page ───────────────────────────
export function ContributorPage() {
    const dispatch = useDispatch<AppDispatch>();
    const [activeTab, setActiveTab] = useState<ContributorTab>('overview');

    // Reuse admin slices (backend filters by contributor scope)
    const { places, loading: placesLoading, totalPages: placesTotalPages, pageNumber: placesPageNumber, actionLoading: placeActionLoading, selectedPlace } = useSelector((state: RootState) => state.adminPlaces);
    const { events, loading: eventsLoading, totalPages: eventsTotalPages, pageNumber: eventsPageNumber, actionLoading: eventActionLoading, selectedEvent } = useSelector((state: RootState) => state.adminEvents);
    const { pendingPlaces, pendingEvents, placesTotalCount, eventsTotalCount, logs, logsLoading, loading: moderationLoading, actionLoading: moderationActionLoading } = useSelector((state: RootState) => state.moderation);

    // Local state
    const [showPlaceForm, setShowPlaceForm] = useState(false);
    const [showEventForm, setShowEventForm] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [moderationSubTab, setModerationSubTab] = useState<'places' | 'events'>('places');
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [mediaTarget, setMediaTarget] = useState<{ resourceType: ResourceType; resourceId: string; title: string } | null>(null);

    const isActionLoading = placeActionLoading || eventActionLoading || moderationActionLoading;

    // Load data on tab change
    useEffect(() => {
        if (activeTab === 'overview') {
            dispatch(fetchAdminPlacesThunk({ page: 1, size: 50 }));
            dispatch(fetchAdminEventsThunk({ page: 1, size: 50 }));
            dispatch(fetchPendingPlacesThunk({ page: 1, size: 50 }));
            dispatch(fetchPendingEventsThunk({ page: 1, size: 50 }));
        } else if (activeTab === 'places') {
            dispatch(fetchAdminPlacesThunk({ page: 1, size: 10 }));
            CategoryService.getCategories(1, 100).then(res => { if (res.success) setCategories(res.data.items); });
        } else if (activeTab === 'events') {
            dispatch(fetchAdminEventsThunk({ page: 1, size: 10 }));
            if (categories.length === 0) CategoryService.getCategories(1, 100).then(res => { if (res.success) setCategories(res.data.items); });
        } else if (activeTab === 'moderation') {
            dispatch(fetchPendingPlacesThunk({ page: 1, size: 50 }));
            dispatch(fetchPendingEventsThunk({ page: 1, size: 50 }));
        }
    }, [activeTab, dispatch]);

    // ── Place handlers ──
    const handlePlacePageChange = (p: number) => dispatch(fetchAdminPlacesThunk({ page: p, size: 10 }));
    const handleOpenCreatePlace = () => { dispatch(setSelectedPlace(null)); setShowPlaceForm(true); };
    const handleOpenEditPlace = (place: PlaceItem) => { dispatch(setSelectedPlace(place)); setShowPlaceForm(true); };
    const handlePlaceFormSubmit = async (data: CreatePlacePayload) => {
        if (selectedPlace) {
            const res = await dispatch(updatePlaceThunk({ id: selectedPlace.id, payload: data }));
            if (updatePlaceThunk.fulfilled.match(res)) { Swal.fire('Thành công', 'Đã cập nhật', 'success'); setShowPlaceForm(false); dispatch(fetchAdminPlacesThunk({ page: placesPageNumber, size: 10 })); }
            else Swal.fire('Lỗi', res.payload as string, 'error');
        } else {
            const res = await dispatch(createPlaceThunk(data));
            if (createPlaceThunk.fulfilled.match(res)) { Swal.fire('Thành công', 'Đã tạo địa điểm', 'success'); setShowPlaceForm(false); dispatch(fetchAdminPlacesThunk({ page: 1, size: 10 })); }
            else Swal.fire('Lỗi', res.payload as string, 'error');
        }
    };
    const handleDeletePlace = async (id: string, title: string) => {
        const c = await Swal.fire({ title: 'Xóa?', text: `Xóa "${title}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy' });
        if (c.isConfirmed) { const res = await dispatch(deletePlaceThunk(id)); if (deletePlaceThunk.fulfilled.match(res)) { Swal.fire('Đã xóa', '', 'success'); dispatch(fetchAdminPlacesThunk({ page: placesPageNumber, size: 10 })); } else Swal.fire('Lỗi', res.payload as string, 'error'); }
    };

    // ── Event handlers ──
    const handleEventPageChange = (p: number) => dispatch(fetchAdminEventsThunk({ page: p, size: 10 }));
    const handleOpenCreateEvent = () => { dispatch(setSelectedEvent(null)); setShowEventForm(true); };
    const handleOpenEditEvent = (ev: EventItem) => { dispatch(setSelectedEvent(ev)); setShowEventForm(true); };
    const handleEventFormSubmit = async (data: CreateEventPayload | UpdateEventPayload) => {
        if (selectedEvent) {
            const res = await dispatch(updateEventThunk({ id: selectedEvent.id, payload: data as UpdateEventPayload }));
            if (updateEventThunk.fulfilled.match(res)) { Swal.fire('Thành công', 'Đã cập nhật', 'success'); setShowEventForm(false); dispatch(fetchAdminEventsThunk({ page: eventsPageNumber, size: 10 })); }
            else Swal.fire('Lỗi', res.payload as string, 'error');
        } else {
            const res = await dispatch(createEventThunk(data as CreateEventPayload));
            if (createEventThunk.fulfilled.match(res)) { Swal.fire('Thành công', 'Đã tạo sự kiện', 'success'); setShowEventForm(false); dispatch(fetchAdminEventsThunk({ page: 1, size: 10 })); }
            else Swal.fire('Lỗi', res.payload as string, 'error');
        }
    };
    const handleDeleteEvent = async (id: string, title: string) => {
        const c = await Swal.fire({ title: 'Xóa?', text: `Xóa "${title}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy' });
        if (c.isConfirmed) { const res = await dispatch(deleteEventThunk(id)); if (deleteEventThunk.fulfilled.match(res)) { Swal.fire('Đã xóa', '', 'success'); dispatch(fetchAdminEventsThunk({ page: eventsPageNumber, size: 10 })); } else Swal.fire('Lỗi', res.payload as string, 'error'); }
    };
    const formatDateTime = (iso: string) => new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // ── Moderation handlers ──
    const handleApproveResource = async (resourceType: ResourceType, id: string, title: string) => {
        const c = await Swal.fire({ title: 'Duyệt?', text: `Duyệt "${title}"?`, icon: 'question', showCancelButton: true, confirmButtonColor: '#28a745', confirmButtonText: 'Duyệt', cancelButtonText: 'Hủy', input: 'text', inputLabel: 'Ghi chú', inputPlaceholder: 'Không bắt buộc' });
        if (c.isConfirmed) { const res = await dispatch(approveResourceThunk({ resourceType, id, payload: { note: c.value || '' } })); if (approveResourceThunk.fulfilled.match(res)) Swal.fire('Đã duyệt', '', 'success'); else Swal.fire('Lỗi', res.payload as string, 'error'); }
    };
    const handleRejectResource = async (resourceType: ResourceType, id: string, title: string) => {
        const c = await Swal.fire({ title: 'Từ chối?', text: `Từ chối "${title}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Từ chối', cancelButtonText: 'Hủy', input: 'text', inputLabel: 'Lý do', inputPlaceholder: 'Bắt buộc nhập', inputValidator: (v) => !v ? 'Vui lòng nhập lý do' : null });
        if (c.isConfirmed) { const res = await dispatch(rejectResourceThunk({ resourceType, id, payload: { note: c.value || '' } })); if (rejectResourceThunk.fulfilled.match(res)) Swal.fire('Đã từ chối', '', 'success'); else Swal.fire('Lỗi', res.payload as string, 'error'); }
    };
    const handleViewLogs = (resourceType: ResourceType, id: string) => { dispatch(fetchLogsThunk({ resourceType, id })); setShowLogsModal(true); };

    // ── Sidebar ──
    const sidebarTabs: { key: ContributorTab; label: string }[] = [
        { key: 'overview', label: 'Tổng quan' },
        { key: 'places', label: 'Quản lý Địa điểm' },
        { key: 'events', label: 'Quản lý Sự kiện' },
        { key: 'moderation', label: 'Kiểm duyệt' },
    ];

    const getCategoryNames = (ids: string[]) => ids.map(id => categories.find(c => c.id === id)?.name).filter(Boolean).join(', ') || '—';

    return (
        <div className="flex h-screen w-full flex-col bg-slate-50">
            {/* Header */}
            <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
                <span className="text-xl font-bold text-emerald-700">Quản lý nội dung</span>
                <ProfileDropdown />
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r bg-white p-4 shadow-sm h-full flex flex-col gap-2">
                    {sidebarTabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-3 rounded-lg p-3 w-full text-left font-medium transition ${activeTab === tab.key ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                            {tab.label}
                        </button>
                    ))}
                </aside>

                {/* Main */}
                <main className="flex-1 overflow-y-auto p-8 relative">
                    {isActionLoading && (
                        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
                        </div>
                    )}

                    {/* ════════════ OVERVIEW ════════════ */}
                    {activeTab === 'overview' && (
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-6">Tổng quan</h1>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => setActiveTab('places')}>
                                    <div className="flex justify-between items-start"><div className="text-sm font-medium text-gray-500">Địa điểm</div><div className="p-2 bg-green-50 rounded-lg text-green-600"><MapPin size={20} /></div></div>
                                    <div className="mt-2 text-3xl font-bold text-gray-800">{places.length}</div>
                                    <div className="text-xs text-gray-500 mt-1">Trong phạm vi quản lý</div>
                                </div>
                                <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => setActiveTab('events')}>
                                    <div className="flex justify-between items-start"><div className="text-sm font-medium text-gray-500">Sự kiện</div><div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Calendar size={20} /></div></div>
                                    <div className="mt-2 text-3xl font-bold text-gray-800">{events.length}</div>
                                    <div className="text-xs text-gray-500 mt-1">Trong phạm vi quản lý</div>
                                </div>
                                <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => { setActiveTab('moderation'); setModerationSubTab('places'); }}>
                                    <div className="flex justify-between items-start"><div className="text-sm font-medium text-gray-500">Địa điểm chờ duyệt</div><div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><CheckCircle size={20} /></div></div>
                                    <div className="mt-2 text-3xl font-bold text-gray-800">{placesTotalCount}</div>
                                </div>
                                <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => { setActiveTab('moderation'); setModerationSubTab('events'); }}>
                                    <div className="flex justify-between items-start"><div className="text-sm font-medium text-gray-500">Sự kiện chờ duyệt</div><div className="p-2 bg-orange-50 rounded-lg text-orange-600"><CheckCircle size={20} /></div></div>
                                    <div className="mt-2 text-3xl font-bold text-gray-800">{eventsTotalCount}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════════════ PLACES ════════════ */}
                    {activeTab === 'places' && (
                        <div className="flex flex-col h-full">
                            <div className="mb-6 flex items-center justify-between flex-shrink-0">
                                <h1 className="text-2xl font-bold text-gray-800">Quản lý Địa điểm</h1>
                                <button onClick={handleOpenCreatePlace} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"><Plus size={16} /> Thêm địa điểm</button>
                            </div>
                            <div className="flex-1 rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left text-sm text-gray-600 min-w-[900px]">
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b sticky top-0 z-10">
                                            <tr><th className="px-4 py-3 font-semibold">Ảnh</th><th className="px-4 py-3 font-semibold">Tên</th><th className="px-4 py-3 font-semibold">Địa chỉ</th><th className="px-4 py-3 font-semibold">Danh mục</th><th className="px-4 py-3 font-semibold">Trạng thái</th><th className="px-4 py-3 font-semibold">Đánh giá</th><th className="px-4 py-3 font-semibold text-right">Thao tác</th></tr>
                                        </thead>
                                        <tbody className="divide-y text-gray-800">
                                            {placesLoading && <tr><td colSpan={7} className="py-10 text-center text-gray-500">Loading...</td></tr>}
                                            {!placesLoading && places.map(p => (
                                                <tr key={p.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-4 py-3"><div className="h-12 w-16 rounded-lg bg-gray-100 overflow-hidden">{p.images?.find(i => i.isPrimary)?.url || p.images?.[0]?.url ? <img src={p.images.find(i => i.isPrimary)?.url || p.images[0]?.url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-gray-400"><MapPin size={16} /></div>}</div></td>
                                                    <td className="px-4 py-3 font-semibold text-gray-900 max-w-[200px] truncate">{p.title}</td>
                                                    <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{p.address || '—'}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[150px] truncate">{getCategoryNames(p.categoryIds)}</td>
                                                    <td className="px-4 py-3"><ModerationBadge status={p.moderationStatus} /></td>
                                                    <td className="px-4 py-3"><div className="flex items-center gap-1"><Star size={14} className="text-yellow-500 fill-yellow-500" /><span className="text-sm font-medium">{p.averageRating?.toFixed(1) || '—'}</span></div></td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <button onClick={() => handleOpenEditPlace(p)} className="p-2 rounded hover:bg-blue-50 text-blue-600 transition" title="Sửa"><Pencil size={15} /></button>
                                                            <button onClick={() => setMediaTarget({ resourceType: 0, resourceId: p.id, title: p.title })} className="p-2 rounded hover:bg-purple-50 text-purple-600 transition" title="Ảnh"><ImageIcon size={15} /></button>
                                                            <button onClick={() => handleDeletePlace(p.id, p.title)} className="p-2 rounded hover:bg-red-50 text-red-600 transition" title="Xóa"><Trash2 size={15} /></button>
                                                            <a href={`/places/${p.id}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded hover:bg-gray-100 text-gray-500 transition" title="Xem"><ExternalLink size={15} /></a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {!placesLoading && places.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-gray-500">Không có dữ liệu.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                                {!placesLoading && placesTotalPages > 1 && (
                                    <div className="flex items-center justify-between border-t px-4 py-3 bg-gray-50 flex-shrink-0">
                                        <span className="text-sm text-gray-700">Trang <b>{placesPageNumber}</b> / <b>{placesTotalPages}</b></span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handlePlacePageChange(placesPageNumber - 1)} disabled={placesPageNumber === 1} className="px-3 py-1 border rounded bg-white text-sm hover:bg-gray-100 disabled:opacity-50 transition">Trước</button>
                                            <button onClick={() => handlePlacePageChange(placesPageNumber + 1)} disabled={placesPageNumber === placesTotalPages} className="px-3 py-1 border rounded bg-white text-sm hover:bg-gray-100 disabled:opacity-50 transition">Sau</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ════════════ EVENTS ════════════ */}
                    {activeTab === 'events' && (
                        <div className="flex flex-col h-full">
                            <div className="mb-6 flex items-center justify-between flex-shrink-0">
                                <h1 className="text-2xl font-bold text-gray-800">Quản lý Sự kiện</h1>
                                <button onClick={handleOpenCreateEvent} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"><Plus size={16} /> Thêm sự kiện</button>
                            </div>
                            <div className="flex-1 rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left text-sm text-gray-600 min-w-[1000px]">
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b sticky top-0 z-10">
                                            <tr><th className="px-4 py-3 font-semibold">Ảnh</th><th className="px-4 py-3 font-semibold">Tên</th><th className="px-4 py-3 font-semibold">Địa điểm</th><th className="px-4 py-3 font-semibold">Thời gian</th><th className="px-4 py-3 font-semibold">Trạng thái SK</th><th className="px-4 py-3 font-semibold">Kiểm duyệt</th><th className="px-4 py-3 font-semibold">Đánh giá</th><th className="px-4 py-3 font-semibold text-right">Thao tác</th></tr>
                                        </thead>
                                        <tbody className="divide-y text-gray-800">
                                            {eventsLoading && <tr><td colSpan={8} className="py-10 text-center text-gray-500">Loading...</td></tr>}
                                            {!eventsLoading && events.map(ev => (
                                                <tr key={ev.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-4 py-3"><div className="h-12 w-16 rounded-lg bg-gray-100 overflow-hidden">{ev.images?.[0]?.url ? <img src={ev.images[0].url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-gray-400"><Calendar size={16} /></div>}</div></td>
                                                    <td className="px-4 py-3 font-semibold text-gray-900 max-w-[180px] truncate">{ev.title}</td>
                                                    <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">{ev.address || '—'}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-600"><div className="flex items-center gap-1"><Clock size={12} /> {formatDateTime(ev.startAt)}</div><div className="text-gray-400 mt-0.5">→ {formatDateTime(ev.endAt)}</div></td>
                                                    <td className="px-4 py-3"><EventStatusBadge status={ev.eventStatus} /></td>
                                                    <td className="px-4 py-3"><ModerationBadge status={ev.moderationStatus} /></td>
                                                    <td className="px-4 py-3"><div className="flex items-center gap-1"><Star size={14} className="text-yellow-500 fill-yellow-500" /><span className="text-sm font-medium">{ev.averageRating?.toFixed(1) || '—'}</span></div></td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <button onClick={() => handleOpenEditEvent(ev)} className="p-2 rounded hover:bg-blue-50 text-blue-600 transition" title="Sửa"><Pencil size={15} /></button>
                                                            <button onClick={() => setMediaTarget({ resourceType: 1, resourceId: ev.id, title: ev.title })} className="p-2 rounded hover:bg-purple-50 text-purple-600 transition" title="Ảnh"><ImageIcon size={15} /></button>
                                                            <button onClick={() => handleDeleteEvent(ev.id, ev.title)} className="p-2 rounded hover:bg-red-50 text-red-600 transition" title="Xóa"><Trash2 size={15} /></button>
                                                            <a href={`/events/${ev.id}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded hover:bg-gray-100 text-gray-500 transition" title="Xem"><ExternalLink size={15} /></a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {!eventsLoading && events.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-gray-500">Không có dữ liệu.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                                {!eventsLoading && eventsTotalPages > 1 && (
                                    <div className="flex items-center justify-between border-t px-4 py-3 bg-gray-50 flex-shrink-0">
                                        <span className="text-sm text-gray-700">Trang <b>{eventsPageNumber}</b> / <b>{eventsTotalPages}</b></span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEventPageChange(eventsPageNumber - 1)} disabled={eventsPageNumber === 1} className="px-3 py-1 border rounded bg-white text-sm hover:bg-gray-100 disabled:opacity-50 transition">Trước</button>
                                            <button onClick={() => handleEventPageChange(eventsPageNumber + 1)} disabled={eventsPageNumber === eventsTotalPages} className="px-3 py-1 border rounded bg-white text-sm hover:bg-gray-100 disabled:opacity-50 transition">Sau</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ════════════ MODERATION ════════════ */}
                    {activeTab === 'moderation' && (
                        <div className="flex flex-col h-full">
                            <div className="mb-6 flex-shrink-0">
                                <h1 className="text-2xl font-bold text-gray-800 mb-4">Kiểm duyệt nội dung</h1>
                                <div className="flex gap-2">
                                    <button onClick={() => setModerationSubTab('places')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${moderationSubTab === 'places' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Địa điểm ({placesTotalCount})</button>
                                    <button onClick={() => setModerationSubTab('events')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${moderationSubTab === 'events' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Sự kiện ({eventsTotalCount})</button>
                                </div>
                            </div>
                            <div className="flex-1 rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
                                {moderationLoading ? (
                                    <div className="flex-1 flex items-center justify-center text-gray-500">Loading...</div>
                                ) : (
                                    <div className="overflow-x-auto flex-1">
                                        <table className="w-full text-left text-sm text-gray-600 min-w-[800px]">
                                            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b sticky top-0 z-10">
                                                <tr><th className="px-4 py-3 font-semibold">Ảnh</th><th className="px-4 py-3 font-semibold">Tên</th><th className="px-4 py-3 font-semibold">Địa chỉ</th>{moderationSubTab === 'events' && <th className="px-4 py-3 font-semibold">Thời gian</th>}<th className="px-4 py-3 font-semibold">Ngày tạo</th><th className="px-4 py-3 font-semibold text-right">Thao tác</th></tr>
                                            </thead>
                                            <tbody className="divide-y text-gray-800">
                                                {moderationSubTab === 'places' && pendingPlaces.map(p => (
                                                    <tr key={p.id} className="hover:bg-gray-50 transition">
                                                        <td className="px-4 py-3"><div className="h-12 w-16 rounded-lg bg-gray-100 overflow-hidden">{p.images?.[0]?.url ? <img src={p.images[0].url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-gray-400"><MapPin size={16} /></div>}</div></td>
                                                        <td className="px-4 py-3 font-semibold text-gray-900">{p.title}</td>
                                                        <td className="px-4 py-3 text-gray-500">{p.address || '—'}</td>
                                                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <button onClick={() => handleApproveResource(0, p.id, p.title)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-green-50 text-green-600 hover:bg-green-100 transition"><CheckCircle size={14} /> Duyệt</button>
                                                                <button onClick={() => handleRejectResource(0, p.id, p.title)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-red-50 text-red-600 hover:bg-red-100 transition"><XCircle size={14} /> Từ chối</button>
                                                                <button onClick={() => handleViewLogs(0, p.id)} className="p-2 rounded hover:bg-gray-100 text-gray-500 transition" title="Lịch sử"><FileText size={15} /></button>
                                                                <a href={`/places/${p.id}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded hover:bg-gray-100 text-gray-500 transition"><ExternalLink size={15} /></a>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {moderationSubTab === 'events' && pendingEvents.map(ev => (
                                                    <tr key={ev.id} className="hover:bg-gray-50 transition">
                                                        <td className="px-4 py-3"><div className="h-12 w-16 rounded-lg bg-gray-100 overflow-hidden">{ev.images?.[0]?.url ? <img src={ev.images[0].url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-gray-400"><Calendar size={16} /></div>}</div></td>
                                                        <td className="px-4 py-3 font-semibold text-gray-900">{ev.title}</td>
                                                        <td className="px-4 py-3 text-gray-500">{ev.address || '—'}</td>
                                                        <td className="px-4 py-3 text-xs text-gray-600"><div className="flex items-center gap-1"><Clock size={12} /> {formatDateTime(ev.startAt)}</div><div className="text-gray-400">→ {formatDateTime(ev.endAt)}</div></td>
                                                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(ev.createdAt).toLocaleDateString('vi-VN')}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <button onClick={() => handleApproveResource(1, ev.id, ev.title)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-green-50 text-green-600 hover:bg-green-100 transition"><CheckCircle size={14} /> Duyệt</button>
                                                                <button onClick={() => handleRejectResource(1, ev.id, ev.title)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-red-50 text-red-600 hover:bg-red-100 transition"><XCircle size={14} /> Từ chối</button>
                                                                <button onClick={() => handleViewLogs(1, ev.id)} className="p-2 rounded hover:bg-gray-100 text-gray-500 transition" title="Lịch sử"><FileText size={15} /></button>
                                                                <a href={`/events/${ev.id}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded hover:bg-gray-100 text-gray-500 transition"><ExternalLink size={15} /></a>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {moderationSubTab === 'places' && pendingPlaces.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-gray-500">Không có địa điểm chờ duyệt.</td></tr>}
                                                {moderationSubTab === 'events' && pendingEvents.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-gray-500">Không có sự kiện chờ duyệt.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modals */}
            {showPlaceForm && <PlaceFormModal place={selectedPlace} categories={categories} onClose={() => setShowPlaceForm(false)} onSubmit={handlePlaceFormSubmit} loading={placeActionLoading} />}
            {showEventForm && <EventFormModal event={selectedEvent} categories={categories} onClose={() => setShowEventForm(false)} onSubmit={handleEventFormSubmit} loading={eventActionLoading} />}
            {mediaTarget && <MediaManager resourceType={mediaTarget.resourceType} resourceId={mediaTarget.resourceId} resourceTitle={mediaTarget.title} onClose={() => setMediaTarget(null)} />}

            {/* Logs Modal */}
            {showLogsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setShowLogsModal(false); dispatch(clearLogs()); }}>
                    <div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setShowLogsModal(false); dispatch(clearLogs()); }} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        <h2 className="mb-4 text-lg font-bold text-gray-800">Lịch sử kiểm duyệt</h2>
                        {logsLoading ? <div className="py-8 text-center text-gray-500">Loading...</div> : logs.length === 0 ? <div className="py-8 text-center text-gray-500">Chưa có lịch sử.</div> : (
                            <div className="space-y-3">
                                {logs.map(log => (
                                    <div key={log.id} className="rounded-lg border p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${log.action === 'approve' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{log.action === 'approve' ? 'Duyệt' : 'Từ chối'}</span>
                                            <span className="text-xs text-gray-400">{new Date(log.actedAt).toLocaleString('vi-VN')}</span>
                                        </div>
                                        {log.note && <p className="text-sm text-gray-600 mt-1">{log.note}</p>}
                                        <p className="text-xs text-gray-400 mt-1">Bởi: {log.actedBy}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
