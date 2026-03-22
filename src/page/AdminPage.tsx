import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ProfileDropdown } from './HomePage';
import type { AppDispatch, RootState } from '../store';
import { fetchAdminUsersThunk, lockUserThunk, unlockUserThunk, approveUserThunk } from '../store/slice/AdminManagerUserSlice';
import { fetchOverviewStatsThunk } from '../store/slice/AdminManagerOverviewSlice';
import { fetchAdminPlacesThunk, createPlaceThunk, updatePlaceThunk, deletePlaceThunk, setSelectedPlace } from '../store/slice/AdminPlaceSlice';
import { fetchAdminEventsThunk, createEventThunk, updateEventThunk, deleteEventThunk, setSelectedEvent } from '../store/slice/AdminEventSlice';
import { fetchPendingPlacesThunk, fetchPendingEventsThunk, approveResourceThunk, rejectResourceThunk, fetchLogsThunk, clearLogs } from '../store/slice/ModerationSlice';
import { fetchAdminCategoriesThunk, createCategoryThunk, updateCategoryThunk, deleteCategoryThunk } from '../store/slice/AdminCategorySlice';
import type { PlaceItem, CreatePlacePayload } from '../services/AdminPlaceService';
import type { EventItem, CreateEventPayload, UpdateEventPayload } from '../services/AdminEventService';
import type { ResourceType } from '../services/ModerationService';
import CategoryService, { type Category } from '../services/CategoryService';
import Swal from 'sweetalert2';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import { Users, MapPin, Calendar, Star, MessageSquare, Plus, Pencil, Trash2, ExternalLink, X, Clock, CheckCircle, XCircle, FileText, Tag, ImageIcon } from 'lucide-react';
import MediaManager from '../components/MediaManager';
import { RoleBadge, UserStatusBadge, ModerationBadge, EventStatusBadge } from '../components/shared/StatusBadges';
import PlaceFormModal from '../components/shared/PlaceFormModal';
import EventFormModal from '../components/shared/EventFormModal';
import LogsModal from '../components/shared/LogsModal';
import Pagination from '../components/shared/Pagination';
import { formatDateTime, categoryTypeLabel } from '../components/shared/utils';

type AdminTab = 'overview' | 'users' | 'places' | 'events' | 'moderation' | 'categories';

