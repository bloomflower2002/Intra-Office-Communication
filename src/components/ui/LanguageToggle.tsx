import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { setLanguage, supportedLanguages, type SupportedLanguage } from '../../i18n';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current =
    supportedLanguages.find((l) => l.code === i18n.language) || supportedLanguages[0];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change language"
        title="Change language"
        className="px-2.5 h-8 rounded-lg text-xs font-semibold text-ink-500 hover:bg-ink-100 hover:text-ink-800 transition-colors flex items-center gap-1 justify-center min-w-[2.25rem]"
      >
        <Globe className="size-3.5" />
        {current.nativeLabel}
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 rounded-lg border border-ink-200 bg-white dark:bg-ink-100 shadow-lg py-1 z-50">
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang.code as SupportedLanguage);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-ink-50 dark:hover:bg-ink-200 ${
                current.code === lang.code ? 'text-brand-700 font-semibold' : 'text-ink-600'
              }`}
            >
              <span>{lang.label}</span>
              <span className="text-ink-400">{lang.nativeLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
