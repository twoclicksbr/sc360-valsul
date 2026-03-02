import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { usePlatform } from '@/providers/platform-provider';
import { useAuth } from '@/auth/context/auth-context';

export interface Module {
  id: number;
  slug: string;
  name: string;
  icon: string | null;
  type: string;
  owner_level: string;
  order: number;
  active: boolean;
}

interface ModulesContextValue {
  modules: Module[];
  loading: boolean;
  refreshModules: () => void;
}

const ModulesContext = createContext<ModulesContextValue>({
  modules: [],
  loading: false,
  refreshModules: () => {},
});

export function ModulesProvider({ children }: { children: React.ReactNode }) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedPlatform } = usePlatform();
  const { auth } = useAuth();

  const fetchModules = useCallback(() => {
    if (!auth?.access_token) {
      setModules([]);
      return;
    }
    setLoading(true);
    apiGet<{ data: Module[] }>(
      `/v1/modules?type=module&per_page=100&sort=order&direction=desc&active=true`,
    )
      .then((res) => setModules(res.data))
      .catch(() => setModules([]))
      .finally(() => setLoading(false));
  }, [auth?.access_token]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules, selectedPlatform]);

  return (
    <ModulesContext.Provider value={{ modules, loading, refreshModules: fetchModules }}>
      {children}
    </ModulesContext.Provider>
  );
}

export function useModules(): ModulesContextValue {
  return useContext(ModulesContext);
}
