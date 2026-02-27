import { LayoutGrid } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GenericGrid } from '@/components/generic-grid';
import { ModuleModal } from './module-modal';

// moduleId=2 — módulo modules criado pelo MainSeeder em tc_main (firstOrCreate, sempre ID=2 após migrate:fresh)
const MODULE_ID = 2;

export function ModulesPage() {
  return (
    <GenericGrid
      moduleId={MODULE_ID}
      icon={LayoutGrid}
      columns={[
        {
          key: 'name',
          label: 'Nome',
          sortable: true,
          meta: { style: { width: '30%' } },
          render: (value, record, openModal) => (
            <button
              className="text-left hover:underline cursor-pointer font-bold text-blue-600"
              onClick={() => openModal('show', record)}
            >
              {String(value ?? '—')}
            </button>
          ),
        },
        {
          key: 'slug',
          label: 'Slug',
          sortable: true,
          meta: { style: { width: '15%' } },
          render: (value) => (
            <Badge variant="info" appearance="light">
              {String(value ?? '—')}
            </Badge>
          ),
        },
        {
          key: 'type',
          label: 'Tipo',
          sortable: true,
          meta: { style: { width: '10%' } },
          render: (value) => {
            const map: Record<string, { label: string; variant: 'primary' | 'secondary' | 'warning' }> = {
              module:    { label: 'Módulo',    variant: 'primary' },
              submodule: { label: 'Submódulo', variant: 'secondary' },
              pivot:     { label: 'Pivot',     variant: 'warning' },
            };
            const opt = map[String(value)] ?? { label: String(value ?? '—'), variant: 'secondary' as const };
            return <Badge variant={opt.variant}>{opt.label}</Badge>;
          },
        },
        {
          key: 'owner_level',
          label: 'Proprietário',
          sortable: true,
          meta: { style: { width: '12%' } },
          render: (value) => {
            const map: Record<string, { label: string; variant: 'primary' | 'secondary' | 'default' }> = {
              master:   { label: 'Master',     variant: 'primary' },
              platform: { label: 'Plataforma', variant: 'secondary' },
              tenant:   { label: 'Tenant',     variant: 'default' },
            };
            const opt = map[String(value)] ?? { label: String(value ?? '—'), variant: 'default' as const };
            return <Badge variant={opt.variant}>{opt.label}</Badge>;
          },
        },
      ]}
      modalComponent={ModuleModal}
    />
  );
}
