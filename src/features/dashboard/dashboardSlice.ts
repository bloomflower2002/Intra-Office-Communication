import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '../../app/apiClient';

interface DepartmentVolume { department: string; value: number }
interface StatusBreakdown { name: string; value: number; color: string }
interface UserGrowthPoint { month: string; users: number }
interface Kpis {
  totalMemos: number;
  pendingApprovals: number;
  unreadNotifications: number;
  activeUsers: number;
}

interface DashboardState {
  kpis: Kpis | null;
  departmentVolume: DepartmentVolume[];
  statusBreakdown: StatusBreakdown[];
  userGrowth: UserGrowthPoint[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: DashboardState = {
  kpis: null,
  departmentVolume: [],
  statusBreakdown: [],
  userGrowth: [],
  status: 'idle',
};

export const fetchDashboardData = createAsyncThunk('dashboard/fetchAll', async () => {
  const [kpis, departmentVolume, statusBreakdown, userGrowth] = await Promise.all([
    apiClient.get<Kpis>('/dashboard/kpis'),
    apiClient.get<DepartmentVolume[]>('/dashboard/department-volume'),
    apiClient.get<StatusBreakdown[]>('/dashboard/status-breakdown'),
    apiClient.get<UserGrowthPoint[]>('/dashboard/user-growth'),
  ]);
  return {
    kpis: kpis.data,
    departmentVolume: departmentVolume.data,
    statusBreakdown: statusBreakdown.data,
    userGrowth: userGrowth.data,
  };
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.kpis = action.payload.kpis;
        state.departmentVolume = action.payload.departmentVolume;
        state.statusBreakdown = action.payload.statusBreakdown;
        state.userGrowth = action.payload.userGrowth;
      })
      .addCase(fetchDashboardData.rejected, (state) => { state.status = 'failed'; });
  },
});

export default dashboardSlice.reducer;
