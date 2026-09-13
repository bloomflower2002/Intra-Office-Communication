import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '../../app/apiClient';
import type { ArchiveDoc } from '../../types';

interface ArchiveState {
  items: ArchiveDoc[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ArchiveState = {
  items: [],
  status: 'idle',
};

export const fetchArchive = createAsyncThunk('archive/fetchAll', async () => {
  const { data } = await apiClient.get<ArchiveDoc[]>('/archive');
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
        state.items = action.payload;
      })
      .addCase(fetchArchive.rejected, (state) => { state.status = 'failed'; });
  },
});

export default archiveSlice.reducer;
