import { ProfileDropdown } from './HomePage';

export function AdministrativeUnitsPage() {
    return (
        <div className="flex h-screen w-full flex-col bg-slate-50">
            {/* Header */}
            <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#008A5E]">Quản lý Đơn vị Hành chính</span>
                </div>
                <div className="flex items-center gap-4">
                    <ProfileDropdown />
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r bg-white p-4 shadow-sm">
                    <nav className="space-y-2">
                        <a href="/administrative-units" className="flex items-center gap-3 rounded-lg bg-green-50 p-3 text-green-700 font-medium">
                            Quản lý Tỉnh/Thành
                        </a>
                        <a href="#" className="flex items-center gap-3 rounded-lg p-3 text-gray-600 hover:bg-gray-100 transition">
                            Quản lý Quận/Huyện
                        </a>
                        <a href="#" className="flex items-center gap-3 rounded-lg p-3 text-gray-600 hover:bg-gray-100 transition">
                            Đề xuất duyệt bài
                        </a>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="mb-8 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">Danh sách Đơn vị</h1>
                        <button className="rounded-lg bg-[#008A5E] px-4 py-2 font-semibold text-white transition hover:bg-[#006e4b]">
                            + Thêm mới
                        </button>
                    </div>

                    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Mã đơn vị</th>
                                    <th className="px-6 py-4 font-medium">Tên đơn vị</th>
                                    <th className="px-6 py-4 font-medium">Loại</th>
                                    <th className="px-6 py-4 font-medium">Trạng thái</th>
                                    <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-gray-800">
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4">01</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">Thành phố Hà Nội</td>
                                    <td className="px-6 py-4">Thành phố Trung ương</td>
                                    <td className="px-6 py-4">
                                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Kích hoạt</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:underline">Sửa</button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4">79</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">Thành phố Hồ Chí Minh</td>
                                    <td className="px-6 py-4">Thành phố Trung ương</td>
                                    <td className="px-6 py-4">
                                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Kích hoạt</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:underline">Sửa</button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4">48</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">Thành phố Đà Nẵng</td>
                                    <td className="px-6 py-4">Thành phố Trung ương</td>
                                    <td className="px-6 py-4">
                                        <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">Đang cập nhật</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:underline">Sửa</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
}
