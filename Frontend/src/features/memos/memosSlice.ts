import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Memo, MemoStage } from '../../types';
import { memos as mockMemos } from '../../mocks/mockData';

interface MemosState {
  items: Memo[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: MemosState = {
  items: mockMemos,
  status: 'idle',
};

export const fetchMemos = createAsyncThunk('memos/fetchAll', async () => {
  await new Promise((r) => setTimeout(r, 400));
  return mockMemos;
});

let memoCounter = 100;
const stageOrder: MemoStage[] = ['Issued', 'Received', 'Reviewed', 'Forwarded', 'Acknowledged', 'Completed'];

const memosSlice = createSlice({
  name: 'memos',
  initialState,
  reducers: {
    createMemo: {
      reducer(state, action: PayloadAction<Memo>) {
        state.items.unshift(action.payload);
      },
      prepare(payload: Omit<Memo, 'id' | 'reference' | 'createdAt' | 'stage' | 'status' | 'stageHistory' | 'readReceipts'>) {
        const id = `memo-${++memoCounter}`;
        const now = new Date().toISOString();
        return {
          payload: {
            ...payload,
            id,
            reference: `OSTA/GEN/2026/${100 + memoCounter}`,
            createdAt: now,
            stage: 'Issued' as MemoStage,
            status: 'Pending Approval' as const,
            stageHistory: [{ stage: 'Issued' as MemoStage, timestamp: now }],
            readReceipts: [],
          },
        };
      },
    },
    actOnMemo(state, action: PayloadAction<{ memoId: string; userId: string; role: string; action: 'Approved' | 'Rejected' | 'Forwarded'; comment?: string }>) {
      const memo = state.items.find((m) => m.id === action.payload.memoId);
      if (!memo) return;
      const now = new Date().toISOString();
      const chainEntry = memo.approvalChain.find((c) => c.userId === action.payload.userId);
      if (chainEntry) {
        chainEntry.action = action.payload.action;
        chainEntry.comment = action.payload.comment;
        chainEntry.timestamp = now;
      } else {
        memo.approvalChain.push({
          role: action.payload.role as Memo['approvalChain'][number]['role'],
          userId: action.payload.userId,
          action: action.payload.action,
          comment: action.payload.comment,
          timestamp: now,
        });
      }
      if (action.payload.action === 'Rejected') {
        memo.status = 'Rejected';
      } else {
        const currentIdx = stageOrder.indexOf(memo.stage);
        const nextIdx = Math.min(currentIdx + 1, stageOrder.length - 1);
        memo.stage = stageOrder[nextIdx];
        memo.stageHistory.push({ stage: memo.stage, timestamp: now });
        memo.status = memo.stage === 'Completed' ? 'Completed' : 'Approved';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMemos.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchMemos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchMemos.rejected, (state) => { state.status = 'failed'; });
  },
});

export const { createMemo, actOnMemo } = memosSlice.actions;
export default memosSlice.reducer;
