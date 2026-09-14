import { useEffect, useRef, useState } from 'react';
import { Paperclip, Send, Circle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { sendMessage, fetchThreadMessages, fetchChannelMessages } from '../../features/messages/messagesSlice';
import { findUser } from '../../features/users/usersSlice';
import { pushToast } from '../../features/ui/uiSlice';
import EmptyState from '../ui/EmptyState';
import Pagination from '../ui/Pagination';
import { MessageSquare } from 'lucide-react';

import type { User } from '../../types';
import { useTranslation } from 'react-i18next';

export default function ChatPanel({
  threadId,
  participantLabel,
  isChannel,
  participantUser,
}: {
  threadId: string | null;
  participantLabel: string;
  isChannel?: boolean;
  participantUser?: User;
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.auth.user);
  const users = useAppSelector((s) => s.users.items);
  const messages = useAppSelector((s) => (threadId ? s.messages.messagesByThread[threadId] ?? [] : []));
  const pagination = useAppSelector((s) => (threadId ? s.messages.messagesPaginationByThread[threadId] : undefined));
  const status = useAppSelector((s) => s.messages.status);
  const [draft, setDraft] = useState('');
  const [page, setPage] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Reset to page 1 whenever the conversation changes, then jump to the most
  // recent page once we know how many pages exist (messages are ordered oldest
  // → newest within a page, so the last page holds the latest messages).
  useEffect(() => { setPage(1); }, [threadId]);

  useEffect(() => {
    if (!threadId) return;
    if (isChannel) dispatch(fetchChannelMessages({ channelId: threadId, page, pageSize: 30 }));
    else dispatch(fetchThreadMessages({ threadId, page, pageSize: 30 }));
  }, [threadId, isChannel, dispatch, page]);

  useEffect(() => {
    if (page === 1 && pagination && pagination.totalPages > 1) {
      setPage(pagination.totalPages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination?.totalPages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !threadId || !currentUser) return;
    dispatch(sendMessage({ threadId, kind: isChannel ? 'channel' : 'thread', body: draft.trim() }));
    setDraft('');
  };

  if (!threadId) {
    return <EmptyState icon={MessageSquare} title={t('select_a_conversation')} description="Choose a contact or channel from the list to start messaging." />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="h-16 shrink-0 border-b border-ink-100 flex items-center justify-between px-5">
        <div className="flex items-center gap-3 min-w-0">
          {participantUser ? (
            <div
              className="size-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 shadow-sm"
              style={{ backgroundColor: participantUser.avatarColor || '#2A4F97' }}
            >
              {participantUser.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-800 leading-tight truncate">{participantLabel}</p>
            {participantUser && (
              <p className="text-xs text-ink-400 leading-tight truncate mt-0.5">
                {participantUser.title} · {participantUser.department}
              </p>
            )}
          </div>
        </div>
        {!isChannel && (
          <span className="flex items-center gap-1.5 text-xs text-success-600 bg-success-50 dark:bg-success-950/30 px-2.5 py-1 rounded-full font-medium shrink-0">
            <Circle className="size-2 fill-current" /> {t('online')}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-3">
        {pagination && pagination.totalPages > 1 && (
          <Pagination pagination={pagination} onPageChange={setPage} className="!pt-0 pb-2 border-b border-ink-100" />
        )}
        {status === 'loading' && messages.length === 0 ? (
          <div className="flex justify-center pt-10 text-sm text-ink-400">{t('loading_messages')}</div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === currentUser?.id;
            const sender = findUser(users, m.senderId);
            return (
              <div key={m.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className="size-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0" style={{ backgroundColor: sender?.avatarColor }}>
                    {sender?.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                )}
                <div className={`max-w-[75%] sm:max-w-md rounded-2xl px-4 py-2.5 text-sm ${
                  isMe ? 'bg-brand-700 text-white rounded-br-md' : 'bg-ink-100 text-ink-800 rounded-bl-md'
                }`}>
                  {isChannel && !isMe && <p className="text-xs font-semibold mb-0.5 text-brand-700">{sender?.fullName}</p>}
                  <p>{m.body}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-brand-200' : 'text-ink-400'}`}>{m.timestamp}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="shrink-0 border-t border-ink-100 p-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => dispatch(pushToast('Attachments are mocked in this preview.', 'info'))}
          className="p-2.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 shrink-0"
        >
          <Paperclip className="size-4" />
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('type_a_message')}
          className="flex-1 bg-ink-50 rounded-lg px-3.5 py-2.5 text-sm outline-none border border-transparent focus:border-brand-300 focus:bg-white dark:bg-ink-100 transition-colors"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="p-2.5 rounded-lg bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-40 shrink-0"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
