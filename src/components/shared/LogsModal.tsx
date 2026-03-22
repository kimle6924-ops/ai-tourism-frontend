import type { ModerationLog } from '../../services/ModerationService';
import { X } from 'lucide-react';

interface LogsModalProps {
    logs: ModerationLog[];
    loading: boolean;
    onClose: () => void;
}

export default function LogsModal({ logs, loading, onClose }: LogsModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                <h2 className="mb-4 text-lg font-bold text-gray-800">Lịch sử kiểm duyệt</h2>

                {loading ? (
                    <div className="py-8 text-center text-gray-500">Loading...</div>
                ) : logs.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">Chưa có lịch sử kiểm duyệt.</div>
                ) : (
                    <div className="space-y-3">
                        {logs.map((log) => (
                            <div key={log.id} className="rounded-lg border p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${log.action === 'approve' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {log.action === 'approve' ? 'Duyệt' : 'Từ chối'}
                                    </span>
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
    );
}
