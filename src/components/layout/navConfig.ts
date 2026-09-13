import {
  LayoutDashboard, MessageSquare, Hash, FileText, ClipboardCheck,
  Archive, BarChart3, Shield, Users, UserCircle, ClipboardList, Settings, SlidersHorizontal,
} from 'lucide-react';
import type { Role } from '../../types';

export interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: ['System Admin', 'Head Office', 'Director', 'Team Leader', 'Employee'] },
  { label: 'Messages', to: '/messages', icon: MessageSquare, roles: ['Head Office', 'Director', 'Team Leader', 'Employee'] },
  { label: 'Channels', to: '/channels', icon: Hash, roles: ['Head Office', 'Director', 'Team Leader', 'Employee'] },
  { label: 'Memos', to: '/memos', icon: FileText, roles: ['Head Office', 'Director', 'Team Leader', 'Employee'] },
  { label: 'Approvals', to: '/approvals', icon: ClipboardCheck, roles: ['Head Office', 'Director', 'Team Leader'] },
  { label: 'Archive', to: '/archive', icon: Archive, roles: ['Head Office', 'Director', 'Team Leader', 'Employee'] },
  { label: 'Reports', to: '/reports', icon: BarChart3, roles: ['Head Office', 'Director', 'Team Leader'] },
  { label: 'Admin', to: '/admin', icon: Shield, roles: ['System Admin'] },
  // Full organization-wide configuration (branding, policies, roles) — System Admin only.
  { label: 'System Settings', to: '/system-settings', icon: Settings, roles: ['System Admin'] },
  // Personal environment controls (theme, language, font size, date format) — every other role.
  { label: 'Preferences', to: '/preferences', icon: SlidersHorizontal, roles: ['Head Office', 'Director', 'Team Leader', 'Employee'] },
  { label: 'Audit Log', to: '/audit-log', icon: ClipboardList, roles: ['System Admin', 'Head Office', 'Director', 'Team Leader', 'Employee'] },
  { label: 'Directory', to: '/directory', icon: Users, roles: ['System Admin', 'Head Office', 'Director', 'Team Leader', 'Employee'] },
  { label: 'Profile', to: '/settings', icon: UserCircle, roles: ['System Admin', 'Head Office', 'Director', 'Team Leader', 'Employee'] },
];
