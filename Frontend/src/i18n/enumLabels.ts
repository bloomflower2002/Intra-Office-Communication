// Fixed, closed sets of values (statuses, priorities, roles, etc.) come from the
// data layer / mock data in English (e.g. MemoStatus = 'Pending Approval').
// These maps translate that fixed vocabulary into i18n keys for display,
// without needing to change the underlying data model or API contract.

export const statusKeys: Record<string, string> = {
  Draft: 'status_draft',
  'Pending Approval': 'status_pending_approval',
  'Revision Requested': 'status_revision_requested',
  Approved: 'status_approved',
  Rejected: 'status_rejected',
  Completed: 'status_completed',
  Archived: 'status_archived',
};

export const priorityKeys: Record<string, string> = {
  Low: 'priority_low',
  Normal: 'priority_normal',
  High: 'priority_high',
  Urgent: 'priority_urgent',
};

export const stageKeys: Record<string, string> = {
  Issued: 'stage_issued',
  Received: 'stage_received',
  Reviewed: 'stage_reviewed',
  Forwarded: 'stage_forwarded',
  Acknowledged: 'stage_acknowledged',
  Completed: 'stage_completed',
};

export const memoTypeKeys: Record<string, string> = {
  'Official Memo': 'memotype_official_memo',
  Circular: 'memotype_circular',
  Notice: 'memotype_notice',
  Directive: 'memotype_directive',
  Report: 'doctype_report',
  Letter: 'doctype_letter',
};

export const roleKeys: Record<string, string> = {
  'System Admin': 'role_system_admin',
  'Head Office': 'role_head_office',
  Director: 'role_director',
  'Team Leader': 'role_team_leader',
  Employee: 'role_employee',
  All: 'all_roles',
};

export const navKeys: Record<string, string> = {
  Dashboard: 'nav_dashboard',
  Messages: 'nav_messages',
  Channels: 'nav_channels',
  Memos: 'nav_memos',
  Approvals: 'nav_approvals',
  Archive: 'nav_archive',
  Reports: 'nav_reports',
  Admin: 'nav_admin',
  'System Settings': 'nav_system_settings',
  'Audit Log': 'nav_audit_log',
  Directory: 'nav_directory',
  Profile: 'nav_profile',
  Settings: 'nav_settings',
};
