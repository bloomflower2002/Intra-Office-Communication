import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '../../app/apiClient';
import type { AuthUser } from '../../types';
import { users as mockUsers } from '../../mocks/mockData';

// ---------------------------------------------------------------------------
// MOCK AUTH (frontend-only)
// ---------------------------------------------------------------------------
// The backend team hasn't wired up real /auth/login yet, so this resolves
// login against the local mock user directory instead of calling the API.
// Any password of 4+ characters is accepted for any known user email.
//
// TO SWITCH TO THE REAL BACKEND LATER:
//   1. Delete the `USE_MOCK_AUTH` flag and the `mockLogin` function below.
//   2. In the `login` thunk, remove the mock branch and keep only the
//      apiClient.post('/auth/login', credentials) call.
// That's it — everything else (guards, roles, session storage) is unchanged.
const USE_MOCK_AUTH = true;

function mockLogin(email: string, password: string): { user: AuthUser; token: string } | null {
  const normalized = email.trim().toLowerCase();
  const match = mockUsers.find((u) => u.email.toLowerCase() === normalized);
  if (!match || password.length < 4) return null;

  const user: AuthUser = { ...match } as AuthUser;
  const token = `mock-token.${match.id}.${Date.now()}`;
  return { user, token };
}

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
    if (USE_MOCK_AUTH) {
      // Simulate network latency so loading states / spinners still look right.
      await new Promise((resolve) => setTimeout(resolve, 500));
      const data = mockLogin(credentials.email, credentials.password);
      if (!data) {
        return rejectWithValue('Invalid email or password.');
      }
      sessionStorage.setItem('iocms_auth', JSON.stringify(data));
      return data;
    }

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
  if (USE_MOCK_AUTH) return;
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
