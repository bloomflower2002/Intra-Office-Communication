import { useAppSelector } from '../app/hooks';
import ExecutiveDashboard from './dashboards/ExecutiveDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import EmployeeDashboard from './dashboards/EmployeeDashboard';

export default function Dashboard() {
  const role = useAppSelector((s) => s.auth.user?.role);

  if (role === 'System Admin') return <AdminDashboard />;
  if (role === 'Head Office' || role === 'Director') return <ExecutiveDashboard />;
  return <EmployeeDashboard />;
}
