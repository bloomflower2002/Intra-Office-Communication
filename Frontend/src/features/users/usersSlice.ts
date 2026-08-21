import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';
import { users as mockUsers } from '../../mocks/mockData';

interface UsersState {
  items: User[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: UsersState = {
  items: mockUsers,
  status: 'idle',
};

export const fetchUsers = createAsyncThunk('users/fetchAll', async () => {
  await new Promise((r) => setTimeout(r, 300));
  return mockUsers;
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    toggleUserStatus(state, action: PayloadAction<string>) {
      const u = state.items.find((x) => x.id === action.payload);
      if (u) u.status = u.status === 'active' ? 'inactive' : 'active';
    },
    updateUserRole(state, action: PayloadAction<{ id: string; role: User['role'] }>) {
      const u = state.items.find((x) => x.id === action.payload.id);
      if (u) u.role = action.payload.role;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      });
  },
});

export const { toggleUserStatus, updateUserRole } = usersSlice.actions;
export default usersSlice.reducer;
