import { useEffect, useState, useRef } from 'react';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/react';
import clsx from 'clsx';
import {
  Search,
  ToggleLeft,
  ToggleRight,
  Shield,
  Plus,
  Trash2,
  Upload,
  RotateCcw,
  Building2,
  LayoutTemplate,
  PhoneCall,
  Sliders,
  CheckCircle2,
  UserPlus,
  Mail
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchUsers, toggleUserStatus, updateUserRole, createUser } from '../features/users/usersSlice';
import { updateSystemConfig, resetSystemConfig } from '../features/system/systemConfigSlice';
import { pushToast } from '../features/ui/uiSlice';
import { roleDefinitions as initialRoleDefs } from '../mocks/mockData';
import { roleKeys } from '../i18n/enumLabels';
import type { Role } from '../types';
import { useTranslation } from 'react-i18next';

const allRoles: Role[] = ['System Admin', 'Head Office', 'Director', 'Team Leader', 'Employee'];
const avatarColorOptions = ['#2A4F97', '#1E9E6F', '#C9821A', '#C4432F', '#7B4FA5', '#2B7FB8', '#3865B8', '#0F1E40'];

const availablePermissions = [
  'Create & Issue Memos',
  'Approve & Reject Memos',
  'Forward Memos across Hierarchy',
  'Access Digital Archive & Compliance Audit',
  'View System & Department Reports',
  'Direct 1-on-1 Encrypted Messaging',
  'Broadcast to Department Channels',
  'Manage Institutional Users & Status',
  'Configure System Policies & Branding',
  'Manage Organizational Hierarchy'
];

