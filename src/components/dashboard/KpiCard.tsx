import type { ReactNode } from 'react';
import { cx } from '../../utils/format';
import { Card } from '../ui/Card';

interface KpiCardProps {
  label: string;
  value: string | number;
  detail?: string;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function KpiCard({ label, value, detail, icon, active, onClick }: KpiCardProps) {
  const content = (
    <Card className={cx('p-4 transition', onClick && 'hover:-translate-y-0.5 hover:shadow-lg', active && 'ring-2 ring-navy-600 dark:ring-blue-400')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{value}</p>
          {detail && <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{detail}</p>}
        </div>
        {icon && <div className="rounded-xl bg-navy-50 p-2 text-navy-700 dark:bg-slate-800 dark:text-blue-300">{icon}</div>}
      </div>
    </Card>
  );

  if (!onClick) return content;

  return (
    <button type="button" onClick={onClick} className="block w-full text-left" aria-pressed={active}>
      {content}
    </button>
  );
}
