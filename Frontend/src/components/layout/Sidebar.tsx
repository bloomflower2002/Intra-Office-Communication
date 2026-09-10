import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { ChevronsLeft, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleSidebar, setMobileSidebarOpen } from '../../features/ui/uiSlice';
import { navItems } from './navConfig';
import { navKeys } from '../../i18n/enumLabels';
import { useTranslation } from 'react-i18next';
import { hasRolePermission } from '../../utils/rolePermissions';

function OstaMark({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation();
  const sysConfig = useAppSelector((s) => s.systemConfig);
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="size-9 rounded-xl overflow-hidden shrink-0 bg-white p-1 shadow-md border border-white/20 flex items-center justify-center">
        <img src={sysConfig.logoUrl} alt={sysConfig.orgShortName} className="w-full h-full object-contain" />
      </div>
      {!collapsed && (
        <div className="leading-tight overflow-hidden">
          <p className="text-sm font-bold text-white tracking-tight whitespace-nowrap">{sysConfig.orgShortName || t('osta')}</p>
          <p className="text-[11px] text-brand-200 font-medium whitespace-nowrap">IOCMS</p>
        </div>
      )}
    </div>
  );
}

interface SidebarProps {
  variant: 'desktop' | 'mobile';
}

export default function Sidebar({ variant }: SidebarProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed) && variant === 'desktop';
  const mobileOpen = useAppSelector((s) => s.ui.mobileSidebarOpen);
  const role = useAppSelector((s) => s.auth.user?.role);
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick((v) => v + 1);
    window.addEventListener('iocms-roles-updated', handler);
    return () => window.removeEventListener('iocms-roles-updated', handler);
  }, []);

  const items = navItems.filter((i) => {
    if (!role) return false;
    if (!i.requiredPermission) return true;
    return hasRolePermission(role, i.requiredPermission);
  });

  const getNavLabel = (label: string) => {
    const key = navKeys[label];
    if (!key) return label;
    const translated = t(key, label);
    if (!translated || translated.startsWith('nav_')) return label;
    return translated;
  };

  const content = (
    <div className="flex flex-col h-full bg-brand-950 text-brand-100">
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        <OstaMark collapsed={collapsed} />
        {variant === 'mobile' && (
          <button onClick={() => dispatch(setMobileSidebarOpen(false))} className="text-brand-200 hover:text-white">
            <X className="size-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2.5 space-y-0.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => variant === 'mobile' && dispatch(setMobileSidebarOpen(false))}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative',
              isActive ? 'bg-brand-700 text-white' : 'text-brand-200 hover:bg-white/5 hover:text-white',
            )}
            title={collapsed ? getNavLabel(item.label) : undefined}
          >
            <item.icon className="size-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{getNavLabel(item.label)}</span>}
          </NavLink>
        ))}
      </nav>

      {variant === 'desktop' && (
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex items-center gap-2 px-4 py-3.5 border-t border-white/10 text-brand-300 hover:text-white text-xs font-medium shrink-0"
        >
          <ChevronsLeft className={clsx('size-4 transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && t('collapse')}
        </button>
      )}
    </div>
  );

  if (variant === 'mobile') {
    return (
      <div className={clsx('fixed inset-0 z-40 lg:hidden', !mobileOpen && 'pointer-events-none')}>
        <div
          className={clsx('absolute inset-0 bg-ink-950/50 transition-opacity', mobileOpen ? 'opacity-100' : 'opacity-0')}
          onClick={() => dispatch(setMobileSidebarOpen(false))}
        />
        <div className={clsx('absolute inset-y-0 left-0 w-64 transition-transform duration-200', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <aside className={clsx('hidden lg:block shrink-0 transition-all duration-200', collapsed ? 'w-[68px]' : 'w-64')}>
      {content}
    </aside>
  );
}
