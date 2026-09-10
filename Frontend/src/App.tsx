import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeSync } from './app/useThemeSync';
import { RequireAuth, RequirePermission } from './routes/guards';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Channels from './pages/Channels';
import Memos from './pages/Memos';
import MemoDetail from './pages/MemoDetail';
import Approvals from './pages/Approvals';
import Archive from './pages/Archive';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import Directory from './pages/Directory';
import Settings from './pages/Settings';
import SystemSettingsPage from './pages/SystemSettings';
import AuditLog from './pages/AuditLog';

import Intro from './pages/Intro';

export default function App() {
  useThemeSync();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/intro" element={<Intro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminLogin />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/settings" element={<Settings />} />

            {/* Department Channels: dynamically controlled via Role Management */}
            <Route element={<RequirePermission permission="Broadcast to Department Channels" />}>
              <Route path="/channels" element={<Channels />} />
            </Route>

            {/* Memos & Memo Detail: dynamically controlled via Role Management */}
            <Route element={<RequirePermission permission="Create & Issue Memos" />}>
              <Route path="/memos" element={<Memos />} />
              <Route path="/memos/:id" element={<MemoDetail />} />
            </Route>

            {/* Approvals: dynamically controlled via Role Management */}
            <Route element={<RequirePermission permission="Approve & Reject Memos" />}>
              <Route path="/approvals" element={<Approvals />} />
            </Route>

            {/* Archive: dynamically controlled via Role Management */}
            <Route element={<RequirePermission permission="Access Digital Archive & Compliance Audit" />}>
              <Route path="/archive" element={<Archive />} />
            </Route>

            {/* Reports: dynamically controlled via Role Management */}
            <Route element={<RequirePermission permission="View System & Department Reports" />}>
              <Route path="/reports" element={<Reports />} />
            </Route>

            {/* Admin Governance: dynamically controlled via Role Management */}
            <Route element={<RequirePermission permission="Manage Institutional Users & Status" />}>
              <Route path="/admin/users" element={<Admin />} />
            </Route>

            {/* Audit Log: open to every authenticated role. Visibility scope
                (System Admin sees everyone, other roles see only their own
                department) is enforced server-side, not via a route guard. */}
            <Route path="/audit-log" element={<AuditLog />} />

            {/* System Settings: dynamically controlled via Role Management */}
            <Route element={<RequirePermission permission="Configure System Policies & Branding" />}>
              <Route path="/system-settings" element={<SystemSettingsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
