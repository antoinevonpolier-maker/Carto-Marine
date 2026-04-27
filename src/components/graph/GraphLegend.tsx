import { HORIZON_COLORS, LEVEL_COLORS, SEGMENT_COLORS } from '../../constants/palette';
import { Card } from '../ui/Card';

function LegendGroup({ title, values }: { title: string; values: Record<string, string> }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {Object.entries(values).map(([label, color]) => (
          <span key={label} className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function GraphLegend() {
  return (
    <Card className="p-4">
      <div className="grid gap-4 xl:grid-cols-3">
        <LegendGroup title="Segments" values={SEGMENT_COLORS} />
        <LegendGroup title="Horizons" values={HORIZON_COLORS} />
        <LegendGroup title="Niveaux" values={LEVEL_COLORS} />
      </div>
    </Card>
  );
}
