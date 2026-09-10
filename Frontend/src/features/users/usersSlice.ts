import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '../../app/apiClient';
import type { User, PaginationMeta, Paginated } from '../../types';

interface UsersState {
  items: User[];
  pagination: PaginationMeta | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: UsersState = {
  items: [],
  pagination: null,
  status: 'idle',
};

export interface FetchUsersParams {
  page?: number;
  pageSize?: number;
  department?: string;
  role?: string;
  status?: string;
  search?: string;
}

export const fetchUsers = createAsyncThunk<Paginated<User>, FetchUsersParams | void>('users/fetchAll', async (params = {}) => {
  const { data } = await apiClient.get<Paginated<User>>('/users', { params });
  return data;
});

export const toggleUserStatus = createAsyncThunk(
  'users/toggleStatus',
  async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
    await apiClient.patch(`/users/${id}/status`, { status });
    return { id, status };
  },
);

export const updateUserRole = createAsyncThunk(
  'users/updateRole',
  async ({ id, role }: { id: string; role: User['role'] }) => {
    const { data } = await apiClient.patch<User>(`/users/${id}`, { role });
    return data;
  },
);

export const createUser = createAsyncThunk(
  'users/create',
  async (payload: { fullName: string; email: string; password: string; role: User['role']; department: string; title: string }) => {
    const { data } = await apiClient.post<User>('/users', payload);
    return data;
  },
);

export const deleteUser = createAsyncThunk('users/delete', async (id: string) => {
  await apiClient.delete(`/users/${id}`);
  return id;
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state) => { state.status = 'failed'; })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const u = state.items.find((x) => x.id === action.payload.id);
        if (u) u.status = action.payload.status;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const idx = state.items.findIndex((x) => x.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter((u) => u.id !== action.payload);
      });
  },
});

/** Plain (non-hook) lookup helper — safe to call inside .map()/loops. */
export const findUser = (users: User[], id?: string) => users.find((u) => u.id === id);

export default usersSlice.reducer;
