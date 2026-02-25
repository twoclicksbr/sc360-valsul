import { useCallback, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { GenericGrid } from '@/components/generic-grid';
import { TenantModal } from './tenant-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// moduleId=1 — único módulo criado pelo MainSeeder em sc360_main (firstOrCreate, sempre ID=1 após migrate:fresh)
const MODULE_ID = 1;

export function TenantsPage() {
  const [tenantData, setTenantData]           = useState<Record<string, unknown>[]>([]);
  const [selectedSlugs, setSelectedSlugs]     = useState<Set<string>>(new Set());
  const [selectedBanks, setSelectedBanks]     = useState<Set<string>>(new Set());
  const [validityRange, setValidityRange]     = useState<DateRange | undefined>(undefined);
  const [slugSearch, setSlugSearch]           = useState('');
  const [bankSearch, setBankSearch]           = useState('');

  const uniqueSlugs = useMemo(
    () => [...new Set(tenantData.map((r) => String(r.slug ?? '')).filter(Boolean))].sort(),
    [tenantData],
  );

  const uniqueBanks = useMemo(
    () => [...new Set(tenantData.map((r) => String(r.db_name ?? '')).filter(Boolean))].sort(),
    [tenantData],
  );

  const filteredSlugs = useMemo(
    () => uniqueSlugs.filter((s) => s.toLowerCase().includes(slugSearch.toLowerCase())),
    [uniqueSlugs, slugSearch],
  );

  const filteredBanks = useMemo(
    () => uniqueBanks.filter((b) => b.toLowerCase().includes(bankSearch.toLowerCase())),
    [uniqueBanks, bankSearch],
  );

  const toggleSlug = (value: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value); else next.add(value);
      return next;
    });
  };

  const toggleBank = (value: string) => {
    setSelectedBanks((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value); else next.add(value);
      return next;
    });
  };

  const handleDataLoad = useCallback((data: Record<string, unknown>[]) => {
    setTenantData(data);
  }, []);

  const handleClearSearchFilters = useCallback(() => {
    setSelectedSlugs(new Set());
    setSelectedBanks(new Set());
    setValidityRange(undefined);
  }, []);

  const handleSearch = useCallback((_baseFilters: Record<string, string>): Record<string, string> => {
    const extra: Record<string, string> = {};
    if (selectedSlugs.size > 0) extra['slugs'] = [...selectedSlugs].join(',');
    if (selectedBanks.size > 0) extra['banks'] = [...selectedBanks].join(',');
    if (validityRange?.from) {
      extra['expiration_date_from'] = format(validityRange.from, 'yyyy-MM-dd');
      if (validityRange.to) extra['expiration_date_to'] = format(validityRange.to, 'yyyy-MM-dd');
    }
    return extra;
  }, [selectedSlugs, selectedBanks, validityRange]);

  const hasModuleFilters = useMemo(
    () => selectedSlugs.size > 0 || selectedBanks.size > 0 || validityRange?.from !== undefined,
    [selectedSlugs, selectedBanks, validityRange],
  );

  const renderSearchFilters = (
    <div className="grid grid-cols-12 gap-4 items-end">

      {/* Slug */}
      <div className="col-span-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start font-normal">
              <span>Slug</span>
              {selectedSlugs.size > 0 && (
                <Badge variant="primary" appearance="light" size="sm" className="ms-2">
                  {selectedSlugs.size}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <Input
              type="text"
              placeholder="Buscar..."
              value={slugSearch}
              onChange={(e) => setSlugSearch(e.target.value)}
              className="mb-2"
            />
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredSlugs.map((slug) => (
                <label key={slug} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={selectedSlugs.has(slug)}
                    onCheckedChange={() => toggleSlug(slug)}
                  />
                  {slug}
                </label>
              ))}
              {filteredSlugs.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">Nenhum resultado</p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Banco */}
      <div className="col-span-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start font-normal">
              <span>Banco</span>
              {selectedBanks.size > 0 && (
                <Badge variant="primary" appearance="light" size="sm" className="ms-2">
                  {selectedBanks.size}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <Input
              type="text"
              placeholder="Buscar..."
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              className="mb-2"
            />
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredBanks.map((bank) => (
                <label key={bank} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={selectedBanks.has(bank)}
                    onCheckedChange={() => toggleBank(bank)}
                  />
                  {bank}
                </label>
              ))}
              {filteredBanks.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">Nenhum resultado</p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

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
