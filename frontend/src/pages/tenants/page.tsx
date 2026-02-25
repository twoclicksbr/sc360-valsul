import { GenericGrid } from '@/components/generic-grid';
import { TenantModal } from './tenant-modal';

// moduleId=1 — único módulo criado pelo MainSeeder em sc360_main (firstOrCreate, sempre ID=1 após migrate:fresh)
const MODULE_ID = 1;

export function TenantsPage() {
  return (
    <GenericGrid
      moduleId={MODULE_ID}
      columns={[
        { key: 'name',            label: 'Nome',    sortable: true },
        { key: 'slug',            label: 'Slug',    sortable: true, width: '140px' },
        { key: 'db_name',         label: 'Banco',                   width: '140px' },
        { key: 'expiration_date', label: 'Validade', sortable: true, type: 'date', width: '120px' },
      ]}
      modalComponent={TenantModal}
      showActionShow={false}
      showActionRestore={false}
      showBtnSearch={false}
    />
  );
}
