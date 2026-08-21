import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { departmentVolume, documentStatusBreakdown, archiveDocs } from '../mocks/mockData';
import { useAppDispatch } from '../app/hooks';
import { pushToast } from '../features/ui/uiSlice';
import type { MemoStatus } from '../types';

export default function Reports() {
  const dispatch = useAppDispatch();
  const [from, setFrom] = useState('2026-07-01');
  const [to, setTo] = useState('2026-08-17');
  const [dept, setDept] = useState('All');

  const handleExport = () => {
    const header = 'Subject,Type,Sender,Department,Date,Status\n';
    const rows = archiveDocs
      .filter((d) => dept === 'All' || d.department === dept)
      .map((d) => [d.subject, d.type, d.sender, d.department, d.date, d.status].map((v) => `"${v}"`).join(','))
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iocms-report-${from}_to_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    dispatch(pushToast('Report exported as CSV.', 'success'));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl mb-1">Reports & Analytics</h1>
          <p className="text-sm text-ink-400">Organization-wide communication and performance reporting.</p>
        </div>
        <Button icon={<Download className="size-4" />} onClick={handleExport}>Export to CSV</Button>
      </div>

      <Card className="mb-5">
        <CardBody className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-ink-500 mb-1.5">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-500 mb-1.5">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-500 mb-1.5">Department</label>
            <select value={dept} onChange={(e) => setDept(e.target.value)} className="px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none bg-white">
              <option>All</option>
              {Array.from(new Set(archiveDocs.map((d) => d.department))).map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-5">
        <Card className="xl:col-span-3">
          <CardHeader><h3 className="text-sm font-semibold">Volume by Department</h3></CardHeader>
          <CardBody className="h-64">
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
          <CardHeader><h3 className="text-sm font-semibold">Status Breakdown</h3></CardHeader>
          <CardBody className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={documentStatusBreakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {documentStatusBreakdown.map((d) => <Cell key={d.name} fill={d.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8eaee', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader><h3 className="text-sm font-semibold">Report Details</h3></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-400 text-xs uppercase tracking-wide border-b border-ink-100">
                <th className="px-5 py-3 font-medium">Subject</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {archiveDocs.filter((d) => dept === 'All' || d.department === dept).map((d) => (
                <tr key={d.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                  <td className="px-5 py-3 text-ink-700 font-medium max-w-xs truncate">{d.subject}</td>
                  <td className="px-5 py-3 text-ink-500">{d.department}</td>
                  <td className="px-5 py-3 text-ink-500">{d.date}</td>
                  <td className="px-5 py-3"><StatusBadge status={d.status as MemoStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
