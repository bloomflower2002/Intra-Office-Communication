import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { dismissToast } from '../../features/ui/uiSlice';
import { useEffect } from 'react';

const iconMap = { success: CheckCircle2, error: XCircle, info: Info };
const colorMap = {
  success: 'text-success-500 bg-success-100',
  error: 'text-danger-500 bg-danger-100',
  info: 'text-info-500 bg-info-100',
};

function ToastItem({ id, type, message }: { id: string; type: 'success' | 'error' | 'info'; message: string }) {
  const dispatch = useAppDispatch();
  const Icon = iconMap[type];

  useEffect(() => {
    const t = setTimeout(() => dispatch(dismissToast(id)), 4000);
    return () => clearTimeout(t);
  }, [id, dispatch]);

  return (
    <div className="animate-slide-in-right flex items-start gap-3 bg-white border border-ink-100 shadow-lg rounded-lg px-4 py-3 w-80">
      <div className={`size-6 rounded-full flex items-center justify-center shrink-0 ${colorMap[type]}`}>
        <Icon className="size-4" />
      </div>
      <p className="text-sm text-ink-700 flex-1">{message}</p>
      <button onClick={() => dispatch(dismissToast(id))} className="text-ink-300 hover:text-ink-600">
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useAppSelector((s) => s.ui.toasts);
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => <ToastItem key={t.id} {...t} />)}
    </div>
  );
}
