import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { Card, CardBody } from './Card';

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  tone?: 'brand' | 'success' | 'warning' | 'info';
}

const toneClasses = {
  brand: 'bg-brand-100 text-brand-700',
  success: 'bg-success-100 text-success-500',
  warning: 'bg-warning-100 text-warning-500',
  info: 'bg-info-100 text-info-500',
};

export default function KpiCard({ label, value, icon: Icon, trend, tone = 'brand' }: KpiCardProps) {
  return (
    <Card>
      <CardBody className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-semibold text-ink-900 mt-1.5">{value}</p>
          {trend && (
            <p className={clsx('text-xs font-medium mt-1.5', trend.positive ? 'text-success-500' : 'text-danger-500')}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={clsx('size-10 rounded-lg flex items-center justify-center shrink-0', toneClasses[tone])}>
          <Icon className="size-5" />
        </div>
      </CardBody>
    </Card>
  );
}
