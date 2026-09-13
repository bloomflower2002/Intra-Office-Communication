import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Bell, Search, LogOut, Settings as SettingsIcon, UserCircle, MenuIcon } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { setMobileSidebarOpen, toggleNotificationsPanel } from '../../features/ui/uiSlice';
import { pushToast } from '../../features/ui/uiSlice';
import { useState } from 'react';
import NotificationsPanel from './NotificationsPanel';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageToggle from '../ui/LanguageToggle';
import { roleKeys } from '../../i18n/enumLabels';

import { useTranslation } from 'react-i18next';
export default function Header() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const unread = useAppSelector((s) => s.notifications.items.filter((n) => !n.read).length);
  const [query, setQuery] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    dispatch(pushToast('You have been logged out.', 'info'));
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/archive?q=${encodeURIComponent(query.trim())}`);
  };

  if (!user) return null;

  return (
    <header className="h-16 shrink-0 bg-white dark:bg-ink-100 border-b border-ink-100 flex items-center gap-4 px-4 lg:px-6">
      <button
        onClick={() => dispatch(setMobileSidebarOpen(true))}
        className="lg:hidden text-ink-500 hover:text-ink-800 p-1.5 -ml-1.5"
      >
        <MenuIcon className="size-5" />
      </button>

      <form onSubmit={handleSearch} className="hidden sm:flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search_the_archive')}
            className="w-full bg-ink-50 border border-transparent focus:border-brand-300 focus:bg-white dark:bg-ink-100 rounded-lg pl-9 pr-3 py-2 text-sm text-ink-700 placeholder:text-ink-400 outline-none transition-colors"
          />
        </div>
      </form>

      <div className="flex-1 sm:hidden" />

      <div className="flex items-center gap-1.5 sm:gap-3 ml-auto">
        <LanguageToggle />
        <ThemeToggle />

        <div className="relative">
          <button
            onClick={() => dispatch(toggleNotificationsPanel())}
            className="relative p-2 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-800 transition-colors"
          >
            <Bell className="size-5" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 size-4 bg-danger-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
          <NotificationsPanel />
        </div>

        <Menu as="div" className="relative">
          <MenuButton className="flex items-center gap-2.5 pl-1.5 pr-2 sm:pr-3 py-1.5 rounded-lg hover:bg-ink-100 transition-colors">
            <div
              className="size-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-sm font-medium text-ink-800">{user.fullName}</p>
              <p className="text-xs text-ink-400">{t(roleKeys[user.role])}</p>
            </div>
          </MenuButton>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-150" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-100" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-ink-100 rounded-xl shadow-lg border border-ink-100 py-1.5 focus:outline-none z-50">
              <div className="px-3.5 py-2.5 border-b border-ink-100">
                <p className="text-sm font-medium text-ink-800">{user.fullName}</p>
                <p className="text-xs text-ink-400 truncate">{user.email}</p>
              </div>
              <MenuItem>
                {({ focus }) => (
                  <NavLink to="/settings" className={`flex items-center gap-2.5 px-3.5 py-2 text-sm text-ink-700 ${focus ? 'bg-ink-50' : ''}`}>
                    <UserCircle className="size-4" /> {t('my_profile')}
                  </NavLink>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <NavLink to="/settings" className={`flex items-center gap-2.5 px-3.5 py-2 text-sm text-ink-700 ${focus ? 'bg-ink-50' : ''}`}>
                    <SettingsIcon className="size-4" /> {t('settings')}
                  </NavLink>
                )}
              </MenuItem>
              <div className="border-t border-ink-100 mt-1 pt-1">
                <MenuItem>
                  {({ focus }) => (
                    <button onClick={handleLogout} className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-danger-500 ${focus ? 'bg-danger-100/60' : ''}`}>
                      <LogOut className="size-4" /> {t('log_out')}
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Transition>
        </Menu>
      </div>
    </header>
  );
}
