import { useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/common/container';
import { GenericGrid } from '@/components/generic-grid';
import { ModuleModal, ModuleInlineCtx, type ModuleForEdit } from './module-modal';
import { ModuleShowModal } from './module-show-modal';

// moduleId=2 — módulo modules criado pelo MainSeeder em tc_main (firstOrCreate, sempre ID=2 após migrate:fresh)
const MODULE_ID = 2;

export function ModulesPage() {
  const [selectedModule, setSelectedModule] = useState<ModuleForEdit | null>(null);
  const [gridKey, setGridKey] = useState(0);

  function handleGoInline(record: ModuleForEdit) {
    setSelectedModule(record);
  }

  function handleBack() {
    setSelectedModule(null);
  }

  function handleSuccess() {
    setSelectedModule(null);
    setGridKey((k) => k + 1);
  }

  if (selectedModule !== null) {
    return (
      <Container>
        {/* Título da página — mesmo visual que no grid view */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <LayoutGrid className="size-6" />
            Módulos
          </h1>
        </div>

        <ModuleShowModal
          inline
          open={false}
          onOpenChange={() => {}}
          record={selectedModule}
          onSuccess={handleSuccess}
          onBack={handleBack}
        />
      </Container>
    );
  }

  return (
    <ModuleInlineCtx.Provider value={handleGoInline}>
      <GenericGrid
        key={gridKey}
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
              const map: Record<string, { label: string; variant: 'primary' | 'secondary' | 'outline' }> = {
                master:   { label: 'Master',     variant: 'primary' },
                platform: { label: 'Plataforma', variant: 'secondary' },
                tenant:   { label: 'Tenant',     variant: 'outline' },
              };
              const opt = map[String(value)] ?? { label: String(value ?? '—'), variant: 'outline' as const };
              return <Badge variant={opt.variant}>{opt.label}</Badge>;
            },
          },
        ]}
        modalComponent={ModuleModal}
        groupBy="owner_level"
        groupByLabels={{ master: 'Master', platform: 'Plataforma', tenant: 'Tenant' }}
        groupByOrder={['master', 'platform', 'tenant']}
      />
    </ModuleInlineCtx.Provider>
  );
}
