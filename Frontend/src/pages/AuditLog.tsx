import { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, Download, Clock, User, Shield, Building2,
  RefreshCw, Lock, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchAuditLog } from '../features/audit/auditSlice';

/* ── Helpers ───────────────────────────────────────────────────────── */
function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch {
    return iso;
  }
}

/** Loosely classify a free-text action string so it can be filtered/colored. */
function categorize(action: string): 'user' | 'memo' | 'system' {
  const a = action.toLowerCase();
  if (a.includes('user') || a.includes('role') || a.includes('account')) return 'user';
  if (a.includes('memo')) return 'memo';
  return 'system';
}

const categoryTones: Record<string, 'info' | 'success' | 'brand' | 'warning'> = {
  user: 'brand',
  memo: 'success',
  system: 'warning',
};

/* ── Component ────────────────────────────────────────────────────── */
export default function AuditLog({ embedded = false }: { embedded?: boolean } = {}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const entries = useAppSelector((s) => s.audit.items);
  const auditPagination = useAppSelector((s) => s.audit.pagination);
  const status = useAppSelector((s) => s.audit.status);
  const currentUser = useAppSelector((s) => s.auth.user);
  const isAdmin = currentUser?.role === 'System Admin';
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAuditLog({ page, pageSize: 30 }));
  }, [dispatch, page]);

  const filtered = useMemo(() => {
    let items = entries;
    if (categoryFilter !== 'all') {
      items = items.filter((e) => categorize(e.action) === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((e) =>
        e.user.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        (e.target || '').toLowerCase().includes(q) ||
        (e.department || '').toLowerCase().includes(q),
      );
    }
    return [...items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [entries, categoryFilter, search]);

  const stats = useMemo(() => ({
    total: auditPagination?.total ?? entries.length,
    user: entries.filter((e) => categorize(e.action) === 'user').length,
    memo: entries.filter((e) => categorize(e.action) === 'memo').length,
    system: entries.filter((e) => categorize(e.action) === 'system').length,
  }), [entries, auditPagination]);

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Department', 'Action', 'Target'];
    const rows = filtered.map((entry) => [
      `"${formatTimestamp(entry.timestamp)}"`,
      `"${entry.user.replace(/"/g, '""')}"`,
      `"${entry.role || ''}"`,
      `"${entry.department || ''}"`,
      `"${entry.action.replace(/"/g, '""')}"`,
      `"${(entry.target || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `IOCMS_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          {!embedded && <h1 className="text-2xl font-semibold mb-1">{t('nav_audit_log') || 'Audit Log'}</h1>}
          <p className="text-sm text-ink-400">
            {isAdmin
              ? 'Institution-wide record of every logged action, security event, and administrative decision.'
              : `Record of logged actions for everyone in your department (${currentUser?.department || '—'}), including your own.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(fetchAuditLog({ page, pageSize: 30 }))}
            title="Refresh"
            className="p-2 text-ink-600 hover:text-ink-900 border border-ink-200 rounded-lg hover:bg-ink-50 transition-colors"
          >
            <RefreshCw className={clsx('size-4', status === 'loading' && 'animate-spin')} />
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-brand-700 hover:bg-brand-800 text-white shadow-sm transition-colors"
          >
            <Download className="size-4" />
            Export CSV ({filtered.length})
          </button>
        </div>
      </div>

      {/* ── Scope banner ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg bg-ink-50 border border-ink-200 text-xs text-ink-500">
        <Lock className="size-3.5 shrink-0" />
        <span>
          Entries here are permanent and cannot be edited or revoked by anyone, including System Admins.
          {!isAdmin && ' You can only see activity from your own department.'}
        </span>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {([
          { label: 'Total Entries',  value: stats.total,  color: 'text-ink-900' },
          { label: 'User Governance', value: stats.user,   color: 'text-purple-600' },
          { label: 'Memo Activity',  value: stats.memo,   color: 'text-emerald-600' },
          { label: 'System / Other', value: stats.system, color: 'text-amber-600' },
        ] as const).map((s) => (
          <Card key={s.label} className="!shadow-sm">
            <CardBody className="!p-3 text-center">
              <p className={clsx('text-2xl font-bold', s.color)}>{s.value}</p>
              <p className="text-xs text-ink-400 mt-0.5">{s.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* ── Filters & Search ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, department, action, or target…"
            className="w-full pl-10 pr-4 py-2 text-sm border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/40 bg-white dark:bg-ink-100"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="size-4 text-ink-400 shrink-0" />
          {(['all', 'memo', 'user', 'system'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={clsx(
                'px-3 py-1.5 text-xs font-medium rounded-full transition-colors capitalize',
                categoryFilter === cat
                  ? 'bg-brand-700 text-white'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-200 dark:text-ink-700',
              )}
            >
              {cat === 'all' ? 'All Entries' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Log Entries ───────────────────────────────────────────── */}
      <Card>
        <CardBody className="!p-0 divide-y divide-ink-100">
          {status === 'loading' && entries.length === 0 && (
            <div className="p-8 text-center text-ink-400 text-sm">Loading audit log…</div>
          )}
          {status !== 'loading' && filtered.length === 0 && (
            <div className="p-8 text-center text-ink-400 text-sm">No audit entries match your search or filter criteria.</div>
          )}
          {filtered.map((entry) => {
            const category = categorize(entry.action);
            const isExpanded = expandedId === entry.id;
            return (
              <div key={entry.id} className="w-full text-left px-4 py-3 hover:bg-ink-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={clsx(
                    'size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                    category === 'user' && 'text-purple-600 bg-purple-50',
                    category === 'memo' && 'text-emerald-600 bg-emerald-50',
                    category === 'system' && 'text-amber-600 bg-amber-50',
                  )}>
                    <Shield className="size-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-ink-900">{entry.action}</span>
                      <Badge tone={categoryTones[category]}>{category}</Badge>
                    </div>
                    {entry.target && (
                      <p className="text-sm text-ink-700 mt-0.5 font-medium">{entry.target}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-ink-400 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <User className="size-3 text-ink-500" />
                        <span className="text-ink-600 font-medium">{entry.user}</span>
                        {entry.role && <span className="text-ink-400">({entry.role})</span>}
                      </span>
                      {entry.department && (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="size-3" />
                          {entry.department}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatRelativeTime(entry.timestamp)}
                      </span>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 font-medium ml-auto"
                      >
                        {isExpanded ? <>Hide Details <ChevronUp className="size-3" /></> : <>View Details <ChevronDown className="size-3" /></>}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 p-3.5 rounded-lg bg-ink-50 dark:bg-ink-200/40 text-xs space-y-2 border border-ink-200">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <span className="text-ink-400 block">Exact Timestamp:</span>
                            <span className="text-ink-800 font-mono font-medium">{formatTimestamp(entry.timestamp)}</span>
                          </div>
                          <div>
                            <span className="text-ink-400 block">Entry ID:</span>
                            <span className="text-ink-800 font-mono">{entry.id}</span>
                          </div>
                          <div>
                            <span className="text-ink-400 block">Department:</span>
                            <span className="text-ink-800 font-mono">{entry.department || '—'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="text-xs text-ink-400 whitespace-nowrap shrink-0 hidden sm:block">
                    {formatRelativeTime(entry.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>
      {auditPagination && (
        <div className="px-1">
          <Pagination pagination={auditPagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
