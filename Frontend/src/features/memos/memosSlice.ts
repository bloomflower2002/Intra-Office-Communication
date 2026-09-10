import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '../../app/apiClient';
import type { Memo, MemoType, Priority, MemoAttachment, Role, PaginationMeta, Paginated } from '../../types';

interface MemosState {
  items: Memo[];
  pagination: PaginationMeta | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: MemosState = {
  items: [],
  pagination: null,
  status: 'idle',
};

export interface FetchMemosParams {
  page?: number;
  pageSize?: number;
  status?: string;
  priority?: string;
  type?: string;
  search?: string;
}

export const fetchMemos = createAsyncThunk<Paginated<Memo>, FetchMemosParams | void>('memos/fetchAll', async (params = {}) => {
  const { data } = await apiClient.get<Paginated<Memo>>('/memos', { params });
  return data;
});

export const createMemo = createAsyncThunk(
  'memos/create',
  async (payload: {
    type: MemoType;
    subject: string;
    body: string;
    recipients: string[]; // resolved user/channel ids
    priority: Priority;
    attachments?: MemoAttachment[];
    approvalChain?: { role: Role; userId: string }[];
  }) => {
    const { data } = await apiClient.post<Memo>('/memos', payload);
    return data;
  },
);

export const approveMemo = createAsyncThunk(
  'memos/approve',
  async ({ memoId, comment, fastTrack }: { memoId: string; comment?: string; fastTrack?: boolean }) => {
    const { data } = await apiClient.post<Memo>(`/memos/${memoId}/approve`, { comment, fastTrack });
    return data;
  },
);

export const rejectMemo = createAsyncThunk(
  'memos/reject',
  async ({ memoId, comment }: { memoId: string; comment?: string }) => {
    const { data } = await apiClient.post<Memo>(`/memos/${memoId}/reject`, { comment });
    return data;
  },
);

export const forwardMemo = createAsyncThunk(
  'memos/forward',
  async ({ memoId, toUserId, toRole, comment }: { memoId: string; toUserId: string; toRole: string; comment?: string }) => {
    const { data } = await apiClient.post<Memo>(`/memos/${memoId}/forward`, { toUserId, toRole, comment });
    return data;
  },
);

export const returnForRevisionMemo = createAsyncThunk(
  'memos/returnForRevision',
  async ({ memoId, comment }: { memoId: string; comment?: string }) => {
    const { data } = await apiClient.post<Memo>(`/memos/${memoId}/return-revision`, { comment });
    return data;
  },
);

export const resubmitMemo = createAsyncThunk(
  'memos/resubmit',
  async ({ memoId, subject, body, attachments, priority }: { memoId: string; subject?: string; body?: string; attachments?: MemoAttachment[]; priority?: Priority }) => {
    const { data } = await apiClient.patch<Memo>(`/memos/${memoId}`, { subject, body, attachments, priority });
    return data;
  },
);

export const acknowledgeMemo = createAsyncThunk('memos/acknowledge', async (memoId: string) => {
  const { data } = await apiClient.post<Memo>(`/memos/${memoId}/acknowledge`);
  return data;
});

export const markMemoRead = createAsyncThunk('memos/markRead', async (memoId: string) => {
  await apiClient.post(`/memos/${memoId}/read`);
  return memoId;
});

function replaceMemo(state: MemosState, updated: Memo) {
  const idx = state.items.findIndex((m) => m.id === updated.id);
  if (idx !== -1) state.items[idx] = updated;
  else state.items.unshift(updated);
}

const memosSlice = createSlice({
  name: 'memos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMemos.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchMemos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMemos.rejected, (state) => { state.status = 'failed'; })
      .addCase(createMemo.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(approveMemo.fulfilled, (state, action) => replaceMemo(state, action.payload))
      .addCase(rejectMemo.fulfilled, (state, action) => replaceMemo(state, action.payload))
      .addCase(returnForRevisionMemo.fulfilled, (state, action) => replaceMemo(state, action.payload))
      .addCase(resubmitMemo.fulfilled, (state, action) => replaceMemo(state, action.payload))
      .addCase(forwardMemo.fulfilled, (state, action) => replaceMemo(state, action.payload))
      .addCase(acknowledgeMemo.fulfilled, (state, action) => replaceMemo(state, action.payload));
  },
});

export default memosSlice.reducer;
