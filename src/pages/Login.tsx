import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, KeyRound, CheckCircle2, HelpCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { login } from '../features/auth/authSlice';
import { pushToast } from '../features/ui/uiSlice';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
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
    if (!email.trim()) e.email = t('login_error_username_required');
    if (!password.trim()) e.password = t('login_error_password_required');
    else if (password.length < 4) e.password = t('login_error_password_min');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await dispatch(login({ email: email.trim(), password }));
    if (login.fulfilled.match(result)) {
      dispatch(pushToast(t('welcome_back_name', { name: result.payload.user.fullName }), 'success'));
      const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';
      navigate(from, { replace: true });
    } else {
      dispatch(pushToast((result.payload as string) ?? t('login_failed'), 'error'));
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      dispatch(pushToast(t('forgot_email_required'), 'error'));
      return;
    }
    setForgotSubmitted(true);
    dispatch(pushToast(t('forgot_request_logged'), 'success'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 px-4 py-12 relative overflow-hidden">
      {/* Top right language/theme & intro link bar */}
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
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">{t('username_or_email')}</label>
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
              <label className="block text-sm font-medium text-ink-700 mb-1.5">{t('password')}</label>
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-ink-600 cursor-pointer select-none">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-ink-300 text-brand-700 focus:ring-brand-500" />
                {t('remember_me')}
              </label>
              <button
                type="button"
                onClick={() => { setForgotSubmitted(false); setForgotOpen(true); }}
                className="text-sm text-brand-700 hover:text-brand-800 font-medium"
              >
                {t('forgot_password')}
              </button>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={status === 'loading'}>
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
        title={t('forgot_modal_title')}
        size="md"
        footer={
          <Button variant="outline" onClick={() => setForgotOpen(false)}>
            {t('close')}
          </Button>
        }
      >
        {forgotSubmitted ? (
          <div className="text-center py-4 space-y-3">
            <div className="size-12 mx-auto rounded-full bg-success-100 text-success-600 flex items-center justify-center">
              <CheckCircle2 className="size-6" />
            </div>
            <h3 className="text-base font-semibold text-ink-900">{t('forgot_dispatched_title')}</h3>
            <p className="text-xs text-ink-500 leading-relaxed max-w-sm mx-auto">
              {t('forgot_dispatched_body_prefix')} <span className="font-semibold text-ink-800">{forgotEmail}</span>, {t('forgot_dispatched_body_suffix')}
            </p>
            <div className="p-3 bg-ink-50 dark:bg-ink-200/50 rounded-xl text-left text-xs space-y-1.5 border border-ink-100">
              <p className="font-semibold text-ink-800 flex items-center gap-1.5">
                <HelpCircle className="size-3.5 text-brand-600" /> {t('need_instant_help')}
              </p>
              <p className="text-ink-600">{t('ict_helpdesk_label')} <span className="font-medium text-ink-800">{sysConfig.contactPhone}</span></p>
              <p className="text-ink-600">{t('email')}: <span className="font-medium text-ink-800">{sysConfig.contactEmail}</span></p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-brand-50 rounded-xl text-xs text-brand-800 border border-brand-100">
              <KeyRound className="size-5 text-brand-600 shrink-0 mt-0.5" />
              <p>
                {t('forgot_instructions')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">{t('institutional_email_label')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. netsanet.fikru@osta.gov.et"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              {t('request_password_reset')}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
