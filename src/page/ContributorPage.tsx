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
import Swal from 'sweetalert2';
import AdministrativeUnitService, { type AdministrativeUnit } from '../services/AdministrativeUnitService';
import { MapPin, Calendar, Star, Plus, Pencil, Trash2, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { ModerationBadge, EventStatusBadge, ContributorTypeBadge } from '../components/shared/StatusBadges';
import PlaceFormModal from '../components/shared/PlaceFormModal';
import EventFormModal from '../components/shared/EventFormModal';
import LogsModal from '../components/shared/LogsModal';
import Pagination from '../components/shared/Pagination';
import { formatDateTime } from '../components/shared/utils';

type ContributorTab = 'overview' | 'places' | 'events' | 'moderation';

// ContributorType: 0=Central, 1=Province, 2=Ward, 3=Collaborator
const CONTRIBUTOR_TYPE_LABELS: Record<number, string> = {
    0: 'Trung ương',
    1: 'Cấp tỉnh',
    2: 'Cấp xã',
    3: 'Cộng tác viên',
};

// ─── Main Contributor Page ───────────────────────────
export function ContributorPage() {
    const dispatch = useDispatch<AppDispatch>();
    const [activeTab, setActiveTab] = useState<ContributorTab>('overview');
    const user = useSelector((state: RootState) => state.login.user);

    const contributorType = user?.contributorType ?? null;
    const isCentral = contributorType === 0;
    const isCTV = contributorType === 3;

    // Managed area info
    const [managedArea, setManagedArea] = useState<AdministrativeUnit | null>(null);
    const [managedParent, setManagedParent] = useState<AdministrativeUnit | null>(null);

    useEffect(() => {
        if (user?.administrativeUnitId) {
            AdministrativeUnitService.getById(user.administrativeUnitId).then(res => {
                if (res.success) {
                    setManagedArea(res.data);
                    if (res.data.level === 1 && res.data.parentId) {
                        AdministrativeUnitService.getById(res.data.parentId).then(parentRes => {
                            if (parentRes.success) setManagedParent(parentRes.data);
                        });
                    }
                }
            });
        }
    }, [user?.administrativeUnitId]);

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
    const isActionLoading = placeActionLoading || eventActionLoading || moderationActionLoading;

    // Build sidebar tabs based on role
    const sidebarTabs: { key: ContributorTab; label: string }[] = [
        { key: 'overview', label: 'Tổng quan' },
        { key: 'places', label: 'Quản lý Địa điểm' },
        { key: 'events', label: 'Quản lý Sự kiện' },
        // CTV cannot moderate
        ...(!isCTV ? [{ key: 'moderation' as ContributorTab, label: 'Kiểm duyệt' }] : []),
    ];

    // Load data on tab change
    useEffect(() => {
        if (activeTab === 'overview') {
            dispatch(fetchAdminPlacesThunk({ page: 1, size: 50 }));
            dispatch(fetchAdminEventsThunk({ page: 1, size: 50 }));
            if (!isCTV) {
                dispatch(fetchPendingPlacesThunk({ page: 1, size: 50 }));
                dispatch(fetchPendingEventsThunk({ page: 1, size: 50 }));
            }
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
    const handlePlaceFormSubmit = async (data: CreatePlacePayload): Promise<string | null> => {
        if (selectedPlace) {
            const res = await dispatch(updatePlaceThunk({ id: selectedPlace.id, payload: data }));
            if (updatePlaceThunk.fulfilled.match(res)) { Swal.fire('Thành công', 'Đã cập nhật', 'success'); setShowPlaceForm(false); dispatch(fetchAdminPlacesThunk({ page: placesPageNumber, size: 10 })); return selectedPlace.id; }
            else { Swal.fire('Lỗi', res.payload as string, 'error'); return null; }
        } else {
            const res = await dispatch(createPlaceThunk(data));
            if (createPlaceThunk.fulfilled.match(res)) { Swal.fire('Thành công', 'Đã tạo địa điểm', 'success'); setShowPlaceForm(false); dispatch(fetchAdminPlacesThunk({ page: 1, size: 10 })); return (res.payload as PlaceItem).id; }
            else { Swal.fire('Lỗi', res.payload as string, 'error'); return null; }
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
    const handleEventFormSubmit = async (data: CreateEventPayload | UpdateEventPayload): Promise<string | null> => {
        if (selectedEvent) {
            const res = await dispatch(updateEventThunk({ id: selectedEvent.id, payload: data as UpdateEventPayload }));
            if (updateEventThunk.fulfilled.match(res)) { Swal.fire('Thành công', 'Đã cập nhật', 'success'); setShowEventForm(false); dispatch(fetchAdminEventsThunk({ page: eventsPageNumber, size: 10 })); return selectedEvent.id; }
            else { Swal.fire('Lỗi', res.payload as string, 'error'); return null; }
        } else {
            const res = await dispatch(createEventThunk(data as CreateEventPayload));
            if (createEventThunk.fulfilled.match(res)) { Swal.fire('Thành công', 'Đã tạo sự kiện', 'success'); setShowEventForm(false); dispatch(fetchAdminEventsThunk({ page: 1, size: 10 })); return (res.payload as EventItem).id; }
            else { Swal.fire('Lỗi', res.payload as string, 'error'); return null; }
        }
    };
    const handleDeleteEvent = async (id: string, title: string) => {
        const c = await Swal.fire({ title: 'Xóa?', text: `Xóa "${title}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy' });
        if (c.isConfirmed) { const res = await dispatch(deleteEventThunk(id)); if (deleteEventThunk.fulfilled.match(res)) { Swal.fire('Đã xóa', '', 'success'); dispatch(fetchAdminEventsThunk({ page: eventsPageNumber, size: 10 })); } else Swal.fire('Lỗi', res.payload as string, 'error'); }
    };

    // ── Moderation handlers ──
    const handleApproveResource = async (resourceType: ResourceType, id: string, title: string) => {
        const c = await Swal.fire({ title: 'Duyệt?', text: `Duyệt "${title}"?`, icon: 'question', showCancelButton: true, confirmButtonColor: '#28a745', confirmButtonText: 'Duyệt', cancelButtonText: 'Hủy', input: 'text', inputLabel: 'Ghi chú', inputPlaceholder: 'Không bắt buộc', customClass: { input: 'text-gray-900 placeholder-gray-500 bg-white' } });
        if (c.isConfirmed) { const res = await dispatch(approveResourceThunk({ resourceType, id, payload: { note: c.value || '' } })); if (approveResourceThunk.fulfilled.match(res)) Swal.fire('Đã duyệt', '', 'success'); else Swal.fire('Lỗi', res.payload as string, 'error'); }
    };
    const handleRejectResource = async (resourceType: ResourceType, id: string, title: string) => {
        const c = await Swal.fire({ title: 'Từ chối?', text: `Từ chối "${title}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Từ chối', cancelButtonText: 'Hủy', input: 'text', inputLabel: 'Lý do', inputPlaceholder: 'Bắt buộc nhập', inputValidator: (v) => !v ? 'Vui lòng nhập lý do' : null, customClass: { input: 'text-gray-900 placeholder-gray-500 bg-white' } });
        if (c.isConfirmed) { const res = await dispatch(rejectResourceThunk({ resourceType, id, payload: { note: c.value || '' } })); if (rejectResourceThunk.fulfilled.match(res)) Swal.fire('Đã từ chối', '', 'success'); else Swal.fire('Lỗi', res.payload as string, 'error'); }
    };
    const handleViewLogs = (resourceType: ResourceType, id: string) => { dispatch(fetchLogsThunk({ resourceType, id })); setShowLogsModal(true); };

    const getCategoryNames = (ids: string[]) => ids.map(id => categories.find(c => c.id === id)?.name).filter(Boolean).join(', ') || '—';

    // Determine forced area: Central can choose freely, others are forced
    const forcedAreaId = isCentral ? undefined : (user?.administrativeUnitId || undefined);
    const forcedAreaLabel = isCentral ? undefined : (managedArea ? (managedArea.level === 1 && managedParent ? `${managedArea.name}, ${managedParent.name}` : managedArea.name) : undefined);

    return (
        <div className="flex h-screen w-full flex-col bg-slate-50">
            {/* Header */}
            <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-emerald-700">Quản lý nội dung</span>
                    {/* Show contributor type badge */}
                    {contributorType !== null && (
                        <ContributorTypeBadge contributorType={contributorType} />
                    )}
                    {/* Show managed area (not for Central) */}
                    {!isCentral && managedArea && (
                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
                            <MapPin size={14} />
                            <span className="font-medium">
                                {managedArea.level === 1 && managedParent
                                    ? `${managedArea.name}, ${managedParent.name}`
                                    : managedArea.name
                                }
                            </span>
                            <span className="text-emerald-500 text-xs">
                                ({managedArea.level === 0 ? 'Cấp tỉnh' : 'Cấp xã'})
                            </span>
                        </div>
                    )}
                    {isCentral && (
                        <div className="flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-sm text-purple-700">
                            <MapPin size={14} />
                            <span className="font-medium">Toàn quốc</span>
                        </div>
                    )}
                </div>
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
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">Tổng quan</h1>
                            {isCTV && (
                                <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                                    Bạn là <strong>Cộng tác viên</strong> — nội dung bạn tạo sẽ cần được duyệt trước khi hiển thị công khai. Chỉnh sửa nội dung đã duyệt sẽ chuyển về trạng thái chờ duyệt.
                                </div>
                            )}
                            {!isCTV && !isCentral && (
                                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                                    Bạn là <strong>{CONTRIBUTOR_TYPE_LABELS[contributorType!]}</strong> — nội dung bạn tạo sẽ được tự động duyệt.
                                </div>
                            )}
                            {isCentral && (
                                <div className="mb-4 rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm text-purple-800">
                                    Bạn là <strong>Trung ương</strong> — có quyền quản lý và kiểm duyệt nội dung toàn quốc. Nội dung bạn tạo sẽ được tự động duyệt.
                                </div>
                            )}
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
                                {!isCTV && (
                                    <>
                                        <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => { setActiveTab('moderation'); setModerationSubTab('places'); }}>
                                            <div className="flex justify-between items-start"><div className="text-sm font-medium text-gray-500">Địa điểm chờ duyệt</div><div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><CheckCircle size={20} /></div></div>
                                            <div className="mt-2 text-3xl font-bold text-gray-800">{placesTotalCount}</div>
                                        </div>
                                        <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => { setActiveTab('moderation'); setModerationSubTab('events'); }}>
                                            <div className="flex justify-between items-start"><div className="text-sm font-medium text-gray-500">Sự kiện chờ duyệt</div><div className="p-2 bg-orange-50 rounded-lg text-orange-600"><CheckCircle size={20} /></div></div>
                                            <div className="mt-2 text-3xl font-bold text-gray-800">{eventsTotalCount}</div>
                                        </div>
                                    </>
                                )}
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
                                                            <button onClick={() => handleDeletePlace(p.id, p.title)} className="p-2 rounded hover:bg-red-50 text-red-600 transition" title="Xóa"><Trash2 size={15} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {!placesLoading && places.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-gray-500">Không có dữ liệu.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                                {!placesLoading && <Pagination currentPage={placesPageNumber} totalPages={placesTotalPages} onPageChange={handlePlacePageChange} />}
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
                                                            <button onClick={() => handleDeleteEvent(ev.id, ev.title)} className="p-2 rounded hover:bg-red-50 text-red-600 transition" title="Xóa"><Trash2 size={15} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {!eventsLoading && events.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-gray-500">Không có dữ liệu.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                                {!eventsLoading && <Pagination currentPage={eventsPageNumber} totalPages={eventsTotalPages} onPageChange={handleEventPageChange} />}
                            </div>
                        </div>
                    )}

                    {/* ════════════ MODERATION ════════════ */}
                    {activeTab === 'moderation' && !isCTV && (
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
            {showPlaceForm && <PlaceFormModal place={selectedPlace} categories={categories} onClose={() => setShowPlaceForm(false)} onSubmit={handlePlaceFormSubmit} loading={placeActionLoading} accentColor="emerald" forcedAdministrativeUnitId={forcedAreaId} forcedAdministrativeUnitLabel={forcedAreaLabel} />}
            {showEventForm && <EventFormModal event={selectedEvent} categories={categories} onClose={() => setShowEventForm(false)} onSubmit={handleEventFormSubmit} loading={eventActionLoading} accentColor="emerald" forcedAdministrativeUnitId={forcedAreaId} forcedAdministrativeUnitLabel={forcedAreaLabel} />}
            {showLogsModal && <LogsModal logs={logs} loading={logsLoading} onClose={() => { setShowLogsModal(false); dispatch(clearLogs()); }} />}
        </div>
    );
}


