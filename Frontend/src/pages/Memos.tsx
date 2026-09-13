import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Paperclip } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { findUser } from '../features/users/usersSlice';
import { fetchMemos } from '../features/memos/memosSlice';
import CreateMemoModal from '../components/memos/CreateMemoModal';
import { memoTypeKeys, stageKeys } from '../i18n/enumLabels';

import { useTranslation } from 'react-i18next';
export default function Memos() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const memos = useAppSelector((s) => s.memos.items);
  const pagination = useAppSelector((s) => s.memos.pagination);
  const users = useAppSelector((s) => s.users.items);
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'mine' | 'pending'>('all');
  const [page, setPage] = useState(1);
  const currentUser = useAppSelector((s) => s.auth.user);

  // Server-side status filter for "pending"; "mine" is filtered client-side
  // against the current page (sender_id already narrows visibility server-side).
  useEffect(() => {
    dispatch(fetchMemos({ page, pageSize: 20, status: filter === 'pending' ? 'Pending Approval' : undefined }));
  }, [dispatch, page, filter]);

  // Filter changes should reset back to page 1.
  useEffect(() => { setPage(1); }, [filter]);

  const filtered = memos.filter((m) => {
    if (filter === 'mine') return m.senderId === currentUser?.id;
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
                    {(m.status === 'Approved' || m.status === 'Completed') && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shadow-2xs">
                        <img src="/official-stamp.png" alt="Seal" className="size-3 object-contain" />
                        Official Stamp
                      </span>
                    )}
                    <span className="text-[11px] text-ink-400">{t(stageKeys[m.stage])}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        {pagination && (
          <div className="px-5 pb-4">
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        )}
      </Card>

      <CreateMemoModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
