import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { loginThunk } from '../store/slice/LoginSlice';
import { registerThunk } from '../store/slice/RegisterSlice';
import { fetchCategoriesThunk } from '../store/slice/CategorySlice';
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

// Emoji map for category types displayed in interests
const TYPE_EMOJI: Record<string, string> = {
    theme: '🗺️',
    style: '✨',
    activity: '🏃',
    budget: '💰',
    companion: '👥',
    tourism: '🌏',
    food: '🍜',
    accommodation: '🏨',
    entertainment: '🎉',
    shopping: '🛍️',
    event: '🎊',
};

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
// Register Form — thu thập dữ liệu, chưa gọi API
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
// Interests — fetch categories từ API, gọi register rồi tự đăng nhập
// ─────────────────────────────────────────────
function InterestsStep({ registerData }: { registerData: RegisterData }) {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { loading: regLoading, error: regError } = useSelector((s: RootState) => s.register);
    const { loading: loginLoading } = useSelector((s: RootState) => s.login);
    const { items: categories, loading: catLoading, error: catError } = useSelector(
        (s: RootState) => s.category,
    );

    const [selected, setSelected] = useState<Set<string>>(new Set());
    const loading = regLoading || loginLoading;

    // Fetch categories on mount
    useEffect(() => {
        dispatch(fetchCategoriesThunk());
    }, [dispatch]);

    const toggle = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleConfirm = async () => {
        const categoryIds = selected.size > 0 ? Array.from(selected) : [];

        // 1. Gọi API đăng ký với các category đã chọn
        const regResult = await dispatch(
            registerThunk({
                ...registerData,
                role: 2,
                categoryIds,
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
            <h2 className="mb-2 text-center font-bold text-[#00008A] text-2xl">Bạn thích gì?</h2>
            <p className="mb-6 text-center text-sm text-gray-500">
                Chọn những sở thích phù hợp với bạn để chúng tôi gợi ý tốt hơn
            </p>

            {catLoading && (
                <div className="mb-6 flex justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00008A] border-t-transparent" />
                </div>
            )}

            {catError && (
                <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-500">
                    {catError}
                </p>
            )}

            {!catLoading && categories.length > 0 && (
                <div className="mb-8 flex flex-wrap justify-center gap-3">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggle(cat.id)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                                selected.has(cat.id)
                                    ? 'border-[#00008A] bg-[#00008A] text-white shadow-md'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-[#00008A] hover:text-[#00008A]'
                            }`}
                        >
                            {TYPE_EMOJI[cat.type] ?? '📌'} {cat.name}
                        </button>
                    ))}
                </div>
            )}

            {regError && (
                <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-500">{regError}</p>
            )}

            <div className="flex flex-col items-center gap-3">
                <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="rounded-full bg-[#FFD700] px-10 py-3 font-bold text-[#00008A] shadow-lg transition hover:brightness-110 hover:shadow-xl disabled:opacity-60"
                >
                    {loading ? 'Đang xử lý...' : '👀 Khám phá ngay 👀'}
                </button>
                {selected.size === 0 && !catLoading && (
                    <p className="text-xs text-gray-400">Bạn có thể bỏ qua bước này nếu chưa muốn chọn</p>
                )}
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
