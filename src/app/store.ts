import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import uiReducer from '../features/ui/uiSlice';
import messagesReducer from '../features/messages/messagesSlice';
import memosReducer from '../features/memos/memosSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import usersReducer from '../features/users/usersSlice';
import departmentsReducer from '../features/departments/departmentsSlice';
import archiveReducer from '../features/archive/archiveSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import systemConfigReducer from '../features/system/systemConfigSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    messages: messagesReducer,
    memos: memosReducer,
    notifications: notificationsReducer,
    users: usersReducer,
    departments: departmentsReducer,
    archive: archiveReducer,
    dashboard: dashboardReducer,
    systemConfig: systemConfigReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
