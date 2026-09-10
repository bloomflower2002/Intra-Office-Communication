import { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Activity, HardDrive } from 'lucide-react';
import KpiCard from '../../components/ui/KpiCard';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchDashboardData } from '../../features/dashboard/dashboardSlice';
import { fetchAuditLog } from '../../features/audit/auditSlice';
import EmptyState from '../../components/ui/EmptyState';
import { ClipboardList } from 'lucide-react';

import { useTranslation } from 'react-i18next';
export default function AdminDashboard() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const users = useAppSelector((s) => s.users.items);
  const { userGrowth } = useAppSelector((s) => s.dashboard);
  const { items: auditLog, status: auditStatus } = useAppSelector((s) => s.audit);
  const active = users.filter((u) => u.status === 'active').length;
  const inactive = users.length - active;

  useEffect(() => {
    dispatch(fetchDashboardData());
    dispatch(fetchAuditLog());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">{t('admin_dashboard')}</h1>
        <p className="text-sm text-ink-400 mt-1">{t('system_health_user_activity_and_platform_usage')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <KpiCard label={t('total_users')} value={`${users.length} (${active} active / ${inactive} inactive)`} icon={Users} tone="brand" />
        <KpiCard label={t('system_uptime')} value="99.98%" icon={Activity} trend={{ value: 'Stable last 30 days', positive: true }} tone="success" />
        <KpiCard label={t('storage_used')} value="64.2 GB / 200 GB" icon={HardDrive} trend={{ value: '32% capacity', positive: true }} tone="info" />
      </div>

      <Card>
        <CardHeader><h3 className="text-sm font-semibold">{t('user_growth')}</h3></CardHeader>
        <CardBody className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowth} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaee" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#7d8598' }} axisLine={{ stroke: '#e8eaee' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#7d8598' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8eaee', fontSize: 13 }} />
              <Line type="monotone" dataKey="users" stroke="#2A4F97" strokeWidth={2.5} dot={{ r: 4, fill: '#2A4F97' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h3 className="text-sm font-semibold">{t('recent_user_activity_audit_log')}</h3></CardHeader>
        {auditStatus !== 'loading' && auditLog.length === 0 ? (
          <EmptyState icon={ClipboardList} title={t('no_activity_yet')} description={t('audit_log_empty_description')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-400 text-xs uppercase tracking-wide border-b border-ink-100">
                  <th className="px-5 py-3 font-medium">{t('user')}</th>
                  <th className="px-5 py-3 font-medium">{t('action')}</th>
                  <th className="px-5 py-3 font-medium">{t('target')}</th>
                  <th className="px-5 py-3 font-medium">{t('timestamp')}</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((l) => (
                  <tr key={l.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                    <td className="px-5 py-3 text-ink-700 font-medium">{l.user}</td>
                    <td className="px-5 py-3 text-ink-600">{l.action}</td>
                    <td className="px-5 py-3 text-ink-500">{l.target}</td>
                    <td className="px-5 py-3 text-ink-400">{new Date(l.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