// ─── Main Admin Page ─────────────────────────────────
export function AdminPage() {
    const dispatch = useDispatch<AppDispatch>();
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');

    // User Management State
    const { users, loading: usersLoading, totalPages: userTotalPages, pageNumber: userPageNumber, actionLoading: userActionLoading } = useSelector((state: RootState) => state.adminUsers);

    // Overview State
    const { stats, loading: overviewLoading } = useSelector((state: RootState) => state.adminOverview);

    // Places State
    const { places, loading: placesLoading, totalPages: placesTotalPages, pageNumber: placesPageNumber, actionLoading: placeActionLoading, selectedPlace } = useSelector((state: RootState) => state.adminPlaces);

    // Events State
    const { events, loading: eventsLoading, totalPages: eventsTotalPages, pageNumber: eventsPageNumber, actionLoading: eventActionLoading, selectedEvent } = useSelector((state: RootState) => state.adminEvents);

    // Moderation State
    const { pendingPlaces, pendingEvents, placesTotalCount, eventsTotalCount, logs, logsLoading, loading: moderationLoading, actionLoading: moderationActionLoading } = useSelector((state: RootState) => state.moderation);

    // Admin Categories State
    const { categories: adminCategoryList, loading: categoriesLoading, totalPages: categoriesTotalPages, pageNumber: categoriesPageNumber, actionLoading: categoryActionLoading } = useSelector((state: RootState) => state.adminCategories);

    // Local state
    const [showPlaceForm, setShowPlaceForm] = useState(false);
    const [showEventForm, setShowEventForm] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [moderationSubTab, setModerationSubTab] = useState<'places' | 'events'>('places');
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [mediaTarget, setMediaTarget] = useState<{ resourceType: ResourceType; resourceId: string; title: string } | null>(null);

    // Category form fields
    const [catName, setCatName] = useState('');
    const [catSlug, setCatSlug] = useState('');
    const [catType, setCatType] = useState('theme');
    const [catIsActive, setCatIsActive] = useState(true);

    const isActionLoading = userActionLoading || placeActionLoading || eventActionLoading || moderationActionLoading || categoryActionLoading;

    // Load data on tab change
    useEffect(() => {
        if (activeTab === 'users') {
            dispatch(fetchAdminUsersThunk({ page: 1, size: 10 }));
        } else if (activeTab === 'overview') {
            dispatch(fetchOverviewStatsThunk({}));
        } else if (activeTab === 'places') {
            dispatch(fetchAdminPlacesThunk({ page: 1, size: 10 }));
            CategoryService.getCategories(1, 100).then(res => {
                if (res.success) setCategories(res.data.items);
            });
        } else if (activeTab === 'events') {
            dispatch(fetchAdminEventsThunk({ page: 1, size: 10 }));
            if (categories.length === 0) {
                CategoryService.getCategories(1, 100).then(res => {
                    if (res.success) setCategories(res.data.items);
                });
            }
        } else if (activeTab === 'moderation') {
            dispatch(fetchPendingPlacesThunk({ page: 1, size: 50 }));
            dispatch(fetchPendingEventsThunk({ page: 1, size: 50 }));
        } else if (activeTab === 'categories') {
            dispatch(fetchAdminCategoriesThunk({ page: 1, size: 20 }));
        }
    }, [activeTab, dispatch]);

    // ── User handlers ──
    const handleUserPageChange = (newPage: number) => {
        dispatch(fetchAdminUsersThunk({ page: newPage, size: 10 }));
    };

    const handleLock = async (id: string, currentStatus: number) => {
        if (currentStatus === 1) return;
        const confirm = await Swal.fire({ title: 'Khóa tài khoản?', text: 'Tài khoản này sẽ không thể đăng nhập!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Khóa', cancelButtonText: 'Hủy' });
        if (confirm.isConfirmed) {
            const res = await dispatch(lockUserThunk(id));
            if (lockUserThunk.fulfilled.match(res)) { Swal.fire('Thành công', 'Đã khóa tài khoản', 'success'); dispatch(fetchAdminUsersThunk({ page: userPageNumber, size: 10 })); }
            else Swal.fire('Lỗi', res.payload as string, 'error');
        }
    };

    const handleUnlock = async (id: string) => {
        const confirm = await Swal.fire({ title: 'Mở khóa tài khoản?', text: 'Tài khoản sẽ hoạt động bình thường.', icon: 'info', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Mở khóa', cancelButtonText: 'Hủy' });
        if (confirm.isConfirmed) {
            const res = await dispatch(unlockUserThunk(id));
            if (unlockUserThunk.fulfilled.match(res)) { Swal.fire('Thành công', 'Đã mở khóa tài khoản', 'success'); dispatch(fetchAdminUsersThunk({ page: userPageNumber, size: 10 })); }
            else Swal.fire('Lỗi', res.payload as string, 'error');
        }
    };

    const handleApprove = async (id: string) => {
        const confirm = await Swal.fire({ title: 'Duyệt tài khoản?', text: 'Tài khoản sẽ được phê duyệt.', icon: 'question', showCancelButton: true, confirmButtonColor: '#28a745', cancelButtonColor: '#d33', confirmButtonText: 'Duyệt', cancelButtonText: 'Hủy' });
        if (confirm.isConfirmed) {
            const res = await dispatch(approveUserThunk(id));
            if (approveUserThunk.fulfilled.match(res)) { Swal.fire('Thành công', 'Đã duyệt tài khoản', 'success'); dispatch(fetchAdminUsersThunk({ page: userPageNumber, size: 10 })); }
            else Swal.fire('Lỗi', res.payload as string, 'error');
        }
    };

    // ── Place handlers ──
    const handlePlacePageChange = (newPage: number) => {
        dispatch(fetchAdminPlacesThunk({ page: newPage, size: 10 }));
    };

    const handleOpenCreatePlace = () => {
        dispatch(setSelectedPlace(null));
        setShowPlaceForm(true);
    };

    const handleOpenEditPlace = (place: PlaceItem) => {
        dispatch(setSelectedPlace(place));
        setShowPlaceForm(true);
    };

    const handlePlaceFormSubmit = async (data: CreatePlacePayload) => {
        if (selectedPlace) {
            const res = await dispatch(updatePlaceThunk({ id: selectedPlace.id, payload: data }));
            if (updatePlaceThunk.fulfilled.match(res)) {
                Swal.fire('Thành công', 'Đã cập nhật địa điểm', 'success');
                setShowPlaceForm(false);
                dispatch(fetchAdminPlacesThunk({ page: placesPageNumber, size: 10 }));
            } else {
                Swal.fire('Lỗi', res.payload as string, 'error');
            }
        } else {
            const res = await dispatch(createPlaceThunk(data));
            if (createPlaceThunk.fulfilled.match(res)) {
                Swal.fire('Thành công', 'Đã tạo địa điểm mới', 'success');
                setShowPlaceForm(false);
                dispatch(fetchAdminPlacesThunk({ page: 1, size: 10 }));
            } else {
                Swal.fire('Lỗi', res.payload as string, 'error');
            }
        }
    };

    const handleDeletePlace = async (id: string, title: string) => {
        const confirm = await Swal.fire({ title: 'Xóa địa điểm?', text: `Bạn có chắc muốn xóa "${title}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy' });
        if (confirm.isConfirmed) {
            const res = await dispatch(deletePlaceThunk(id));
            if (deletePlaceThunk.fulfilled.match(res)) {
                Swal.fire('Thành công', 'Đã xóa địa điểm', 'success');
                dispatch(fetchAdminPlacesThunk({ page: placesPageNumber, size: 10 }));
            } else {
                Swal.fire('Lỗi', res.payload as string, 'error');
            }
        }
    };

    // ── Event handlers ──
    const handleEventPageChange = (newPage: number) => {
        dispatch(fetchAdminEventsThunk({ page: newPage, size: 10 }));
    };

    const handleOpenCreateEvent = () => {
        dispatch(setSelectedEvent(null));
        setShowEventForm(true);
    };

    const handleOpenEditEvent = (event: EventItem) => {
        dispatch(setSelectedEvent(event));
        setShowEventForm(true);
    };

    const handleEventFormSubmit = async (data: CreateEventPayload | UpdateEventPayload) => {
        if (selectedEvent) {
            const res = await dispatch(updateEventThunk({ id: selectedEvent.id, payload: data as UpdateEventPayload }));
            if (updateEventThunk.fulfilled.match(res)) {
                Swal.fire('Thành công', 'Đã cập nhật sự kiện', 'success');
                setShowEventForm(false);
                dispatch(fetchAdminEventsThunk({ page: eventsPageNumber, size: 10 }));
            } else {
                Swal.fire('Lỗi', res.payload as string, 'error');
            }
        } else {
            const res = await dispatch(createEventThunk(data as CreateEventPayload));
            if (createEventThunk.fulfilled.match(res)) {
                Swal.fire('Thành công', 'Đã tạo sự kiện mới', 'success');
                setShowEventForm(false);
                dispatch(fetchAdminEventsThunk({ page: 1, size: 10 }));
            } else {
                Swal.fire('Lỗi', res.payload as string, 'error');
            }
        }
    };

    const handleDeleteEvent = async (id: string, title: string) => {
        const confirm = await Swal.fire({ title: 'Xóa sự kiện?', text: `Bạn có chắc muốn xóa "${title}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy' });
        if (confirm.isConfirmed) {
            const res = await dispatch(deleteEventThunk(id));
            if (deleteEventThunk.fulfilled.match(res)) {
                Swal.fire('Thành công', 'Đã xóa sự kiện', 'success');
                dispatch(fetchAdminEventsThunk({ page: eventsPageNumber, size: 10 }));
            } else {
                Swal.fire('Lỗi', res.payload as string, 'error');
            }
        }
    };

    // ── Category handlers ──
    const handleCategoryPageChange = (newPage: number) => {
        dispatch(fetchAdminCategoriesThunk({ page: newPage, size: 20 }));
    };

    const handleOpenCreateCategory = () => {
        setEditingCategory(null);
        setCatName(''); setCatSlug(''); setCatType('theme'); setCatIsActive(true);
        setShowCategoryForm(true);
    };

    const handleOpenEditCategory = (cat: Category) => {
        setEditingCategory(cat);
        setCatName(cat.name); setCatSlug(cat.slug); setCatType(cat.type); setCatIsActive(cat.isActive);
        setShowCategoryForm(true);
    };

    const handleCategoryFormSubmit = async () => {
        if (!catName.trim() || !catSlug.trim()) {
            Swal.fire('Thiếu thông tin', 'Vui lòng nhập tên và slug', 'warning');
            return;
        }
        if (editingCategory) {
            const res = await dispatch(updateCategoryThunk({ id: editingCategory.id, payload: { name: catName.trim(), slug: catSlug.trim(), type: catType, isActive: catIsActive } }));
            if (updateCategoryThunk.fulfilled.match(res)) {
                Swal.fire('Thành công', 'Đã cập nhật danh mục', 'success');
                setShowCategoryForm(false);
                dispatch(fetchAdminCategoriesThunk({ page: categoriesPageNumber, size: 20 }));
            } else { Swal.fire('Lỗi', res.payload as string, 'error'); }
        } else {
            const res = await dispatch(createCategoryThunk({ name: catName.trim(), slug: catSlug.trim(), type: catType }));
            if (createCategoryThunk.fulfilled.match(res)) {
                Swal.fire('Thành công', 'Đã tạo danh mục mới', 'success');
                setShowCategoryForm(false);
                dispatch(fetchAdminCategoriesThunk({ page: 1, size: 20 }));
            } else { Swal.fire('Lỗi', res.payload as string, 'error'); }
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        const confirm = await Swal.fire({ title: 'Xóa danh mục?', text: `Bạn có chắc muốn xóa "${name}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy' });
        if (confirm.isConfirmed) {
            const res = await dispatch(deleteCategoryThunk(id));
            if (deleteCategoryThunk.fulfilled.match(res)) {
                Swal.fire('Thành công', 'Đã xóa danh mục', 'success');
                dispatch(fetchAdminCategoriesThunk({ page: categoriesPageNumber, size: 20 }));
            } else { Swal.fire('Lỗi', res.payload as string, 'error'); }
        }
    };

    // ── Moderation handlers ──
    const handleApproveResource = async (resourceType: ResourceType, id: string, title: string) => {
        const confirm = await Swal.fire({ title: 'Duyệt nội dung?', text: `Duyệt "${title}"?`, icon: 'question', showCancelButton: true, confirmButtonColor: '#28a745', cancelButtonColor: '#6c757d', confirmButtonText: 'Duyệt', cancelButtonText: 'Hủy', input: 'text', inputLabel: 'Ghi chú (không bắt buộc)', inputPlaceholder: 'VD: Đạt yêu cầu', customClass: { input: 'text-gray-900 placeholder-gray-500 bg-white' } });
        if (confirm.isConfirmed) {
            const res = await dispatch(approveResourceThunk({ resourceType, id, payload: { note: confirm.value || '' } }));
            if (approveResourceThunk.fulfilled.match(res)) {
                Swal.fire('Thành công', 'Đã duyệt', 'success');
            } else {
                Swal.fire('Lỗi', res.payload as string, 'error');
            }
        }
    };

    const handleRejectResource = async (resourceType: ResourceType, id: string, title: string) => {
        const confirm = await Swal.fire({ title: 'Từ chối nội dung?', text: `Từ chối "${title}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#6c757d', confirmButtonText: 'Từ chối', cancelButtonText: 'Hủy', input: 'text', inputLabel: 'Lý do từ chối', inputPlaceholder: 'VD: Thông tin không chính xác', inputValidator: (value) => { if (!value) return 'Vui lòng nhập lý do từ chối'; return null; }, customClass: { input: 'text-gray-900 placeholder-gray-500 bg-white' } });
        if (confirm.isConfirmed) {
            const res = await dispatch(rejectResourceThunk({ resourceType, id, payload: { note: confirm.value || '' } }));
            if (rejectResourceThunk.fulfilled.match(res)) {
                Swal.fire('Thành công', 'Đã từ chối', 'success');
            } else {
                Swal.fire('Lỗi', res.payload as string, 'error');
            }
        }
    };

    const handleViewLogs = (resourceType: ResourceType, id: string) => {
        dispatch(fetchLogsThunk({ resourceType, id }));
        setShowLogsModal(true);
    };

    // ── Chart data ──
    const formatChartData = () => {
        if (!stats) return [];
        return stats.timeSeries.users.map((item: any, index: number) => ({
            date: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
            users: item.count,
            places: stats.timeSeries.places[index]?.count || 0,
            events: stats.timeSeries.events[index]?.count || 0,
            reviews: stats.timeSeries.reviews[index]?.count || 0,
        }));
    };
    const chartData = formatChartData();

    // ── Sidebar config ──
    const sidebarTabs: { key: AdminTab; label: string }[] = [
        { key: 'overview', label: 'Tổng quan' },
        { key: 'users', label: 'Quản lý Người dùng' },
        { key: 'places', label: 'Quản lý Địa điểm' },
        { key: 'events', label: 'Quản lý Sự kiện' },
        { key: 'moderation', label: 'Kiểm duyệt' },
        { key: 'categories', label: 'Quản lý Danh mục' },
    ];

    // Helper: get category names for a place
    const getCategoryNames = (categoryIds: string[]) => {
        return categoryIds.map(id => categories.find(c => c.id === id)?.name).filter(Boolean).join(', ') || '—';
    };

    return (
        <div className="flex h-screen w-full flex-col bg-gray-50">
            {/* Header */}
            <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#00008A]">Quản trị hệ thống</span>
                </div>
                <div className="flex items-center gap-4">
                    <ProfileDropdown />
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r bg-white p-4 shadow-sm h-full flex flex-col gap-2">
                    {sidebarTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-3 rounded-lg p-3 w-full text-left font-medium transition ${activeTab === tab.key ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-8 relative">
                    {isActionLoading && (
                        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00008A] border-t-transparent" />
                        </div>
                    )}

                    {/* ════════════ OVERVIEW TAB ════════════ */}
                    {activeTab === 'overview' && (
                        <div>
                            <div className="mb-8 flex items-center justify-between">
                                <h1 className="text-2xl font-bold text-gray-800">Khái quát trạng thái hệ thống</h1>
                                {overviewLoading && <span className="text-sm text-gray-500 animate-pulse">Đang làm mới dữ liệu...</span>}
                            </div>

                            {stats && !overviewLoading && (
                                <>
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                                        {[
                                            { label: 'Người dùng', value: stats.users.total, sub: `${stats.users.active} đang hoạt động`, icon: <Users size={20} />, color: 'blue' },
                                            { label: 'Địa điểm', value: stats.places.total, sub: `${stats.places.approved} đã được duyệt`, icon: <MapPin size={20} />, color: 'green' },
                                            { label: 'Sự kiện', value: stats.events.total, sub: `${stats.events.upcoming} sắp diễn ra`, icon: <Calendar size={20} />, color: 'purple' },
                                            { label: 'Đánh giá', value: stats.reviews.total, sub: `${stats.reviews.averageRating.toFixed(1)} sao TB`, icon: <Star size={20} />, color: 'yellow' },
                                            { label: 'Tin nhắn Chat', value: stats.chat.totalMessages, sub: `${stats.chat.totalConversations} cuộc hội thoại`, icon: <MessageSquare size={20} />, color: 'teal' },
                                        ].map((card, i) => (
                                            <div key={i} className="rounded-xl border bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition cursor-pointer"
                                                onClick={() => {
                                                    if (card.label === 'Người dùng') setActiveTab('users');
                                                    if (card.label === 'Địa điểm') setActiveTab('places');
                                                    if (card.label === 'Sự kiện') setActiveTab('events');
                                                }}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="text-sm font-medium text-gray-500">{card.label}</div>
                                                    <div className={`p-2 bg-${card.color}-50 rounded-lg text-${card.color}-600`}>{card.icon}</div>
                                                </div>
                                                <div>
                                                    <div className="mt-2 text-3xl font-bold text-gray-800">{card.value}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{card.sub}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid gap-6 lg:grid-cols-3 mt-6">
                                        <div className="col-span-2 rounded-xl border bg-white p-6 shadow-sm">
                                            <h3 className="text-lg font-bold text-gray-800 mb-6">Tăng trưởng nội dung (29 ngày)</h3>
                                            <div className="h-80 w-full text-sm">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                        <Line type="monotone" dataKey="places" name="Địa điểm" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                                                        <Line type="monotone" dataKey="events" name="Sự kiện" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                                                        <Line type="monotone" dataKey="users" name="Người dùng" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                                                        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />
                                                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} dy={10} minTickGap={30} />
                                                        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} dx={-10} />
                                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }} />
                                                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="col-span-1 rounded-xl border bg-white p-6 shadow-sm flex flex-col">
                                            <h3 className="text-lg font-bold text-gray-800 mb-6">Đánh giá mới</h3>
                                            <div className="flex-1 w-full min-h-[300px] text-sm">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={chartData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} minTickGap={30} axisLine={false} tickLine={false} dy={10} />
                                                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                                        <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }} />
                                                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                                                        <Bar dataKey="reviews" name="Bài đánh giá" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ════════════ USERS TAB ════════════ */}
                    {activeTab === 'users' && (
                        <div className="flex flex-col h-full">
                            <div className="mb-6 flex items-center justify-between flex-shrink-0">
                                <h1 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h1>
                            </div>

                            <div className="flex-1 rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left text-sm text-gray-600 min-w-[800px]">
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Người dùng</th>
                                                <th className="px-4 py-3 font-semibold">SĐT</th>
                                                <th className="px-4 py-3 font-semibold">Vai trò</th>
                                                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                                                <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y text-gray-800">
                                            {usersLoading && (
                                                <tr><td colSpan={5} className="py-10 text-center text-gray-500">Loading...</td></tr>
                                            )}
                                            {!usersLoading && users.map((u) => (
                                                <tr key={u.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-purple-100 flex-shrink-0 overflow-hidden">
                                                                {u.avatarUrl ? (
                                                                    <img src={u.avatarUrl} alt={u.fullName} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center text-purple-700 font-bold">{u.fullName.charAt(0)}</div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-gray-900">{u.fullName}</div>
                                                                <div className="text-xs text-gray-500">{u.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">{u.phone || '—'}</td>
                                                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                                                    <td className="px-4 py-3"><UserStatusBadge status={u.status} /></td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {u.role !== 0 && (
                                                                <>
                                                                    {u.status === 0 ? (
                                                                        <button onClick={() => handleLock(u.id, u.status)} className="px-3 py-1.5 text-xs font-semibold rounded bg-red-50 text-red-600 hover:bg-red-100 transition">Khóa</button>
                                                                    ) : (
                                                                        <button onClick={() => handleUnlock(u.id)} className="px-3 py-1.5 text-xs font-semibold rounded bg-green-50 text-green-600 hover:bg-green-100 transition">Mở Khóa</button>
                                                                    )}
                                                                    {u.status === 2 && (
                                                                        <button onClick={() => handleApprove(u.id)} className="px-3 py-1.5 text-xs font-semibold rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition">Duyệt</button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {!usersLoading && users.length === 0 && (
                                                <tr><td colSpan={5} className="py-10 text-center text-gray-500">Không có dữ liệu.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {!usersLoading && <Pagination currentPage={userPageNumber} totalPages={userTotalPages} onPageChange={handleUserPageChange} />}
                            </div>
                        </div>
                    )}

                    {/* ════════════ PLACES TAB ════════════ */}
                    {activeTab === 'places' && (
                        <div className="flex flex-col h-full">
                            <div className="mb-6 flex items-center justify-between flex-shrink-0">
                                <h1 className="text-2xl font-bold text-gray-800">Quản lý Địa điểm</h1>
                                <button onClick={handleOpenCreatePlace} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
                                    <Plus size={16} /> Thêm địa điểm
                                </button>
                            </div>

                            <div className="flex-1 rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left text-sm text-gray-600 min-w-[900px]">
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Ảnh</th>
                                                <th className="px-4 py-3 font-semibold">Tên địa điểm</th>
                                                <th className="px-4 py-3 font-semibold">Địa chỉ</th>
                                                <th className="px-4 py-3 font-semibold">Danh mục</th>
                                                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                                                <th className="px-4 py-3 font-semibold">Đánh giá</th>
                                                <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y text-gray-800">
                                            {placesLoading && (
                                                <tr><td colSpan={7} className="py-10 text-center text-gray-500">Loading...</td></tr>
                                            )}
                                            {!placesLoading && places.map((p) => (
                                                <tr key={p.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-4 py-3">
                                                        <div className="h-12 w-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                            {p.images?.find(img => img.isPrimary)?.url || p.images?.[0]?.url ? (
                                                                <img src={p.images.find(img => img.isPrimary)?.url || p.images[0]?.url} alt={p.title} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-gray-400"><MapPin size={16} /></div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-gray-900 max-w-[200px] truncate">{p.title}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="max-w-[180px] truncate text-gray-500">{p.address || '—'}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="max-w-[150px] truncate text-xs text-gray-500">{getCategoryNames(p.categoryIds)}</div>
                                                    </td>
                                                    <td className="px-4 py-3"><ModerationBadge status={p.moderationStatus} /></td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1">
                                                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                                            <span className="text-sm font-medium">{p.averageRating?.toFixed(1) || '—'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <button onClick={() => handleOpenEditPlace(p)} className="p-2 rounded hover:bg-blue-50 text-blue-600 transition" title="Sửa"><Pencil size={15} /></button>
                                                            <button onClick={() => setMediaTarget({ resourceType: 0, resourceId: p.id, title: p.title })} className="p-2 rounded hover:bg-purple-50 text-purple-600 transition" title="Quản lý ảnh"><ImageIcon size={15} /></button>
                                                            <button onClick={() => handleDeletePlace(p.id, p.title)} className="p-2 rounded hover:bg-red-50 text-red-600 transition" title="Xóa"><Trash2 size={15} /></button>
                                                            <a href={`/places/${p.id}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded hover:bg-gray-100 text-gray-500 transition" title="Xem chi tiết"><ExternalLink size={15} /></a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {!placesLoading && places.length === 0 && (
                                                <tr><td colSpan={7} className="py-10 text-center text-gray-500">Không có dữ liệu.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {!placesLoading && <Pagination currentPage={placesPageNumber} totalPages={placesTotalPages} onPageChange={handlePlacePageChange} />}
                            </div>
                        </div>
                    )}

                    {/* ════════════ EVENTS TAB ════════════ */}
                    {activeTab === 'events' && (
                        <div className="flex flex-col h-full">
                            <div className="mb-6 flex items-center justify-between flex-shrink-0">
                                <h1 className="text-2xl font-bold text-gray-800">Quản lý Sự kiện</h1>
                                <button onClick={handleOpenCreateEvent} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
                                    <Plus size={16} /> Thêm sự kiện
                                </button>
                            </div>

                            <div className="flex-1 rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left text-sm text-gray-600 min-w-[1000px]">
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Ảnh</th>
                                                <th className="px-4 py-3 font-semibold">Tên sự kiện</th>
                                                <th className="px-4 py-3 font-semibold">Địa điểm</th>
                                                <th className="px-4 py-3 font-semibold">Thời gian</th>
                                                <th className="px-4 py-3 font-semibold">Trạng thái SK</th>
                                                <th className="px-4 py-3 font-semibold">Kiểm duyệt</th>
                                                <th className="px-4 py-3 font-semibold">Đánh giá</th>
                                                <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y text-gray-800">
                                            {eventsLoading && (
                                                <tr><td colSpan={8} className="py-10 text-center text-gray-500">Loading...</td></tr>
                                            )}
                                            {!eventsLoading && events.map((ev) => (
                                                <tr key={ev.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-4 py-3">
                                                        <div className="h-12 w-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                            {ev.images?.find(img => img.isPrimary)?.url || ev.images?.[0]?.url ? (
                                                                <img src={ev.images.find(img => img.isPrimary)?.url || ev.images[0]?.url} alt={ev.title} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-gray-400"><Calendar size={16} /></div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-gray-900 max-w-[180px] truncate">{ev.title}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="max-w-[150px] truncate text-gray-500">{ev.address || '—'}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-xs text-gray-600">
                                                            <div className="flex items-center gap-1"><Clock size={12} /> {formatDateTime(ev.startAt)}</div>
                                                            <div className="text-gray-400 mt-0.5">→ {formatDateTime(ev.endAt)}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3"><EventStatusBadge status={ev.eventStatus} /></td>
                                                    <td className="px-4 py-3"><ModerationBadge status={ev.moderationStatus} /></td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1">
                                                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                                            <span className="text-sm font-medium">{ev.averageRating?.toFixed(1) || '—'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <button onClick={() => handleOpenEditEvent(ev)} className="p-2 rounded hover:bg-blue-50 text-blue-600 transition" title="Sửa"><Pencil size={15} /></button>
                                                            <button onClick={() => setMediaTarget({ resourceType: 1, resourceId: ev.id, title: ev.title })} className="p-2 rounded hover:bg-purple-50 text-purple-600 transition" title="Quản lý ảnh"><ImageIcon size={15} /></button>
                                                            <button onClick={() => handleDeleteEvent(ev.id, ev.title)} className="p-2 rounded hover:bg-red-50 text-red-600 transition" title="Xóa"><Trash2 size={15} /></button>
                                                            <a href={`/events/${ev.id}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded hover:bg-gray-100 text-gray-500 transition" title="Xem chi tiết"><ExternalLink size={15} /></a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {!eventsLoading && events.length === 0 && (
                                                <tr><td colSpan={8} className="py-10 text-center text-gray-500">Không có dữ liệu.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {!eventsLoading && <Pagination currentPage={eventsPageNumber} totalPages={eventsTotalPages} onPageChange={handleEventPageChange} />}
                            </div>
                        </div>
                    )}

                    {/* ════════════ MODERATION TAB ════════════ */}
                    {activeTab === 'moderation' && (
                        <div className="flex flex-col h-full">
                            <div className="mb-6 flex-shrink-0">
                                <h1 className="text-2xl font-bold text-gray-800 mb-4">Kiểm duyệt nội dung</h1>
                                <div className="flex gap-2">
                                    <button onClick={() => setModerationSubTab('places')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${moderationSubTab === 'places' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                        Địa điểm chờ duyệt ({placesTotalCount})
                                    </button>
                                    <button onClick={() => setModerationSubTab('events')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${moderationSubTab === 'events' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                        Sự kiện chờ duyệt ({eventsTotalCount})
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
                                {moderationLoading ? (
                                    <div className="flex-1 flex items-center justify-center text-gray-500">Loading...</div>
                                ) : (
                                    <>
                                        {/* Pending Places */}
                                        {moderationSubTab === 'places' && (
                                            <div className="overflow-x-auto flex-1">
                                                <table className="w-full text-left text-sm text-gray-600 min-w-[800px]">
                                                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b sticky top-0 z-10">
                                                        <tr>
                                                            <th className="px-4 py-3 font-semibold">Ảnh</th>
                                                            <th className="px-4 py-3 font-semibold">Tên địa điểm</th>
                                                            <th className="px-4 py-3 font-semibold">Địa chỉ</th>
                                                            <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                                                            <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y text-gray-800">
                                                        {pendingPlaces.map((p) => (
                                                            <tr key={p.id} className="hover:bg-gray-50 transition">
                                                                <td className="px-4 py-3">
                                                                    <div className="h-12 w-16 rounded-lg bg-gray-100 overflow-hidden">
                                                                        {p.images?.[0]?.url ? (
                                                                            <img src={p.images[0].url} alt={p.title} className="h-full w-full object-cover" />
                                                                        ) : (
                                                                            <div className="h-full w-full flex items-center justify-center text-gray-400"><MapPin size={16} /></div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 font-semibold text-gray-900 max-w-[200px] truncate">{p.title}</td>
                                                                <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{p.address || '—'}</td>
                                                                <td className="px-4 py-3 text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <div className="flex justify-end gap-1">
                                                                        <button onClick={() => handleApproveResource(0, p.id, p.title)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-green-50 text-green-600 hover:bg-green-100 transition" title="Duyệt"><CheckCircle size={14} /> Duyệt</button>
                                                                        <button onClick={() => handleRejectResource(0, p.id, p.title)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-red-50 text-red-600 hover:bg-red-100 transition" title="Từ chối"><XCircle size={14} /> Từ chối</button>
                                                                        <button onClick={() => handleViewLogs(0, p.id)} className="p-2 rounded hover:bg-gray-100 text-gray-500 transition" title="Lịch sử"><FileText size={15} /></button>
                                                                        <a href={`/places/${p.id}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded hover:bg-gray-100 text-gray-500 transition" title="Xem chi tiết"><ExternalLink size={15} /></a>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {pendingPlaces.length === 0 && (
                                                            <tr><td colSpan={5} className="py-10 text-center text-gray-500">Không có địa điểm nào chờ duyệt.</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {/* Pending Events */}
                                        {moderationSubTab === 'events' && (
                                            <div className="overflow-x-auto flex-1">
                                                <table className="w-full text-left text-sm text-gray-600 min-w-[900px]">
                                                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b sticky top-0 z-10">
                                                        <tr>
                                                            <th className="px-4 py-3 font-semibold">Ảnh</th>
                                                            <th className="px-4 py-3 font-semibold">Tên sự kiện</th>
                                                            <th className="px-4 py-3 font-semibold">Địa điểm</th>
                                                            <th className="px-4 py-3 font-semibold">Thời gian</th>
                                                            <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                                                            <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y text-gray-800">
                                                        {pendingEvents.map((ev) => (
                                                            <tr key={ev.id} className="hover:bg-gray-50 transition">
                                                                <td className="px-4 py-3">
                                                                    <div className="h-12 w-16 rounded-lg bg-gray-100 overflow-hidden">
                                                                        {ev.images?.[0]?.url ? (
                                                                            <img src={ev.images[0].url} alt={ev.title} className="h-full w-full object-cover" />
                                                                        ) : (
                                                                            <div className="h-full w-full flex items-center justify-center text-gray-400"><Calendar size={16} /></div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 font-semibold text-gray-900 max-w-[180px] truncate">{ev.title}</td>
                                                                <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">{ev.address || '—'}</td>
                                                                <td className="px-4 py-3 text-xs text-gray-600">
                                                                    <div className="flex items-center gap-1"><Clock size={12} /> {formatDateTime(ev.startAt)}</div>
                                                                    <div className="text-gray-400 mt-0.5">→ {formatDateTime(ev.endAt)}</div>
                                                                </td>
                                                                <td className="px-4 py-3 text-xs text-gray-500">{new Date(ev.createdAt).toLocaleDateString('vi-VN')}</td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <div className="flex justify-end gap-1">
                                                                        <button onClick={() => handleApproveResource(1, ev.id, ev.title)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-green-50 text-green-600 hover:bg-green-100 transition" title="Duyệt"><CheckCircle size={14} /> Duyệt</button>
                                                                        <button onClick={() => handleRejectResource(1, ev.id, ev.title)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-red-50 text-red-600 hover:bg-red-100 transition" title="Từ chối"><XCircle size={14} /> Từ chối</button>
                                                                        <button onClick={() => handleViewLogs(1, ev.id)} className="p-2 rounded hover:bg-gray-100 text-gray-500 transition" title="Lịch sử"><FileText size={15} /></button>
                                                                        <a href={`/events/${ev.id}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded hover:bg-gray-100 text-gray-500 transition" title="Xem chi tiết"><ExternalLink size={15} /></a>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {pendingEvents.length === 0 && (
                                                            <tr><td colSpan={6} className="py-10 text-center text-gray-500">Không có sự kiện nào chờ duyệt.</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ════════════ CATEGORIES TAB ════════════ */}
                    {activeTab === 'categories' && (
                        <div className="flex flex-col h-full">
                            <div className="mb-6 flex items-center justify-between flex-shrink-0">
                                <h1 className="text-2xl font-bold text-gray-800">Quản lý Danh mục</h1>
                                <button onClick={handleOpenCreateCategory} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
                                    <Plus size={16} /> Thêm danh mục
                                </button>
                            </div>

                            <div className="flex-1 rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left text-sm text-gray-600 min-w-[600px]">
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Tên</th>
                                                <th className="px-4 py-3 font-semibold">Slug</th>
                                                <th className="px-4 py-3 font-semibold">Loại</th>
                                                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                                                <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y text-gray-800">
                                            {categoriesLoading && (
                                                <tr><td colSpan={5} className="py-10 text-center text-gray-500">Loading...</td></tr>
                                            )}
                                            {!categoriesLoading && adminCategoryList.map((cat) => (
                                                <tr key={cat.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Tag size={14} className="text-gray-400" />
                                                            <span className="font-semibold text-gray-900">{cat.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{cat.slug}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-800">{categoryTypeLabel(cat.type)}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {cat.isActive
                                                            ? <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Hoạt động</span>
                                                            : <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500">Ẩn</span>
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <button onClick={() => handleOpenEditCategory(cat)} className="p-2 rounded hover:bg-blue-50 text-blue-600 transition" title="Sửa"><Pencil size={15} /></button>
                                                            <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="p-2 rounded hover:bg-red-50 text-red-600 transition" title="Xóa"><Trash2 size={15} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {!categoriesLoading && adminCategoryList.length === 0 && (
                                                <tr><td colSpan={5} className="py-10 text-center text-gray-500">Không có danh mục.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {!categoriesLoading && <Pagination currentPage={categoriesPageNumber} totalPages={categoriesTotalPages} onPageChange={handleCategoryPageChange} />}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Place Form Modal */}
            {showPlaceForm && (
                <PlaceFormModal
                    place={selectedPlace}
                    categories={categories}
                    onClose={() => setShowPlaceForm(false)}
                    onSubmit={handlePlaceFormSubmit}
                    loading={placeActionLoading}
                    accentColor="blue"
                />
            )}

            {/* Event Form Modal */}
            {showEventForm && (
                <EventFormModal
                    event={selectedEvent}
                    categories={categories}
                    onClose={() => setShowEventForm(false)}
                    onSubmit={handleEventFormSubmit}
                    loading={eventActionLoading}
                    accentColor="blue"
                />
            )}

            {/* Category Form Modal */}
            {showCategoryForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowCategoryForm(false)}>
                    <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowCategoryForm(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        <h2 className="mb-5 text-lg font-bold text-gray-800">{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Tên danh mục *</label>
                                <input value={catName} onChange={e => setCatName(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="VD: Du lịch biển" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Slug *</label>
                                <input value={catSlug} onChange={e => setCatSlug(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm font-mono text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="VD: du-lich-bien" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Loại</label>
                                <select value={catType} onChange={e => setCatType(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                                    <option value="theme">Chủ đề</option>
                                    <option value="style">Phong cách</option>
                                    <option value="activity">Hoạt động</option>
                                    <option value="budget">Ngân sách</option>
                                    <option value="companion">Đối tượng</option>
                                </select>
                            </div>
                            {editingCategory && (
                                <div className="flex items-center gap-3">
                                    <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                                    <button type="button" onClick={() => setCatIsActive(!catIsActive)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${catIsActive ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${catIsActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                    <span className="text-sm text-gray-500">{catIsActive ? 'Hoạt động' : 'Ẩn'}</span>
                                </div>
                            )}
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => setShowCategoryForm(false)} className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Hủy</button>
                                <button onClick={handleCategoryFormSubmit} disabled={categoryActionLoading} className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition">
                                    {categoryActionLoading ? 'Đang xử lý...' : editingCategory ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Moderation Logs Modal */}
            {showLogsModal && (
                <LogsModal
                    logs={logs}
                    loading={logsLoading}
                    onClose={() => { setShowLogsModal(false); dispatch(clearLogs()); }}
                />
            )}

            {/* Media Manager Modal */}
            {mediaTarget && (
                <MediaManager
                    resourceType={mediaTarget.resourceType}
                    resourceId={mediaTarget.resourceId}
                    resourceTitle={mediaTarget.title}
                    onClose={() => setMediaTarget(null)}
                />
            )}
        </div>
    );
}
