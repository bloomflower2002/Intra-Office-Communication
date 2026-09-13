import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import defaultLogo from '../../assets/logo.png';

export interface SystemConfigState {
  orgName: string;
  orgShortName: string;
  systemName: string;
  systemTagline: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  copyrightText: string;
  introHeroTitle: string;
  introHeroSubtitle: string;
  introOverviewText: string;
  maxAttachmentSizeMb: number;
  notifyOnMemo: boolean;
  notifyOnMessage: boolean;
  maintenanceMode: boolean;
  // Email / SMTP Live Delivery Settings
  enableLiveEmailDelivery: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  smtpSenderName: string;
}

const STORAGE_KEY = 'iocms_system_config_v1';

const defaultState: SystemConfigState = {
  orgName: 'Oromia Science & Technology Authority',
  orgShortName: 'OSTA',
  systemName: 'Intra-Office Communication Management System',
  systemTagline: 'Empowering Administrative Efficiency, Transparent Memo Routing & Secure Internal Collaboration',
  logoUrl: defaultLogo,
  contactEmail: 'support@osta.gov.et',
  contactPhone: '+251 (0) 11 550 4848',
  contactAddress: 'Addis Ababa / Finfinnee, Oromia, Ethiopia',
  copyrightText: '© 2026 Oromia Science & Technology Authority. All rights reserved.',
  introHeroTitle: 'Experience Modern Intra-Office Communication at OSTA',
  introHeroSubtitle: 'A unified digital ecosystem engineered for real-time institutional memos, multi-tier hierarchical approvals, secure messaging, and document lifecycle governance.',
  introOverviewText: 'IOCMS eliminates administrative latency by modernizing paper-based memo routing into automated digital workflows with real-time auditability and role-based accountability.',
  maxAttachmentSizeMb: 15,
  notifyOnMemo: true,
  notifyOnMessage: true,
  maintenanceMode: false,
  enableLiveEmailDelivery: true,
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: 'notifications@osta.gov.et',
  smtpPass: '',
  smtpSenderName: 'OSTA IOCMS Gateway',
};

const loadInitialState = (): SystemConfigState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...defaultState, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to load system config from storage:', err);
  }
  return defaultState;
};

const systemConfigSlice = createSlice({
  name: 'systemConfig',
  initialState: loadInitialState(),
  reducers: {
    updateSystemConfig: (state, action: PayloadAction<Partial<SystemConfigState>>) => {
      Object.assign(state, action.payload);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error('Failed to persist system config:', err);
      }
    },
    resetSystemConfig: (state) => {
      Object.assign(state, defaultState);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.error('Failed to clear system config storage:', err);
      }
    },
  },
});

export const { updateSystemConfig, resetSystemConfig } = systemConfigSlice.actions;
export default systemConfigSlice.reducer;
