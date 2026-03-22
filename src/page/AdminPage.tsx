import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ProfileDropdown } from './HomePage';
import type { AppDispatch, RootState } from '../store';
import { fetchAdminUsersThunk, lockUserThunk, unlockUserThunk, approveUserThunk } from '../store/slice/AdminManagerUserSlice';
import { fetchOverviewStatsThunk } from '../store/slice/AdminManagerOverviewSlice';
import Swal from 'sweetalert2';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import { Users, MapPin, Calendar, Star, MessageSquare } from 'lucide-react';

export function AdminPage() {
    const dispatch = useDispatch<AppDispatch>();
    const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');

    // User Management State
    const { users, loading: usersLoading, totalPages, pageNumber, actionLoading } = useSelector((state: RootState) => state.adminUsers);

    // Overview State
    const { stats, loading: overviewLoading } = useSelector((state: RootState) => state.adminOverview);

    // Initial load
    useEffect(() => {
        if (activeTab === 'users') {
            dispatch(fetchAdminUsersThunk({ page: 1, size: 10 }));
        } else if (activeTab === 'overview') {
            dispatch(fetchOverviewStatsThunk({}));
        }
    }, [activeTab, dispatch]);

    const handlePageChange = (newPage: number) => {
        dispatch(fetchAdminUsersThunk({ page: newPage, size: 10 }));
    };

    const handleLock = async (id: string, currentStatus: number) => {
        if (currentStatus === 1) return;
        const confirm = await Swal.fire({
            title: 'Khóa tài khoản?',
            text: 'Tài khoản này sẽ không thể đăng nhập!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Khóa',
            cancelButtonText: 'Hủy'
        });
        if (confirm.isConfirmed) {
            const res = await dispatch(lockUserThunk(id));
            if (lockUserThunk.fulfilled.match(res)) {
                Swal.fire('Thành công', 'Đã khóa tài khoản', 'success');
                dispatch(fetchAdminUsersThunk({ page: pageNumber, size: 10 }));
            } else {
                Swal.fire('Lỗi', res.payload as string, 'error');
            }
        }
    };

    const handleUnlock = async (id: string) => {
        const confirm = await Swal.fire({
            title: 'Mở khóa tài khoản?',
            text: 'Tài khoản sẽ hoạt động bình thường.',
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Mở khóa',
            cancelButtonText: 'Hủy'
        });
        if (confirm.isConfirmed) {
            const res = await dispatch(unlockUserThunk(id));
            if (unlockUserThunk.fulfilled.match(res)) {
                Swal.fire('Thành công', 'Đã mở khóa tài khoản', 'success');
                dispatch(fetchAdminUsersThunk({ page: pageNumber, size: 10 }));
            } else {
                Swal.fire('Lỗi', res.payload as string, 'error');
            }
        }
    };

    const handleApprove = async (id: string) => {
        const confirm = await Swal.fire({
            title: 'Duyệt tài khoản?',
            text: 'Tài khoản sẽ được phê duyệt.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Duyệt',
            cancelButtonText: 'Hủy'
        });
        if (confirm.isConfirmed) {
            const res = await dispatch(approveUserThunk(id));
            if (approveUserThunk.fulfilled.match(res)) {
                Swal.fire('Thành công', 'Đã duyệt tài khoản', 'success');
                dispatch(fetchAdminUsersThunk({ page: pageNumber, size: 10 }));
            } else {
                Swal.fire('Lỗi', res.payload as string, 'error');
            }
        }
    };

    const RoleBadge = ({ role }: { role: number }) => {
        switch (role) {
            case 0: return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Admin</span>;
            case 1: return <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">Manager</span>;
            case 2: return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">User</span>;
            default: return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">Unknown</span>;
        }
    };

    const StatusBadge = ({ status }: { status: number }) => {
        if (status === 0) return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Hoạt động</span>;
        if (status === 1) return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Bị khóa</span>;
        return <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">Chờ duyệt ({status})</span>;
    };

    // Format Data for Charts
    const formatChartData = () => {
        if (!stats) return [];
        return stats.timeSeries.users.map((item, index) => {
            // we assume all Series have same length and order
            return {
                date: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                users: item.count,
                places: stats.timeSeries.places[index]?.count || 0,
                events: stats.timeSeries.events[index]?.count || 0,
                reviews: stats.timeSeries.reviews[index]?.count || 0,
            };
        });
    };

    const chartData = formatChartData();

    return (
        <div className="flex h-screen w-full flex-col bg-gray-50">
            {/* Header */}
            <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#00008A]">Thống kê Admin</span>
                </div>
                <div className="flex items-center gap-4">
                    <ProfileDropdown />
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r bg-white p-4 shadow-sm h-full flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-3 rounded-lg p-3 w-full text-left font-medium transition ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Tổng quan
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-3 rounded-lg p-3 w-full text-left font-medium transition ${activeTab === 'users' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Quản lý Người dùng
                    </button>
                    {/* <button className="flex items-center gap-3 rounded-lg p-3 w-full text-left font-medium text-gray-600 hover:bg-gray-100 transition">
                        Cài đặt hệ thống
                    </button> */}
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-8 relative">
                    {actionLoading && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00008A] border-t-transparent" />
                        </div>
                    )}

                    {activeTab === 'overview' && (
                        <div>
                            <div className="mb-8 flex items-center justify-between">
                                <h1 className="text-2xl font-bold text-gray-800">Khái quát trạng thái hệ thống</h1>
                                {overviewLoading && <span className="text-sm text-gray-500 animate-pulse">Đang làm mới dữ liệu...</span>}
                            </div>

                            {stats && !overviewLoading && (
                                <>
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                                        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                                            <div className="flex justify-between items-start">
                                                <div className="text-sm font-medium text-gray-500">Người dùng</div>
                                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Users size={20} /></div>
                                            </div>
                                            <div>
                                                <div className="mt-2 text-3xl font-bold text-gray-800">{stats.users.total}</div>
                                                <div className="text-xs text-blue-600 mt-1">{stats.users.active} đang hoạt động</div>
                                            </div>
                                        </div>
                                        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                                            <div className="flex justify-between items-start">
                                                <div className="text-sm font-medium text-gray-500">Địa điểm</div>
                                                <div className="p-2 bg-green-50 rounded-lg text-green-600"><MapPin size={20} /></div>
                                            </div>
                                            <div>
                                                <div className="mt-2 text-3xl font-bold text-gray-800">{stats.places.total}</div>
                                                <div className="text-xs text-green-600 mt-1">{stats.places.approved} đã được duyệt</div>
                                            </div>
                                        </div>
                                        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                                            <div className="flex justify-between items-start">
                                                <div className="text-sm font-medium text-gray-500">Sự kiện</div>
                                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Calendar size={20} /></div>
                                            </div>
                                            <div>
                                                <div className="mt-2 text-3xl font-bold text-gray-800">{stats.events.total}</div>
                                                <div className="text-xs text-purple-600 mt-1">{stats.events.upcoming} sắp diễn ra</div>
                                            </div>
                                        </div>
                                        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                                            <div className="flex justify-between items-start">
                                                <div className="text-sm font-medium text-gray-500">Đánh giá</div>
                                                <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><Star size={20} /></div>
                                            </div>
                                            <div>
                                                <div className="mt-2 text-3xl font-bold text-gray-800">{stats.reviews.total}</div>
                                                <div className="text-xs text-gray-500 mt-1">Lên tới {stats.reviews.averageRating.toFixed(1)} sao TB</div>
                                            </div>
                                        </div>
                                        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                                            <div className="flex justify-between items-start">
                                                <div className="text-sm font-medium text-gray-500">Tin nhắn Chat</div>
                                                <div className="p-2 bg-teal-50 rounded-lg text-teal-600"><MessageSquare size={20} /></div>
                                            </div>
                                            <div>
                                                <div className="mt-2 text-3xl font-bold text-gray-800">{stats.chat.totalMessages}</div>
                                                <div className="text-xs text-gray-500 mt-1">Trong {stats.chat.totalConversations} cuộc hội thoại</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 lg:grid-cols-3 mt-6">
                                        {/* Chart 1: Content Growth */}
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

                                        {/* Activity Bars */}
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
                                        <tbody className="divide-y text-gray-800 relative">
                                            {usersLoading && (
                                                <tr>
                                                    <td colSpan={5} className="py-10 text-center text-gray-500">Loading...</td>
                                                </tr>
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
                                                    <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {u.role !== 0 && (
                                                                <>
                                                                    {u.status === 0 ? (
                                                                        <button onClick={() => handleLock(u.id, u.status)} className="px-3 py-1.5 text-xs font-semibold rounded bg-red-50 text-red-600 hover:bg-red-100 transition">Khóa</button>
                                                                    ) : (
                                                                        <button onClick={() => handleUnlock(u.id)} className="px-3 py-1.5 text-xs font-semibold rounded bg-green-50 text-green-600 hover:bg-green-100 transition">Mở Khóa</button>
                                                                    )}
                                                                    <button onClick={() => handleApprove(u.id)} className="px-3 py-1.5 text-xs font-semibold rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition">Duyệt</button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {!usersLoading && users.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="py-10 text-center text-gray-500">Không có dữ liệu.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {!usersLoading && totalPages > 1 && (
                                    <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6 bg-gray-50 flex-shrink-0">
                                        <span className="text-sm text-gray-700">
                                            Trang <span className="font-semibold">{pageNumber}</span> / <span className="font-semibold">{totalPages}</span>
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handlePageChange(pageNumber - 1)}
                                                disabled={pageNumber === 1}
                                                className="px-3 py-1 border rounded bg-white text-sm hover:bg-gray-100 disabled:opacity-50 transition"
                                            >Trước</button>
                                            <button
                                                onClick={() => handlePageChange(pageNumber + 1)}
                                                disabled={pageNumber === totalPages}
                                                className="px-3 py-1 border rounded bg-white text-sm hover:bg-gray-100 disabled:opacity-50 transition"
                                            >Sau</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
