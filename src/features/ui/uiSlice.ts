import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ToastMessage } from '../../types';

export type Theme = 'light' | 'dark';
export type FontSize = 'sm' | 'md' | 'lg';
export type DateFormat = 'dmy' | 'mdy' | 'ymd';

interface UIState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  notificationsPanelOpen: boolean;
  toasts: ToastMessage[];
  theme: Theme;
  fontSize: FontSize;
  dateFormat: DateFormat;
}

// Default is always light unless the user has explicitly chosen dark before.
const storedTheme = localStorage.getItem('iocms_theme');
const initialTheme: Theme = storedTheme === 'dark' ? 'dark' : 'light';

const storedFontSize = localStorage.getItem('iocms_font_size');
const initialFontSize: FontSize = storedFontSize === 'sm' || storedFontSize === 'lg' ? storedFontSize : 'md';

const storedDateFormat = localStorage.getItem('iocms_date_format');
const initialDateFormat: DateFormat =
  storedDateFormat === 'mdy' || storedDateFormat === 'ymd' ? storedDateFormat : 'dmy';

const initialState: UIState = {
  sidebarCollapsed: localStorage.getItem('iocms_sidebar_collapsed') === 'true',
  mobileSidebarOpen: false,
  notificationsPanelOpen: false,
  toasts: [],
  theme: initialTheme,
  fontSize: initialFontSize,
  dateFormat: initialDateFormat,
};

let toastId = 0;

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('iocms_sidebar_collapsed', String(state.sidebarCollapsed));
    },
    setMobileSidebarOpen(state, action: PayloadAction<boolean>) {
      state.mobileSidebarOpen = action.payload;
    },
    toggleNotificationsPanel(state) {
      state.notificationsPanelOpen = !state.notificationsPanelOpen;
    },
    closeNotificationsPanel(state) {
      state.notificationsPanelOpen = false;
    },
    pushToast: {
      reducer(state, action: PayloadAction<ToastMessage>) {
        state.toasts.push(action.payload);
      },
      prepare(message: string, type: ToastMessage['type'] = 'info') {
        return { payload: { id: `toast-${++toastId}`, message, type } };
      },
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('iocms_theme', state.theme);
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      localStorage.setItem('iocms_theme', state.theme);
    },
    setFontSize(state, action: PayloadAction<FontSize>) {
      state.fontSize = action.payload;
      localStorage.setItem('iocms_font_size', state.fontSize);
    },
    setDateFormat(state, action: PayloadAction<DateFormat>) {
      state.dateFormat = action.payload;
      localStorage.setItem('iocms_date_format', state.dateFormat);
    },
  },
});

export const {
  toggleSidebar, setMobileSidebarOpen, toggleNotificationsPanel,
  closeNotificationsPanel, pushToast, dismissToast, toggleTheme, setTheme,
  setFontSize, setDateFormat,
} = uiSlice.actions;
export default uiSlice.reducer;
