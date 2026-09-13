import { useTranslation } from 'react-i18next';
import { SystemSettings } from './Admin';

export default function SystemSettingsPage() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl mb-1">{t('tab_system_settings')}</h1>
        <p className="text-sm text-ink-400">{t('system_settings_subtitle')}</p>
      </div>

      <SystemSettings />
    </div>
  );
}
