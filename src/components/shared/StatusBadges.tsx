export const RoleBadge = ({ role }: { role: number }) => {
    switch (role) {
        case 0: return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Admin</span>;
        case 1: return <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">Manager</span>;
        case 2: return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">User</span>;
        default: return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">Unknown</span>;
    }
};

export const UserStatusBadge = ({ status }: { status: number }) => {
    if (status === 0) return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Hoạt động</span>;
    if (status === 1) return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Bị khóa</span>;
    return <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">Chờ duyệt</span>;
};

export const ModerationBadge = ({ status }: { status: number }) => {
    switch (status) {
        case 0: return <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">Chờ duyệt</span>;
        case 1: return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Đã duyệt</span>;
        case 2: return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Từ chối</span>;
        default: return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">—</span>;
    }
};

export const EventStatusBadge = ({ status }: { status: number }) => {
    switch (status) {
        case 0: return <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">Sắp diễn ra</span>;
        case 1: return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Đang diễn ra</span>;
        case 2: return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">Đã kết thúc</span>;
        default: return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">—</span>;
    }
};
