import { useState } from 'react';
import { Search, Mail, Phone, Building2 } from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { users, departments } from '../mocks/mockData';
import type { User } from '../types';
import { Users as UsersIcon } from 'lucide-react';

export default function Directory() {
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('All');
  const [role, setRole] = useState('All');
  const [selected, setSelected] = useState<User | null>(null);
  const [view, setView] = useState<'list' | 'tree'>('list');

  const roles = ['All', ...Array.from(new Set(users.map((u) => u.role)))];

  const filtered = users.filter((u) => {
    if (query && !u.fullName.toLowerCase().includes(query.toLowerCase()) && !u.department.toLowerCase().includes(query.toLowerCase())) return false;
    if (dept !== 'All' && u.department !== dept) return false;
    if (role !== 'All' && u.role !== role) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl mb-1">Staff & Department Directory</h1>
          <p className="text-sm text-ink-400">Search the organizational directory of OSTA.</p>
        </div>
        <div className="flex gap-1.5 bg-ink-100 p-1 rounded-lg w-fit">
          <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${view === 'list' ? 'bg-white shadow-sm text-ink-800' : 'text-ink-500'}`}>List View</button>
          <button onClick={() => setView('tree')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${view === 'tree' ? 'bg-white shadow-sm text-ink-800' : 'text-ink-500'}`}>Department View</button>
        </div>
      </div>

      <Card className="mb-5">
        <CardBody className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name…" className="w-full bg-ink-50 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none border border-transparent focus:border-brand-300 focus:bg-white" />
          </div>
          <select value={dept} onChange={(e) => setDept(e.target.value)} className="px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none bg-white">
            <option value="All">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none bg-white">
            {roles.map((r) => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>)}
          </select>
        </CardBody>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={UsersIcon} title="No staff found" description="Try a different search or filter." /></Card>
      ) : view === 'list' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u) => (
            <Card key={u.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(u)}>
              <CardBody className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="size-11 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: u.avatarColor }}>
                    {u.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  {u.online && <span className="absolute bottom-0 right-0 size-2.5 bg-success-500 rounded-full ring-2 ring-white" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-800 truncate">{u.fullName}</p>
                  <p className="text-xs text-ink-400 truncate">{u.title}</p>
                  <p className="text-xs text-brand-700 truncate mt-0.5">{u.department}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {departments.map((d) => {
            const members = filtered.filter((u) => u.department === d);
            if (members.length === 0) return null;
            return (
              <Card key={d}>
                <CardBody>
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="size-4 text-brand-700" />
                    <h3 className="text-sm font-semibold text-ink-800">{d}</h3>
                    <span className="text-xs text-ink-400">({members.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {members.map((u) => (
                      <button key={u.id} onClick={() => setSelected(u)} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-ink-50 text-left">
                        <div className="size-8 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0" style={{ backgroundColor: u.avatarColor }}>
                          {u.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-ink-800 truncate">{u.fullName}</p>
                          <p className="text-[11px] text-ink-400 truncate">{u.title}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Staff Profile">
        {selected && (
          <div className="text-center">
            <div className="size-16 rounded-full flex items-center justify-center text-white text-xl font-semibold mx-auto mb-3" style={{ backgroundColor: selected.avatarColor }}>
              {selected.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <p className="text-base font-semibold text-ink-900">{selected.fullName}</p>
            <p className="text-sm text-ink-400">{selected.title}</p>
            <div className="mt-5 space-y-2.5 text-left border-t border-ink-100 pt-4">
              <div className="flex items-center gap-2.5 text-sm text-ink-600"><Mail className="size-4 text-ink-400" /> {selected.email}</div>
              {selected.phone && <div className="flex items-center gap-2.5 text-sm text-ink-600"><Phone className="size-4 text-ink-400" /> {selected.phone}</div>}
              <div className="flex items-center gap-2.5 text-sm text-ink-600"><Building2 className="size-4 text-ink-400" /> {selected.department} · {selected.role}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
