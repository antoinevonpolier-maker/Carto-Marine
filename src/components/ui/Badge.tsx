import type { PropsWithChildren } from 'react';
import { cx } from '../../utils/format';

interface BadgeProps extends PropsWithChildren {
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span className={cx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset', className ?? 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700')}>
      {children}
    </span>
  );
}
