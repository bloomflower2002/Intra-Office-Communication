import { Inbox, MailWarning, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import KpiCard from '../../components/ui/KpiCard';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { findUser } from '../../features/users/usersSlice';
import { useAppSelector } from '../../app/hooks';
import { StatusBadge } from '../../components/ui/Badge';

import { useTranslation } from 'react-i18next';
export default function EmployeeDashboard() {
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const memos = useAppSelector((s) => s.memos.items);
  const users = useAppSelector((s) => s.users.items);
  const recent = memos.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">{t('welcome_back')} {user?.fullName.split(' ')[0]}</h1>
        <p className="text-sm text-ink-400 mt-1">{t('here_s_what_s_happening_in_your_workspace_today')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label={t('my_pending_communications')} value="4" icon={Inbox} tone="warning" />
        <KpiCard label={t('my_unread_messages')} value="7" icon={MailWarning} tone="info" />
        <KpiCard label={t('new_announcements')} value="2" icon={Megaphone} tone="brand" />
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold">{t('recent_communications_feed')}</h3>
          <Link to="/memos" className="text-xs font-medium text-brand-700 hover:text-brand-800">{t('view_all_memos')}</Link>
        </CardHeader>
        <div className="divide-y divide-ink-50">
          {recent.map((m) => {
            const sender = findUser(users, m.senderId);
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
