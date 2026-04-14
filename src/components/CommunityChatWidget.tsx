import { useNavigate } from '@tanstack/react-router';
import { Users } from 'lucide-react';

export function CommunityChatWidget() {
    const navigate = useNavigate();

    return (
        <div className="fixed bottom-[130px] right-6 z-50 flex flex-col items-center gap-2">
            <div className="relative flex items-center gap-1.5 rounded-2xl rounded-br-sm bg-white px-3 py-2 text-xs font-semibold text-indigo-600 shadow-lg border border-indigo-100">
                <span>Cộng đồng du lịch</span>
                <span className="absolute -bottom-2 right-4 h-0 w-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white" />
            </div>

            <button
                onClick={() => navigate({ to: '/community' })}
                className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)] transition-all hover:scale-110 active:scale-95"
                title="Mở community feed"
            >
                <Users className="text-white group-hover:scale-110 transition-transform" size={28} />
            </button>
        </div>
    );
}
