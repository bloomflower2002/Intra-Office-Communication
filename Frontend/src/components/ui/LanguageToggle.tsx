import { useTranslation } from 'react-i18next';
import { setLanguage } from '../../i18n';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const current = i18n.language || 'en';

  const nextLang = current === 'en' ? 'om' : current === 'om' ? 'am' : 'en';

  const label = current === 'om' ? 'A.O' : current === 'am' ? 'አማ' : 'EN';
  const title =
    current === 'om'
      ? 'Afaan Oromoo (Switch to አማርኛ)'
      : current === 'am'
      ? 'አማርኛ (Switch to English)'
      : 'English (Switch to Afaan Oromoo)';

  return (
    <button
      type="button"
      onClick={() => setLanguage(nextLang)}
      aria-label={title}
      title={title}
      className="px-2.5 h-8 rounded-lg text-xs font-bold text-ink-600 hover:bg-ink-100 hover:text-ink-900 border border-ink-200 transition-colors flex items-center justify-center min-w-[2.5rem] bg-white shadow-2xs"
    >
      {label}
    </button>
  );
}
