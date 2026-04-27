import { useEffect } from 'react';
import { loadDataFromUrl } from '../services/dataLoader';
import { useAppStore } from '../store/useAppStore';

export function useWorkbook() {
  const { data, loading, error, setData, setError, setLoading } = useAppStore();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadDataFromUrl()
      .then((workbookData) => {
        if (!cancelled) setData(workbookData);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erreur inconnue au chargement des données.');
      });

    return () => {
      cancelled = true;
    };
  }, [setData, setError, setLoading]);

  return { data, loading, error };
}
