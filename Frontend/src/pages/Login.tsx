import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { loginStart, loginSuccess } from '../features/auth/authSlice';
import { pushToast } from '../features/ui/uiSlice';
import Button from '../components/ui/Button';
import type { Role } from '../types';
import logo from '../assets/logo.png';
const roles: Role[] = ['System Admin', 'Head Office', 'Director', 'Team Leader', 'Employee'];

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useAppSelector((s) => s.auth.status);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [role, setRole] = useState<Role>('Employee');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Username or email is required.';
    if (!password.trim()) e.password = 'Password is required.';
    else if (password.length < 4) e.password = 'Password must be at least 4 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(loginStart());
    await new Promise((r) => setTimeout(r, 700));
    dispatch(loginSuccess({ role }));
    dispatch(pushToast(`Welcome back — signed in as ${role}.`, 'success'));
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />

      <div className="w-full max-w-md relative animate-slide-up">
        <div className="text-center mb-6">
          <div className="size-14 mx-auto rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden mb-4">
  <img src={logo} alt="OSTA Logo" className="w-full h-full object-cover" />
</div>
          <h1 className="text-xl font-semibold text-white">Oromia Science & Technology Authority</h1>
          <p className="text-brand-200 text-sm mt-1">Intra-Office Communication Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-7 sm:p-8">
          <h2 className="text-lg font-semibold text-ink-900 mb-1">Sign in to your account</h2>
          <p className="text-sm text-ink-400 mb-6">Enter your credentials to access IOCMS.</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Username or Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="text"
                  placeholder="you@osta.gov.et"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                    errors.email ? 'border-danger-500 focus:border-danger-500' : 'border-ink-200 focus:border-brand-500'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-danger-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                    errors.password ? 'border-danger-500 focus:border-danger-500' : 'border-ink-200 focus:border-brand-500'
                  }`}
                />
              </div>
              {errors.password && <p className="text-xs text-danger-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-brand-600" /> Demo role (for preview)</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white"
              >
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-ink-600 cursor-pointer select-none">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-ink-300 text-brand-700 focus:ring-brand-500" />
                Remember me
              </label>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-sm text-brand-700 hover:text-brand-800 font-medium">Forgot password?</a>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={status === 'loading'}>
              {status === 'loading' ? 'Signing in…' : 'Login'}
            </Button>
          </form>
        </div>
        <p className="text-center text-brand-200/70 text-xs mt-6">© 2026 Oromia Science and Technology Authority. All rights reserved.</p>
      </div>
    </div>
  );
}
