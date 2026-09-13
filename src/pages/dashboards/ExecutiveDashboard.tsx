import { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { Send, Clock3, TrendingUp, Smile } from 'lucide-react';
import { Link } from 'react-router-dom';
import KpiCard from '../../components/ui/KpiCard';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchDashboardData } from '../../features/dashboard/dashboardSlice';
import { findUser } from '../../features/users/usersSlice';

import { useTranslation } from 'react-i18next';
export default function ExecutiveDashboard() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const memos = useAppSelector((s) => s.memos.items);
  const users = useAppSelector((s) => s.users.items);
  const { kpis, departmentVolume, statusBreakdown, status } = useAppSelector((s) => s.dashboard);
  const loading = status === 'idle' || status === 'loading';
  const pending = memos.filter((m) => m.status === 'Pending Approval').slice(0, 5);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">{t('executive_dashboard')}</h1>
        <p className="text-sm text-ink-400 mt-1">{t('organization_wide_communication_overview_and_pendi')}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Card key={i}><SkeletonCard /></Card>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label={t('total_communications')} value={String(kpis?.totalMemos ?? 0)} icon={Send} trend={{ value: '12.4% vs last month', positive: true }} tone="brand" />
          <KpiCard label={t('pending_approvals')} value={String(kpis?.pendingApprovals ?? pending.length)} icon={Clock3} trend={{ value: '3 new today', positive: false }} tone="warning" />
          <KpiCard label={t('avg_approval_turnaround')} value="1.8 days" icon={TrendingUp} trend={{ value: '0.4 days faster', positive: true }} tone="info" />
          <KpiCard label={t('employee_satisfaction')} value="4.6 / 5" icon={Smile} trend={{ value: '0.2 improvement', positive: true }} tone="success" />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <Card className="xl:col-span-3">
          <CardHeader><h3 className="text-sm font-semibold">{t('communication_volume_by_department')}</h3></CardHeader>
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentVolume} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaee" />
                <XAxis dataKey="department" tick={{ fontSize: 12, fill: '#7d8598' }} axisLine={{ stroke: '#e8eaee' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#7d8598' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8eaee', fontSize: 13 }} cursor={{ fill: '#f5f6f8' }} />
                <Bar dataKey="value" fill="#2A4F97" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader><h3 className="text-sm font-semibold">{t('document_status_breakdown')}</h3></CardHeader>
          <CardBody className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie data={statusBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {statusBreakdown.map((d) => <Cell key={d.name} fill={d.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8eaee', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-1">
              {statusBreakdown.map((d) => (
                <span key={d.name} className="flex items-center gap-1.5 text-xs text-ink-500">
                  <span className="size-2 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}
                </span>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold">{t('recent_pending_approvals')}</h3>
          <Link to="/approvals" className="text-xs font-medium text-brand-700 hover:text-brand-800">{t('view_all')}</Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-400 text-xs uppercase tracking-wide border-b border-ink-100">
                <th className="px-5 py-3 font-medium">{t('subject')}</th>
                <th className="px-5 py-3 font-medium">{t('sender')}</th>
                <th className="px-5 py-3 font-medium">{t('priority')}</th>
                <th className="px-5 py-3 font-medium">{t('status')}</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {pending.map((m) => {
                const sender = findUser(users, m.senderId);
                return (
                  <tr key={m.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                    <td className="px-5 py-3 text-ink-700 font-medium max-w-xs truncate">{m.subject}</td>
                    <td className="px-5 py-3 text-ink-500">{sender?.fullName}</td>
                    <td className="px-5 py-3"><PriorityBadge priority={m.priority} /></td>
                    <td className="px-5 py-3"><StatusBadge status={m.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <Link to={`/memos/${m.id}`} className="text-xs font-medium text-brand-700 hover:text-brand-800">{t('review_2')}</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
