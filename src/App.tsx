import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeSync } from './app/useThemeSync';
import { RequireAuth, RequireRole } from './routes/guards';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Channels from './pages/Channels';
import Memos from './pages/Memos';
import MemoDetail from './pages/MemoDetail';
import Approvals from './pages/Approvals';
import Archive from './pages/Archive';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import SystemSettingsPage from './pages/SystemSettingsPage';
import Preferences from './pages/Preferences';
import Directory from './pages/Directory';
import Settings from './pages/Settings';
import AuditLog from './pages/AuditLog';

import Intro from './pages/Intro';

export default function App() {
  useThemeSync();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/intro" element={<Intro />} />
        <Route path="/login" element={<Login />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/channels" element={<Channels />} />
            <Route path="/memos" element={<Memos />} />
            <Route path="/memos/:id" element={<MemoDetail />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/audit-log" element={<AuditLog />} />

            <Route element={<RequireRole roles={['Head Office', 'Director', 'Team Leader']} />}>
              <Route path="/approvals" element={<Approvals />} />
              <Route path="/reports" element={<Reports />} />
            </Route>

            {/* Organization-wide System Settings (branding, policies, roles) is
                System Admin only — other roles get /preferences instead, which
                only controls their own personal environment. */}
            <Route element={<RequireRole roles={['System Admin']} />}>
              <Route path="/admin" element={<Admin />} />
              <Route path="/system-settings" element={<SystemSettingsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
