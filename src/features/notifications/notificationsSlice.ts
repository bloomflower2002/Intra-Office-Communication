import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '../../app/apiClient';
import type { Notification } from '../../types';

interface NotificationsState {
  items: Notification[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: NotificationsState = {
  items: [],
  status: 'idle',
};

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async () => {
  const { data } = await apiClient.get<Notification[]>('/notifications');
  return data;
});

export const markRead = createAsyncThunk('notifications/markRead', async (id: string) => {
  await apiClient.patch(`/notifications/${id}/read`);
  return id;
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async () => {
  await apiClient.patch('/notifications/read-all');
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state) => { state.status = 'failed'; })
      .addCase(markRead.fulfilled, (state, action) => {
        const n = state.items.find((i) => i.id === action.payload);
        if (n) n.read = true;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.items.forEach((i) => { i.read = true; });
      });
  },
});

export default notificationsSlice.reducer;
