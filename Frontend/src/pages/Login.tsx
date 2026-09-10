import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { login } from '../features/auth/authSlice';
import { pushToast } from '../features/ui/uiSlice';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../components/ui/ThemeToggle';
import LanguageToggle from '../components/ui/LanguageToggle';

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useAppSelector((s) => s.auth.status);
  const sysConfig = useAppSelector((s) => s.systemConfig);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Username or institutional email is required.';
    if (!password.trim()) e.password = 'Password is required.';
    else if (password.length < 4) e.password = 'Password must be at least 4 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let loginEmail = email.trim();
    if (!loginEmail.includes('@')) {
      loginEmail = `${loginEmail}@osta.gov.et`;
    }

    const result = await dispatch(login({ email: loginEmail, password }));
    if (login.fulfilled.match(result)) {
      dispatch(pushToast(`Welcome back, ${result.payload.user.fullName}.`, 'success'));
      const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';
      navigate(from, { replace: true });
    } else {
      dispatch(pushToast((result.payload as string) ?? 'Invalid username, email, or password.', 'error'));
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      dispatch(pushToast('Please enter your institutional email.', 'error'));
      return;
    }
    setForgotSubmitted(true);
    dispatch(pushToast('Password recovery request logged. Check your inbox or reach out to ICT support.', 'success'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 px-4 py-12 relative overflow-hidden">
      {/* Top right language/theme & intro bar */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <Link
          to="/intro"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
        >
          {t('about_iocms', 'System Overview & Intro')} →
        </Link>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-0.5 flex items-center text-white">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />

      <div className="w-full max-w-md relative animate-slide-up">
        <div className="text-center mb-6">
          <div className="size-14 mx-auto rounded-2xl bg-white dark:bg-ink-100 shadow-lg flex items-center justify-center overflow-hidden mb-4 p-1">
            <img src={sysConfig.logoUrl} alt={sysConfig.orgShortName} className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-semibold text-white">{sysConfig.orgName}</h1>
          <p className="text-brand-200 text-sm mt-1">{sysConfig.systemName}</p>
        </div>

        <div className="bg-white dark:bg-ink-100 rounded-2xl shadow-2xl p-7 sm:p-8">
          <h2 className="text-lg font-semibold text-ink-900 mb-1">{t('sign_in_to_your_account')}</h2>
          <p className="text-sm text-ink-400 mb-6">{t('enter_your_credentials_to_access_iocms')}</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Username or Email */}
            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">
                {t('username_or_email')} <span className="text-danger-500">*</span>
              </label>
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

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">
                {t('password')} <span className="text-danger-500">*</span>
              </label>
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-ink-600 dark:text-ink-300">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-ink-300 text-brand-700 focus:ring-brand-500"
                />
                <span>{t('remember_me')}</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotSubmitted(false);
                  setForgotEmail(email);
                  setForgotOpen(true);
                }}
                className="text-brand-700 dark:text-brand-300 hover:underline font-medium text-xs"
              >
                {t('forgot_password')}
              </button>
            </div>

            {/* Single Standard Login Button */}
            <Button type="submit" size="lg" className="w-full font-semibold" loading={status === 'loading'}>
              {status === 'loading' ? t('signing_in') : t('login')}
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-ink-100 dark:border-ink-200/60 text-center">
            <Link
              to="/intro"
              className="text-xs text-brand-700 dark:text-brand-300 hover:underline font-medium inline-flex items-center gap-1"
            >
              <span>{t('learn_more_about_iocms', 'New to IOCMS? Explore System Introduction & Tour')}</span>
              <span>→</span>
            </Link>
          </div>
        </div>
        <p className="text-center text-brand-200/70 text-xs mt-6">{sysConfig.copyrightText}</p>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Account Access Recovery"
        size="md"
        footer={
          <Button variant="outline" onClick={() => setForgotOpen(false)}>
            Close
          </Button>
        }
      >
        {forgotSubmitted ? (
          <div className="text-center py-4 space-y-3">
            <CheckCircle2 className="size-12 text-success-500 mx-auto" />
            <h3 className="font-medium text-ink-900">Recovery Instructions Dispatched</h3>
            <p className="text-sm text-ink-600">
              A secure password reset link has been dispatched to{' '}
              <strong className="text-ink-900">{forgotEmail}</strong> if it exists in the OSTA institutional directory.
            </p>
            <p className="text-xs text-ink-400">
              For urgent clearance resets, please contact the ICT Bureau Helpdesk with your staff badge ID.
            </p>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4 py-2">
            <div className="flex items-start gap-3 p-3 bg-brand-50/60 rounded-xl border border-brand-100">
              <KeyRound className="size-5 text-brand-700 shrink-0 mt-0.5" />
              <p className="text-xs text-brand-900 leading-relaxed">
                Enter your institutional government email address (e.g., <code className="font-mono text-brand-800">user@osta.gov.et</code>).
                We will send you a temporary authentication token.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Institutional Email</label>
              <input
                type="email"
                required
                placeholder="name@osta.gov.et"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-3 py-2 border border-ink-200 rounded-lg text-sm focus:border-brand-500 outline-none"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setForgotOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Send Reset Token</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