function UserManagement() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const users = useAppSelector((s) => s.users.items);
  const departments = useAppSelector((s) => s.departments.items);
  const currentUser = useAppSelector((s) => s.auth.user);
  const isSystemAdmin = currentUser?.role === 'System Admin';
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');

  // Create User Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('ICT Bureau');
  const [role, setRole] = useState<Role>('Employee');
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('Passw0rd!');
  const [avatarColor, setAvatarColor] = useState('#2A4F97');
  const [formErrors, setFormErrors] = useState<{ fullName?: string; email?: string; title?: string }>({});

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filtered = users.filter(
    (u) =>
      (roleFilter === 'all' || u.role === roleFilter) &&
      (u.fullName.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase()) ||
        u.department.toLowerCase().includes(query.toLowerCase()))
  );

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setDepartment(departments[0] || 'ICT Bureau');
    setRole('Employee');
    setTitle('');
    setPassword('Passw0rd!');
    setAvatarColor('#2A4F97');
    setFormErrors({});
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSystemAdmin) {
      dispatch(pushToast('Only a System Admin can add new users.', 'error'));
      return;
    }
    const errors: typeof formErrors = {};
    if (!fullName.trim()) errors.fullName = 'Full name is required.';
    if (!email.trim() || !email.includes('@')) errors.email = 'Valid institutional email is required.';
    if (!title.trim()) errors.title = 'Job title is required.';
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    const result = await dispatch(
      createUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        department,
        role,
        title: title.trim(),
        password,
      })
    );

    if (createUser.fulfilled.match(result)) {
      dispatch(pushToast(`User ${fullName} created successfully.`, 'success'));
      resetForm();
      setCreateModalOpen(false);
    } else {
      dispatch(pushToast('Failed to create user. Email may already exist.', 'error'));
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search_users')}
                className="w-full bg-ink-50 rounded-lg pl-9 pr-3 py-2 text-sm outline-none border border-transparent focus:border-brand-300 focus:bg-white dark:bg-ink-100"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | Role)}
              className="text-sm border border-ink-200 rounded-lg px-3 py-2 outline-none bg-white dark:bg-ink-100"
              title="Filter by role"
            >
              <option value="all">{t('all_roles', 'All Roles')}</option>
              {allRoles.map((r) => (
                <option key={r} value={r}>
                  {t(roleKeys[r]) || r}
                </option>
              ))}
            </select>
          </div>
          {isSystemAdmin && (
            <Button size="sm" icon={<UserPlus className="size-4" />} onClick={() => setCreateModalOpen(true)}>
              {t('new_user', '+ Add New User')}
            </Button>
          )}
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-400 text-xs uppercase tracking-wide border-b border-ink-100">
                <th className="px-5 py-3 font-medium">{t('name')}</th>
                <th className="px-5 py-3 font-medium">{t('department')}</th>
                <th className="px-5 py-3 font-medium">{t('role')}</th>
                <th className="px-5 py-3 font-medium">{t('status')}</th>
                <th className="px-5 py-3 font-medium text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="size-8 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
                        style={{ backgroundColor: u.avatarColor }}
                      >
                        {u.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-ink-800 font-medium truncate">{u.fullName}</p>
                        <p className="text-xs text-ink-400 truncate">{u.title} · {u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-500">{u.department}</td>
                  <td className="px-5 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => {
                        dispatch(updateUserRole({ id: u.id, role: e.target.value as Role }));
                        dispatch(pushToast(`Updated role for ${u.fullName} to ${e.target.value}.`, 'success'));
                      }}
                      className="text-xs border border-ink-200 rounded-md px-2 py-1 outline-none bg-white dark:bg-ink-100 font-medium"
                    >
                      {allRoles.map((r) => (
                        <option key={r} value={r}>
                          {t(roleKeys[r]) || r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={u.status === 'active' ? 'success' : 'neutral'}>
                      {t(u.status === 'active' ? 'account_active' : 'account_inactive')}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => {
                        dispatch(toggleUserStatus({ id: u.id, status: u.status === 'active' ? 'inactive' : 'active' }));
                        dispatch(pushToast(`${u.fullName} ${u.status === 'active' ? 'disabled' : 'enabled'}.`, 'info'));
                      }}
                      className="text-ink-400 hover:text-brand-700"
                      title={t(u.status === 'active' ? 'disable_account' : 'enable_account')}
                    >
                      {u.status === 'active' ? (
                        <ToggleRight className="size-6 text-success-500" />
                      ) : (
                        <ToggleLeft className="size-6" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE NEW USER MODAL */}
      <Modal
        open={createModalOpen}
        onClose={() => {
          resetForm();
          setCreateModalOpen(false);
        }}
        title="Add Institutional User"
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setCreateModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>Create User Account</Button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Almaz Tadesse"
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${
                  formErrors.fullName ? 'border-danger-500' : 'border-ink-200 focus:border-brand-500'
                } bg-white dark:bg-ink-100`}
                required
              />
              {formErrors.fullName && <p className="text-xs text-danger-500 mt-1">{formErrors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Institutional Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="almaz.tadesse@osta.gov.et"
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${
                  formErrors.email ? 'border-danger-500' : 'border-ink-200 focus:border-brand-500'
                } bg-white dark:bg-ink-100`}
                required
              />
              {formErrors.email && <p className="text-xs text-danger-500 mt-1">{formErrors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Department *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">System Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100 font-medium"
              >
                {allRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Job Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Network Engineer"
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${
                  formErrors.title ? 'border-danger-500' : 'border-ink-200 focus:border-brand-500'
                } bg-white dark:bg-ink-100`}
                required
              />
              {formErrors.title && <p className="text-xs text-danger-500 mt-1">{formErrors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Initial Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Avatar Color Scheme</label>
            <div className="flex items-center gap-2">
              {avatarColorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className={`size-7 rounded-full transition-transform ${
                    avatarColor === c ? 'ring-2 ring-offset-2 ring-brand-600 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}

interface CustomRoleDef {
  role: string;
  description: string;
  permissions: string[];
  isCustom?: boolean;
}

// Maps each default institutional role to the granular permission set (drawn
// from `availablePermissions`) it should actually hold. System Admin manages
// the platform but does not author memos, so "Create & Issue Memos" is
// intentionally excluded for that role.
const defaultRolePermissions: Record<string, string[]> = {
  'System Admin': [
    'Approve & Reject Memos',
    'Forward Memos across Hierarchy',
    'Access Digital Archive & Compliance Audit',
    'View System & Department Reports',
    'Direct 1-on-1 Encrypted Messaging',
    'Broadcast to Department Channels',
    'Manage Institutional Users & Status',
    'Configure System Policies & Branding',
    'Manage Organizational Hierarchy',
  ],
  'Head Office': [
    'Approve & Reject Memos',
    'Forward Memos across Hierarchy',
    'Access Digital Archive & Compliance Audit',
    'View System & Department Reports',
    'Direct 1-on-1 Encrypted Messaging',
    'Broadcast to Department Channels',
  ],
  Director: [
    'Approve & Reject Memos',
    'Forward Memos across Hierarchy',
    'Access Digital Archive & Compliance Audit',
    'View System & Department Reports',
    'Direct 1-on-1 Encrypted Messaging',
  ],
  'Team Leader': [
    'Approve & Reject Memos',
    'Forward Memos across Hierarchy',
    'Direct 1-on-1 Encrypted Messaging',
    'Broadcast to Department Channels',
  ],
  Employee: [
    'Create & Issue Memos',
    'Direct 1-on-1 Encrypted Messaging',
  ],
};

function RoleManagement() {
  const dispatch = useAppDispatch();
  const [roleDefs, setRoleDefs] = useState<CustomRoleDef[]>(() => {
    const saved = localStorage.getItem('iocms_custom_roles_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialRoleDefs.map((r) => ({
      role: r.role,
      description: `Default system tier for ${r.role}`,
      permissions: defaultRolePermissions[r.role] ?? [],
      isCustom: false,
    }));
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([availablePermissions[0], availablePermissions[5]]);

  const persistRoles = (updated: CustomRoleDef[]) => {
    setRoleDefs(updated);
    localStorage.setItem('iocms_custom_roles_v1', JSON.stringify(updated));
  };

  const handleTogglePerm = (roleName: string, perm: string) => {
    const updated = roleDefs.map((r) => {
      if (r.role === roleName) {
        const has = r.permissions.includes(perm);
        const perms = has ? r.permissions.filter((p) => p !== perm) : [...r.permissions, perm];
        return { ...r, permissions: perms };
      }
      return r;
    });
    persistRoles(updated);
    dispatch(pushToast(`Permissions updated for ${roleName}.`, 'success'));
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      dispatch(pushToast('Role name is required.', 'error'));
      return;
    }
    if (roleDefs.some((r) => r.role.toLowerCase() === newRoleName.trim().toLowerCase())) {
      dispatch(pushToast('A role with this name already exists.', 'error'));
      return;
    }

    const newEntry: CustomRoleDef = {
      role: newRoleName.trim(),
      description: newRoleDesc.trim() || 'Custom administrative authority role',
      permissions: selectedPerms,
      isCustom: true,
    };

    const updated = [...roleDefs, newEntry];
    persistRoles(updated);
    dispatch(pushToast(`Role "${newRoleName.trim()}" created successfully.`, 'success'));
    setNewRoleName('');
    setNewRoleDesc('');
    setSelectedPerms([availablePermissions[0]]);
    setModalOpen(false);
  };

  const handleDeleteRole = (roleName: string) => {
    const updated = roleDefs.filter((r) => r.role !== roleName);
    persistRoles(updated);
    dispatch(pushToast(`Role "${roleName}" removed.`, 'info'));
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-ink-900">Role & Permission Hierarchy</h2>
          <p className="text-xs text-ink-400">Configure institutional security privileges and authorization scopes</p>
        </div>
        <Button size="sm" icon={<Plus className="size-4" />} onClick={() => setModalOpen(true)}>
          Add Custom Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roleDefs.map((r) => (
          <Card key={r.role}>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-brand-700" />
                <h3 className="text-sm font-semibold">{r.role}</h3>
                {r.isCustom && (
                  <span className="text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-semibold">
                    Custom
                  </span>
                )}
              </div>
              {r.isCustom && (
                <button
                  onClick={() => handleDeleteRole(r.role)}
                  className="text-ink-400 hover:text-danger-500 transition-colors p-1"
                  title="Delete role"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </CardHeader>
            <CardBody>
              <p className="text-xs text-ink-400 mb-3">{r.description}</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                {availablePermissions.map((perm) => {
                  const has = r.permissions.includes(perm);
                  return (
                    <label
                      key={perm}
                      className="flex items-center justify-between text-xs text-ink-700 hover:bg-ink-50 p-1.5 rounded cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`size-2 rounded-full ${has ? 'bg-success-500' : 'bg-ink-300'}`}
                        />
                        {perm}
                      </span>
                      <input
                        type="checkbox"
                        checked={has}
                        onChange={() => handleTogglePerm(r.role, perm)}
                        className="rounded border-ink-300 text-brand-600 size-3.5"
                      />
                    </label>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* ADD ROLE MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Custom System Role"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRole}>Save Role</Button>
          </>
        }
      >
        <form onSubmit={handleAddRole} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Role Title *</label>
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g. Compliance Auditor, Division Chief"
              className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Role Description</label>
            <input
              type="text"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              placeholder="Brief description of responsibilities"
              className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Granted Permissions</label>
            <div className="space-y-2 border border-ink-200 rounded-lg p-3 max-h-48 overflow-y-auto scrollbar-thin">
              {availablePermissions.map((p) => {
                const checked = selectedPerms.includes(p);
                return (
                  <label key={p} className="flex items-center gap-2 text-xs text-ink-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedPerms(checked ? selectedPerms.filter((x) => x !== p) : [...selectedPerms, p]);
                      }}
                      className="rounded border-ink-300 text-brand-600 size-4"
                    />
                    {p}
                  </label>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function SystemSettings() {
  const dispatch = useAppDispatch();
  const sysConfig = useAppSelector((s) => s.systemConfig);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({ ...sysConfig });

  useEffect(() => {
    setForm({ ...sysConfig });
  }, [sysConfig]);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      dispatch(pushToast('Please select a valid image file (PNG, JPG, SVG, WebP).', 'error'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setForm((prev) => ({ ...prev, logoUrl: dataUrl }));
      dispatch(pushToast('Logo image loaded. Click "Save System Branding" to apply.', 'info'));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateSystemConfig(form));
    dispatch(pushToast('System branding and settings updated across the platform!', 'success'));
  };

  const handleReset = () => {
    if (window.confirm('Reset all system settings, titles, and logos back to factory default OSTA branding?')) {
      dispatch(resetSystemConfig());
      dispatch(pushToast('System branding reset to default.', 'info'));
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* 1. INSTITUTION BRANDING & LOGOS */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Building2 className="size-4.5 text-brand-600" />
          <div>
            <h3 className="text-sm font-semibold">Institutional Branding & Logo</h3>
            <p className="text-xs text-ink-400">Updates organization titles, emblems, and names across Header, Sidebar, and Login</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          {/* Logo preview and upload */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-xl bg-ink-50 dark:bg-ink-200/40 border border-ink-100">
            <div className="size-20 rounded-2xl bg-white dark:bg-ink-100 p-2 shadow-md border border-ink-200 flex items-center justify-center overflow-hidden shrink-0">
              <img src={form.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-semibold text-ink-800">Official Organization Logo</p>
              <p className="text-xs text-ink-400 leading-relaxed">
                Upload a custom PNG, SVG, or JPG emblem. This replaces the default logo across the Introduction page, Sidebar header, and Login screens.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  icon={<Upload className="size-3.5" />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload New Logo File
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Full Organization Name</label>
              <input
                type="text"
                value={form.orgName}
                onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Organization Acronym / Short Name</label>
              <input
                type="text"
                value={form.orgShortName}
                onChange={(e) => setForm({ ...form, orgShortName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100 font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">System Name</label>
              <input
                type="text"
                value={form.systemName}
                onChange={(e) => setForm({ ...form, systemName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Copyright Footer Text</label>
              <input
                type="text"
                value={form.copyrightText}
                onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 2. INTRODUCTION PORTAL & HERO CONTENT */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <LayoutTemplate className="size-4.5 text-brand-600" />
          <div>
            <h3 className="text-sm font-semibold">Introduction Portal & Landing Page Content</h3>
            <p className="text-xs text-ink-400">Controls the headline, lead paragraph, and value propositions on /intro</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Portal Hero Headline</label>
            <input
              type="text"
              value={form.introHeroTitle}
              onChange={(e) => setForm({ ...form, introHeroTitle: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Portal Hero Subtitle / Lead Paragraph</label>
            <textarea
              rows={3}
              value={form.introHeroSubtitle}
              onChange={(e) => setForm({ ...form, introHeroSubtitle: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100 resize-none"
            />
          </div>
        </CardBody>
      </Card>

      {/* 3. CONTACT INFORMATION */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <PhoneCall className="size-4.5 text-brand-600" />
          <div>
            <h3 className="text-sm font-semibold">Institutional Contact & Helpdesk Information</h3>
            <p className="text-xs text-ink-400">Displayed in password recovery modals, user support tickets, and footer info</p>
          </div>
        </CardHeader>
        <CardBody className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Support Email</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Helpdesk Phone</label>
            <input
              type="text"
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Physical Address</label>
            <input
              type="text"
              value={form.contactAddress}
              onChange={(e) => setForm({ ...form, contactAddress: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100"
            />
          </div>
        </CardBody>
      </Card>

      {/* 4. REAL EMAIL & SMTP NOTIFICATIONS */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="size-4.5 text-brand-600" />
            <div>
              <h3 className="text-sm font-semibold">Real Email Delivery (SMTP Gateway)</h3>
              <p className="text-xs text-ink-400">Dispatch live memos and approval notices to real external email inboxes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setForm({ ...form, enableLiveEmailDelivery: !form.enableLiveEmailDelivery })}
            className="flex items-center gap-1.5 text-xs font-medium"
          >
            <span className={form.enableLiveEmailDelivery ? 'text-success-600' : 'text-ink-400'}>
              {form.enableLiveEmailDelivery ? 'Active' : 'Disabled'}
            </span>
            {form.enableLiveEmailDelivery ? (
              <ToggleRight className="size-7 text-success-500" />
            ) : (
              <ToggleLeft className="size-7 text-ink-300" />
            )}
          </button>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">SMTP Server Host</label>
              <input
                type="text"
                value={form.smtpHost}
                onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
                placeholder="smtp.gmail.com or mail.osta.gov.et"
                className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">SMTP Port</label>
              <input
                type="number"
                value={form.smtpPort}
                onChange={(e) => setForm({ ...form, smtpPort: Number(e.target.value) })}
                placeholder="587"
                className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">SMTP Username / Email</label>
              <input
                type="email"
                value={form.smtpUser}
                onChange={(e) => setForm({ ...form, smtpUser: e.target.value })}
                placeholder="notifications@osta.gov.et or your-email@gmail.com"
                className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">SMTP Password / App Password</label>
              <input
                type="password"
                value={form.smtpPass}
                onChange={(e) => setForm({ ...form, smtpPass: e.target.value })}
                placeholder="••••••••••••••••"
                className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Sender Display Name</label>
            <input
              type="text"
              value={form.smtpSenderName}
              onChange={(e) => setForm({ ...form, smtpSenderName: e.target.value })}
              placeholder="OSTA IOCMS Gateway"
              className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100"
            />
          </div>
        </CardBody>
      </Card>

      {/* 5. SYSTEM OPERATIONAL POLICIES */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Sliders className="size-4.5 text-brand-600" />
          <div>
            <h3 className="text-sm font-semibold">Operational System Policies</h3>
            <p className="text-xs text-ink-400">Attachment limits and in-app automated notification rules</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-ink-700 mb-1">Maximum Attachment Size (MB)</label>
            <input
              type="number"
              value={form.maxAttachmentSizeMb}
              onChange={(e) => setForm({ ...form, maxAttachmentSizeMb: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500 bg-white dark:bg-ink-100"
              min={1}
              max={100}
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-ink-100">
            <div>
              <p className="text-sm font-medium text-ink-700">In-App Alerts for Issued Memos</p>
              <p className="text-xs text-ink-400">Instantly notify designated approvers and recipients</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, notifyOnMemo: !form.notifyOnMemo })}
            >
              {form.notifyOnMemo ? (
                <ToggleRight className="size-7 text-success-500" />
              ) : (
                <ToggleLeft className="size-7 text-ink-300" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-ink-100">
            <div>
              <p className="text-sm font-medium text-ink-700">Direct Message Push Alerts</p>
              <p className="text-xs text-ink-400">Notify users of unread direct messages across departments</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, notifyOnMessage: !form.notifyOnMessage })}
            >
              {form.notifyOnMessage ? (
                <ToggleRight className="size-7 text-success-500" />
              ) : (
                <ToggleLeft className="size-7 text-ink-300" />
              )}
            </button>
          </div>
        </CardBody>
      </Card>

      {/* SAVE & RESET BUTTONS */}
      <div className="flex items-center justify-between pt-2">
        <Button type="submit" size="lg" icon={<CheckCircle2 className="size-4" />}>
          Save System Branding & Settings
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={<RotateCcw className="size-3.5" />}
          onClick={handleReset}
        >
          Reset to Factory Branding
        </Button>
      </div>
    </form>
  );
}

export default function Admin() {
  const { t: translate } = useTranslation();
  return (
    <div>
      <h1 className="text-2xl mb-1">{translate('system_administration')}</h1>
      <p className="text-sm text-ink-400 mb-5">{translate('manage_users_roles_and_platform_wide_settings')}</p>

      <TabGroup>
        <TabList className="flex gap-1.5 mb-5 border-b border-ink-100">
          {['tab_user_management', 'tab_role_management', 'tab_system_settings'].map((tabKey) => (
            <Tab key={tabKey} className={({ selected }) => clsx(
              'px-4 py-2.5 text-sm font-medium outline-none border-b-2 -mb-px transition-colors',
              selected ? 'border-brand-700 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-800',
            )}>
              {translate(tabKey)}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          <TabPanel><UserManagement /></TabPanel>
          <TabPanel><RoleManagement /></TabPanel>
          <TabPanel><SystemSettings /></TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
