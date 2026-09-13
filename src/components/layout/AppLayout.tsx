import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ToastContainer from '../ui/ToastContainer';
import { useAppDispatch } from '../../app/hooks';
import { fetchUsers } from '../../features/users/usersSlice';
import { fetchNotifications } from '../../features/notifications/notificationsSlice';
import { fetchDirectThreads, fetchChannels } from '../../features/messages/messagesSlice';
import { fetchDepartments } from '../../features/departments/departmentsSlice';
import { fetchMemos } from '../../features/memos/memosSlice';

export default function AppLayout() {
  const dispatch = useAppDispatch();

  // Data shared across most pages — fetch once whenever an authenticated layout mounts.
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchNotifications());
    dispatch(fetchDirectThreads());
    dispatch(fetchChannels());
    dispatch(fetchDepartments());
    dispatch(fetchMemos());
  }, [dispatch]);

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      <Sidebar variant="desktop" />
      <Sidebar variant="mobile" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
