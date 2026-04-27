import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { Download, Eye, Ship } from 'lucide-react';
import { useMemo, useState } from 'react';
import { STATUS_COLORS } from '../../constants/palette';
import { useAppStore } from '../../store/useAppStore';
import type { InventoryItem, WorkbookData } from '../../types/data';
import { filterInventory } from '../../utils/filters';
import { cx, displayValue, formatNumber } from '../../utils/format';
import { downloadCsv, inventoryToRawRows } from '../../utils/export';
import { FilterPanel } from '../filters/FilterPanel';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { SectionTitle } from '../ui/SectionTitle';

interface AnalyticalTableProps {
  data: WorkbookData;
}

const columns: ColumnDef<InventoryItem>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'nomBatiment', header: 'Nom' },
  { accessorKey: 'codeCoque', header: 'Code coque' },
  { accessorKey: 'segmentCartographie', header: 'Segment' },
  { accessorKey: 'paysMarine', header: 'Pays / marine' },
  { accessorKey: 'horizonProgramme', header: 'Horizon' },
  {
    accessorKey: 'statutCartographie',
    header: 'Statut',
    cell: ({ getValue }) => {
      const value = String(getValue() ?? '');
      return <Badge className={cx(STATUS_COLORS[value] ?? 'bg-slate-100 text-slate-700 ring-slate-200')}>{displayValue(value)}</Badge>;
    },
  },
  { accessorKey: 'opportuniteMarche', header: 'Opportunité' },
  { accessorKey: 'fonction', header: 'Fonction' },
  { accessorKey: 'categorie', header: 'Catégorie' },
  { accessorKey: 'typeBatiment', header: 'Type' },
  { accessorKey: 'classe', header: 'Classe' },
  { accessorKey: 'portRattachement', header: 'Port' },
  { accessorKey: 'zone', header: 'Zone' },
  { accessorKey: 'tonnageTexte', header: 'Tonnage' },
  { accessorKey: 'miseEnServiceDate', header: 'MES / date' },
  { accessorKey: 'constructeur', header: 'Constructeur' },
  { accessorKey: 'mainteneur', header: 'Mainteneur' },
  { accessorKey: 'fiabiliteSource', header: 'Fiabilité' },
];

export function AnalyticalTable({ data }: AnalyticalTableProps) {
  const filters = useAppStore((state) => state.filters);
  const setSelectedItem = useAppStore((state) => state.setSelectedItem);
  const [sorting, setSorting] = useState<SortingState>([]);
  const filteredInventory = useMemo(() => filterInventory(data.inventory, filters), [data.inventory, filters]);

  const table = useReactTable({
    data: filteredInventory,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 25 } },
  });

  return (
    <div className="space-y-5">
      <SectionTitle
        eyebrow="Inventaire détaillé"
        title="Vue analytique / tableau"
        description="Tableau filtrable et exportable basé sur l’inventaire détaillé. Les champs métier sont conservés dans les données brutes et dans l’export CSV."
        action={
          <Button onClick={() => downloadCsv('inventaire_marine_filtre.csv', inventoryToRawRows(filteredInventory))} variant="primary">
            <Download className="h-4 w-4" /> Exporter CSV
          </Button>
        }
      />

      <FilterPanel items={data.inventory} />

      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-navy-700 dark:text-blue-300" />
            <p className="font-bold text-slate-950 dark:text-white">{formatNumber(filteredInventory.length)} lignes affichées</p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tri : cliquez sur un en-tête</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1500px] w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="whitespace-nowrap px-4 py-3 font-bold">
                      <button className="flex items-center gap-1" onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && ' ↑'}
                        {header.column.getIsSorted() === 'desc' && ' ↓'}
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 font-bold">Action</th>
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="max-w-[260px] px-4 py-3 align-top text-slate-700 dark:text-slate-200">
                      <div className="line-clamp-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                    </td>
                  ))}
                  <td className="px-4 py-3 align-top">
                    <Button variant="ghost" onClick={() => setSelectedItem(row.original)}>
                      <Eye className="h-4 w-4" /> Voir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>Début</Button>
            <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Précédent</Button>
            <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Suivant</Button>
            <Button onClick={() => table.setPageIndex(Math.max(table.getPageCount() - 1, 0))} disabled={!table.getCanNextPage()}>Fin</Button>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(event) => table.setPageSize(Number(event.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {[10, 25, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>
    </div>
  );
}
