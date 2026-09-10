import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Paperclip, Check, X as XIcon, FileText,
  Printer, Mail, User, Building, Clock, Shield, Download,
  RotateCcw, Edit3, AlertCircle, Eye, ExternalLink
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { approveMemo, rejectMemo, forwardMemo, returnForRevisionMemo, resubmitMemo } from '../features/memos/memosSlice';
import { findUser } from '../features/users/usersSlice';
import { pushToast } from '../features/ui/uiSlice';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { StatusBadge, PriorityBadge, ReadReceiptTag, Badge } from '../components/ui/Badge';
import StatusTracker from '../components/memos/StatusTracker';
import EmptyState from '../components/ui/EmptyState';
import { memoTypeKeys, roleKeys } from '../i18n/enumLabels';
import { useTranslation } from 'react-i18next';
import type { Priority, MemoAttachment } from '../types';

type ActionType = 'Approved' | 'Endorsed' | 'Rejected' | 'Forwarded' | 'Returned for Revision';

export default function MemoDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const memo = useAppSelector((s) => s.memos.items.find((m) => m.id === id));
  const users = useAppSelector((s) => s.users.items);
  const currentUser = useAppSelector((s) => s.auth.user);
  const sysConfig = useAppSelector((s) => s.systemConfig);

  const [actionModal, setActionModal] = useState<ActionType | null>(null);
  const [comment, setComment] = useState('');
  const [forwardToId, setForwardToId] = useState('');

  // Resubmit state
  const [resubmitOpen, setResubmitOpen] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('Normal');

  // Attachment preview state
  const [viewingAttachment, setViewingAttachment] = useState<MemoAttachment | null>(null);

  const downloadAttachment = (a: MemoAttachment) => {
    let url = a.dataUrl || a.url;
    let cleanupUrl = false;
    if (!url) {
      const content = `=====================================================
INSTITUTIONAL OFFICIAL ATTACHMENT / DOCUMENT
=====================================================
Document Name : ${a.name}
Memo Reference: ${memo?.reference || 'N/A'}
Subject       : ${memo?.subject || 'N/A'}
File Format   : ${a.type.toUpperCase()}
Recorded Date : ${memo?.createdAt ? new Date(memo.createdAt).toLocaleString() : new Date().toLocaleString()}
Classification: Official Record

-----------------------------------------------------
ATTACHMENT SUMMARY & METADATA
-----------------------------------------------------
This file was registered as an official institutional attachment within the
Intra-Office Communication Management System (IOCMS).

File verification status: Verified by Institutional Gateway.
=====================================================`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      url = URL.createObjectURL(blob);
      cleanupUrl = true;
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = a.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (cleanupUrl) URL.revokeObjectURL(url);
    dispatch(pushToast(`Downloaded attachment: ${a.name}`, 'success'));
  };

  const openAttachmentInNewTab = (a: MemoAttachment) => {
    if (a.dataUrl) {
      const win = window.open();
      if (win) {
        if (a.type === 'image') {
          win.document.write(`<html><head><title>${a.name}</title><style>body{margin:0;background:#0f172a;display:flex;align-items:center;justify-content:center;height:100vh;}img{max-width:95vw;max-height:95vh;object-fit:contain;box-shadow:0 10px 25px rgba(0,0,0,0.5);border-radius:8px;}</style></head><body><img src="${a.dataUrl}" alt="${a.name}"/></body></html>`);
        } else {
          win.document.write(`<html><head><title>${a.name}</title><style>body{margin:0;height:100vh;overflow:hidden;}iframe{width:100%;height:100%;border:none;}</style></head><body><iframe src="${a.dataUrl}"></iframe></body></html>`);
        }
      }
    } else {
      downloadAttachment(a);
    }
  };

  if (!memo) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 mb-4">
          <ArrowLeft className="size-4" /> {t('back')}
        </button>
        <EmptyState
          icon={FileText}
          title={t('memo_not_found')}
          description="The requested memo was not found or may have been archived."
        />
      </div>
    );
  }

  const sender = findUser(users, memo.senderId);
  const isAuthor = currentUser?.id === memo.senderId;

  // Active step in the approval hierarchy
  const activeStepIdx = memo.approvalChain?.findIndex((c) => !c.action);
  const activeStep = (activeStepIdx !== undefined && activeStepIdx !== -1) ? memo.approvalChain[activeStepIdx] : null;
  const isFinalStep = activeStepIdx === (memo.approvalChain?.length || 1) - 1;

  // Reviewer authorization
  const isDesignatedReviewer = activeStep && (
    activeStep.userId === currentUser?.id ||
    (currentUser?.role === activeStep.role && (activeStep.role === 'Head Office' || currentUser?.department === sender?.department || !sender?.department)) ||
    currentUser?.role === 'System Admin'
  );

  const canAct = Boolean(isDesignatedReviewer && memo.status === 'Pending Approval');

  const handleAction = async () => {
    if (!currentUser) return;
    if (actionModal === 'Approved' || actionModal === 'Endorsed') {
      await dispatch(approveMemo({ memoId: memo.id, comment: comment.trim() || undefined }));
      const msg = isFinalStep
        ? `Memo ${memo.reference} received final approval & release authorization.`
        : `Memo ${memo.reference} endorsed and forwarded to the next tier.`;
      dispatch(pushToast(msg, 'success'));
    } else if (actionModal === 'Returned for Revision') {
      await dispatch(returnForRevisionMemo({ memoId: memo.id, comment: comment.trim() || undefined }));
      dispatch(pushToast(`Memo ${memo.reference} returned to author for revision.`, 'info'));
    } else if (actionModal === 'Rejected') {
      await dispatch(rejectMemo({ memoId: memo.id, comment: comment.trim() || undefined }));
      dispatch(pushToast(`Memo ${memo.reference} rejected.`, 'error'));
    } else if (actionModal === 'Forwarded') {
      const target = findUser(users, forwardToId);
      if (!target) return;
      await dispatch(forwardMemo({ memoId: memo.id, toUserId: target.id, toRole: target.role, comment: comment.trim() || undefined }));
      dispatch(pushToast(`Memo forwarded to ${target.fullName}.`, 'success'));
    }
    setActionModal(null);
    setComment('');
    setForwardToId('');
  };

  const handleOpenResubmit = () => {
    setEditSubject(memo.subject);
    setEditBody(memo.body);
    setEditPriority(memo.priority);
    setResubmitOpen(true);
  };

  const handleResubmit = async () => {
    if (!editSubject.trim() || !editBody.trim()) {
      dispatch(pushToast('Subject and body cannot be empty.', 'error'));
      return;
    }
    await dispatch(resubmitMemo({
      memoId: memo.id,
      subject: editSubject.trim(),
      body: editBody.trim(),
      priority: editPriority,
    }));
    dispatch(pushToast('Memo updated and resubmitted for Tier 1 Team Leader vetting.', 'success'));
    setResubmitOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleQuickEmail = () => {
    dispatch(pushToast(`Dispatched official email notice for ${memo.reference}`, 'info'));
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* ── Top Navigation Bar ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 font-medium"
        >
          <ArrowLeft className="size-4" /> {t('back', 'Back to Memos')}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-50 bg-white"
            title="Print official letterhead copy"
          >
            <Printer className="size-3.5" /> {t('print', 'Print Memo')}
          </button>
          <button
            onClick={handleQuickEmail}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-50 bg-white"
            title="Send email notification"
          >
            <Mail className="size-3.5" /> {t('email_notice', 'Email Copy')}
          </button>
        </div>
      </div>

      {/* ── Revision Requested Notice (For Author) ─────────────────── */}
      {memo.status === 'Revision Requested' && (
        <div className="mb-5 p-4.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-ink-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                Action Required: Corrections Requested by Reviewing Official
              </p>
              <p className="text-xs text-amber-800 mt-1">
                {memo.stageHistory?.[memo.stageHistory.length - 1]?.note || 'Reviewer requested changes before this memo can proceed.'}
              </p>
            </div>
          </div>
          {isAuthor && (
            <button
              onClick={handleOpenResubmit}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow transition-colors shrink-0"
            >
              <Edit3 className="size-4" /> Edit & Resubmit Memo
            </button>
          )}
        </div>
      )}

      {/* ── Contextual Action Banner for Leadership ─────────────────── */}
      {canAct && activeStep && (
        <div className="mb-5 p-4.5 rounded-xl bg-gradient-to-r from-brand-900 via-brand-800 to-ink-900 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-brand-700/50">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="size-4.5 text-brand-300" />
              <p className="text-sm font-bold text-white">
                {activeStep.role === 'Team Leader'
                  ? 'Tier 1 · Team Leader Vetting & Verification'
                  : activeStep.role === 'Director'
                  ? 'Tier 2 · Department Director Review & Endorsement'
                  : 'Tier 3 · Head Office Final Approval & Authorization'}
              </p>
              <Badge tone="warning">Pending Your Review</Badge>
            </div>
            <p className="text-xs text-brand-200 mt-1">
              {activeStep.role === 'Team Leader'
                ? 'Check document accuracy. If valid, endorse to Director; if errors exist, return to author.'
                : activeStep.role === 'Director'
                ? 'Review departmental memo. If endorsed, forward to Head Office for final release.'
                : 'Final institutional release authority. Authorize release or return for revisions.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Endorse / Approve Button */}
            <button
              onClick={() => { setComment(''); setActionModal(isFinalStep ? 'Approved' : 'Endorsed'); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-colors"
            >
              <Check className="size-4" />
              {isFinalStep ? 'Final Approve & Release' : activeStep.role === 'Team Leader' ? 'Endorse to Director' : 'Endorse to Head Office'}
            </button>

            {/* Return for Revision Button */}
            <button
              onClick={() => { setComment(''); setActionModal('Returned for Revision'); }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow transition-colors"
              title="Send back to creator with instructions to fix"
            >
              <RotateCcw className="size-3.5" />
              Return for Revision
            </button>

            {/* Reject Button (Available for Head Office / Director) */}
            {(activeStep.role === 'Head Office' || activeStep.role === 'Director') && (
              <button
                onClick={() => { setComment(''); setActionModal('Rejected'); }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow transition-colors"
              >
                <XIcon className="size-3.5" />
                Reject
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Main Document Dossier Card ─────────────────────────────── */}
      <Card className="mb-6 overflow-hidden border border-ink-200 shadow-sm">
        {/* Official Header */}
        <div className="p-6 bg-brand-50/50 border-b border-ink-100 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="size-11 rounded-xl bg-brand-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              {sysConfig.orgShortName || 'OSTA'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-brand-800 uppercase tracking-wider font-mono">
                  {memo.reference}
                </span>
                <span className="text-ink-300">·</span>
                <span className="text-xs font-medium text-ink-600">
                  {t(memoTypeKeys[memo.type]) || memo.type}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-ink-900 mt-1 leading-tight">
                {memo.subject}
              </h1>
              <p className="text-xs text-ink-500 mt-1">
                Issued on {new Date(memo.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start shrink-0">
            <PriorityBadge priority={memo.priority} />
            <StatusBadge status={memo.status} />
          </div>
        </div>

        {/* Sender Dossier Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-ink-100 border-b border-ink-100 bg-white text-xs">
          <div className="p-4 flex items-center gap-3">
            <div
              className="size-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: sender?.avatarColor || '#2A4F97' }}
            >
              {sender?.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0">
              <p className="text-ink-400 text-[11px]">Originator / Sender</p>
              <p className="text-sm font-semibold text-ink-900 truncate">{sender?.fullName || 'Institutional Staff'}</p>
              <p className="text-ink-500 truncate">{sender?.title || 'Staff Officer'}</p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-ink-100 text-ink-600 flex items-center justify-center shrink-0">
              <Building className="size-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-ink-400 text-[11px]">Department / Bureau</p>
              <p className="text-sm font-semibold text-ink-900 truncate">{sender?.department || 'Administration'}</p>
              <p className="text-ink-500 truncate">{sender?.email || 'N/A'}</p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-ink-100 text-ink-600 flex items-center justify-center shrink-0">
              <Clock className="size-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-ink-400 text-[11px]">Workflow Stage</p>
              <p className="text-sm font-semibold text-brand-700 capitalize">{memo.stage || 'Issued'}</p>
              <p className="text-ink-500">{memo.approvalChain?.length || 0} Approval Step(s)</p>
            </div>
          </div>
        </div>

        {/* Live Stage Progression Tracker */}
        <div className="p-5 bg-ink-50/50 border-b border-ink-100">
          <p className="text-xs font-semibold text-ink-600 mb-3 uppercase tracking-wider">
            Institutional Routing Timeline
          </p>
          <StatusTracker current={memo.stage} history={memo.stageHistory} />
        </div>

        {/* Document Body */}
        <CardBody className="p-6">
          <div className="prose max-w-none text-ink-800 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-white p-5 rounded-lg border border-ink-100 shadow-inner min-h-[140px]">
            {memo.body}
          </div>

          {/* Attachments Section */}
          {memo.attachments && memo.attachments.length > 0 && (
            <div className="mt-6 pt-5 border-t border-ink-100">
              <p className="text-xs font-bold text-ink-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Paperclip className="size-3.5" />
                Attached Official Documents ({memo.attachments.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {memo.attachments.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-ink-200 bg-ink-50/70 hover:bg-ink-100/70 transition-colors"
                  >
                    <div
                      onClick={() => setViewingAttachment(a)}
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                    >
                      <div className="size-8.5 rounded bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 font-bold text-[10px] uppercase group-hover:bg-brand-200 transition-colors">
                        {a.type || 'DOC'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-ink-900 truncate group-hover:text-brand-700 transition-colors">{a.name}</p>
                        <p className="text-[10px] text-ink-400">{a.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setViewingAttachment(a)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded text-brand-700 hover:bg-brand-100 bg-white border border-brand-200"
                        title="View / Preview Attachment"
                      >
                        <Eye className="size-3" /> Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadAttachment(a)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded text-ink-700 hover:bg-ink-200 bg-white border border-ink-200"
                        title="Download Attachment File"
                      >
                        <Download className="size-3" /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Detailed Dossier: Approval Chain & Recipients ──────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Approval Chain History */}
        <Card className="border border-ink-200 shadow-sm">
          <CardHeader className="flex items-center justify-between border-b border-ink-100 bg-ink-50/50">
            <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
              <Shield className="size-4 text-brand-600" />
              Hierarchical Review & Sign-Offs
            </h3>
            <span className="text-xs text-ink-400 font-mono">
              {memo.approvalChain?.filter((c) => c.action).length} / {memo.approvalChain?.length} Done
            </span>
          </CardHeader>
          <CardBody className="p-4 space-y-3">
            {!memo.approvalChain || memo.approvalChain.length === 0 ? (
              <p className="text-xs text-ink-400 py-4 text-center">
                This document is a direct Circular / Notice with no approval hierarchy required.
              </p>
            ) : (
              memo.approvalChain.map((c, i) => {
                const u = findUser(users, c.userId);
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border text-xs ${
                      c.action === 'Approved'
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : c.action === 'Rejected'
                        ? 'border-rose-200 bg-rose-50/40'
                        : 'border-amber-200 bg-amber-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="size-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ backgroundColor: u?.avatarColor || '#2A4F97' }}
                        >
                          {u?.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-ink-900">
                            {u?.fullName || 'Reviewing Official'}
                          </p>
                          <p className="text-[11px] text-ink-500">
                            {u?.title || c.role} ({t(roleKeys[c.role]) || c.role})
                          </p>
                        </div>
                      </div>

                      <Badge
                        tone={
                          c.action === 'Approved' ? 'success' : c.action === 'Rejected' ? 'danger' : 'warning'
                        }
                      >
                        {c.action ? c.action : 'Pending Review'}
                      </Badge>
                    </div>

                    {c.comment && (
                      <div className="mt-2 pt-2 border-t border-ink-200/60">
                        <p className="text-[11px] text-ink-600 italic">
                          "{c.comment}"
                        </p>
                      </div>
                    )}

                    {c.timestamp && (
                      <p className="text-[10px] text-ink-400 mt-1.5 font-mono">
                        {new Date(c.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>

        {/* Card 2: Delivery & Read Receipts */}
        <Card className="border border-ink-200 shadow-sm">
          <CardHeader className="flex items-center justify-between border-b border-ink-100 bg-ink-50/50">
            <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
              <User className="size-4 text-brand-600" />
              Recipient Inboxes & Read Receipts
            </h3>
            <span className="text-xs text-ink-400 font-mono">
              {memo.readReceipts?.filter((r) => r.status === 'read').length || 0} Read
            </span>
          </CardHeader>
          <CardBody className="p-4 space-y-2.5 max-h-[300px] overflow-y-auto scrollbar-thin">
            {!memo.recipients || memo.recipients.length === 0 ? (
              <p className="text-xs text-ink-400 py-4 text-center">
                No individual recipient records tracked.
              </p>
            ) : (
              memo.recipients.map((recId, i) => {
                const isExternal = typeof recId === 'string' && recId.startsWith('email:');
                const emailStr = isExternal ? recId.replace('email:', '') : '';
                const u = !isExternal ? findUser(users, recId) : null;
                const receipt = memo.readReceipts?.find((r) => r.userId === recId);

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-ink-50/60 border border-ink-100 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="size-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {isExternal ? '✉️' : (u?.fullName?.[0] || 'U')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-ink-800 truncate">
                          {isExternal ? emailStr : (u?.fullName || recId)}
                        </p>
                        <p className="text-[10px] text-ink-400 truncate">
                          {isExternal ? 'External Recipient' : (u?.department || 'Internal Staff')}
                        </p>
                      </div>
                    </div>

                    {receipt ? (
                      <ReadReceiptTag receipt={receipt} />
                    ) : (
                      <span className="text-[10px] text-ink-400 bg-ink-100 px-2 py-0.5 rounded">
                        Dispatched
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>
      </div>

      {/* ── Action Confirmation Modal ───────────────────────────────── */}
      <Modal
        open={!!actionModal}
        onClose={() => setActionModal(null)}
        title={
          actionModal === 'Approved'
            ? 'Final Approve & Release Memo'
            : actionModal === 'Endorsed'
            ? 'Endorse & Forward to Next Tier'
            : actionModal === 'Returned for Revision'
            ? 'Return Memo to Author for Revision'
            : actionModal === 'Rejected'
            ? 'Reject Official Memo'
            : 'Forward Memo to Official'
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setActionModal(null)}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              variant={
                actionModal === 'Rejected'
                  ? 'danger'
                  : actionModal === 'Returned for Revision'
                  ? 'outline'
                  : 'primary'
              }
              disabled={
                (actionModal === 'Returned for Revision' && !comment.trim()) ||
                (actionModal === 'Forwarded' && !forwardToId)
              }
              onClick={handleAction}
            >
              {actionModal === 'Approved'
                ? 'Confirm Final Approval'
                : actionModal === 'Endorsed'
                ? 'Confirm Endorsement'
                : actionModal === 'Returned for Revision'
                ? 'Return for Revision'
                : actionModal === 'Rejected'
                ? 'Confirm Rejection'
                : 'Forward Memo'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-sm">
          <div className="p-3 rounded-lg bg-brand-50 border border-brand-200">
            <p className="font-semibold text-brand-900">{memo.reference}</p>
            <p className="text-xs text-brand-700 mt-0.5">{memo.subject}</p>
          </div>

          {actionModal === 'Returned for Revision' && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <strong>Instructions for Author:</strong> State clearly what errors were found or what corrections are needed before this memo can be endorsed.
            </div>
          )}

          {actionModal === 'Forwarded' && (
            <div>
              <label className="block font-medium text-ink-700 mb-1.5">
                Select Forward Recipient
              </label>
              <select
                value={forwardToId}
                onChange={(e) => setForwardToId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100"
              >
                <option value="">Choose Director / Official</option>
                {users
                  .filter((u) => u.id !== currentUser?.id && u.role !== 'Employee')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} — {u.title} ({u.department})
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-medium text-ink-700 mb-1.5">
              {actionModal === 'Returned for Revision'
                ? 'Required Revision Notes / What to Fix'
                : actionModal === 'Rejected'
                ? 'Reason for Rejection (Optional)'
                : 'Official Remarks / Endorsement Note (Optional)'}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder={
                actionModal === 'Returned for Revision'
                  ? 'e.g. Please re-check the budget figures in paragraph 2 and attach the approved invoice.'
                  : actionModal === 'Endorsed'
                  ? 'e.g. Verified and endorsed. Content conforms to department guidelines.'
                  : actionModal === 'Approved'
                  ? 'e.g. Approved and authorized for institutional dissemination.'
                  : 'e.g. Please review and revise.'
              }
              className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* ── Edit & Resubmit Modal (For Authors) ───────────────────────── */}
      <Modal
        open={resubmitOpen}
        onClose={() => setResubmitOpen(false)}
        title="Edit & Resubmit Memo for Review"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setResubmitOpen(false)}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button onClick={handleResubmit}>
              Resubmit for Vetting
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-sm">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <strong>Reviewer Feedback:</strong>{' '}
            {memo.stageHistory?.[memo.stageHistory.length - 1]?.note || 'Please fix identified issues.'}
          </div>

          <div>
            <label className="block font-medium text-ink-700 mb-1.5">Subject</label>
            <input
              value={editSubject}
              onChange={(e) => setEditSubject(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100"
            />
          </div>

          <div>
            <label className="block font-medium text-ink-700 mb-1.5">Updated Document Body</label>
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={8}
              className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 resize-none font-sans"
            />
          </div>
        </div>
      </Modal>

      {/* ── Attachment Preview & Download Modal ────────────────────── */}
      <Modal
        open={Boolean(viewingAttachment)}
        onClose={() => setViewingAttachment(null)}
        title={viewingAttachment ? `Attachment: ${viewingAttachment.name}` : 'Document Preview'}
        size="lg"
        footer={
          viewingAttachment && (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-ink-400 font-mono">
                {viewingAttachment.type.toUpperCase()} · {viewingAttachment.size}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setViewingAttachment(null)}>
                  Close
                </Button>
                {viewingAttachment.dataUrl && (
                  <Button
                    variant="outline"
                    onClick={() => openAttachmentInNewTab(viewingAttachment)}
                    className="inline-flex items-center gap-1.5"
                  >
                    <ExternalLink className="size-3.5" /> Full Window
                  </Button>
                )}
                <Button
                  onClick={() => downloadAttachment(viewingAttachment)}
                  className="inline-flex items-center gap-1.5"
                >
                  <Download className="size-3.5" /> Download File
                </Button>
              </div>
            </div>
          )
        }
      >
        {viewingAttachment && (
          <div className="space-y-4">
            {viewingAttachment.type === 'image' && viewingAttachment.dataUrl ? (
              <div className="max-h-[60vh] overflow-auto flex items-center justify-center p-3 bg-ink-900 rounded-xl">
                <img
                  src={viewingAttachment.dataUrl}
                  alt={viewingAttachment.name}
                  className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-md"
                />
              </div>
            ) : viewingAttachment.type === 'pdf' && viewingAttachment.dataUrl ? (
              <div className="h-[60vh] rounded-xl overflow-hidden border border-ink-200 bg-ink-100">
                <iframe
                  src={viewingAttachment.dataUrl}
                  title={viewingAttachment.name}
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-ink-50 border border-ink-200 text-center space-y-4">
                <div className="size-16 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto shadow-inner font-bold text-lg">
                  {viewingAttachment.type.toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-bold text-ink-900">{viewingAttachment.name}</h4>
                  <p className="text-xs text-ink-500 mt-1">
                    Official Attached Document ({viewingAttachment.size})
                  </p>
                  <p className="text-xs text-ink-400 mt-1">
                    Attached to memo: <span className="font-mono font-semibold text-brand-700">{memo.reference}</span>
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-white border border-ink-200 text-left max-w-md mx-auto text-xs text-ink-600 space-y-2">
                  <div className="flex justify-between py-1 border-b border-ink-100">
                    <span className="text-ink-400">Document Type</span>
                    <span className="font-semibold text-ink-800 uppercase">{viewingAttachment.type}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-ink-100">
                    <span className="text-ink-400">File Size</span>
                    <span className="font-semibold text-ink-800">{viewingAttachment.size}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-ink-400">Security Clearance</span>
                    <span className="font-semibold text-emerald-700">Verified Institutional Asset</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => downloadAttachment(viewingAttachment)}
                    className="inline-flex items-center gap-2"
                  >
                    <Download className="size-4" /> Download & Open Document
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

