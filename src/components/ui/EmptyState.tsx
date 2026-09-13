import type { LucideIcon } from 'lucide-react';

export default function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="size-12 rounded-full bg-ink-100 flex items-center justify-center mb-4">
        <Icon className="size-6 text-ink-400" />
      </div>
      <p className="text-sm font-medium text-ink-700">{title}</p>
      {description && <p className="text-sm text-ink-400 mt-1 max-w-sm">{description}</p>}
    </div>
  );
}
