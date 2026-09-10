import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { login, logout } from '../features/auth/authSlice';
import { pushToast } from '../features/ui/uiSlice';
import Button from '../components/ui/Button';

export default function AdminLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useAppSelector((s) => s.auth.status);
  const sysConfig = useAppSelector((s) => s.systemConfig);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Administrator ID and password are required.');
      return;
    }

    let loginEmail = email.trim();
    if (!loginEmail.includes('@')) {
      loginEmail = `${loginEmail}@osta.gov.et`;
    }

    const result = await dispatch(login({ email: loginEmail, password }));
    if (login.fulfilled.match(result)) {
      if (result.payload.user.role !== 'System Admin') {
        // Not an admin account — this portal is restricted.
        dispatch(logout());
        setError('This portal is reserved for System Administrator accounts.');
        return;
      }
      dispatch(pushToast(`Welcome back, ${result.payload.user.fullName}.`, 'success'));
      const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';
      navigate(from, { replace: true });
    } else {
      setError((result.payload as string) ?? 'Invalid administrator credentials.');
    }
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center bg-ink-950 px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />

      <div className="w-full max-w-sm relative animate-slide-up">
        <div className="text-center mb-6">
          <div className="size-14 mx-auto rounded-2xl bg-ink-800 shadow-lg flex items-center justify-center mb-4">
            <ShieldCheck className="size-7 text-brand-400" />
          </div>
          <h1 className="text-lg font-semibold text-white">{sysConfig.orgShortName ?? sysConfig.orgName}</h1>
          <p className="text-ink-400 text-xs mt-1 uppercase tracking-wide">System Administrator Access</p>
        </div>

        <div className="bg-ink-900 border border-ink-800 rounded-2xl shadow-2xl p-6 sm:p-7">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-300 mb-1.5">Administrator ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-500" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="text"
                  autoFocus
                  placeholder="admin@osta.gov.et"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-ink-700 bg-ink-800 text-sm text-white placeholder:text-ink-500 outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-500" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-ink-700 bg-ink-800 text-sm text-white placeholder:text-ink-500 outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {error && <p className="text-xs text-danger-500">{error}</p>}

            <Button type="submit" size="lg" className="w-full font-semibold" loading={status === 'loading'}>
              {status === 'loading' ? 'Verifying…' : 'Access Admin Console'}
            </Button>
          </form>
        </div>

        <p className="text-center text-ink-500 text-[11px] mt-6">
          Restricted access. Unauthorized use is logged and monitored.
        </p>
      </div>
    </div>
  );
}
