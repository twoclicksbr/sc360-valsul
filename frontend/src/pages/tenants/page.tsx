import { useCallback, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { GenericGrid } from '@/components/generic-grid';
import { TenantModal } from './tenant-modal';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// moduleId=1 — único módulo criado pelo MainSeeder em sc360_main (firstOrCreate, sempre ID=1 após migrate:fresh)
const MODULE_ID = 1;

export function TenantsPage() {
  const [validityRange, setValidityRange] = useState<DateRange | undefined>(undefined);

  const handleDataLoad = useCallback((_data: Record<string, unknown>[]) => {}, []);

  const handleClearSearchFilters = useCallback(() => {
    setValidityRange(undefined);
  }, []);

  const handleSearch = useCallback((_baseFilters: Record<string, string>): Record<string, string> => {
    const extra: Record<string, string> = {};
    if (validityRange?.from) {
      extra['expiration_date_from'] = format(validityRange.from, 'yyyy-MM-dd');
      if (validityRange.to) extra['expiration_date_to'] = format(validityRange.to, 'yyyy-MM-dd');
    }
    return extra;
  }, [validityRange]);

  const hasModuleFilters = useMemo(
    () => validityRange?.from !== undefined,
    [validityRange],
  );

  const renderSearchFilters = (
    <div className="grid grid-cols-12 gap-4 items-end">

      {/* Validade */}
      <div className="col-span-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start font-normal text-left">
              <CalendarIcon className="size-4 opacity-60" />
              {validityRange?.from ? (
                validityRange.to ? (
                  <span>{format(validityRange.from, 'dd/MM/yyyy')} — {format(validityRange.to, 'dd/MM/yyyy')}</span>
                ) : (
                  format(validityRange.from, 'dd/MM/yyyy')
                )
              ) : (
                <span className="text-muted-foreground">Período de Validade</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={validityRange?.from}
              selected={validityRange}
              onSelect={setValidityRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

    </div>
  );

  return (
    <GenericGrid
      moduleId={MODULE_ID}
      columns={[
        { key: 'name',            label: 'Nome',    sortable: true },
        { key: 'slug',            label: 'Slug',    sortable: true, meta: { style: { width: '12%' } } },
        { key: 'db_name',         label: 'Banco',                   meta: { style: { width: '12%' } } },
        { key: 'expiration_date', label: 'Validade', sortable: true, type: 'date', meta: { style: { width: '12%' } } },
      ]}
      modalComponent={TenantModal}
      showActionShow={false}
      showActionRestore={false}
      onDataLoad={handleDataLoad}
      renderSearchFilters={renderSearchFilters}
      onClearSearchFilters={handleClearSearchFilters}
      onSearch={handleSearch}
      hasModuleFilters={hasModuleFilters}
    />
  );
}
