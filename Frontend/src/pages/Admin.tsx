import { useState } from 'react';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/react';
import clsx from 'clsx';
import { Search, ToggleLeft, ToggleRight, Shield } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { toggleUserStatus, updateUserRole } from '../features/users/usersSlice';
import { pushToast } from '../features/ui/uiSlice';
import { roleDefinitions } from '../mocks/mockData';
import type { Role } from '../types';

const allRoles: Role[] = ['System Admin', 'Head Office', 'Director', 'Team Leader', 'Employee'];

function UserManagement() {
  const dispatch = useAppDispatch();
  const users = useAppSelector((s) => s.users.items);
  const [query, setQuery] = useState('');

  const filtered = users.filter((u) => u.fullName.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()));

  return (
    <Card>
      <CardHeader>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users…" className="w-full bg-ink-50 rounded-lg pl-9 pr-3 py-2 text-sm outline-none border border-transparent focus:border-brand-300 focus:bg-white" />
        </div>
        <Button size="sm" onClick={() => dispatch(pushToast('User creation is mocked in this preview.', 'info'))}>+ New User</Button>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-400 text-xs uppercase tracking-wide border-b border-ink-100">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Department</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 30).map((u) => (
              <tr key={u.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0" style={{ backgroundColor: u.avatarColor }}>
                      {u.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-ink-800 font-medium truncate">{u.fullName}</p>
                      <p className="text-xs text-ink-400 truncate">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-ink-500">{u.department}</td>
                <td className="px-5 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => { dispatch(updateUserRole({ id: u.id, role: e.target.value as Role })); dispatch(pushToast(`Updated role for ${u.fullName}.`, 'success')); }}
                    className="text-xs border border-ink-200 rounded-md px-2 py-1 outline-none bg-white"
                  >
                    {allRoles.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3"><Badge tone={u.status === 'active' ? 'success' : 'neutral'}>{u.status}</Badge></td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => { dispatch(toggleUserStatus(u.id)); dispatch(pushToast(`${u.fullName} ${u.status === 'active' ? 'disabled' : 'enabled'}.`, 'info')); }}
                    className="text-ink-400 hover:text-brand-700"
                    title={u.status === 'active' ? 'Disable account' : 'Enable account'}
                  >
                    {u.status === 'active' ? <ToggleRight className="size-6 text-success-500" /> : <ToggleLeft className="size-6" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function RoleManagement() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {roleDefinitions.map((r) => (
        <Card key={r.role}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-brand-700" />
              <h3 className="text-sm font-semibold">{r.role}</h3>
            </div>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2">
              {r.permissions.map((p) => (
                <li key={p} className="text-sm text-ink-600 flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-brand-500 shrink-0" /> {p}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function SystemSettings() {
  const dispatch = useAppDispatch();
  const [maxSize, setMaxSize] = useState(10);
  const [notifyOnMemo, setNotifyOnMemo] = useState(true);
  const [notifyOnMessage, setNotifyOnMessage] = useState(true);

  return (
    <Card>
      <CardHeader><h3 className="text-sm font-semibold">System Configuration</h3></CardHeader>
      <CardBody className="space-y-5 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Maximum attachment size (MB)</label>
          <input type="number" value={maxSize} onChange={(e) => setMaxSize(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink-700">Notify on new memo</p>
            <p className="text-xs text-ink-400">Send in-app notification when a memo is issued.</p>
          </div>
          <button onClick={() => setNotifyOnMemo(!notifyOnMemo)}>{notifyOnMemo ? <ToggleRight className="size-7 text-success-500" /> : <ToggleLeft className="size-7 text-ink-300" />}</button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink-700">Notify on new message</p>
            <p className="text-xs text-ink-400">Send in-app notification for direct messages.</p>
          </div>
          <button onClick={() => setNotifyOnMessage(!notifyOnMessage)}>{notifyOnMessage ? <ToggleRight className="size-7 text-success-500" /> : <ToggleLeft className="size-7 text-ink-300" />}</button>
        </div>
        <Button onClick={() => dispatch(pushToast('System settings saved.', 'success'))}>Save Settings</Button>
      </CardBody>
    </Card>
  );
}

export default function Admin() {
  return (
    <div>
      <h1 className="text-2xl mb-1">System Administration</h1>
      <p className="text-sm text-ink-400 mb-5">Manage users, roles, and platform-wide settings.</p>

      <TabGroup>
        <TabList className="flex gap-1.5 mb-5 border-b border-ink-100">
          {['User Management', 'Role Management', 'System Settings'].map((t) => (
            <Tab key={t} className={({ selected }) => clsx(
              'px-4 py-2.5 text-sm font-medium outline-none border-b-2 -mb-px transition-colors',
              selected ? 'border-brand-700 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-800',
            )}>
              {t}
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
