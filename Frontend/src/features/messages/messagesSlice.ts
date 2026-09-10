import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../app/apiClient';
import type { ChatMessage, DirectThread, Channel, PaginationMeta, Paginated } from '../../types';

interface MessagesState {
  directThreads: DirectThread[];
  directThreadsPagination: PaginationMeta | null;
  channels: Channel[];
  channelsPagination: PaginationMeta | null;
  messagesByThread: Record<string, ChatMessage[]>;
  messagesPaginationByThread: Record<string, PaginationMeta>;
  activeThreadId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: MessagesState = {
  directThreads: [],
  directThreadsPagination: null,
  channels: [],
  channelsPagination: null,
  messagesByThread: {},
  messagesPaginationByThread: {},
  activeThreadId: null,
  status: 'idle',
};

export interface ListPageParams {
  page?: number;
  pageSize?: number;
}

export const fetchDirectThreads = createAsyncThunk<Paginated<DirectThread>, ListPageParams | void>(
  'messages/fetchThreads',
  async (params = {}) => {
    const { data } = await apiClient.get<Paginated<DirectThread>>('/messages/threads', { params });
    return data;
  },
);

export const fetchChannels = createAsyncThunk<Paginated<Channel>, ListPageParams | void>(
  'messages/fetchChannels',
  async (params = {}) => {
    const { data } = await apiClient.get<Paginated<Channel>>('/messages/channels', { params });
    return data;
  },
);

/** Get or create a direct thread with another user, returning its id. */
export const openDirectThread = createAsyncThunk(
  'messages/openDirectThread',
  async (participantId: string) => {
    const { data } = await apiClient.post<{ id: string }>('/messages/threads', { participantId });
    return data.id;
  },
);

export const fetchThreadMessages = createAsyncThunk(
  'messages/fetchThread',
  async ({ threadId, page, pageSize }: { threadId: string } & ListPageParams) => {
    const { data } = await apiClient.get<Paginated<ChatMessage>>(`/messages/threads/${threadId}/messages`, {
      params: { page, pageSize },
    });
    return { threadId, ...data };
  },
);

export const fetchChannelMessages = createAsyncThunk(
  'messages/fetchChannel',
  async ({ channelId, page, pageSize }: { channelId: string } & ListPageParams) => {
    const { data } = await apiClient.get<Paginated<ChatMessage>>(`/messages/channels/${channelId}/messages`, {
      params: { page, pageSize },
    });
    return { threadId: channelId, ...data };
  },
);

/** `kind` distinguishes which endpoint to hit — direct thread vs channel. */
export const sendMessage = createAsyncThunk(
  'messages/send',
  async (payload: { threadId: string; kind: 'thread' | 'channel'; body: string }) => {
    const path = payload.kind === 'thread'
      ? `/messages/threads/${payload.threadId}/messages`
      : `/messages/channels/${payload.threadId}/messages`;
    const { data } = await apiClient.post<ChatMessage>(path, { body: payload.body });
    return data;
  },
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setActiveThread(state, action: PayloadAction<string>) {
      state.activeThreadId = action.payload;
      const t = state.directThreads.find((d) => d.id === action.payload);
      if (t) t.unread = 0;
      const c = state.channels.find((c) => c.id === action.payload);
      if (c) c.unread = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDirectThreads.fulfilled, (state, action) => {
        state.directThreads = action.payload.data;
        state.directThreadsPagination = action.payload.pagination;
      })
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.channels = action.payload.data;
        state.channelsPagination = action.payload.pagination;
      })
      .addCase(fetchThreadMessages.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchThreadMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messagesByThread[action.payload.threadId] = action.payload.data;
        state.messagesPaginationByThread[action.payload.threadId] = action.payload.pagination;
      })
      .addCase(fetchThreadMessages.rejected, (state) => { state.status = 'failed'; })
      .addCase(fetchChannelMessages.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchChannelMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messagesByThread[action.payload.threadId] = action.payload.data;
        state.messagesPaginationByThread[action.payload.threadId] = action.payload.pagination;
      })
      .addCase(fetchChannelMessages.rejected, (state) => { state.status = 'failed'; })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const msg = action.payload;
        state.messagesByThread[msg.threadId] = [...(state.messagesByThread[msg.threadId] ?? []), msg];
        const t = state.directThreads.find((d) => d.id === msg.threadId);
        if (t) { t.lastMessage = msg.body; t.lastTimestamp = msg.timestamp; }
        const c = state.channels.find((c) => c.id === msg.threadId);
        if (c) { c.lastMessage = msg.body; c.lastTimestamp = msg.timestamp; }
      });
  },
});

export const { setActiveThread } = messagesSlice.actions;
export default messagesSlice.reducer;
