export const AVAILABLE_PERMISSIONS = [
  'Create & Issue Memos',
  'Approve & Reject Memos',
  'Forward Memos across Hierarchy',
  'Access Digital Archive & Compliance Audit',
  'View System & Department Reports',
  'Broadcast to Department Channels',
  'Manage Institutional Users & Status',
  'Configure System Policies & Branding',
  'Manage Organizational Hierarchy',
] as const;

export type Permission = typeof AVAILABLE_PERMISSIONS[number];

export interface CustomRoleDef {
  role: string;
  description: string;
  permissions: string[];
  isCustom?: boolean;
}

export const INSTITUTIONAL_DEFAULT_ROLES: CustomRoleDef[] = [
  {
    role: 'System Admin',
    description: 'Full institutional governance, security policies, user provisioning & audit oversight (Isolated from operational memo and channel workflows by default)',
    permissions: [
      'Manage Institutional Users & Status',
      'Configure System Policies & Branding',
      'Manage Organizational Hierarchy',
      'View System & Department Reports',
      // Note: 'Broadcast to Department Channels' is intentionally omitted by default for Admin.
      // To give Channels to Admin, simply tick it in Role Management and click Save!
    ],
    isCustom: false,
  },
  {
    role: 'Head Office',
    description: 'Executive Director General — Tier 3 Final Approval and Release Authority for all institutional memos',
    permissions: [
      'Create & Issue Memos',
      'Approve & Reject Memos',
      'Forward Memos across Hierarchy',
      'Access Digital Archive & Compliance Audit',
      'View System & Department Reports',
      'Broadcast to Department Channels',
    ],
    isCustom: false,
  },
  {
    role: 'Director',
    description: 'Departmental Director — Tier 2 Vetting & Endorsement Authority for department-level memos and directives',
    permissions: [
      'Create & Issue Memos',
      'Approve & Reject Memos',
      'Forward Memos across Hierarchy',
      'Access Digital Archive & Compliance Audit',
      'View System & Department Reports',
      'Broadcast to Department Channels',
    ],
    isCustom: false,
  },
  {
    role: 'Team Leader',
    description: 'Unit / Section Lead — Tier 1 Technical Review Authority; can vet, order revision, or forward memos to Director',
    permissions: [
      'Create & Issue Memos',
      'Approve & Reject Memos',
      'Forward Memos across Hierarchy',
      'Broadcast to Department Channels',
      'View System & Department Reports',
    ],
    isCustom: false,
  },
  {
    role: 'Employee',
    description: 'Professional Staff Member — Initiates official memos, tracks review progress, and communicates securely',
    permissions: [
      'Create & Issue Memos',
      'Broadcast to Department Channels',
      'Access Digital Archive & Compliance Audit',
    ],
    isCustom: false,
  },
];

export const ROLES_STORAGE_KEY = 'iocms_custom_roles_v1';

export function getSavedRoleDefs(): CustomRoleDef[] {
  try {
    const raw = localStorage.getItem(ROLES_STORAGE_KEY);
    if (raw) {
      const parsed: CustomRoleDef[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load custom roles:', err);
  }
  return INSTITUTIONAL_DEFAULT_ROLES;
}

export function saveRoleDefs(roles: CustomRoleDef[]): void {
  localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
  window.dispatchEvent(new CustomEvent('iocms-roles-updated'));
}

export function hasRolePermission(roleName: string, permission: Permission | string): boolean {
  const allRoles = getSavedRoleDefs();
  const found = allRoles.find((r) => r.role.toLowerCase() === roleName.toLowerCase());
  if (!found) return false;
  return found.permissions.includes(permission);
}
