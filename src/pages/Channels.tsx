import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Hash } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setActiveThread } from '../features/messages/messagesSlice';
import ChatPanel from '../components/chat/ChatPanel';

import { useTranslation } from 'react-i18next';
export default function Channels() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const channels = useAppSelector((s) => s.messages.channels);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (channels.length && !active) {
      setActive(channels[0].id);
      dispatch(setActiveThread(channels[0].id));
    }
  }, [channels, active, dispatch]);

  const activeChannel = channels.find((c) => c.id === active);

  return (
    <div>
      <h1 className="text-2xl mb-1">{t('channels')}</h1>
      <p className="text-sm text-ink-400 mb-5">{t('departmental_and_cross_departmental_discussion_cha')}</p>

      <div className="bg-white dark:bg-ink-100 rounded-xl border border-ink-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-[300px_1fr]" style={{ height: 'calc(100vh - 220px)', minHeight: 480 }}>
        <div className={clsx('border-r border-ink-100 flex-col overflow-y-auto scrollbar-thin', active ? 'hidden md:flex' : 'flex')}>
          {channels.map((c) => {
            const isActive = c.id === active;
            return (
              <button
                key={c.id}
                onClick={() => { setActive(c.id); dispatch(setActiveThread(c.id)); }}
                className={clsx('w-full flex items-center gap-3 px-4 py-3 text-left border-b border-ink-50 hover:bg-ink-50 transition-colors', isActive && 'bg-brand-50')}
              >
                <div className="size-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                  <Hash className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink-800 truncate">{c.name}</p>
                    <span className="text-[11px] text-ink-400 shrink-0">{c.lastTimestamp}</span>
                  </div>
                  <p className="text-xs text-ink-400 truncate">{c.lastMessage}</p>
                </div>
                {c.unread > 0 && (
                  <span className="size-5 rounded-full bg-brand-700 text-white text-[10px] font-semibold flex items-center justify-center shrink-0">{c.unread}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className={clsx(active ? 'flex' : 'hidden md:flex', 'flex-col')}>
          {active && (
            <button onClick={() => setActive(null)} className="md:hidden text-xs text-brand-700 px-4 py-2 border-b border-ink-100 text-left">{t('back_to_channels')}</button>
          )}
          <div className="flex-1 min-h-0">
            <ChatPanel
              threadId={active}
              isChannel
              participantLabel={activeChannel ? `#${activeChannel.name} · ${activeChannel.memberCount} members` : ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
