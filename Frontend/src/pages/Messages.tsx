import { useEffect, useState, useMemo } from 'react';
import clsx from 'clsx';
import {
  Search,
  Plus,
  UserPlus,
  X,
  MessageCircle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  setActiveThread,
  fetchDirectThreads,
  openDirectThread,
} from '../features/messages/messagesSlice';
import { fetchUsers } from '../features/users/usersSlice';
import Pagination from '../components/ui/Pagination';
import ChatPanel from '../components/chat/ChatPanel';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import type { User } from '../types';
import { useTranslation } from 'react-i18next';

export default function Messages() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector((s) => s.auth.user);
  const users = useAppSelector((s) => s.users.items);
  const threads = useAppSelector((s) => s.messages.directThreads);
  const threadsPagination = useAppSelector((s) => s.messages.directThreadsPagination);
  const activeThreadId = useAppSelector((s) => s.messages.activeThreadId);

  const [active, setActive] = useState<string | null>(activeThreadId);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Sync initial fetch
  useEffect(() => {
    dispatch(fetchDirectThreads({ page, pageSize: 30 }));
    if (users.length === 0) {
      dispatch(fetchUsers());
    }
  }, [dispatch, page, users.length]);

  // Sync active thread with first thread if none selected
  useEffect(() => {
    if (threads.length > 0 && !active) {
      const firstId = threads[0].id;
      setActive(firstId);
      dispatch(setActiveThread(firstId));
    }
  }, [threads, active, dispatch]);

  // Keep local active state in sync with redux
  useEffect(() => {
    if (activeThreadId && activeThreadId !== active) {
      setActive(activeThreadId);
    }
  }, [activeThreadId, active]);

  // Filter colleague list for 'New Chat' modal (exclude current logged-in user)
  const availableColleagues = useMemo(() => {
    return users
      .filter((u) => u.id !== currentUser?.id && u.status === 'active')
      .filter((u) => {
        if (!userSearch.trim()) return true;
        const q = userSearch.toLowerCase();
        return (
          u.fullName.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q) ||
          u.title.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
        );
      });
  }, [users, currentUser?.id, userSearch]);

  // Resolve thread participant user details
  const threadListWithUsers = useMemo(() => {
    return threads.map((thread) => {
      const otherUser = users.find((u) => u.id === thread.participantId);
      return {
        ...thread,
        otherUser,
      };
    });
  }, [threads, users]);

  // Filter active threads by search query
  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threadListWithUsers;
    const q = searchQuery.toLowerCase();
    return threadListWithUsers.filter((t) => {
      const name = t.otherUser?.fullName?.toLowerCase() || '';
      const dept = t.otherUser?.department?.toLowerCase() || '';
      const msg = t.lastMessage?.toLowerCase() || '';
      return name.includes(q) || dept.includes(q) || msg.includes(q);
    });
  }, [threadListWithUsers, searchQuery]);

  const activeThread = threadListWithUsers.find((t) => t.id === active);
  const activeParticipant = activeThread?.otherUser;

  const handleSelectThread = (threadId: string) => {
    setActive(threadId);
    dispatch(setActiveThread(threadId));
  };

  const handleStartChatWithUser = async (user: User) => {
    const result = await dispatch(openDirectThread(user.id));
    if (openDirectThread.fulfilled.match(result)) {
      const newThreadId = result.payload.id;
      setActive(newThreadId);
      dispatch(setActiveThread(newThreadId));
      setNewChatModalOpen(false);
      setUserSearch('');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
            {t('nav_messages') || 'Direct Messages'}
          </h1>
          <p className="text-sm text-ink-400 mt-0.5">
            Private, secure one-to-one institutional messaging between colleagues
          </p>
        </div>
        <Button
          size="sm"
          icon={<UserPlus className="size-4" />}
          onClick={() => setNewChatModalOpen(true)}
          className="shadow-sm shrink-0"
        >
          New 1-to-1 Chat
        </Button>
      </div>

      <div
        className="bg-white dark:bg-ink-100 rounded-xl border border-ink-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-[340px_1fr]"
        style={{ height: 'calc(100vh - 220px)', minHeight: 520 }}
      >
        {/* Left Column: Direct Message Threads */}
        <div
          className={clsx(
            'border-r border-ink-100 flex flex-col overflow-hidden bg-white dark:bg-ink-100',
            active ? 'hidden md:flex' : 'flex'
          )}
        >
          {/* Search Box */}
          <div className="p-3 border-b border-ink-100 shrink-0">
            <div className="relative">
              <Search className="size-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-ink-50 dark:bg-ink-200/40 rounded-lg text-xs outline-none border border-transparent focus:border-brand-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-ink-50 dark:divide-ink-200/20">
            {filteredThreads.length === 0 ? (
              <div className="p-6 text-center">
                <div className="size-12 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="size-6" />
                </div>
                <p className="text-sm font-medium text-ink-800 dark:text-ink-200">
                  {searchQuery ? 'No conversations found' : 'No 1-to-1 chats yet'}
                </p>
                <p className="text-xs text-ink-400 mt-1 mb-4">
                  {searchQuery
                    ? 'Try searching with a different name or department.'
                    : 'Start a direct private message with any colleague.'}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Plus className="size-3.5" />}
                  onClick={() => setNewChatModalOpen(true)}
                >
                  Start New Chat
                </Button>
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isActive = t.id === active;
                const user = t.otherUser;
                const initials = user?.fullName
                  ? user.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                  : '??';

                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectThread(t.id)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors relative group',
                      isActive
                        ? 'bg-brand-50/80 dark:bg-brand-950/40 border-l-4 border-brand-700'
                        : 'hover:bg-ink-50/70 dark:hover:bg-ink-200/20'
                    )}
                  >
                    {/* User Avatar with Initials */}
                    <div className="relative shrink-0">
                      <div
                        className="size-11 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                        style={{ backgroundColor: user?.avatarColor || '#2A4F97' }}
                      >
                        {initials}
                      </div>
                      <span className="absolute bottom-0 right-0 size-3 rounded-full bg-success-500 border-2 border-white dark:border-ink-100" />
                    </div>

                    {/* Thread Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-semibold text-ink-900 dark:text-ink-100 truncate">
                          {user?.fullName || 'Colleague'}
                        </p>
                        <span className="text-[11px] text-ink-400 shrink-0">
                          {t.lastTimestamp
                            ? new Date(t.lastTimestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-400 truncate mt-0.5">
                        {user ? `${user.title} · ${user.department}` : ''}
                      </p>
                      <p className="text-xs text-ink-500 dark:text-ink-300 truncate mt-1">
                        {t.lastMessage || (
                          <span className="italic text-ink-400">Click to start conversation</span>
                        )}
                      </p>
                    </div>

                    {/* Unread Counter */}
                    {t.unread > 0 && (
                      <span className="size-5 rounded-full bg-brand-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {t.unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Threads Pagination */}
          {threadsPagination && threadsPagination.totalPages > 1 && (
            <div className="p-2 border-t border-ink-100 shrink-0">
              <Pagination pagination={threadsPagination} onPageChange={setPage} />
            </div>
          )}
        </div>

        {/* Right Column: Active 1-to-1 Chat Box */}
        <div className={clsx(active ? 'flex' : 'hidden md:flex', 'flex-col h-full overflow-hidden')}>
          {active && (
            <div className="md:hidden flex items-center gap-2 p-2 border-b border-ink-100 bg-ink-50">
              <button
                onClick={() => setActive(null)}
                className="text-xs font-medium text-brand-700 hover:text-brand-900 px-2 py-1 rounded flex items-center gap-1"
              >
                ← Back to conversations
              </button>
            </div>
          )}

          <div className="flex-1 min-h-0">
            <ChatPanel
              threadId={active}
              participantLabel={activeParticipant?.fullName || '1-to-1 Conversation'}
              participantUser={activeParticipant}
            />
          </div>
        </div>
      </div>

      {/* New 1-to-1 Chat Modal */}
      <Modal
        open={newChatModalOpen}
        onClose={() => {
          setNewChatModalOpen(false);
          setUserSearch('');
        }}
        title="Start 1-to-1 Institutional Chat"
      >
        <div className="space-y-4">
          <p className="text-xs text-ink-400">
            Select a verified colleague from the directory to start a private direct conversation:
          </p>

          <div className="relative">
            <Search className="size-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by colleague name, role, department..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-ink-200 rounded-lg text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100"
              autoFocus
            />
          </div>

          <div className="max-h-72 overflow-y-auto scrollbar-thin divide-y divide-ink-50 border border-ink-100 rounded-lg">
            {availableColleagues.length === 0 ? (
              <div className="p-4 text-center text-xs text-ink-400">
                No colleagues match your search.
              </div>
            ) : (
              availableColleagues.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleStartChatWithUser(u)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-brand-50/60 dark:hover:bg-ink-200/30 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="size-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                      style={{ backgroundColor: u.avatarColor || '#2A4F97' }}
                    >
                      {u.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-800 group-hover:text-brand-700 truncate">
                        {u.fullName}
                      </p>
                      <p className="text-xs text-ink-400 truncate">
                        {u.title} · {u.department}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-brand-700 group-hover:underline shrink-0 ml-2">
                    Message →
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
