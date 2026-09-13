import { Sun, Moon, Globe, Type, CalendarClock, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { setTheme, setFontSize, setDateFormat, type FontSize, type DateFormat } from '../features/ui/uiSlice';
import { pushToast } from '../features/ui/uiSlice';
import { setLanguage, supportedLanguages, type SupportedLanguage } from '../i18n';
import { formatDateByPref } from '../utils/date';

/**
 * Personal "environment" settings — theme, language, font size, date format.
 * Every authenticated user can control these for their own account; they
 * only affect how the app looks/reads for that person. This is intentionally
 * separate from System Settings (organization branding, policies, roles),
 * which only System Admin can change and which applies to everyone.
 */
export default function Preferences() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.ui.theme);
  const fontSize = useAppSelector((s) => s.ui.fontSize);
  const dateFormat = useAppSelector((s) => s.ui.dateFormat);
  const currentLang = (localStorage.getItem('iocms.lang') as SupportedLanguage) || 'en';

  const now = new Date().toISOString();

  const fontSizeOptions: { value: FontSize; labelKey: string }[] = [
    { value: 'sm', labelKey: 'font_size_small' },
    { value: 'md', labelKey: 'font_size_medium' },
    { value: 'lg', labelKey: 'font_size_large' },
  ];

  const dateFormatOptions: { value: DateFormat; sample: string }[] = [
    { value: 'dmy', sample: formatDateByPref(now, 'dmy') },
    { value: 'mdy', sample: formatDateByPref(now, 'mdy') },
    { value: 'ymd', sample: formatDateByPref(now, 'ymd') },
  ];

  const handleSaveNote = () => dispatch(pushToast(t('preferences_saved'), 'success'));

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl mb-1">{t('nav_preferences')}</h1>
      <p className="text-sm text-ink-400 mb-2">{t('preferences_subtitle')}</p>
      <p className="text-xs text-ink-400 flex items-center gap-1.5 mb-5">
        <ShieldAlert className="size-3.5 shrink-0" />
        {t('preferences_admin_note')}
      </p>

      <div className="space-y-5">
        {/* ── Appearance ─────────────────────────────────────────── */}
        <Card>
          <CardHeader><h3 className="text-sm font-semibold">{t('pref_appearance')}</h3></CardHeader>
          <CardBody className="space-y-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-medium text-ink-700">{t('pref_theme')}</p>
                <p className="text-xs text-ink-400">{t('pref_theme_desc')}</p>
              </div>
              <div className="inline-flex rounded-lg border border-ink-200 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => { dispatch(setTheme('light')); handleSaveNote(); }}
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    theme === 'light' ? 'bg-brand-700 text-white' : 'text-ink-600 hover:bg-ink-100',
                  )}
                >
                  <Sun className="size-3.5" /> {t('pref_theme_light')}
                </button>
                <button
                  type="button"
                  onClick={() => { dispatch(setTheme('dark')); handleSaveNote(); }}
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    theme === 'dark' ? 'bg-brand-700 text-white' : 'text-ink-600 hover:bg-ink-100',
                  )}
                >
                  <Moon className="size-3.5" /> {t('pref_theme_dark')}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-medium text-ink-700 flex items-center gap-1.5"><Globe className="size-3.5" /> {t('pref_language')}</p>
                <p className="text-xs text-ink-400">{t('pref_language_desc')}</p>
              </div>
              <div className="inline-flex rounded-lg border border-ink-200 p-1 gap-1">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => { setLanguage(lang.code as SupportedLanguage); handleSaveNote(); }}
                    className={clsx(
                      'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                      currentLang === lang.code ? 'bg-brand-700 text-white' : 'text-ink-600 hover:bg-ink-100',
                    )}
                  >
                    {lang.nativeLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-medium text-ink-700 flex items-center gap-1.5"><Type className="size-3.5" /> {t('pref_font_size')}</p>
                <p className="text-xs text-ink-400">{t('pref_font_size_desc')}</p>
              </div>
              <div className="inline-flex rounded-lg border border-ink-200 p-1 gap-1">
                {fontSizeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { dispatch(setFontSize(opt.value)); handleSaveNote(); }}
                    className={clsx(
                      'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                      fontSize === opt.value ? 'bg-brand-700 text-white' : 'text-ink-600 hover:bg-ink-100',
                    )}
                  >
                    {t(opt.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ── Date & Time ────────────────────────────────────────── */}
        <Card>
          <CardHeader><h3 className="text-sm font-semibold flex items-center gap-1.5"><CalendarClock className="size-4" /> {t('pref_date_time')}</h3></CardHeader>
          <CardBody className="space-y-3">
            <div>
              <p className="text-sm font-medium text-ink-700">{t('pref_date_format')}</p>
              <p className="text-xs text-ink-400 mb-3">{t('pref_date_format_desc')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {dateFormatOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { dispatch(setDateFormat(opt.value)); handleSaveNote(); }}
                    className={clsx(
                      'text-left px-3 py-2.5 rounded-lg border text-xs transition-colors',
                      dateFormat === opt.value
                        ? 'border-brand-600 bg-brand-50 text-brand-800'
                        : 'border-ink-200 text-ink-600 hover:bg-ink-50',
                    )}
                  >
                    <span className="block font-semibold uppercase tracking-wide text-[10px] text-ink-400 mb-0.5">{opt.value}</span>
                    <span className="block font-mono text-ink-800">{t('date_format_preview')} {opt.sample}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
