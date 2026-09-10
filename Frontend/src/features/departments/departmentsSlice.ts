import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '../../app/apiClient';

interface DepartmentsState {
  items: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: DepartmentsState = {
  items: [],
  status: 'idle',
};

export const fetchDepartments = createAsyncThunk('departments/fetchAll', async () => {
  const { data } = await apiClient.get<string[]>('/departments');
  return data;
});

const departmentsSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state) => { state.status = 'failed'; });
  },
});

export default departmentsSlice.reducer;
