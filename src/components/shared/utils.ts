export const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const categoryTypeLabel = (type: string) => {
    const map: Record<string, string> = {
        theme: 'Chủ đề',
        style: 'Phong cách',
        activity: 'Hoạt động',
        budget: 'Ngân sách',
        companion: 'Đối tượng',
    };
    return map[type] || type;
};
