import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, X as XIcon, Search, Eye, RotateCcw, Shield, Paperclip, Zap, Clock, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Card } from '../components/ui/Card';
import { PriorityBadge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { findUser, fetchUsers } from '../features/users/usersSlice';
import { approveMemo, rejectMemo, returnForRevisionMemo, fetchMemos } from '../features/memos/memosSlice';
import { pushToast } from '../features/ui/uiSlice';
import { useTranslation } from 'react-i18next';
import type { Memo } from '../types';

export default function Approvals() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const memos = useAppSelector((s) => s.memos.items);
  const memosPagination = useAppSelector((s) => s.memos.pagination);
  const users = useAppSelector((s) => s.users.items);
  const currentUser = useAppSelector((s) => s.auth.user);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'my_tier' | 'all_pipeline'>('my_tier');
  const [page, setPage] = useState(1);

  // Always fetch fresh memos and users when entering the Approvals view.
  // Only the pending-approval queue is relevant here, so narrow it server-side
  // and use a larger page size since this list is meant to be worked through.
  useEffect(() => {
    dispatch(fetchMemos({ page, pageSize: 50, status: 'Pending Approval' }));
    dispatch(fetchUsers());
  }, [dispatch, page]);

  useEffect(() => { setPage(1); }, [activeTab]);

  // Quick revision modal state
  const [revisionTarget, setRevisionTarget] = useState<Memo | null>(null);
  const [revisionNote, setRevisionNote] = useState('');

  // 1. Memos awaiting action at the current user's review tier
  const myTierPending = memos.filter((m) => {
    if (m.status !== 'Pending Approval') return false;
    const activeStepIdx = m.approvalChain.findIndex((c) => !c.action);
    if (activeStepIdx === -1) return false;
    const activeStep = m.approvalChain[activeStepIdx];

    const isDirectAssignee = activeStep.userId === currentUser?.id;
    const isTeamLeaderTier = currentUser?.role === 'Team Leader' && activeStep.role === 'Team Leader';
    const isDirectorTier = currentUser?.role === 'Director' && activeStep.role === 'Director';
    const isHeadOfficeTier = currentUser?.role === 'Head Office' && activeStep.role === 'Head Office';
    const isAdmin = currentUser?.role === 'System Admin';

    return isDirectAssignee || isTeamLeaderTier || isDirectorTier || isHeadOfficeTier || isAdmin;
  });

  // 2. All in-flight memos in the institution's approval pipeline
  const allInPipeline = memos.filter((m) => m.status === 'Pending Approval');

  // Choose the active dataset based on selected tab
  const displayedMemos = (activeTab === 'my_tier' ? myTierPending : allInPipeline).filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const sender = findUser(users, m.senderId);
    return (
      m.subject.toLowerCase().includes(q) ||
      m.reference.toLowerCase().includes(q) ||
      (sender?.fullName && sender.fullName.toLowerCase().includes(q)) ||
      (sender?.department && sender.department.toLowerCase().includes(q))
    );
  });

  const handleQuickEndorse = async (memo: Memo) => {
    const activeStepIdx = memo.approvalChain.findIndex((c) => !c.action);
    const isFinalStep = activeStepIdx === memo.approvalChain.length - 1;
    await dispatch(
      approveMemo({
        memoId: memo.id,
        comment: isFinalStep ? 'Final Approval granted & Official OSTA Stamp affixed.' : 'Endorsed with Official Stamp to next tier.',
      })
    );
    dispatch(
      pushToast(
        isFinalStep
          ? `Memo ${memo.reference} fully approved with Official OSTA Authority Stamp affixed.`
          : `Memo ${memo.reference} endorsed with Official Stamp to next tier.`,
        'success'
      )
    );
  };

  const handleFastTrackApprove = async (memo: Memo) => {
    await dispatch(
      approveMemo({
        memoId: memo.id,
        comment: 'Executive Fast-Track Authorization & Release by Head Office (Official OSTA Stamp Affixed).',
        fastTrack: true,
      })
    );
    dispatch(pushToast(`Memo ${memo.reference} fast-track authorized with Official OSTA Stamp affixed!`, 'success'));
  };

  const handleQuickReject = async (memoId: string, reference: string) => {
    await dispatch(rejectMemo({ memoId, comment: 'Rejected via Approvals Queue.' }));
    dispatch(pushToast(`Memo ${reference} rejected.`, 'error'));
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

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-ink-200 pb-2">
        <button
          onClick={() => setActiveTab('my_tier')}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'my_tier'
              ? 'bg-brand-700 text-white shadow-sm'
              : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
          }`}
        >
          <span>Requires My Tier Action</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'my_tier' ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-800'
            }`}
          >
            {myTierPending.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all_pipeline')}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'all_pipeline'
              ? 'bg-brand-700 text-white shadow-sm'
              : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
          }`}
        >
          <Clock className="size-3.5" />
          <span>All In-Flight Pipeline</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'all_pipeline' ? 'bg-white/20 text-white' : 'bg-ink-200 text-ink-700'
            }`}
          >
            {allInPipeline.length}
          </span>
        </button>
      </div>

      {/* Information notice if my_tier is empty but in_flight has memos */}
      {activeTab === 'my_tier' && myTierPending.length === 0 && allInPipeline.length > 0 && (
        <div className="mb-4 p-3.5 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-between gap-3 text-xs text-brand-900">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-brand-600 shrink-0" />
            <span>
              {currentUser?.role === 'Head Office'
                ? `You have 0 memos currently awaiting Tier 3 final sign-off, but ${allInPipeline.length} memo(s) are actively progressing through Tier 1 / Tier 2 departmental vetting.`
                : `${allInPipeline.length} institutional memo(s) are currently in earlier or later stages of review in the pipeline.`}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('all_pipeline')}
            className="inline-flex items-center gap-1 font-bold text-brand-700 hover:underline shrink-0"
          >
            View In-Flight Pipeline <ArrowRight className="size-3.5" />
          </button>
        </div>
      )}

      {/* Table Card */}
      <Card className="shadow-sm border border-ink-200 overflow-hidden">
        {displayedMemos.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={ClipboardCheck}
              title={activeTab === 'my_tier' ? t('nothing_pending', 'Nothing pending') : 'No Memos in Pipeline'}
              description={
                activeTab === 'my_tier'
                  ? "You're all caught up — no memos currently require your review or approval at this tier."
                  : 'There are currently no memos undergoing review in the organization.'
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-500 text-xs font-semibold uppercase tracking-wider bg-ink-50 border-b border-ink-200">
                  <th className="px-5 py-3.5">Sender / Originator</th>
                  <th className="px-5 py-3.5">Memo Reference & Subject</th>
                  <th className="px-5 py-3.5">Current Active Tier</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5 text-right">Reviewer Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-white">
                {displayedMemos.map((m) => {
                  const sender = findUser(users, m.senderId);
                  const activeStepIdx = m.approvalChain.findIndex((c) => !c.action);
                  const activeStep = activeStepIdx !== -1 ? m.approvalChain[activeStepIdx] : null;
                  const isFinalStep = activeStepIdx === m.approvalChain.length - 1;

                  const canActDirectly =
                    activeStep &&
                    (activeStep.userId === currentUser?.id ||
                      (currentUser?.role === 'Team Leader' && activeStep.role === 'Team Leader') ||
                      (currentUser?.role === 'Director' && activeStep.role === 'Director') ||
                      (currentUser?.role === 'Head Office' && activeStep.role === 'Head Office') ||
                      currentUser?.role === 'System Admin');

                  const canFastTrack =
                    (currentUser?.role === 'Head Office' || currentUser?.role === 'System Admin') &&
                    activeStepIdx !== -1 &&
                    !isFinalStep;

                  return (
                    <tr key={m.id} className="hover:bg-brand-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="size-8.5 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm"
                            style={{ backgroundColor: sender?.avatarColor || '#2A4F97' }}
                          >
                            {sender?.fullName
                              ? sender.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')
                              : 'ST'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-ink-900 font-semibold text-xs truncate">{sender?.fullName || 'Staff'}</p>
                            <p className="text-[11px] text-ink-400 truncate">{sender?.department || 'Department'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 max-w-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-brand-700 font-mono uppercase bg-brand-50 px-1.5 py-0.5 rounded">
                            {m.reference}
                          </span>
                          {m.attachments && m.attachments.length > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-brand-700 bg-brand-50 px-1 py-0.5 rounded font-medium">
                              <Paperclip className="size-2.5" />
                              {m.attachments.length}
                            </span>
                          )}
                        </div>
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
                          {/* Direct Endorse / Approve Button */}
                          {canActDirectly && (
                            <>
                              <button
                                onClick={() => handleQuickEndorse(m)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                                title={isFinalStep ? 'Final Approve & Affix Official OSTA Stamp' : 'Endorse with Official Stamp'}
                              >
                                <img src="/official-stamp.png" alt="Seal" className="size-3.5 object-contain brightness-0 invert drop-shadow-sm" />
                                {isFinalStep ? 'Approve & Stamp' : 'Endorse & Stamp'}
                              </button>

                              <button
                                onClick={() => {
                                  setRevisionTarget(m);
                                  setRevisionNote('');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-colors"
                                title="Return to Author with Revision Instructions"
                              >
                                <RotateCcw className="size-3.5" /> Return
                              </button>

                              {(activeStep?.role === 'Head Office' || currentUser?.role === 'Head Office') && (
                                <button
                                  onClick={() => handleQuickReject(m.id, m.reference)}
                                  className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors"
                                  title="Reject Memo"
                                >
                                  <XIcon className="size-3.5" />
                                </button>
                              )}
                            </>
                          )}

                          {/* Executive Fast-Track Release (For Head Office / Admin when viewing pipeline) */}
                          {canFastTrack && !canActDirectly && (
                            <button
                              onClick={() => handleFastTrackApprove(m)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-brand-700 hover:bg-brand-600 text-white shadow-sm transition-colors"
                              title="Executive Fast-Track: Authorize & release immediately"
                            >
                              <Zap className="size-3.5 text-amber-300" /> Fast-Track
                            </button>
                          )}

                          {/* Dossier Review Link */}
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
        {memosPagination && (
          <div className="px-5 py-3 border-t border-ink-100">
            <Pagination pagination={memosPagination} onPageChange={setPage} />
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
    </div>
  );
}

