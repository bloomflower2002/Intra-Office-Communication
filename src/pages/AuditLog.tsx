import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Download, Clock, User, FileText, Shield, Settings, LogIn, LogOut, UserPlus, Trash2, CheckCircle2, XCircle, ArrowRightLeft, Loader2 } from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { apiClient } from '../app/apiClient';
import { auditActionKeys, auditCategoryKeys, auditMetaLabelKeys, roleKeys } from '../i18n/enumLabels';

/* ── Types ────────────────────────────────────────────────────────── */
type AuditAction =
  | 'login' | 'logout'
  | 'memo_created' | 'memo_approved' | 'memo_rejected' | 'memo_forwarded'
  | 'user_created' | 'user_deactivated' | 'user_role_changed'
  | 'settings_updated' | 'role_created' | 'role_deleted'
  | 'password_reset' | 'file_uploaded';

type AuditCategory = 'auth' | 'memo' | 'user' | 'system';

/* Descriptions are stored as an i18n key + params instead of a fixed English
 * string, so every entry renders correctly in English, Amharic, and Afaan
 * Oromoo. Proper nouns (names, references, emails) stay as data. */
interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: AuditAction;
  category: AuditCategory;
  descKey: string;
  descParams?: Record<string, string>;
  ip: string;
  metadata?: Record<string, string>;
}

/* ── Icon + color mapping ─────────────────────────────────────────── */
const actionMeta: Record<AuditAction, { icon: typeof Clock; color: string }> = {
  login:              { icon: LogIn,          color: 'text-emerald-600 bg-emerald-50' },
  logout:             { icon: LogOut,         color: 'text-ink-500 bg-ink-50' },
  memo_created:       { icon: FileText,       color: 'text-blue-600 bg-blue-50' },
  memo_approved:      { icon: CheckCircle2,   color: 'text-emerald-600 bg-emerald-50' },
  memo_rejected:      { icon: XCircle,        color: 'text-red-600 bg-red-50' },
  memo_forwarded:     { icon: ArrowRightLeft, color: 'text-amber-600 bg-amber-50' },
  user_created:       { icon: UserPlus,       color: 'text-blue-600 bg-blue-50' },
  user_deactivated:   { icon: Trash2,         color: 'text-red-600 bg-red-50' },
  user_role_changed:  { icon: Shield,         color: 'text-purple-600 bg-purple-50' },
  settings_updated:   { icon: Settings,       color: 'text-brand-600 bg-brand-50' },
  role_created:       { icon: Shield,         color: 'text-blue-600 bg-blue-50' },
  role_deleted:       { icon: Trash2,         color: 'text-red-600 bg-red-50' },
  password_reset:     { icon: Settings,       color: 'text-amber-600 bg-amber-50' },
  file_uploaded:      { icon: FileText,       color: 'text-cyan-600 bg-cyan-50' },
};

const categoryTones: Record<AuditCategory, 'info' | 'success' | 'brand' | 'warning'> = {
  auth:   'info',
  memo:   'success',
  user:   'brand',
  system: 'warning',
};

