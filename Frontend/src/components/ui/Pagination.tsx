import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import type { PaginationMeta } from '../../types';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Builds a compact page-number sequence with ellipses, e.g.:
 * 1 … 4 5 [6] 7 8 … 42
 */
function buildPageList(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | 'ellipsis')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push('ellipsis');
    result.push(p);
    prev = p;
  }
  return result;
}

/**
 * Numbered pagination with Prev/Next controls, used across every list/table
 * in the app that can grow over time (memos, messages, channels, archive,
 * audit log, directory, notifications, reports).
 */
export default function Pagination({ pagination, onPageChange, className }: PaginationProps) {
  const { t } = useTranslation();
  const { page, totalPages, total, pageSize, hasNextPage, hasPrevPage } = pagination;

  if (totalPages <= 1) return null;

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);
  const pages = buildPageList(page, totalPages);

  return (
    <nav
      className={clsx('flex flex-col sm:flex-row items-center justify-between gap-3 pt-3', className)}
      aria-label={t('pagination_label')}
    >
      <p className="text-xs text-ink-500">
        {t('pagination_showing', { start: rangeStart, end: rangeEnd, total })}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="inline-flex items-center justify-center size-8 rounded-md border border-ink-200 text-ink-600 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label={t('pagination_previous')}
        >
          <ChevronLeft className="size-4" />
        </button>

        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-ink-400 text-sm select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={clsx(
                'inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-md text-sm font-medium transition-colors',
                p === page
                  ? 'bg-brand-700 text-white'
                  : 'text-ink-600 hover:bg-ink-100',
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="inline-flex items-center justify-center size-8 rounded-md border border-ink-200 text-ink-600 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label={t('pagination_next')}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}
