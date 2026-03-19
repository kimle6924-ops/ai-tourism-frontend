import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { loginThunk } from '../store/slice/LoginSlice';
import { registerThunk } from '../store/slice/RegisterSlice';
import bannerImg from '../assets/images/banner.jpg';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type AuthStep = 'login' | 'register' | 'interests';

interface RegisterData {
    email: string;
    password: string;
    fullName: string;
    phone: string;
}

const HOBBY_CATEGORIES = [
    { id: '34686b5e-6d51-4173-9f3e-31f91fb469fa', label: '🌿 Thiên nhiên' },
    { id: '34686b5e-6d51-4173-9f3e-31f91fb469fa', label: '🏙️ Thành phố' },
    { id: '34686b5e-6d51-4173-9f3e-31f91fb469fa', label: '🍜 Ẩm thực' },
    { id: '34686b5e-6d51-4173-9f3e-31f91fb469fa', label: '🏯 Văn hoá - Lịch sử' },
    { id: '34686b5e-6d51-4173-9f3e-31f91fb469fa', label: '🎉 Lễ hội - sự kiện' },
    { id: '34686b5e-6d51-4173-9f3e-31f91fb469fa', label: '😌 Chill – thư giãn' },
    { id: '34686b5e-6d51-4173-9f3e-31f91fb469fa', label: '😄 Vui vẻ – năng động' },
    { id: '34686b5e-6d51-4173-9f3e-31f91fb469fa', label: '😲 Sôi động – náo nhiệt' },
    { id: '34686b5e-6d51-4173-9f3e-31f91fb469fa', label: '😉 Phiêu lưu – khám phá' },
    { id: '34686b5e-6d51-4173-9f3e-31f91fb469fa', label: '🧗 Trekking / khám phá' },
    { id: '34686b5e-6d51-4173-9f3e-31f91fb469fa', label: '🏕️ Du lịch sinh thái' },
    { id: '34686b5e-6d51-4173-9f3e-31f91fb469fa', label: '📸 Check-in sống ảo' },
    { id: '34686b5e-6d51-4173-9f3e-31f91fb469fa', label: '🎮 Giải trí / vui chơi' },
    { id: '34686b5e-6d51-4173-9f3e-31f91fb469fa', label: '💰 Giá rẻ – tiết kiệm' },
    { id: '34686b5e-6d51-4173-9f3e-31f91fb469fa', label: '💎 Cao cấp – sang chảnh' },
    { id: '34686b5e-6d51-4173-9f3e-31f91fb469fa', label: '👨‍👩‍👧 Gia đình' },
    { id: '34686b5e-6d51-4173-9f3e-31f91fb469fa', label: '❤️ Cặp đôi' },
    { id: '34686b5e-6d51-4173-9f3e-31f91fb469fa', label: '👯 Nhóm bạn' },
];

