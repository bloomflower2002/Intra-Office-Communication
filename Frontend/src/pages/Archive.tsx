import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Archive as ArchiveIcon, Eye } from 'lucide-react';
import { Card } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { archiveDocs, departments } from '../mocks/mockData';
import type { ArchiveDoc } from '../types';

const statusTone: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  Completed: 'success', Archived: 'neutral', Approved: 'info', Rejected: 'danger', 'Pending Approval': 'warning', Draft: 'neutral',
};

export default function Archive() {
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('q') ?? '');
  const [type, setType] = useState('All');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [preview, setPreview] = useState<ArchiveDoc | null>(null);

  const types = ['All', ...Array.from(new Set(archiveDocs.map((d) => d.type)))];
  const statuses = ['All', ...Array.from(new Set(archiveDocs.map((d) => d.status)))];

  const filtered = useMemo(() => archiveDocs.filter((d) => {
    if (keyword && !d.subject.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (type !== 'All' && d.type !== type) return false;
    if (department !== 'All' && d.department !== department) return false;
    if (status !== 'All' && d.status !== status) return false;
    return true;
  }), [keyword, type, department, status]);

  return (
    <div>
      <h1 className="text-2xl mb-1">Document Archive</h1>
      <p className="text-sm text-ink-400 mb-5">Centralized, searchable repository of memos, letters, and reports.</p>

      <Card className="mb-5">
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
            <input
              value={keyword} onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by keyword…"
              className="w-full bg-ink-50 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none border border-transparent focus:border-brand-300 focus:bg-white"
            />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)} className="px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none bg-white">
            {types.map((t) => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
          </select>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none bg-white">
            <option value="All">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                status === s ? 'bg-brand-700 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={ArchiveIcon} title="No documents found" description="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-400 text-xs uppercase tracking-wide border-b border-ink-100">
                  <th className="px-5 py-3 font-medium">Subject</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Sender</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60 cursor-pointer" onClick={() => setPreview(d)}>
                    <td className="px-5 py-3 text-ink-800 font-medium max-w-xs truncate">{d.subject}</td>
                    <td className="px-5 py-3 text-ink-500">{d.type}</td>
                    <td className="px-5 py-3 text-ink-500">{d.sender}</td>
                    <td className="px-5 py-3 text-ink-500">{d.date}</td>
                    <td className="px-5 py-3"><Badge tone={statusTone[d.status] ?? 'neutral'}>{d.status}</Badge></td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setPreview(d); }} className="text-ink-400 hover:text-brand-700"><Eye className="size-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!preview} onClose={() => setPreview(null)} title="Document Preview">
        {preview && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-ink-400 mb-1">{preview.type} · {preview.department}</p>
              <h3 className="text-base font-semibold text-ink-900">{preview.subject}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-ink-400 text-xs">Sender</p><p className="text-ink-700 font-medium">{preview.sender}</p></div>
              <div><p className="text-ink-400 text-xs">Date</p><p className="text-ink-700 font-medium">{preview.date}</p></div>
              <div><p className="text-ink-400 text-xs">Status</p><Badge tone={statusTone[preview.status] ?? 'neutral'}>{preview.status}</Badge></div>
              <div><p className="text-ink-400 text-xs">Department</p><p className="text-ink-700 font-medium">{preview.department}</p></div>
            </div>
            <div className="border-t border-ink-100 pt-4">
              <p className="text-sm text-ink-500 italic">Full document content and metadata would be rendered here from the archive service.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
