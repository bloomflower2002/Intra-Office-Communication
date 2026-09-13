import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Check, X as XIcon, Search, Eye, RotateCcw, Shield } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Card } from '../components/ui/Card';
import { PriorityBadge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { findUser } from '../features/users/usersSlice';
import { approveMemo, rejectMemo, returnForRevisionMemo } from '../features/memos/memosSlice';
import { pushToast } from '../features/ui/uiSlice';
import { useTranslation } from 'react-i18next';
import type { Memo } from '../types';

export default function Approvals() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const memos = useAppSelector((s) => s.memos.items);
  const users = useAppSelector((s) => s.users.items);
  const currentUser = useAppSelector((s) => s.auth.user);
  const [search, setSearch] = useState('');

  // Quick revision modal state
  const [revisionTarget, setRevisionTarget] = useState<Memo | null>(null);
  const [revisionNote, setRevisionNote] = useState('');

  // Decline (reject) modal state — requires a reason for the audit trail
  const [declineTarget, setDeclineTarget] = useState<Memo | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const pending = memos.filter((m) => {
    if (m.status !== 'Pending Approval') return false;
    const activeStepIdx = m.approvalChain.findIndex((c) => !c.action);
    if (activeStepIdx === -1) return false;
    const activeStep = m.approvalChain[activeStepIdx];

    // Check if step belongs to current user
    const sender = findUser(users, m.senderId);
    const matchesUser =
      activeStep.userId === currentUser?.id ||
      (currentUser?.role === activeStep.role && (activeStep.role === 'Head Office' || currentUser?.department === sender?.department || !sender?.department)) ||
      currentUser?.role === 'System Admin';

    if (!matchesUser) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.subject.toLowerCase().includes(q) ||
        m.reference.toLowerCase().includes(q) ||
        (sender?.fullName && sender.fullName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleQuickEndorse = async (memo: Memo) => {
    const activeStepIdx = memo.approvalChain.findIndex((c) => !c.action);
    const isFinalStep = activeStepIdx === memo.approvalChain.length - 1;
    await dispatch(approveMemo({ memoId: memo.id, comment: isFinalStep ? 'Final Approval granted via Approvals Queue.' : 'Endorsed via Approvals Queue.' }));
    dispatch(pushToast(isFinalStep ? `Memo ${memo.reference} fully approved & released.` : `Memo ${memo.reference} endorsed to next tier.`, 'success'));
  };

  const handleConfirmDecline = async () => {
    if (!declineTarget || !declineReason.trim()) return;
    await dispatch(rejectMemo({ memoId: declineTarget.id, comment: declineReason.trim() }));
    dispatch(pushToast(`Memo ${declineTarget.reference} declined.`, 'error'));
    setDeclineTarget(null);
    setDeclineReason('');
  };

  const handleConfirmRevision = async () => {
    if (!revisionTarget || !revisionNote.trim()) return;
    await dispatch(returnForRevisionMemo({ memoId: revisionTarget.id, comment: revisionNote.trim() }));
    dispatch(pushToast(`Memo ${revisionTarget.reference} returned to author for corrections.`, 'info'));
    setRevisionTarget(null);
    setRevisionNote('');
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-brand-700" />
            <h1 className="text-2xl font-bold text-ink-900">{t('approvals_queue', 'Institutional Approvals & Review Queue')}</h1>
          </div>
          <p className="text-sm text-ink-400 mt-1">
            {currentUser?.role === 'Team Leader'
              ? 'Tier 1 Vetting: Verify document accuracy. Endorse to Director or return for revisions.'
              : currentUser?.role === 'Director'
              ? 'Tier 2 Endorsement: Review departmental memos and forward to Head Office.'
              : currentUser?.role === 'Head Office'
              ? 'Tier 3 Final Authority: Final approval and institutional release of official memos.'
              : 'System-wide approval workflow queue and audit oversight.'}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pending memos…"
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40 bg-white"
          />
        </div>
      </div>

      <Card className="shadow-sm border border-ink-200 overflow-hidden">
        {pending.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={ClipboardCheck}
              title={t('nothing_pending', 'Nothing pending')}
              description="You're all caught up — no memos require your review or approval right now."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-500 text-xs font-semibold uppercase tracking-wider bg-ink-50 border-b border-ink-200">
                  <th className="px-5 py-3.5">Sender / Originator</th>
                  <th className="px-5 py-3.5">Memo Reference & Subject</th>
                  <th className="px-5 py-3.5">Review Tier</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5 text-right">Reviewer Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-white">
                {pending.map((m) => {
                  const sender = findUser(users, m.senderId);
                  const activeStepIdx = m.approvalChain.findIndex((c) => !c.action);
                  const activeStep = activeStepIdx !== -1 ? m.approvalChain[activeStepIdx] : null;
                  const isFinalStep = activeStepIdx === m.approvalChain.length - 1;

                  return (
                    <tr key={m.id} className="hover:bg-brand-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="size-8.5 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm"
                            style={{ backgroundColor: sender?.avatarColor || '#2A4F97' }}
                          >
                            {sender?.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="text-ink-900 font-semibold text-xs truncate">{sender?.fullName || 'Staff'}</p>
                            <p className="text-[11px] text-ink-400 truncate">{sender?.department || 'Department'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 max-w-xs">
                        <span className="text-[10px] font-bold text-brand-700 font-mono uppercase bg-brand-50 px-1.5 py-0.5 rounded">
                          {m.reference}
                        </span>
                        <p className="text-sm font-semibold text-ink-900 mt-1 line-clamp-1">{m.subject}</p>
                        <p className="text-xs text-ink-500 mt-0.5 line-clamp-1">{m.body}</p>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          {activeStep?.role === 'Team Leader'
                            ? 'Tier 1 · Team Leader'
                            : activeStep?.role === 'Director'
                            ? 'Tier 2 · Director'
                            : 'Tier 3 · Head Office'}
                        </span>
                        <p className="text-[10px] text-ink-400 mt-0.5 font-mono">
                          Step {activeStepIdx + 1} of {m.approvalChain.length}
                        </p>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <PriorityBadge priority={m.priority} />
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Endorse / Approve Button */}
                          <button
                            onClick={() => handleQuickEndorse(m)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                            title={isFinalStep ? 'Final Approve & Release' : 'Endorse to Next Tier'}
                          >
                            <Check className="size-3.5" />
                            {isFinalStep ? 'Approve' : 'Endorse'}
                          </button>

                          {/* Return for Revision Button */}
                          <button
                            onClick={() => { setRevisionTarget(m); setRevisionNote(''); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-colors"
                            title="Return to Author with Revision Instructions"
                          >
                            <RotateCcw className="size-3.5" /> Return
                          </button>

                          {/* Decline / Reject — available to any reviewer at their tier */}
                          <button
                            onClick={() => { setDeclineTarget(m); setDeclineReason(''); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors"
                            title="Decline Memo"
                          >
                            <XIcon className="size-3.5" /> Decline
                          </button>

                          <Link
                            to={`/memos/${m.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-ink-100 hover:bg-ink-200 text-ink-700 transition-colors"
                            title="Open Full Dossier"
                          >
                            <Eye className="size-3.5" /> Review
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Quick Return for Revision Modal ──────────────────────────── */}
      <Modal
        open={!!revisionTarget}
        onClose={() => setRevisionTarget(null)}
        title="Return Memo for Revision"
        footer={
          <>
            <Button variant="outline" onClick={() => setRevisionTarget(null)}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              variant="outline"
              disabled={!revisionNote.trim()}
              onClick={handleConfirmRevision}
            >
              Confirm Return for Revision
            </Button>
          </>
        }
      >
        <div className="space-y-3.5 text-sm">
          <div className="p-3 rounded-lg bg-brand-50 border border-brand-200">
            <p className="font-semibold text-brand-900">{revisionTarget?.reference}</p>
            <p className="text-xs text-brand-700 mt-0.5">{revisionTarget?.subject}</p>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <strong>Revision Order:</strong> The author will be notified to review the document, make the required corrections, and resubmit.
          </div>

          <div>
            <label className="block font-medium text-ink-700 mb-1.5">
              Specify Required Corrections / Instructions to Author (Required)
            </label>
            <textarea
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              rows={4}
              placeholder="e.g. Please re-check the department budget table and attach the latest procurement quotation before resubmitting."
              className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* ── Decline Memo Modal ───────────────────────────────────────── */}
      <Modal
        open={!!declineTarget}
        onClose={() => setDeclineTarget(null)}
        title="Decline Memo"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeclineTarget(null)}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              variant="outline"
              disabled={!declineReason.trim()}
              onClick={handleConfirmDecline}
            >
              Confirm Decline
            </Button>
          </>
        }
      >
        <div className="space-y-3.5 text-sm">
          <div className="p-3 rounded-lg bg-brand-50 border border-brand-200">
            <p className="font-semibold text-brand-900">{declineTarget?.reference}</p>
            <p className="text-xs text-brand-700 mt-0.5">{declineTarget?.subject}</p>
          </div>

          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <strong>Decline Notice:</strong> The memo will be marked as rejected and the author will be notified with your reason.
          </div>

          <div>
            <label className="block font-medium text-ink-700 mb-1.5">
              Reason for Declining (Required)
            </label>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
              placeholder="e.g. This request does not align with current departmental policy and cannot be endorsed."
              className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

