import { Inbox, MailWarning, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import KpiCard from '../../components/ui/KpiCard';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { getUser } from '../../mocks/mockData';
import { useAppSelector } from '../../app/hooks';
import { StatusBadge } from '../../components/ui/Badge';

export default function EmployeeDashboard() {
  const user = useAppSelector((s) => s.auth.user);
  const memos = useAppSelector((s) => s.memos.items);
  const recent = memos.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">Welcome back, {user?.fullName.split(' ')[0]}</h1>
        <p className="text-sm text-ink-400 mt-1">Here's what's happening in your workspace today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="My Pending Communications" value="4" icon={Inbox} tone="warning" />
        <KpiCard label="My Unread Messages" value="7" icon={MailWarning} tone="info" />
        <KpiCard label="New Announcements" value="2" icon={Megaphone} tone="brand" />
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold">Recent Communications Feed</h3>
          <Link to="/memos" className="text-xs font-medium text-brand-700 hover:text-brand-800">View all memos</Link>
        </CardHeader>
        <div className="divide-y divide-ink-50">
          {recent.map((m) => {
            const sender = getUser(m.senderId);
            return (
              <Link to={`/memos/${m.id}`} key={m.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-ink-50/60 transition-colors">
                <div className="size-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0" style={{ backgroundColor: sender?.avatarColor }}>
                  {sender?.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-800 truncate">{m.subject}</p>
                  <p className="text-xs text-ink-400 truncate">{sender?.fullName} · {m.reference}</p>
                </div>
                <CardBody className="!p-0"><StatusBadge status={m.status} /></CardBody>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
