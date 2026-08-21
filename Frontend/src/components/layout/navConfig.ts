import {
  LayoutDashboard, MessageSquare, Hash, FileText, ClipboardCheck,
  Archive, BarChart3, Shield, Users, Settings,
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
  { label: 'Messages', to: '/messages', icon: MessageSquare, roles: ['System Admin', 'Head Office', 'Director', 'Team Leader', 'Employee'] },
  { label: 'Channels', to: '/channels', icon: Hash, roles: ['System Admin', 'Head Office', 'Director', 'Team Leader', 'Employee'] },
  { label: 'Memos', to: '/memos', icon: FileText, roles: ['System Admin', 'Head Office', 'Director', 'Team Leader', 'Employee'] },
  { label: 'Approvals', to: '/approvals', icon: ClipboardCheck, roles: ['System Admin', 'Head Office', 'Director', 'Team Leader'] },
  { label: 'Archive', to: '/archive', icon: Archive, roles: ['System Admin', 'Head Office', 'Director', 'Team Leader', 'Employee'] },
  { label: 'Reports', to: '/reports', icon: BarChart3, roles: ['System Admin', 'Head Office', 'Director', 'Team Leader'] },
  { label: 'Admin', to: '/admin', icon: Shield, roles: ['System Admin'] },
  { label: 'Directory', to: '/directory', icon: Users, roles: ['System Admin', 'Head Office', 'Director', 'Team Leader', 'Employee'] },
  { label: 'Settings', to: '/settings', icon: Settings, roles: ['System Admin', 'Head Office', 'Director', 'Team Leader', 'Employee'] },
];