/* ── Mock audit data ──────────────────────────────────────────────── */
function generateMockAuditLog(): AuditEntry[] {
  const now = Date.now();
  const h = (hours: number) => new Date(now - hours * 3600_000).toISOString();
  const loc = 'Addis Ababa, Ethiopia';

  return [
    { id: 'aud-001', timestamp: h(0.1),  userId: 'u-admin',  userName: 'Netsanet Fikru',    action: 'login',             category: 'auth',   descKey: 'audit_desc_login', descParams: { location: loc }, ip: '196.188.42.11' },
    { id: 'aud-002', timestamp: h(0.5),  userId: 'u-admin',  userName: 'Netsanet Fikru',    action: 'settings_updated',  category: 'system', descKey: 'audit_desc_settings_branding', ip: '196.188.42.11' },
    { id: 'aud-003', timestamp: h(1.2),  userId: 'u-dir-ict', userName: 'W/ro Hana Tesfaye', action: 'memo_created',     category: 'memo',   descKey: 'audit_desc_created', descParams: { docType: '__memo', reference: 'OSTA/ICT/2026/MEM001', title: 'Revised IT Security Policy' }, ip: '196.188.42.15', metadata: { memoId: 'memo-1', reference: 'OSTA/ICT/2026/MEM001' } },
    { id: 'aud-004', timestamp: h(2.0),  userId: 'u-head',   userName: 'Ato Girma Wolde',   action: 'memo_approved',     category: 'memo',   descKey: 'audit_desc_memo_approved_step', descParams: { reference: 'OSTA/ICT/2026/MEM001', step: '1' }, ip: '196.188.42.20', metadata: { memoId: 'memo-1' } },
    { id: 'aud-005', timestamp: h(3.5),  userId: 'u-head',   userName: 'Ato Girma Wolde',   action: 'memo_created',      category: 'memo',   descKey: 'audit_desc_created', descParams: { docType: '__circular', reference: 'OSTA/ADM/2026/CIR001', title: 'Office Holiday Schedule 2026' }, ip: '196.188.42.20', metadata: { memoId: 'memo-2', reference: 'OSTA/ADM/2026/CIR001' } },
    { id: 'aud-006', timestamp: h(5.0),  userId: 'u-admin',  userName: 'Netsanet Fikru',    action: 'user_created',      category: 'user',   descKey: 'audit_desc_user_created', descParams: { name: 'Abebe Kebede', role: 'Policy Analyst' }, ip: '196.188.42.11', metadata: { newUserId: 'u-emp-5' } },
    { id: 'aud-007', timestamp: h(6.0),  userId: 'u-emp-1',  userName: 'Meron Alemu',       action: 'memo_created',      category: 'memo',   descKey: 'audit_desc_created', descParams: { docType: '__notice', reference: 'OSTA/ICT/2026/NOT001', title: 'New Printer Setup ICT Lab' }, ip: '196.188.42.30', metadata: { memoId: 'memo-3', reference: 'OSTA/ICT/2026/NOT001' } },
    { id: 'aud-008', timestamp: h(7.0),  userId: 'u-dir-ict', userName: 'W/ro Hana Tesfaye', action: 'memo_approved',    category: 'memo',   descKey: 'audit_desc_memo_approved', descParams: { reference: 'OSTA/ICT/2026/NOT001' }, ip: '196.188.42.15', metadata: { memoId: 'memo-3' } },
    { id: 'aud-009', timestamp: h(8.5),  userId: 'u-tl-rd',  userName: 'W/ro Selam Kassa',  action: 'memo_created',      category: 'memo',   descKey: 'audit_desc_created', descParams: { docType: '__directive', reference: 'OSTA/RD/2026/DIR001', title: 'Mandatory Training Sessions' }, ip: '196.188.42.22', metadata: { memoId: 'memo-4', reference: 'OSTA/RD/2026/DIR001' } },
    { id: 'aud-010', timestamp: h(9.0),  userId: 'u-dir-ict', userName: 'W/ro Hana Tesfaye', action: 'memo_rejected',    category: 'memo',   descKey: 'audit_desc_memo_rejected', descParams: { reference: 'OSTA/RD/2026/DIR001', reason: 'Insufficient budget justification' }, ip: '196.188.42.15', metadata: { memoId: 'memo-4' } },
    { id: 'aud-011', timestamp: h(10.0), userId: 'u-admin',  userName: 'Netsanet Fikru',    action: 'user_role_changed', category: 'user',   descKey: 'audit_desc_user_role_changed', descParams: { name: 'Meron Alemu', oldRole: '__Employee', newRole: '__Team Leader' }, ip: '196.188.42.11', metadata: { targetUser: 'u-emp-1', oldRole: 'Employee', newRole: 'Team Leader' } },
    { id: 'aud-012', timestamp: h(12.0), userId: 'u-admin',  userName: 'Netsanet Fikru',    action: 'role_created',      category: 'system', descKey: 'audit_desc_role_created', descParams: { roleName: 'Department Coordinator' }, ip: '196.188.42.11' },
    { id: 'aud-013', timestamp: h(14.0), userId: 'u-emp-2',  userName: 'Kidist Tadesse',    action: 'login',             category: 'auth',   descKey: 'audit_desc_login', descParams: { location: loc }, ip: '196.188.42.35' },
    { id: 'aud-014', timestamp: h(16.0), userId: 'u-emp-2',  userName: 'Kidist Tadesse',    action: 'file_uploaded',     category: 'memo',   descKey: 'audit_desc_file_uploaded', descParams: { filename: 'Q3_Budget_Report.pdf', size: '1.2 MB' }, ip: '196.188.42.35' },
    { id: 'aud-015', timestamp: h(18.0), userId: 'u-head',   userName: 'Ato Girma Wolde',   action: 'login',             category: 'auth',   descKey: 'audit_desc_login', descParams: { location: loc }, ip: '196.188.42.20' },
    { id: 'aud-016', timestamp: h(20.0), userId: 'u-head',   userName: 'Ato Girma Wolde',   action: 'memo_forwarded',    category: 'memo',   descKey: 'audit_desc_memo_forwarded', descParams: { reference: 'OSTA/ICT/2026/MEM005', recipient: 'Finance Director' }, ip: '196.188.42.20', metadata: { memoId: 'memo-5' } },
    { id: 'aud-017', timestamp: h(22.0), userId: 'u-admin',  userName: 'Netsanet Fikru',    action: 'user_deactivated',  category: 'user',   descKey: 'audit_desc_user_deactivated', descParams: { email: 'test.user@osta.gov.et' }, ip: '196.188.42.11' },
    { id: 'aud-018', timestamp: h(24.0), userId: 'u-admin',  userName: 'Netsanet Fikru',    action: 'password_reset',    category: 'auth',   descKey: 'audit_desc_password_reset', descParams: { email: 'kidist.tadesse@osta.gov.et' }, ip: '196.188.42.11' },
    { id: 'aud-019', timestamp: h(30.0), userId: 'u-dir-fin', userName: 'Ato Dawit Assefa',  action: 'login',            category: 'auth',   descKey: 'audit_desc_login', descParams: { location: loc }, ip: '196.188.42.18' },
    { id: 'aud-020', timestamp: h(36.0), userId: 'u-admin',  userName: 'Netsanet Fikru',    action: 'settings_updated',  category: 'system', descKey: 'audit_desc_settings_general', ip: '196.188.42.11' },
  ];
}

