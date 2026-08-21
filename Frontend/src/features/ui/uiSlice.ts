import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ToastMessage } from '../../types';

interface UIState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  notificationsPanelOpen: boolean;
  toasts: ToastMessage[];
}

const initialState: UIState = {
  sidebarCollapsed: localStorage.getItem('iocms_sidebar_collapsed') === 'true',
  mobileSidebarOpen: false,
  notificationsPanelOpen: false,
  toasts: [],
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
  },
});

export const {
  toggleSidebar, setMobileSidebarOpen, toggleNotificationsPanel,
  closeNotificationsPanel, pushToast, dismissToast,
} = uiSlice.actions;
export default uiSlice.reducer;
