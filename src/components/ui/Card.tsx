import type { PropsWithChildren } from 'react';
import { cx } from '../../utils/format';

interface CardProps extends PropsWithChildren {
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <section className={cx('rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900', className)}>{children}</section>;
}
