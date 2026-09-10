import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '../../app/apiClient';
import type { ArchiveDoc, PaginationMeta, Paginated } from '../../types';

interface ArchiveState {
  items: ArchiveDoc[];
  pagination: PaginationMeta | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ArchiveState = {
  items: [],
  pagination: null,
  status: 'idle',
};

export interface FetchArchiveParams {
  page?: number;
  pageSize?: number;
  type?: string;
  department?: string;
  status?: string;
  search?: string;
}

export const fetchArchive = createAsyncThunk<Paginated<ArchiveDoc>, FetchArchiveParams | void>('archive/fetchAll', async (params = {}) => {
  const { data } = await apiClient.get<Paginated<ArchiveDoc>>('/archive', { params });
  return data;
});

const archiveSlice = createSlice({
  name: 'archive',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchArchive.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchArchive.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchArchive.rejected, (state) => { state.status = 'failed'; });
  },
});

export default archiveSlice.reducer;
