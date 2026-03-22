interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t px-4 py-3 bg-gray-50 flex-shrink-0">
            <span className="text-sm text-gray-700">
                Trang <span className="font-semibold">{currentPage}</span> / <span className="font-semibold">{totalPages}</span>
            </span>
            <div className="flex gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded bg-white text-sm hover:bg-gray-100 disabled:opacity-50 transition"
                >
                    Trước
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded bg-white text-sm hover:bg-gray-100 disabled:opacity-50 transition"
                >
                    Sau
                </button>
            </div>
        </div>
    );
}
