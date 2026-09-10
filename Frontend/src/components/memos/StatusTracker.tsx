import { Check } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import type { MemoStage } from '../../types';
import { stageKeys } from '../../i18n/enumLabels';

const stages: MemoStage[] = ['Issued', 'Received', 'Reviewed', 'Forwarded', 'Acknowledged', 'Completed'];

export default function StatusTracker({ current, history }: { current: MemoStage; history: { stage: MemoStage; timestamp: string }[] }) {
  const { t } = useTranslation();
  const currentIdx = stages.indexOf(current);

  return (
    <div className="flex items-start">
      {stages.map((stage, i) => {
        const reached = i <= currentIdx;
        const entry = history.find((h) => h.stage === stage);
        return (
          <div key={stage} className="flex-1 flex flex-col items-center relative">
            {i > 0 && (
              <div className={clsx('absolute top-4 right-1/2 w-full h-0.5 -z-0', i <= currentIdx ? 'bg-brand-600' : 'bg-ink-200')} />
            )}
            <div className={clsx(
              'size-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 z-10 border-2',
              reached ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white dark:bg-ink-100 border-ink-200 text-ink-300',
            )}>
              {reached ? <Check className="size-4" /> : i + 1}
            </div>
            <p className={clsx('text-xs font-medium mt-2 text-center', reached ? 'text-ink-800' : 'text-ink-400')}>{t(stageKeys[stage])}</p>
            {entry && <p className="text-[10px] text-ink-400 mt-0.5 text-center">{new Date(entry.timestamp).toLocaleDateString()}</p>}
          </div>
        );
      })}
    </div>
  );
}
