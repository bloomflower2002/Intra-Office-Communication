import { useNavigate } from 'react-router-dom';
import { Bell, FileText, MessageSquare, ClipboardCheck, Settings } from 'lucide-react';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { closeNotificationsPanel, toggleNotificationsPanel } from '../../features/ui/uiSlice';
import { markAllRead, markRead } from '../../features/notifications/notificationsSlice';
import EmptyState from '../ui/EmptyState';
import { useEffect, useRef } from 'react';

const kindIcon = { memo: FileText, message: MessageSquare, system: Settings, approval: ClipboardCheck };

export default function NotificationsPanel() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.notificationsPanelOpen);
  const items = useAppSelector((s) => s.notifications.items);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        dispatch(closeNotificationsPanel());
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, dispatch]);

  if (!open) return null;

  return (
    <div ref={ref} className="animate-slide-up absolute right-0 sm:right-0 -right-24 mt-2 w-80 max-w-[90vw] bg-white rounded-xl shadow-lg border border-ink-100 z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
        <p className="text-sm font-semibold text-ink-800">Notifications</p>
        <button onClick={() => dispatch(markAllRead())} className="text-xs font-medium text-brand-700 hover:text-brand-800">
          Mark all read
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto scrollbar-thin">
        {items.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
        ) : (
          items.map((n) => {
            const Icon = kindIcon[n.kind];
            return (
              <button
                key={n.id}
                onClick={() => {
                  dispatch(markRead(n.id));
                  dispatch(toggleNotificationsPanel());
                  navigate(n.link);
                }}
                className={clsx(
                  'w-full text-left flex items-start gap-3 px-4 py-3 border-b border-ink-50 last:border-0 hover:bg-ink-50 transition-colors',
                  !n.read && 'bg-brand-50/40',
                )}
              >
                <div className="size-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-800 truncate">{n.title}</p>
                  <p className="text-xs text-ink-500 line-clamp-2 mt-0.5">{n.description}</p>
                  <p className="text-[11px] text-ink-400 mt-1">{n.timestamp}</p>
                </div>
                {!n.read && <span className="size-2 rounded-full bg-brand-600 mt-1.5 shrink-0" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
