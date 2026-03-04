import React, { useCallback, useMemo, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/common/container';
import { GenericGrid } from '@/components/generic-grid';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModuleModal, ModuleInlineCtx, type ModuleForEdit } from './module-modal';
import { ModuleShowModal } from './module-show-modal';
import { useModules } from '@/providers/modules-provider';

export function ModulesPage() {
  const { refreshModules } = useModules();
  const [selectedModule, setSelectedModule] = useState<ModuleForEdit | null>(null);
  const [gridKey, setGridKey] = useState(0);
  const [filterType, setFilterType] = useState('all');

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

  const handleClearSearchFilters = useCallback(() => {
    setFilterType('all');
  }, []);

  const handleSearch = useCallback((_baseFilters: Record<string, string>): Record<string, string> => {
    const extra: Record<string, string> = {};
    if (filterType !== 'all') extra['type'] = filterType;
    return extra;
  }, [filterType]);

  const hasModuleFilters = useMemo(
    () => filterType !== 'all',
    [filterType],
  );

  const renderSearchFilters = (
    <div className="grid grid-cols-12 gap-4 items-end">

      {/* Tipo */}
      <div className="col-span-3 flex flex-col gap-1.5">
        <Label>Tipo</Label>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger>
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">—</SelectItem>
            <SelectItem value="module">Módulo</SelectItem>
            <SelectItem value="submodule">Submódulo</SelectItem>
            <SelectItem value="pivot">Pivot</SelectItem>
          </SelectContent>
        </Select>
      </div>

    </div>
  );

  if (selectedModule !== null) {
    return (
      <Container>
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
        slug="modules"
        title="Módulos"
        columns={[
          {
            key: 'name',
            label: 'Nome',
            sortable: true,
            render: (value, record, openModal) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const IconComponent = record.icon ? (LucideIcons as any)[record.icon] as React.ComponentType<{ className?: string }> : null;
              return (
                <button
                  className="text-left hover:underline cursor-pointer font-bold text-blue-600 flex items-center gap-2"
                  onClick={() => openModal('show', record)}
                >
                  {IconComponent && <IconComponent className="size-4 text-muted-foreground" />}
                  {String(value ?? '—')}
                </button>
              );
            },
          },
          {
            key: 'slug',
            label: 'Slug',
            sortable: true,
            meta: { style: { width: '10%' } },
            render: (value) => (
              <Badge variant="info" appearance="light">
                {String(value ?? '—')}
              </Badge>
            ),
          },
        ]}
        modalComponent={ModuleModal}
        groupBy="computed"
        groupByCompute={(record) => String(record.type ?? 'module')}
        groupByLabels={{ module: 'Módulo', submodule: 'Submódulo', pivot: 'Pivot' }}
        groupByOrder={['module', 'submodule', 'pivot']}
        onReorder={refreshModules}
        renderSearchFilters={renderSearchFilters}
        onClearSearchFilters={handleClearSearchFilters}
        onSearch={handleSearch}
        hasModuleFilters={hasModuleFilters}
      />
    </ModuleInlineCtx.Provider>
  );
}
