import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import uiReducer from '../features/ui/uiSlice';
import messagesReducer from '../features/messages/messagesSlice';
import memosReducer from '../features/memos/memosSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import usersReducer from '../features/users/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    messages: messagesReducer,
    memos: memosReducer,
    notifications: notificationsReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
