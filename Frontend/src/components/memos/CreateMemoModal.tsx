import { useState } from 'react';
import { Bold, Italic, List, Underline, Paperclip, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createMemo } from '../../features/memos/memosSlice';
import { pushToast } from '../../features/ui/uiSlice';
import { users, departments } from '../../mocks/mockData';
import type { MemoType, Priority } from '../../types';

const memoTypes: MemoType[] = ['Official Memo', 'Circular', 'Notice', 'Directive'];
const priorities: Priority[] = ['Low', 'Normal', 'High', 'Urgent'];

export default function CreateMemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.auth.user);
  const [type, setType] = useState<MemoType>('Official Memo');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<Priority>('Normal');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientQuery, setRecipientQuery] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ subject?: string; body?: string; recipients?: string }>({});

  const recipientOptions = [
    ...departments,
    ...users.filter((u) => u.id !== currentUser?.id).map((u) => u.fullName),
  ].filter((r) => r.toLowerCase().includes(recipientQuery.toLowerCase()) && !recipients.includes(r));

  const reset = () => {
    setType('Official Memo'); setSubject(''); setBody(''); setPriority('Normal');
    setRecipients([]); setRecipientQuery(''); setAttachment(null); setErrors({});
  };

  const handleSubmit = () => {
    const e: typeof errors = {};
    if (!subject.trim()) e.subject = 'Subject is required.';
    if (!body.trim()) e.body = 'Memo body cannot be empty.';
    if (recipients.length === 0) e.recipients = 'Select at least one recipient.';
    setErrors(e);
    if (Object.keys(e).length > 0 || !currentUser) return;

    dispatch(createMemo({
      type, subject: subject.trim(), body: body.trim(), senderId: currentUser.id,
      recipients, priority,
      attachments: attachment ? [{ name: attachment, size: '1.2 MB', type: 'pdf' }] : [],
      approvalChain: [{ role: currentUser.role, userId: currentUser.id }],
    }));
    dispatch(pushToast('Memo submitted for approval.', 'success'));
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Create New Memo" size="lg"
      footer={<>
        <Button variant="outline" onClick={() => { reset(); onClose(); }}>Cancel</Button>
        <Button onClick={handleSubmit}>Submit for Approval</Button>
      </>}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Memo Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as MemoType)} className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white">
            {memoTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Subject</label>
          <input
            value={subject} onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Approval Request: Q4 Budget Allocation"
            className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none ${errors.subject ? 'border-danger-500' : 'border-ink-200 focus:border-brand-500'}`}
          />
          {errors.subject && <p className="text-xs text-danger-500 mt-1">{errors.subject}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Recipients</label>
          <div className="border border-ink-200 rounded-lg p-2 focus-within:border-brand-500">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {recipients.map((r) => (
                <span key={r} className="flex items-center gap-1 bg-brand-100 text-brand-700 text-xs font-medium px-2 py-1 rounded-full">
                  {r}
                  <button onClick={() => setRecipients(recipients.filter((x) => x !== r))}><X className="size-3" /></button>
                </span>
              ))}
            </div>
            <input
              value={recipientQuery}
              onChange={(e) => setRecipientQuery(e.target.value)}
              placeholder="Search users or departments…"
              className="w-full text-sm outline-none px-1 py-1"
            />
            {recipientQuery && recipientOptions.length > 0 && (
              <div className="border-t border-ink-100 mt-1 pt-1 max-h-32 overflow-y-auto scrollbar-thin">
                {recipientOptions.slice(0, 6).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setRecipients([...recipients, opt]); setRecipientQuery(''); }}
                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-ink-50 text-ink-700"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.recipients && <p className="text-xs text-danger-500 mt-1">{errors.recipients}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Memo Body</label>
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
              placeholder="Write the memo content here…"
              className="w-full px-3 py-2.5 text-sm outline-none resize-none"
            />
          </div>
          {errors.body && <p className="text-xs text-danger-500 mt-1">{errors.body}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white">
              {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Attachment</label>
            <button
              type="button"
              onClick={() => setAttachment(attachment ? null : 'Supporting-Document.pdf')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-ink-300 text-sm text-ink-500 hover:border-brand-400 hover:text-brand-700"
            >
              <Paperclip className="size-4" /> {attachment ?? 'Attach file (max 10MB)'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
