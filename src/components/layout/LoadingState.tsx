import { Ship } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-soft">
          <Ship className="h-7 w-7 animate-pulse" />
        </div>
        <h1 className="mt-4 text-lg font-bold">Chargement de la cartographie</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Lecture et normalisation des données de marché.</p>
      </div>
    </div>
  );
}
