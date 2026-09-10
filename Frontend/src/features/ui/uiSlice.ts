import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ToastMessage } from '../../types';

export type Theme = 'light' | 'dark';

interface UIState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  notificationsPanelOpen: boolean;
  toasts: ToastMessage[];
  theme: Theme;
}

// Default is always light unless the user has explicitly chosen dark before.
const storedTheme = localStorage.getItem('iocms_theme');
const initialTheme: Theme = storedTheme === 'dark' ? 'dark' : 'light';

const initialState: UIState = {
  sidebarCollapsed: localStorage.getItem('iocms_sidebar_collapsed') === 'true',
  mobileSidebarOpen: false,
  notificationsPanelOpen: false,
  toasts: [],
  theme: initialTheme,
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
  },
});

export const {
  toggleSidebar, setMobileSidebarOpen, toggleNotificationsPanel,
  closeNotificationsPanel, pushToast, dismissToast, toggleTheme, setTheme,
} = uiSlice.actions;
export default uiSlice.reducer;
