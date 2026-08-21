import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser, Role } from '../../types';
import { users, currentUsersByRole } from '../../mocks/mockData';

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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.status = 'loading';
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<{ role: Role }>) {
      const uid = currentUsersByRole[action.payload.role];
      const u = users.find((x) => x.id === uid)!;
      const authUser: AuthUser = {
        id: u.id, fullName: u.fullName, email: u.email, role: u.role,
        department: u.department, title: u.title, avatarColor: u.avatarColor,
      };
      const token = `mock-jwt-${u.id}-${Date.now()}`;
      state.user = authUser;
      state.token = token;
      state.status = 'authenticated';
      sessionStorage.setItem('iocms_auth', JSON.stringify({ user: authUser, token }));
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      sessionStorage.removeItem('iocms_auth');
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
