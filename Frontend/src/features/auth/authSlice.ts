import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '../../app/apiClient';
import type { AuthUser } from '../../types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  error: string | null;
}

const persisted = (() => {
  try {
    const raw = sessionStorage.getItem('iocms_auth');
    return raw ? (JSON.parse(raw) as { user: AuthUser; token: string }) : null;
  } catch {
    return null;
  }
})();

const initialState: AuthState = {
  user: persisted?.user ?? null,
  token: persisted?.token ?? null,
  status: persisted ? 'authenticated' : 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<{ user: AuthUser; token: string }>('/auth/login', credentials);
      sessionStorage.setItem('iocms_auth', JSON.stringify(data));
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message ?? 'Invalid email or password.';
      return rejectWithValue(message);
    }
  },
);

export const logoutAsync = createAsyncThunk('auth/logout', async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // ignore network errors on logout — we clear local state regardless
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      sessionStorage.removeItem('iocms_auth');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'error';
        state.error = (action.payload as string) ?? action.error.message ?? 'Login failed.';
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
        sessionStorage.removeItem('iocms_auth');
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
