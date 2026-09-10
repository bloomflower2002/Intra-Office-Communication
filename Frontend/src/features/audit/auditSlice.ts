import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '../../app/apiClient';
import type { AuditLogEntry, PaginationMeta, Paginated } from '../../types';

interface AuditState {
  items: AuditLogEntry[];
  pagination: PaginationMeta | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AuditState = {
  items: [],
  pagination: null,
  status: 'idle',
};

export interface FetchAuditLogParams {
  page?: number;
  pageSize?: number;
}

export const fetchAuditLog = createAsyncThunk<Paginated<AuditLogEntry>, FetchAuditLogParams | void>('audit/fetchAll', async (params = {}) => {
  const { data } = await apiClient.get<Paginated<AuditLogEntry>>('/audit', { params });
  return data;
});

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLog.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchAuditLog.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAuditLog.rejected, (state) => { state.status = 'failed'; });
  },
});

export default auditSlice.reducer;
