import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { loginThunk } from '../store/slice/LoginSlice';
import { registerThunk } from '../store/slice/RegisterSlice';
import { fetchCategoriesThunk } from '../store/slice/CategorySlice';
import AdministrativeUnitService, { type AdministrativeUnit } from '../services/AdministrativeUnitService';
import bannerImg from '../assets/images/banner.jpg';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type AuthStep = 'login' | 'register' | 'role-select' | 'interests';

interface RegisterData {
    email: string;
    password: string;
    fullName: string;
    phone: string;
}

interface RoleData {
    role: number; // 1 = Contributor, 2 = User
    administrativeUnitId?: string;
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
            const role = result.payload.user.role;
            if (role === 0) {
                navigate({ to: '/admin' });
            } else if (role === 1) {
                navigate({ to: '/contributor' });
            } else {
                navigate({ to: '/' });
            }
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
                    <div className="rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-500">
                        {error.includes('pending') || error.includes('PENDING')
                            ? 'Tài khoản đang chờ Admin duyệt. Vui lòng đợi hoặc liên hệ quản trị viên.'
                            : error.includes('Locked') || error.includes('LOCKED')
                                ? 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.'
                                : error
                        }
                    </div>
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
// Role Select — chọn vai trò + khu vực (nếu Contributor)
// ─────────────────────────────────────────────
function RoleSelectStep({
    onBack,
    onSuccess,
}: {
    onBack: () => void;
    onSuccess: (data: RoleData) => void;
}) {
    const [role, setRole] = useState<number | null>(null);
    const [adminLevel, setAdminLevel] = useState<'province' | 'ward'>('province');
    const [provinces, setProvinces] = useState<AdministrativeUnit[]>([]);
    const [wards, setWards] = useState<AdministrativeUnit[]>([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [loadingUnits, setLoadingUnits] = useState(false);
    const [error, setError] = useState('');

    // Load provinces when contributor is selected
    useEffect(() => {
        if (role === 1 && provinces.length === 0) {
            setLoadingUnits(true);
            AdministrativeUnitService.getByLevel(0)
                .then(res => {
                    if (res.success) setProvinces(res.data);
                })
                .finally(() => setLoadingUnits(false));
        }
    }, [role]);

    // Load wards when province is selected and admin level is ward
    useEffect(() => {
        if (adminLevel === 'ward' && selectedProvince) {
            setLoadingUnits(true);
            setWards([]);
            setSelectedWard('');
            AdministrativeUnitService.getChildren(selectedProvince)
                .then(res => {
                    if (res.success) setWards(res.data);
                })
                .finally(() => setLoadingUnits(false));
        }
    }, [adminLevel, selectedProvince]);

    const handleContinue = () => {
        if (role === null) {
            setError('Vui lòng chọn vai trò');
            return;
        }
        if (role === 2) {
            onSuccess({ role: 2 });
            return;
        }
        // Contributor
        if (adminLevel === 'province') {
            if (!selectedProvince) {
                setError('Vui lòng chọn tỉnh/thành phố');
                return;
            }
            onSuccess({ role: 1, administrativeUnitId: selectedProvince });
        } else {
            if (!selectedWard) {
                setError('Vui lòng chọn xã/phường');
                return;
            }
            onSuccess({ role: 1, administrativeUnitId: selectedWard });
        }
    };

    return (
        <div className="w-full max-w-lg rounded-2xl bg-white/95 backdrop-blur-md px-10 py-10 shadow-2xl">
            <h2 className="mb-2 text-center font-bold text-[#00008A] text-2xl">Bạn là ai?</h2>
            <p className="mb-6 text-center text-sm text-gray-500">Chọn vai trò phù hợp với bạn</p>

            {/* Role cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                    type="button"
                    onClick={() => { setRole(2); setError(''); }}
                    className={`rounded-xl border-2 p-5 text-left transition hover:shadow-md ${role === 2 ? 'border-[#00008A] bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                >
                    <div className="text-3xl mb-2">🧳</div>
                    <div className="font-bold text-gray-800">Người dùng</div>
                    <div className="text-xs text-gray-500 mt-1">Khám phá địa điểm, sự kiện du lịch</div>
                </button>
                <button
                    type="button"
                    onClick={() => { setRole(1); setError(''); }}
                    className={`rounded-xl border-2 p-5 text-left transition hover:shadow-md ${role === 1 ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                >
                    <div className="text-3xl mb-2">📋</div>
                    <div className="font-bold text-gray-800">Người cung cấp</div>
                    <div className="text-xs text-gray-500 mt-1">Quản lý địa điểm, sự kiện khu vực</div>
                </button>
            </div>

            {/* Administrative unit selection for Contributor */}
            {role === 1 && (
                <div className="space-y-4 mb-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Cấp quản lý</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setAdminLevel('province'); setSelectedWard(''); }}
                                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${adminLevel === 'province' ? 'bg-emerald-600 text-white shadow' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                            >
                                Cấp Tỉnh/Thành phố
                            </button>
                            <button
                                type="button"
                                onClick={() => setAdminLevel('ward')}
                                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${adminLevel === 'ward' ? 'bg-emerald-600 text-white shadow' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                            >
                                Cấp Xã/Phường
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            {adminLevel === 'province' ? 'Chọn Tỉnh/Thành phố' : 'Chọn Tỉnh/Thành phố (để lọc xã)'}
                        </label>
                        <select
                            value={selectedProvince}
                            onChange={e => { setSelectedProvince(e.target.value); setSelectedWard(''); }}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        >
                            <option value="">— Chọn tỉnh/thành phố —</option>
                            {provinces.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {adminLevel === 'ward' && selectedProvince && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Chọn Xã/Phường</label>
                            {loadingUnits ? (
                                <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                                    Đang tải...
                                </div>
                            ) : wards.length === 0 ? (
                                <p className="text-sm text-gray-400 py-2">Không có xã/phường nào</p>
                            ) : (
                                <select
                                    value={selectedWard}
                                    onChange={e => setSelectedWard(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                >
                                    <option value="">— Chọn xã/phường —</option>
                                    {wards.map(w => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                </div>
            )}

            {error && (
                <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-500">{error}</p>
            )}

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 rounded-xl border border-gray-300 py-3 font-medium text-gray-600 transition hover:bg-gray-50"
                >
                    Quay lại
                </button>
                <button
                    type="button"
                    onClick={handleContinue}
                    disabled={loadingUnits}
                    className="flex-1 rounded-xl bg-[#00008A] py-3 font-bold text-white transition hover:bg-[#0000aa] disabled:opacity-60"
                >
                    Tiếp theo
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Interests — fetch categories từ API, gọi register rồi tự đăng nhập
// ─────────────────────────────────────────────
function InterestsStep({ registerData, roleData }: { registerData: RegisterData; roleData: RoleData }) {
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

    const [registerSuccess, setRegisterSuccess] = useState(false);

    const handleConfirm = async () => {
        const categoryIds = selected.size > 0 ? Array.from(selected) : [];

        // 1. Gọi API đăng ký
        const regResult = await dispatch(
            registerThunk({
                ...registerData,
                role: roleData.role,
                administrativeUnitId: roleData.administrativeUnitId,
                categoryIds,
            }),
        );
        if (!registerThunk.fulfilled.match(regResult)) return;

        // 2. Contributor cần admin duyệt → không auto-login
        if (roleData.role === 1) {
            setRegisterSuccess(true);
            return;
        }

        // 3. User thường → tự đăng nhập
        const loginResult = await dispatch(
            loginThunk({ email: registerData.email, password: registerData.password }),
        );
        if (loginThunk.fulfilled.match(loginResult)) {
            const role = loginResult.payload.user.role;
            if (role === 0) {
                navigate({ to: '/admin' });
            } else {
                navigate({ to: '/' });
            }
        }
    };

    // Contributor registered successfully — show pending message
    if (registerSuccess) {
        return (
            <div className="w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-md px-8 py-10 shadow-2xl text-center">
                <div className="text-5xl mb-4">⏳</div>
                <h2 className="mb-3 font-bold text-emerald-700 text-2xl">Đăng ký thành công!</h2>
                <p className="text-gray-600 mb-2">
                    Tài khoản của bạn đang chờ được <span className="font-semibold">Admin duyệt</span>.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                    Bạn sẽ có thể đăng nhập sau khi tài khoản được phê duyệt.
                    Vui lòng liên hệ quản trị viên nếu cần hỗ trợ.
                </p>
                <button
                    onClick={() => navigate({ to: '/auth' })}
                    className="rounded-xl bg-[#00008A] px-8 py-3 font-bold text-white transition hover:bg-[#0000aa]"
                >
                    Về trang đăng nhập
                </button>
            </div>
        );
    }

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
    const [pendingRoleData, setPendingRoleData] = useState<RoleData | null>(null);

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
                        setStep('role-select');
                    }}
                />
            )}
            {step === 'role-select' && pendingRegData && (
                <RoleSelectStep
                    onBack={() => setStep('register')}
                    onSuccess={(data) => {
                        setPendingRoleData(data);
                        setStep('interests');
                    }}
                />
            )}
            {step === 'interests' && pendingRegData && pendingRoleData && (
                <InterestsStep registerData={pendingRegData} roleData={pendingRoleData} />
            )}
        </div>
    );
}
