import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { Send, Clock3, TrendingUp, Smile } from 'lucide-react';
import { Link } from 'react-router-dom';
import KpiCard from '../../components/ui/KpiCard';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { departmentVolume, documentStatusBreakdown } from '../../mocks/mockData';
import { useAppSelector } from '../../app/hooks';
import { getUser } from '../../mocks/mockData';

export default function ExecutiveDashboard() {
  const [loading, setLoading] = useState(true);
  const memos = useAppSelector((s) => s.memos.items);
  const pending = memos.filter((m) => m.status === 'Pending Approval').slice(0, 5);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">Executive Dashboard</h1>
        <p className="text-sm text-ink-400 mt-1">Organization-wide communication overview and pending decisions.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Card key={i}><SkeletonCard /></Card>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="Total Communications" value="1,284" icon={Send} trend={{ value: '12.4% vs last month', positive: true }} tone="brand" />
          <KpiCard label="Pending Approvals" value={String(pending.length + 6)} icon={Clock3} trend={{ value: '3 new today', positive: false }} tone="warning" />
          <KpiCard label="Avg. Approval Turnaround" value="1.8 days" icon={TrendingUp} trend={{ value: '0.4 days faster', positive: true }} tone="info" />
          <KpiCard label="Employee Satisfaction" value="4.6 / 5" icon={Smile} trend={{ value: '0.2 improvement', positive: true }} tone="success" />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <Card className="xl:col-span-3">
          <CardHeader><h3 className="text-sm font-semibold">Communication Volume by Department</h3></CardHeader>
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
          <CardHeader><h3 className="text-sm font-semibold">Document Status Breakdown</h3></CardHeader>
          <CardBody className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie data={documentStatusBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {documentStatusBreakdown.map((d) => <Cell key={d.name} fill={d.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8eaee', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-1">
              {documentStatusBreakdown.map((d) => (
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
          <h3 className="text-sm font-semibold">Recent Pending Approvals</h3>
          <Link to="/approvals" className="text-xs font-medium text-brand-700 hover:text-brand-800">View all</Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-400 text-xs uppercase tracking-wide border-b border-ink-100">
                <th className="px-5 py-3 font-medium">Subject</th>
                <th className="px-5 py-3 font-medium">Sender</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {pending.map((m) => {
                const sender = getUser(m.senderId);
                return (
                  <tr key={m.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                    <td className="px-5 py-3 text-ink-700 font-medium max-w-xs truncate">{m.subject}</td>
                    <td className="px-5 py-3 text-ink-500">{sender?.fullName}</td>
                    <td className="px-5 py-3"><PriorityBadge priority={m.priority} /></td>
                    <td className="px-5 py-3"><StatusBadge status={m.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <Link to={`/memos/${m.id}`} className="text-xs font-medium text-brand-700 hover:text-brand-800">Review</Link>
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
