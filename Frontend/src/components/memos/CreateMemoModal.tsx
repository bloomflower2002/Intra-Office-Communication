import { useEffect, useState } from 'react';
import { Bold, Italic, List, Underline, Paperclip, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createMemo } from '../../features/memos/memosSlice';
import { fetchUsers } from '../../features/users/usersSlice';
import { pushToast } from '../../features/ui/uiSlice';
import { fetchChannels } from '../../features/messages/messagesSlice';
import { memoTypeKeys, priorityKeys } from '../../i18n/enumLabels';
import type { MemoType, Priority, Role, MemoAttachment } from '../../types';

import { useTranslation } from 'react-i18next';
const memoTypes: MemoType[] = ['Official Memo', 'Circular', 'Notice', 'Directive'];
const priorities: Priority[] = ['Low', 'Normal', 'High', 'Urgent'];

export default function CreateMemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.auth.user);
  const users = useAppSelector((s) => s.users.items);
  const channels = useAppSelector((s) => s.messages.channels);
  const [type, setType] = useState<MemoType>('Official Memo');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<Priority>('Normal');
  // Selected recipients are kept as { id, label } so we can send real backend ids
  // (user id or channel id) while still displaying friendly names in the chip list.
  const [recipients, setRecipients] = useState<{ id: string; label: string }[]>([]);
  const [recipientQuery, setRecipientQuery] = useState('');
  const [approverId, setApproverId] = useState('');
  const [attachment, setAttachment] = useState<MemoAttachment | null>(null);
  const [errors, setErrors] = useState<{ subject?: string; body?: string; recipients?: string }>({});

  useEffect(() => {
    if (open) {
      dispatch(fetchUsers());
      dispatch(fetchChannels());
    }
  }, [open, dispatch]);

  const recipientOptions = [
    ...channels.map((c) => ({ id: c.id, label: c.name })),
    ...users.filter((u) => u.id !== currentUser?.id).map((u) => ({ id: u.id, label: u.fullName })),
  ].filter((opt) => opt.label.toLowerCase().includes(recipientQuery.toLowerCase()) && !recipients.some((r) => r.id === opt.id));

  const reset = () => {
    setType('Official Memo'); setSubject(''); setBody(''); setPriority('Normal');
    setRecipients([]); setRecipientQuery(''); setApproverId(''); setAttachment(null); setErrors({});
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Calculate readable size
    const sizeInKb = file.size / 1024;
    const readableSize = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${Math.round(sizeInKb)} KB`;

    // Determine type
    const ext = file.name.split('.').pop()?.toLowerCase();
    let fileType: 'pdf' | 'docx' | 'image' = 'pdf';
    if (ext === 'docx' || ext === 'doc') fileType = 'docx';
    else if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext || '')) fileType = 'image';

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        size: readableSize,
        type: fileType,
        dataUrl: reader.result as string,
      });
    };
    reader.onerror = () => {
      setAttachment({
        name: file.name,
        size: readableSize,
        type: fileType,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    // Auto-resolve recipient if user typed in recipientQuery without clicking suggestion or hitting Enter
    let resolvedRecipients = [...recipients];
    if (resolvedRecipients.length === 0 && recipientQuery.trim()) {
      const q = recipientQuery.trim();
      const matched = recipientOptions.find((o) => o.label.toLowerCase() === q.toLowerCase());
      if (matched) {
        resolvedRecipients.push(matched);
      } else if (q.includes('@') && q.includes('.')) {
        resolvedRecipients.push({ id: `email:${q}`, label: q });
      }
    }

    const e: typeof errors = {};
    if (!subject.trim()) e.subject = 'Subject is required.';
    if (!body.trim()) e.body = 'Memo body cannot be empty.';
    if (resolvedRecipients.length === 0) e.recipients = 'Select at least one recipient.';
    setErrors(e);
    if (Object.keys(e).length > 0 || !currentUser) return;

    let chain: { role: Role; userId: string }[] = [];
    if (type === 'Official Memo' || type === 'Directive') {
      const senderDept = currentUser.department || 'ICT Bureau';
      const tl = users.find((u) => u.role === 'Team Leader' && (u.department === senderDept || !senderDept)) || users.find((u) => u.role === 'Team Leader') || { id: 'u-tl-rd' };
      const dir = users.find((u) => u.role === 'Director' && (u.department === senderDept || !senderDept)) || users.find((u) => u.role === 'Director') || { id: 'u-dir-ict' };
      const head = users.find((u) => u.role === 'Head Office') || { id: 'u-head' };

      const selectedTL = users.find((u) => u.id === approverId && u.role === 'Team Leader') || tl;
      const selectedDir = users.find((u) => u.id === approverId && u.role === 'Director') || dir;

      if (currentUser.role === 'Head Office') {
        // Head Office issues memos directly without lower-tier review
        chain = [];
      } else if (currentUser.role === 'Director') {
        // Directors route directly to Head Office for release
        chain = [{ role: 'Head Office', userId: head.id }];
      } else if (currentUser.role === 'Team Leader') {
        // Team Leaders route to Director and Head Office
        chain = [
          { role: 'Director', userId: selectedDir.id },
          { role: 'Head Office', userId: head.id },
        ];
      } else {
        // Employees and Admins route through full 3-tier hierarchy
        chain = [
          { role: 'Team Leader', userId: selectedTL.id },
          { role: 'Director', userId: selectedDir.id },
          { role: 'Head Office', userId: head.id },
        ];
      }
    }

    const result = await dispatch(createMemo({
      type,
      subject: subject.trim(),
      body: body.trim(),
      recipients: resolvedRecipients.map((r) => r.id),
      priority,
      attachments: attachment ? [attachment] : [],
      approvalChain: chain,
    }));

    if (createMemo.fulfilled.match(result)) {
      const successMsg = chain.length > 0
        ? `Memo created and submitted to ${chain[0].role} for vetting.`
        : 'Memo created and published successfully.';
      dispatch(pushToast(successMsg, 'success'));
      reset();
      onClose();
    } else {
      const err = (result as any)?.error?.message || (result as any)?.payload || 'Failed to create memo. Please check document contents.';
      dispatch(pushToast(err, 'error'));
    }
  };

  const isAdmin = currentUser?.role === 'System Admin';

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title={t('create_new_memo')} size="lg"
      footer={<>
        <Button variant="outline" onClick={() => { reset(); onClose(); }}>{t('cancel')}</Button>
        <Button onClick={handleSubmit}>{t('submit_for_approval')}</Button>
      </>}
    >
      <div className="space-y-4">
        {isAdmin && (
          <div className="p-3.5 rounded-lg bg-brand-50 border border-brand-200 text-brand-800 text-xs leading-relaxed">
            <strong>System Admin Originator:</strong> Submitting as Administrator will route this memo through the official departmental hierarchy for sign-off.
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">{t('memo_type')}</label>
          <select value={type} onChange={(e) => setType(e.target.value as MemoType)} className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100">
            {memoTypes.map((mt) => <option key={mt} value={mt}>{t(memoTypeKeys[mt])}</option>)}
          </select>
        </div>

        {(type === 'Official Memo' || type === 'Directive') && (
          <div className="p-3.5 rounded-xl bg-brand-50/70 border border-brand-200/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                Institutional 3-Tier Approval Workflow
              </span>
              <span className="text-[10px] bg-brand-200 text-brand-800 px-2 py-0.5 rounded-full font-semibold">
                Sequential Routing
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white border border-brand-200">
                <span className="text-[10px] font-bold text-brand-600 block">Tier 1 · Vetting</span>
                <span className="font-semibold text-ink-900">Team Leader</span>
                <span className="text-[10px] text-ink-400 block">Checks & can return for revision</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-brand-200">
                <span className="text-[10px] font-bold text-brand-600 block">Tier 2 · Endorsement</span>
                <span className="font-semibold text-ink-900">Department Director</span>
                <span className="text-[10px] text-ink-400 block">Departmental sign-off</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-brand-200">
                <span className="text-[10px] font-bold text-brand-600 block">Tier 3 · Final Release</span>
                <span className="font-semibold text-ink-900">Head Office</span>
                <span className="text-[10px] text-ink-400 block">Executive approval & authorization</span>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">{t('subject')}</label>
          <input
            value={subject} onChange={(e) => setSubject(e.target.value)}
            placeholder={t('e_g_approval_request_q4_budget_allocation')}
            className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none ${errors.subject ? 'border-danger-500' : 'border-ink-200 focus:border-brand-500'}`}
          />
          {errors.subject && <p className="text-xs text-danger-500 mt-1">{errors.subject}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">{t('recipients')}</label>
          <div className="border border-ink-200 rounded-lg p-2 focus-within:border-brand-500">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {recipients.map((r) => (
                <span key={r.id} className="flex items-center gap-1 bg-brand-100 text-brand-700 text-xs font-medium px-2 py-1 rounded-full">
                  {r.label}
                  <button onClick={() => setRecipients(recipients.filter((x) => x.id !== r.id))}><X className="size-3" /></button>
                </span>
              ))}
            </div>
            <input
              value={recipientQuery}
              onChange={(e) => setRecipientQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && recipientQuery.trim()) {
                  e.preventDefault();
                  const val = recipientQuery.trim();
                  const isEmail = val.includes('@') && val.includes('.');
                  if (isEmail) {
                    setRecipients([...recipients, { id: `email:${val}`, label: val }]);
                    setRecipientQuery('');
                  }
                }
              }}
              placeholder={t('search_users_or_departments', 'Search staff, departments, or type real email (e.g. user@gmail.com)...')}
              className="w-full text-sm outline-none px-1 py-1"
            />
            {recipientQuery && (
              <div className="border-t border-ink-100 mt-1 pt-1 max-h-36 overflow-y-auto scrollbar-thin">
                {recipientQuery.includes('@') && !recipients.some((r) => r.label.toLowerCase() === recipientQuery.toLowerCase()) && (
                  <button
                    type="button"
                    onClick={() => {
                      setRecipients([...recipients, { id: `email:${recipientQuery.trim()}`, label: `✉️ Send to: ${recipientQuery.trim()}` }]);
                      setRecipientQuery('');
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs font-semibold rounded bg-brand-50 hover:bg-brand-100 text-brand-800 mb-1 flex items-center justify-between"
                  >
                    <span>Add External Email: <strong>{recipientQuery.trim()}</strong></span>
                    <span className="text-[10px] bg-brand-200 px-1.5 py-0.5 rounded">Press Enter</span>
                  </button>
                )}
                {recipientOptions.slice(0, 6).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { setRecipients([...recipients, opt]); setRecipientQuery(''); }}
                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-ink-50 text-ink-700"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.recipients && <p className="text-xs text-danger-500 mt-1">{errors.recipients}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">{t('memo_body')}</label>
          <div className={`border rounded-lg overflow-hidden ${errors.body ? 'border-danger-500' : 'border-ink-200 focus-within:border-brand-500'}`}>
            <div className="flex items-center gap-1 px-2 py-1.5 border-b border-ink-100 bg-ink-50">
              {[Bold, Italic, Underline, List].map((Icon, i) => (
                <button key={i} type="button" className="p-1.5 rounded hover:bg-ink-200 text-ink-500">
                  <Icon className="size-3.5" />
                </button>
              ))}
            </div>
            <textarea
              value={body} onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder={t('write_the_memo_content_here')}
              className="w-full px-3 py-2.5 text-sm outline-none resize-none"
            />
          </div>
          {errors.body && <p className="text-xs text-danger-500 mt-1">{errors.body}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">{t('priority')}</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100">
              {priorities.map((p) => <option key={p} value={p}>{t(priorityKeys[p])}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">{t('attachment')}</label>
            <input
              type="file"
              id="memo-file-upload"
              className="hidden"
              accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
            />
            {attachment ? (
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-brand-50 border border-brand-200 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip className="size-4 text-brand-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-brand-900 truncate">{attachment.name}</p>
                    <p className="text-[10px] text-brand-600 uppercase">{attachment.type} · {attachment.size}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="text-ink-400 hover:text-danger-500 p-1"
                  title="Remove attachment"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="memo-file-upload"
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-ink-300 text-sm text-ink-500 hover:border-brand-400 hover:text-brand-700 cursor-pointer transition-colors"
              >
                <Paperclip className="size-4" /> {t('attach_file', 'Choose File (PDF, DOCX, Image)')}
              </label>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
