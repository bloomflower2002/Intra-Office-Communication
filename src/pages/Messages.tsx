import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setActiveThread } from '../features/messages/messagesSlice';
import { findUser } from '../features/users/usersSlice';
import ChatPanel from '../components/chat/ChatPanel';
import { Search } from 'lucide-react';

import { useTranslation } from 'react-i18next';
export default function Messages() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const threads = useAppSelector((s) => s.messages.directThreads);
  const users = useAppSelector((s) => s.users.items);
  const [active, setActive] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (threads.length && !active) {
      setActive(threads[0].id);
      dispatch(setActiveThread(threads[0].id));
    }
  }, [threads, active, dispatch]);

  const filtered = threads.filter((t) => {
    const u = findUser(users, t.participantId);
    return u?.fullName.toLowerCase().includes(query.toLowerCase());
  });

  const activeUser = active ? findUser(users, threads.find((t) => t.id === active)?.participantId) : null;

  return (
    <div>
      <h1 className="text-2xl mb-1">{t('messages')}</h1>
      <p className="text-sm text-ink-400 mb-5">{t('direct_one_on_one_conversations_with_your_colleagu')}</p>

      <div className="bg-white dark:bg-ink-100 rounded-xl border border-ink-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-[300px_1fr]" style={{ height: 'calc(100vh - 220px)', minHeight: 480 }}>
        <div className={clsx('border-r border-ink-100 flex-col', active ? 'hidden md:flex' : 'flex')}>
          <div className="p-3 border-b border-ink-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search_contacts')}
                className="w-full bg-ink-50 rounded-lg pl-9 pr-3 py-2 text-sm outline-none border border-transparent focus:border-brand-300 focus:bg-white dark:bg-ink-100"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {filtered.map((t) => {
              const u = findUser(users, t.participantId);
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  onClick={() => { setActive(t.id); dispatch(setActiveThread(t.id)); }}
                  className={clsx('w-full flex items-center gap-3 px-4 py-3 text-left border-b border-ink-50 hover:bg-ink-50 transition-colors', isActive && 'bg-brand-50')}
                >
                  <div className="relative shrink-0">
                    <div className="size-10 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: u?.avatarColor }}>
                      {u?.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    {u?.online && <span className="absolute bottom-0 right-0 size-2.5 bg-success-500 rounded-full ring-2 ring-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-ink-800 truncate">{u?.fullName}</p>
                      <span className="text-[11px] text-ink-400 shrink-0">{t.lastTimestamp}</span>
                    </div>
                    <p className="text-xs text-ink-400 truncate">{t.lastMessage}</p>
                  </div>
                  {t.unread > 0 && (
                    <span className="size-5 rounded-full bg-brand-700 text-white text-[10px] font-semibold flex items-center justify-center shrink-0">{t.unread}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className={clsx(active ? 'flex' : 'hidden md:flex', 'flex-col')}>
          {active && (
            <button onClick={() => setActive(null)} className="md:hidden text-xs text-brand-700 px-4 py-2 border-b border-ink-100 text-left">{t('back_to_contacts')}</button>
          )}
          <div className="flex-1 min-h-0">
            <ChatPanel threadId={active} participantLabel={activeUser ? `${activeUser.fullName} · ${activeUser.title}` : ''} />
          </div>
        </div>
      </div>
    </div>
  );
}
