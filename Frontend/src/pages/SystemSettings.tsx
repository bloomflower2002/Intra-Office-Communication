import { useTranslation } from 'react-i18next';
import { SystemSettings as SystemSettingsPanel } from './Admin';

export default function SystemSettingsPage() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-2xl mb-1">{t('nav_system_settings') || 'System Settings'}</h1>
      <p className="text-sm text-ink-400 mb-5">
        {t('manage_system_branding_settings') || 'Configure organization branding, portal content, and platform-wide settings.'}
      </p>
      <SystemSettingsPanel />
    </div>
  );
}
