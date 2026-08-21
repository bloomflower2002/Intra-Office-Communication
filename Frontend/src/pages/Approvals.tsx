import { Link } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';
import { useAppSelector } from '../app/hooks';
import { Card } from '../components/ui/Card';
import { PriorityBadge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { getUser } from '../mocks/mockData';

export default function Approvals() {
  const memos = useAppSelector((s) => s.memos.items);
  const currentUser = useAppSelector((s) => s.auth.user);

  const pending = memos.filter((m) =>
    m.status === 'Pending Approval' &&
    (m.approvalChain.some((c) => c.userId === currentUser?.id && !c.action) || currentUser?.role === 'System Admin'),
  );

  return (
    <div>
      <h1 className="text-2xl mb-1">Approvals Queue</h1>
      <p className="text-sm text-ink-400 mb-5">Memos awaiting your action, routed by hierarchy.</p>

      <Card>
        {pending.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title="Nothing pending" description="You're all caught up — no memos require your approval right now." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-400 text-xs uppercase tracking-wide border-b border-ink-100">
                  <th className="px-5 py-3 font-medium">Sender</th>
                  <th className="px-5 py-3 font-medium">Subject</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((m) => {
                  const sender = getUser(m.senderId);
                  return (
                    <tr key={m.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-full flex items-center justify-center text-white text-[10px] font-semibold" style={{ backgroundColor: sender?.avatarColor }}>
                            {sender?.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <p className="text-ink-800 font-medium">{sender?.fullName}</p>
                            <p className="text-xs text-ink-400">{sender?.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-ink-700 max-w-xs truncate">{m.subject}</td>
                      <td className="px-5 py-3 text-ink-500">{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3"><PriorityBadge priority={m.priority} /></td>
                      <td className="px-5 py-3 text-right">
                        <Link to={`/memos/${m.id}`} className="text-xs font-medium text-brand-700 hover:text-brand-800">Review →</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
