import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '../../app/apiClient';
import type { Notification, PaginationMeta, Paginated } from '../../types';

interface NotificationsState {
  items: Notification[];
  pagination: PaginationMeta | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: NotificationsState = {
  items: [],
  pagination: null,
  status: 'idle',
};

export interface FetchNotificationsParams {
  page?: number;
  pageSize?: number;
}

export const fetchNotifications = createAsyncThunk<Paginated<Notification>, FetchNotificationsParams | void>(
  'notifications/fetchAll',
  async (params = {}) => {
    const { data } = await apiClient.get<Paginated<Notification>>('/notifications', { params });
    return data;
  },
);

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
        state.items = Array.isArray(action.payload) ? action.payload : (action.payload?.data ?? []);
        state.pagination = action.payload?.pagination ?? null;
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