/* Doc-type token → i18n key, used only inside descParams.docType so the
 * "memo / circular / notice / directive" word is localized too. */
const docTypeKeys: Record<string, string> = {
  __memo: 'audit_doctype_memo',
  __circular: 'audit_doctype_circular',
  __notice: 'audit_doctype_notice',
  __directive: 'audit_doctype_directive',
};

/* ── Component ────────────────────────────────────────────────────── */
export default function AuditLog() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | AuditCategory>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  /* Resolve a stored description into fully localized text, translating
   * embedded role/doc-type tokens (prefixed "__") along the way. */
  const describeEntry = (entry: AuditEntry): string => {
    if (!entry.descParams) return t(entry.descKey);
    const resolved: Record<string, string> = {};
    for (const [k, v] of Object.entries(entry.descParams)) {
      if (v.startsWith('__') && docTypeKeys[v]) {
        resolved[k] = t(docTypeKeys[v]);
      } else if (v.startsWith('__') && roleKeys[v.slice(2)]) {
        resolved[k] = t(roleKeys[v.slice(2)]);
      } else {
        resolved[k] = v;
      }
    }
    return t(entry.descKey, resolved);
  };

  // Fetch the audit trail from the database via the backend API. Until the
  // backend exposes a dedicated /audit-log endpoint, we fall back to the
  // local sample data so the page keeps working end-to-end.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiClient
      .get<AuditEntry[]>('/audit-log')
      .then((res) => {
        if (cancelled) return;
        const live = Array.isArray(res.data) && res.data.length > 0;
        setLogs(live ? res.data : generateMockAuditLog());
        setIsLive(live);
      })
      .catch(() => {
        if (cancelled) return;
        setLogs(generateMockAuditLog());
        setIsLive(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let items = logs;
    if (categoryFilter !== 'all') items = items.filter((e) => e.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((e) => {
        const label = t(auditActionKeys[e.action]).toLowerCase();
        const desc = describeEntry(e).toLowerCase();
        return (
          e.userName.toLowerCase().includes(q) ||
          desc.includes(q) ||
          label.includes(q) ||
          e.action.toLowerCase().includes(q)
        );
      });
    }
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, categoryFilter, search, i18n.language]);

  const stats = useMemo(() => ({
    total: logs.length,
    auth: logs.filter((e) => e.category === 'auth').length,
    memo: logs.filter((e) => e.category === 'memo').length,
    user: logs.filter((e) => e.category === 'user').length,
    system: logs.filter((e) => e.category === 'system').length,
  }), [logs]);

  /* Locale-aware relative and absolute timestamps. Afaan Oromoo has no
   * dedicated ICU locale in most browsers, so it falls back to English
   * numeral/date conventions while the surrounding words stay translated. */
  const dateLocale = i18n.language === 'am' ? 'am-ET' : 'en-GB';

  function formatRelativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return t('time_just_now');
    if (mins < 60) return t('time_minutes_ago', { count: mins });
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return t('time_hours_ago', { count: hrs });
    const days = Math.floor(hrs / 24);
    return t('time_days_ago', { count: days });
  }

  function formatTimestamp(iso: string): string {
    try {
      return new Date(iso).toLocaleString(dateLocale, {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
    } catch {
      return new Date(iso).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
    }
  }

  const categories: ('all' | AuditCategory)[] = ['all', 'auth', 'memo', 'user', 'system'];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-semibold">{t('nav_audit_log')}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-ink-400">{t('audit_log_subtitle')}</p>
            {loading ? (
              <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                <Loader2 className="size-3 animate-spin" /> {t('audit_syncing')}
              </span>
            ) : (
              <Badge tone={isLive ? 'success' : 'neutral'}>
                {isLive ? t('audit_live_from_database') : t('audit_sample_data')}
              </Badge>
            )}
          </div>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-50 transition-colors">
          <Download className="size-4" />
          {t('audit_export_csv')}
        </button>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {([
          { label: t('audit_stat_total_events'),   value: stats.total,  color: 'text-ink-900' },
          { label: t('audit_stat_authentication'),  value: stats.auth,   color: 'text-blue-600' },
          { label: t('audit_stat_memo_activity'),   value: stats.memo,   color: 'text-emerald-600' },
          { label: t('audit_stat_user_management'), value: stats.user,   color: 'text-purple-600' },
          { label: t('audit_stat_system_changes'),  value: stats.system, color: 'text-amber-600' },
        ]).map((s) => (
          <Card key={s.label} className="!shadow-sm">
            <CardBody className="!p-3 text-center">
              <p className={clsx('text-2xl font-bold', s.color)}>{s.value}</p>
              <p className="text-xs text-ink-400 mt-0.5">{s.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* ── Filters ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('audit_search_placeholder') || undefined}
            className="w-full pl-10 pr-4 py-2 text-sm border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="size-4 text-ink-400" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={clsx(
                'px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
                categoryFilter === cat
                  ? 'bg-brand-700 text-white'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200',
              )}
            >
              {cat === 'all' ? t('audit_filter_all') : t(auditCategoryKeys[cat])}
            </button>
          ))}
        </div>
      </div>

      {/* ── Log Entries ───────────────────────────────────────────── */}
      <Card>
        <CardBody className="!p-0 divide-y divide-ink-100">
          {filtered.length === 0 && (
            <div className="p-8 text-center text-ink-400 text-sm">{t('audit_no_entries')}</div>
          )}
          {filtered.map((entry) => {
            const meta = actionMeta[entry.action];
            const Icon = meta.icon;
            const isExpanded = expandedId === entry.id;
            const description = describeEntry(entry);
            return (
              <button
                key={entry.id}
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                className="w-full text-left px-4 py-3 hover:bg-ink-50/50 transition-colors focus:outline-none"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={clsx('size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', meta.color)}>
                    <Icon className="size-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-ink-900">{t(auditActionKeys[entry.action])}</span>
                      <Badge tone={categoryTones[entry.category]}>
                        {t(auditCategoryKeys[entry.category])}
                      </Badge>
                    </div>
                    <p className="text-sm text-ink-600 mt-0.5 line-clamp-1">{description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-ink-400">
                      <span className="inline-flex items-center gap-1">
                        <User className="size-3" />
                        {entry.userName}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatRelativeTime(entry.timestamp)}
                      </span>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-3 p-3 rounded-lg bg-ink-50 text-xs space-y-1.5 border border-ink-100">
                        <div className="flex gap-8 flex-wrap">
                          <div>
                            <span className="text-ink-400">{t('audit_timestamp_label')}</span>{' '}
                            <span className="text-ink-700 font-mono">{formatTimestamp(entry.timestamp)}</span>
                          </div>
                          <div>
                            <span className="text-ink-400">{t('audit_ip_address_label')}</span>{' '}
                            <span className="text-ink-700 font-mono">{entry.ip}</span>
                          </div>
                          <div>
                            <span className="text-ink-400">{t('audit_user_id_label')}</span>{' '}
                            <span className="text-ink-700 font-mono">{entry.userId}</span>
                          </div>
                        </div>
                        {entry.metadata && (
                          <div className="flex gap-4 flex-wrap pt-1 border-t border-ink-200">
                            {Object.entries(entry.metadata).map(([k, v]) => (
                              <div key={k}>
                                <span className="text-ink-400">{t(auditMetaLabelKeys[k] ?? k)}:</span>{' '}
                                <span className="text-ink-700 font-mono">{v}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp (right) */}
                  <span className="text-xs text-ink-400 whitespace-nowrap shrink-0 hidden sm:block">
                    {formatRelativeTime(entry.timestamp)}
                  </span>
                </div>
              </button>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
