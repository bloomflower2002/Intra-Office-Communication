import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ChatMessage, DirectThread, Channel } from '../../types';
import { directThreads, channels, chatMessages, channelMessages } from '../../mocks/mockData';

interface MessagesState {
  directThreads: DirectThread[];
  channels: Channel[];
  messagesByThread: Record<string, ChatMessage[]>;
  activeThreadId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const grouped: Record<string, ChatMessage[]> = {};
[...chatMessages, ...channelMessages].forEach((m) => {
  grouped[m.threadId] = grouped[m.threadId] ? [...grouped[m.threadId], m] : [m];
});

const initialState: MessagesState = {
  directThreads,
  channels,
  messagesByThread: grouped,
  activeThreadId: null,
  status: 'idle',
};

export const fetchThreadMessages = createAsyncThunk('messages/fetchThread', async (threadId: string) => {
  await new Promise((r) => setTimeout(r, 350));
  return { threadId, messages: grouped[threadId] ?? [] };
});

let msgCounter = 1000;

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
    sendMessage(state, action: PayloadAction<{ threadId: string; senderId: string; body: string }>) {
      const { threadId, senderId, body } = action.payload;
      const msg: ChatMessage = {
        id: `m-${++msgCounter}`,
        threadId,
        senderId,
        body,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      state.messagesByThread[threadId] = [...(state.messagesByThread[threadId] ?? []), msg];
      const t = state.directThreads.find((d) => d.id === threadId);
      if (t) { t.lastMessage = body; t.lastTimestamp = 'Now'; }
      const c = state.channels.find((c) => c.id === threadId);
      if (c) { c.lastMessage = body; c.lastTimestamp = 'Now'; }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchThreadMessages.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchThreadMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messagesByThread[action.payload.threadId] = action.payload.messages;
      })
      .addCase(fetchThreadMessages.rejected, (state) => { state.status = 'failed'; });
  },
});

export const { setActiveThread, sendMessage } = messagesSlice.actions;
export default messagesSlice.reducer;
