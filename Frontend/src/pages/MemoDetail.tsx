import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Paperclip, Check, X as XIcon, Forward, FileText } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { actOnMemo } from '../features/memos/memosSlice';
import { pushToast } from '../features/ui/uiSlice';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { StatusBadge, PriorityBadge, ReadReceiptTag } from '../components/ui/Badge';
import StatusTracker from '../components/memos/StatusTracker';
import { getUser, users } from '../mocks/mockData';
import EmptyState from '../components/ui/EmptyState';

type ActionType = 'Approved' | 'Rejected' | 'Forwarded';

export default function MemoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const memo = useAppSelector((s) => s.memos.items.find((m) => m.id === id));
  const currentUser = useAppSelector((s) => s.auth.user);
  const [actionModal, setActionModal] = useState<ActionType | null>(null);
  const [comment, setComment] = useState('');
  const [forwardTo, setForwardTo] = useState('');

  if (!memo) {
    return <EmptyState icon={FileText} title="Memo not found" description="It may have been removed or the link is incorrect." />;
  }

  const sender = getUser(memo.senderId);
  const canAct = currentUser && memo.status === 'Pending Approval' &&
    memo.approvalChain.some((c) => c.userId === currentUser.id && !c.action);

  const handleAction = () => {
    if (!currentUser) return;
    dispatch(actOnMemo({ memoId: memo.id, userId: currentUser.id, role: currentUser.role, action: actionModal!, comment }));
    dispatch(pushToast(
      actionModal === 'Approved' ? 'Memo approved successfully.' : actionModal === 'Rejected' ? 'Memo rejected.' : `Memo forwarded${forwardTo ? ` to ${forwardTo}` : ''}.`,
      actionModal === 'Rejected' ? 'error' : 'success',
    ));
    setActionModal(null);
    setComment('');
    setForwardTo('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 mb-4">
        <ArrowLeft className="size-4" /> Back
      </button>

      <Card className="mb-5">
        <CardBody>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-medium text-brand-700 mb-1">{memo.reference} · {memo.type}</p>
              <h1 className="text-xl">{memo.subject}</h1>
              <p className="text-sm text-ink-400 mt-1">
                From <span className="text-ink-700 font-medium">{sender?.fullName}</span> ({sender?.title}) · {new Date(memo.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={memo.priority} />
              <StatusBadge status={memo.status} />
            </div>
          </div>

          <div className="my-6 py-6 border-y border-ink-100">
            <StatusTracker current={memo.stage} history={memo.stageHistory} />
          </div>

          <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">{memo.body}</p>

          {memo.attachments.length > 0 && (
            <div className="mt-5 space-y-2">
              {memo.attachments.map((a) => (
                <div key={a.name} className="flex items-center gap-2.5 border border-ink-100 rounded-lg px-3 py-2.5 w-fit">
                  <Paperclip className="size-4 text-ink-400" />
                  <div>
                    <p className="text-sm font-medium text-ink-700">{a.name}</p>
                    <p className="text-xs text-ink-400">{a.size}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {canAct && (
            <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-ink-100">
              <Button variant="primary" icon={<Check className="size-4" />} onClick={() => setActionModal('Approved')}>Approve</Button>
              <Button variant="danger" icon={<XIcon className="size-4" />} onClick={() => setActionModal('Rejected')}>Reject</Button>
              <Button variant="outline" icon={<Forward className="size-4" />} onClick={() => setActionModal('Forwarded')}>Forward</Button>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card>
          <CardHeader><h3 className="text-sm font-semibold">Approval Chain</h3></CardHeader>
          <CardBody className="space-y-3">
            {memo.approvalChain.length === 0 ? (
              <p className="text-sm text-ink-400">No approval routing required.</p>
            ) : memo.approvalChain.map((c, i) => {
              const u = getUser(c.userId);
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="size-8 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0" style={{ backgroundColor: u?.avatarColor }}>
                    {u?.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-800">{u?.fullName} <span className="text-ink-400 font-normal">· {c.role}</span></p>
                    {c.action ? (
                      <>
                        <p className={`text-xs font-medium mt-0.5 ${c.action === 'Rejected' ? 'text-danger-500' : 'text-success-500'}`}>{c.action}</p>
                        {c.comment && <p className="text-xs text-ink-500 mt-1 italic">"{c.comment}"</p>}
                        {c.timestamp && <p className="text-[11px] text-ink-400 mt-0.5">{new Date(c.timestamp).toLocaleString()}</p>}
                      </>
                    ) : (
                      <p className="text-xs text-warning-500 font-medium mt-0.5">Awaiting action</p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="text-sm font-semibold">Read Receipts</h3></CardHeader>
          <CardBody className="space-y-3">
            {memo.readReceipts.length === 0 ? (
              <p className="text-sm text-ink-400">No recipients tracked yet.</p>
            ) : memo.readReceipts.map((r) => {
              const u = getUser(r.userId);
              return (
                <div key={r.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0" style={{ backgroundColor: u?.avatarColor }}>
                      {u?.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <p className="text-sm text-ink-700">{u?.fullName}</p>
                  </div>
                  <ReadReceiptTag receipt={r} />
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      <Modal
        open={!!actionModal}
        onClose={() => setActionModal(null)}
        title={actionModal === 'Approved' ? 'Approve Memo' : actionModal === 'Rejected' ? 'Reject Memo' : 'Forward Memo'}
        footer={<>
          <Button variant="outline" onClick={() => setActionModal(null)}>Cancel</Button>
          <Button variant={actionModal === 'Rejected' ? 'danger' : 'primary'} onClick={handleAction}>Confirm {actionModal}</Button>
        </>}
      >
        <div className="space-y-4">
          {actionModal === 'Forwarded' && (
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Forward to</label>
              <select value={forwardTo} onChange={(e) => setForwardTo(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white">
                <option value="">Select next recipient…</option>
                {users.filter((u) => u.role !== 'Employee').map((u) => <option key={u.id} value={u.fullName}>{u.fullName} ({u.role})</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Comment {actionModal === 'Rejected' ? '(required)' : '(optional)'}</label>
            <textarea
              value={comment} onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Add a comment for the record…"
              className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
