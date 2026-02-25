import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GenericModal } from '@/components/generic-modal';
import { apiGet } from '@/lib/api';

export interface TenantForEdit {
  id: number;
  name: string;
  slug: string;
  expiration_date: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface TenantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | 'delete' | 'show' | 'restore';
  record: TenantForEdit | null;
  onSuccess: () => void;
  moduleId: number;
  size?: 'p' | 'm' | 'g';
}

type FieldErrors = Record<string, string[]>;
type SlugStatus = 'idle' | 'checking' | 'available' | 'unavailable';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function defaultExpiration(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

export function TenantModal({ open, onOpenChange, mode, record, onSuccess, moduleId, size }: TenantModalProps) {
  const isDelete = mode === 'delete';

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [expirationDate, setExpirationDate] = useState(defaultExpiration);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Inicializa / reseta o formulário ao abrir
  useEffect(() => {
    if (open) {
      if (record) {
        setName(record.name);
        setSlug(record.slug);
        setSlugManual(true);
        setExpirationDate(record.expiration_date?.split('T')[0] ?? defaultExpiration());
      } else {
        setName('');
        setSlug('');
        setSlugManual(false);
        setExpirationDate(defaultExpiration());
      }
      setErrors({});
      setSlugStatus('idle');
    }
  }, [open, record]);

  // Verificação de disponibilidade do slug com debounce de 500ms
  useEffect(() => {
    if (mode !== 'create' && mode !== 'edit' && mode !== 'restore') return;
    if (!slug) {
      setSlugStatus('idle');
      return;
    }

    setSlugStatus('checking');
    const excludeId = record?.id;

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ slug });
        if (excludeId) params.set('exclude_id', String(excludeId));
        const res = await apiGet<{ available: boolean }>(
          `/v1/admin/tenants/check-slug?${params}`,
        );
        setSlugStatus(res.available ? 'available' : 'unavailable');
      } catch {
        setSlugStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, record?.id, isDelete]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugManual) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugManual(true);
    setSlug(value);
    setErrors((prev) => { const e = { ...prev }; delete e.slug; return e; });
  }

  // Coleta dados do formulário — retorna null para abortar se slug inválido
  function handleGetData(): Record<string, unknown> | null {
    if (slugStatus === 'checking' || slugStatus === 'unavailable') return null;
    return { name, slug, expiration_date: expirationDate };
  }

  // Recebe erros 422 da API e distribui nos campos
  function handleErrors(errs: Record<string, string[]>) {
    setErrors(errs);
  }

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      mode={mode}
      size={size}
      moduleId={moduleId}
      record={record}
      onSuccess={onSuccess}
      onGetData={handleGetData}
      onErrors={handleErrors}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tenant-name">
          Nome <span className="text-destructive">*</span>
        </Label>
        <Input
          id="tenant-name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Nome do tenant"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tenant-slug">
          Slug <span className="text-destructive">*</span>
        </Label>
        <Input
          id="tenant-slug"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="slug-do-tenant"
        />
        {errors.slug && (
          <p className="text-sm text-destructive">{errors.slug[0]}</p>
        )}
        {!errors.slug && slugStatus === 'checking' && (
          <p className="text-sm text-muted-foreground">Verificando...</p>
        )}
        {!errors.slug && slugStatus === 'unavailable' && (
          <p className="text-sm text-destructive">Slug já em uso</p>
        )}
        {!errors.slug && slugStatus === 'available' && (
          <p className="text-sm text-green-600">Slug disponível</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tenant-expiration">
          Validade <span className="text-destructive">*</span>
        </Label>
        <Input
          id="tenant-expiration"
          type="date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
        />
        {errors.expiration_date && (
          <p className="text-sm text-destructive">{errors.expiration_date[0]}</p>
        )}
      </div>
    </GenericModal>
  );
}
