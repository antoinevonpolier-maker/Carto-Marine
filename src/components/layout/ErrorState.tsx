import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="max-w-lg rounded-2xl border border-red-200 bg-white p-6 shadow-soft dark:border-red-900 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-300">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-950 dark:text-white">Les données n’ont pas pu être chargées</h1>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Vérifiez que le fichier de données intégré est bien présent dans le dossier public/data du projet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