// ─────────────────────────────────────────────
// Login Form
// ─────────────────────────────────────────────
function LoginForm({ onSwitch }: { onSwitch: () => void }) {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, error } = useSelector((s: RootState) => s.login);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await dispatch(loginThunk({ email, password }));
        if (loginThunk.fulfilled.match(result)) {
            navigate({ to: '/' });
        }
    };

    return (
        <div className="w-full max-w-md rounded-2xl bg-white px-10 py-12 shadow-2xl">
            <h2 className="mb-8 text-center font-bold text-[#00008A] text-3xl">Đăng nhập</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-600">Tên đăng nhập</label>
                    <input
                        type="email"
                        placeholder="Tên đăng nhập"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#00008A] focus:ring-2 focus:ring-[#00008A]/20"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-600">Mật khẩu</label>
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#00008A] focus:ring-2 focus:ring-[#00008A]/20"
                    />
                    <div className="mt-1 flex justify-end">
                        <button type="button" className="text-xs italic text-gray-400 hover:underline">
                            Quên mật khẩu?
                        </button>
                    </div>
                </div>

                {error && (
                    <p className="rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-500">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 rounded-xl bg-[#00008A] py-3 font-bold text-white transition hover:bg-[#0000aa] disabled:opacity-60"
                >
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>

                <p className="text-center text-sm">
                    <span className="text-gray-500">Bạn chưa có tài khoản? </span>
                    <button
                        type="button"
                        onClick={onSwitch}
                        className="font-semibold text-[#FFA500] hover:underline"
                    >
                        Đăng ký ngay
                    </button>
                </p>
            </form>
        </div>
    );
}

// ─────────────────────────────────────────────
// Register Form — chỉ thu thập dữ liệu, CHƯA gọi API
// ─────────────────────────────────────────────
function RegisterForm({
    onSwitch,
    onSuccess,
}: {
    onSwitch: () => void;
    onSuccess: (data: RegisterData) => void;
}) {

    const [form, setForm] = useState<RegisterData>({
        email: '',
        password: '',
        fullName: '',
        phone: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Không gọi API ở đây, chỉ chuyển sang bước chọn sở thích
        onSuccess(form);
    };

    return (
        <div className="w-full max-w-md rounded-2xl bg-white px-10 py-10 shadow-2xl">
            <h2 className="mb-7 text-center font-bold text-[#00008A] text-3xl">Đăng ký</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-600">Họ tên</label>
                    <input
                        name="fullName"
                        placeholder="Họ và tên"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#00008A] focus:ring-2 focus:ring-[#00008A]/20"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-600">Email</label>
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#00008A] focus:ring-2 focus:ring-[#00008A]/20"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-600">Số điện thoại</label>
                    <input
                        name="phone"
                        type="tel"
                        placeholder="Số điện thoại"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#00008A] focus:ring-2 focus:ring-[#00008A]/20"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-600">Mật khẩu</label>
                    <input
                        name="password"
                        type="password"
                        placeholder="Mật khẩu"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#00008A] focus:ring-2 focus:ring-[#00008A]/20"
                    />
                </div>

                <button
                    type="submit"
                    className="mt-2 rounded-xl bg-[#00008A] py-3 font-bold text-white transition hover:bg-[#0000aa]"
                >
                    Tiếp theo
                </button>

                <p className="text-center text-sm">
                    <span className="text-gray-500">Đã có tài khoản? </span>
                    <button
                        type="button"
                        onClick={onSwitch}
                        className="font-semibold text-[#FFA500] hover:underline"
                    >
                        Đăng nhập ngay
                    </button>
                </p>
            </form>
        </div>
    );
}

// ─────────────────────────────────────────────
// Interests — gọi API register rồi tự đăng nhập
// ─────────────────────────────────────────────
function InterestsStep({ registerData }: { registerData: RegisterData }) {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { loading: regLoading, error: regError } = useSelector((s: RootState) => s.register);
    const { loading: loginLoading } = useSelector((s: RootState) => s.login);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const loading = regLoading || loginLoading;

    const toggle = (i: number) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(i)) next.delete(i);
            else next.add(i);
            return next;
        });
    };

    const handleConfirm = async () => {
        // 1. Gọi API đăng ký
        const regResult = await dispatch(
            registerThunk({
                ...registerData,
                role: 2,
                categoryIds: ['34686b5e-6d51-4173-9f3e-31f91fb469fa'],
            }),
        );
        if (!registerThunk.fulfilled.match(regResult)) return;

        // 2. Tự đăng nhập với thông tin vừa đăng ký
        const loginResult = await dispatch(
            loginThunk({ email: registerData.email, password: registerData.password }),
        );
        if (loginThunk.fulfilled.match(loginResult)) {
            navigate({ to: '/' });
        }
    };

    return (
        <div className="w-full max-w-2xl rounded-2xl bg-white/90 backdrop-blur-md px-8 py-10 shadow-2xl">
            <div className="mb-8 flex flex-wrap justify-center gap-3">
                {HOBBY_CATEGORIES.map((cat, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => toggle(i)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${selected.has(i)
                            ? 'border-[#00008A] bg-[#00008A] text-white shadow-md'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-[#00008A] hover:text-[#00008A]'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {regError && (
                <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-500">{regError}</p>
            )}

            <div className="flex justify-center">
                <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="rounded-full bg-[#FFD700] px-10 py-3 font-bold text-[#00008A] shadow-lg transition hover:brightness-110 hover:shadow-xl disabled:opacity-60"
                >
                    {loading ? 'Đang xử lý...' : '👀 Khám phá ngay 👀'}
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// AuthPage (orchestrator)
// ─────────────────────────────────────────────
export function AuthPage() {
    const [step, setStep] = useState<AuthStep>('login');
    const [pendingRegData, setPendingRegData] = useState<RegisterData | null>(null);

    return (
        <div
            className="flex min-h-screen w-full items-center justify-center"
            style={{
                backgroundImage: `url(${bannerImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {step === 'login' && (
                <LoginForm onSwitch={() => setStep('register')} />
            )}
            {step === 'register' && (
                <RegisterForm
                    onSwitch={() => setStep('login')}
                    onSuccess={(data) => {
                        setPendingRegData(data);
                        setStep('interests');
                    }}
                />
            )}
            {step === 'interests' && pendingRegData && (
                <InterestsStep registerData={pendingRegData} />
            )}
        </div>
    );
}
