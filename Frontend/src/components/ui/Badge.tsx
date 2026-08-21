import clsx from 'clsx';
import { Check, Clock, Eye } from 'lucide-react';
import type { ReadReceipt, MemoStatus, Priority } from '../../types';

const toneClasses = {
  success: 'bg-success-100 text-success-500',
  warning: 'bg-warning-100 text-warning-500',
  danger: 'bg-danger-100 text-danger-500',
  info: 'bg-info-100 text-info-500',
  neutral: 'bg-ink-100 text-ink-600',
  brand: 'bg-brand-100 text-brand-700',
};

export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof toneClasses; children: React.ReactNode }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', toneClasses[tone])}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: MemoStatus }) {
  const map: Record<MemoStatus, keyof typeof toneClasses> = {
    Draft: 'neutral', 'Pending Approval': 'warning', Approved: 'info', Rejected: 'danger', Completed: 'success',
  };
  return <Badge tone={map[status]}>{status}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, keyof typeof toneClasses> = {
    Low: 'neutral', Normal: 'info', High: 'warning', Urgent: 'danger',
  };
  return <Badge tone={map[priority]}>{priority}</Badge>;
}

export function ReadReceiptTag({ receipt }: { receipt: ReadReceipt }) {
  if (receipt.status === 'read') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-info-500">
        <Eye className="size-3.5" /> Read{receipt.timestamp ? ` · ${new Date(receipt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
      </span>
    );
  }
  if (receipt.status === 'delivered') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-success-500">
        <Check className="size-3.5" /> Delivered
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-400">
      <Clock className="size-3.5" /> Pending
    </span>
  );
}
