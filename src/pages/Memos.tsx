import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Paperclip } from 'lucide-react';
import { useAppSelector } from '../app/hooks';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { findUser } from '../features/users/usersSlice';
import CreateMemoModal from '../components/memos/CreateMemoModal';
import { memoTypeKeys, stageKeys } from '../i18n/enumLabels';

import { useTranslation } from 'react-i18next';
export default function Memos() {
  const { t } = useTranslation();
  const memos = useAppSelector((s) => s.memos.items);
  const users = useAppSelector((s) => s.users.items);
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'mine' | 'pending'>('all');
  const currentUser = useAppSelector((s) => s.auth.user);

  const filtered = memos.filter((m) => {
    if (filter === 'mine') return m.senderId === currentUser?.id;
    if (filter === 'pending') return m.status === 'Pending Approval';
    return true;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl mb-1">{t('memos_circulars')}</h1>
          <p className="text-sm text-ink-400">{t('create_track_and_manage_official_memos_and_routing')}</p>
        </div>
        <Button icon={<Plus className="size-4" />} onClick={() => setCreateOpen(true)}>{t('create_new_memo')}</Button>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'mine', 'pending'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === f ? 'bg-brand-700 text-white' : 'bg-white dark:bg-ink-100 border border-ink-200 text-ink-600 hover:bg-ink-50'
            }`}
          >
            {f === 'all' ? t('filter_all_memos') : f === 'mine' ? t('filter_sent_by_me') : t('filter_pending_approval')}
          </button>
        ))}
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={FileText} title={t('no_memos_found')} description={t('try_different_filter_or_create_memo')} />
        ) : (
          <div className="divide-y divide-ink-50">
            {filtered.map((m) => {
              const sender = findUser(users, m.senderId);
              return (
                <Link key={m.id} to={`/memos/${m.id}`} className="flex items-start gap-4 px-5 py-4 hover:bg-ink-50/60 transition-colors">
                  <div className="size-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                    <FileText className="size-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-ink-800">{m.subject}</p>
                      <PriorityBadge priority={m.priority} />
                    </div>
                    <p className="text-xs text-ink-400 mt-1">
                      {m.reference} · {t(memoTypeKeys[m.type])} {t('from_2')} {sender?.fullName} · {new Date(m.createdAt).toLocaleDateString()}
                    </p>
                    {m.attachments.length > 0 && (
                      <p className="text-xs text-ink-400 mt-1 flex items-center gap-1"><Paperclip className="size-3" /> {m.attachments.length} {t('attachment_s')}</p>
                    )}
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <StatusBadge status={m.status} />
                    <span className="text-[11px] text-ink-400">{t(stageKeys[m.stage])}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      <CreateMemoModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
