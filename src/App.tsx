import { useMemo } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { ErrorState } from './components/layout/ErrorState';
import { LoadingState } from './components/layout/LoadingState';
import { AppShell } from './components/layout/AppShell';
import { GraphView } from './components/graph/GraphView';
import { AnalyticalTable } from './components/table/AnalyticalTable';
import { OpportunitiesView } from './components/opportunities/OpportunitiesView';
import { QualitySourcesView } from './components/quality/QualitySourcesView';
import { useWorkbook } from './hooks/useWorkbook';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const { data, loading, error } = useWorkbook();
  const activeView = useAppStore((state) => state.activeView);

  const content = useMemo(() => {
    if (!data) return null;
    switch (activeView) {
      case 'dashboard':
        return <Dashboard data={data} />;
      case 'cartographie':
        return <GraphView data={data} />;
      case 'tableau':
        return <AnalyticalTable data={data} />;
      case 'opportunites':
        return <OpportunitiesView data={data} />;
      case 'qualite':
        return <QualitySourcesView data={data} />;
      default:
        return <Dashboard data={data} />;
    }
  }, [activeView, data]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState error={error ?? 'Aucune donnée chargée.'} />;

  return <AppShell data={data}>{content}</AppShell>;
}
