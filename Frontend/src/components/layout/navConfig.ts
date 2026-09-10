import {
  LayoutDashboard, Hash, FileText, ClipboardCheck,
  Archive, BarChart3, Shield, Users, Settings, Sliders, ClipboardList,
} from 'lucide-react';
import type { Role } from '../../types';
import type { Permission } from '../../utils/rolePermissions';

export interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  requiredPermission?: Permission;
  fallbackRoles?: Role[];
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Channels', to: '/channels', icon: Hash, requiredPermission: 'Broadcast to Department Channels' },
  { label: 'Memos', to: '/memos', icon: FileText, requiredPermission: 'Create & Issue Memos' },
  { label: 'Approvals', to: '/approvals', icon: ClipboardCheck, requiredPermission: 'Approve & Reject Memos' },
  { label: 'Archive', to: '/archive', icon: Archive, requiredPermission: 'Access Digital Archive & Compliance Audit' },
  { label: 'Reports', to: '/reports', icon: BarChart3, requiredPermission: 'View System & Department Reports' },
  { label: 'Admin', to: '/admin/users', icon: Shield, requiredPermission: 'Manage Institutional Users & Status' },
  { label: 'System Settings', to: '/system-settings', icon: Sliders, requiredPermission: 'Configure System Policies & Branding' },
  // No requiredPermission: every role gets an Audit Log entry in their sidebar.
  // What they can actually see there is scoped server-side (System Admin = everyone,
  // everyone else = only their own department) — see auditController.js.
  { label: 'Audit Log', to: '/audit-log', icon: ClipboardList },
  { label: 'Directory', to: '/directory', icon: Users },
  { label: 'Profile', to: '/settings', icon: Settings },
];
