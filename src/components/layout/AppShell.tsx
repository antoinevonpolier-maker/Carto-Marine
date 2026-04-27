import type { PropsWithChildren } from 'react';
import type { WorkbookData } from '../../types/data';
import { useAppStore } from '../../store/useAppStore';
import { cx } from '../../utils/format';
import { GlobalSearchResults } from '../search/GlobalSearchResults';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppShellProps extends PropsWithChildren {
  data: WorkbookData;
}

export function AppShell({ children, data }: AppShellProps) {
  const darkMode = useAppStore((state) => state.darkMode);

  return (
    <div className={cx(darkMode && 'dark')}>
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
        <div className="flex">
          <Sidebar />
          <main className="min-w-0 flex-1">
            <Header />
            <GlobalSearchResults data={data} />
            <div className="p-4 md:p-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
