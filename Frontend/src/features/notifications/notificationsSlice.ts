import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '../../types';
import { notifications as mockNotifications } from '../../mocks/mockData';

interface NotificationsState {
  items: Notification[];
}

const initialState: NotificationsState = {
  items: mockNotifications,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markRead(state, action: PayloadAction<string>) {
      const n = state.items.find((i) => i.id === action.payload);
      if (n) n.read = true;
    },
    markAllRead(state) {
      state.items.forEach((i) => { i.read = true; });
    },
  },
});

export const { markRead, markAllRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
