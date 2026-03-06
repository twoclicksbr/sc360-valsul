import { createContext, useContext, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { GenericModal } from '@/components/generic-modal';
import { apiGet } from '@/lib/api';
import { useModules } from '@/providers/modules-provider';
import { ModuleEdit } from './module-edit';

// Context para interceptar show/edit e renderizar inline na página
export const ModuleInlineCtx = createContext<((record: ModuleForEdit) => void) | null>(null);

export interface ModuleForEdit {
  id: number;
  slug: string;
  url_prefix: string | null;
  name: string;
  icon: string | null;
  type: 'module' | 'submodule' | 'pivot';
  is_custom: boolean;
  model: string;
  request: string;
  controller: string;
  observer: string;
  service: string;
  page: string | null;
  order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

interface ModuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | 'delete' | 'show' | 'restore';
  record: ModuleForEdit | null;
  onSuccess: () => void;
  moduleId?: number;
  slug?: string;
  size?: 'p' | 'm' | 'g';
}

type FieldErrors = Record<string, string[]>;
type SlugStatus = 'idle' | 'checking' | 'available' | 'unavailable';

// 'show-crm' = modal CRM de detalhes; os demais = GenericModal direto
type RenderMode = 'show-crm' | 'create' | 'edit' | 'delete' | 'restore';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toRenderMode(mode: ModuleModalProps['mode']): RenderMode {
  return mode === 'edit' || mode === 'show' ? 'show-crm' : (mode as RenderMode);
}

export function ModuleModal({ open, onOpenChange, mode, record, onSuccess, moduleId, slug: slugProp, size }: ModuleModalProps) {
  const goInline = useContext(ModuleInlineCtx);
  const { refreshModules } = useModules();

  function handleSuccess() {
    onSuccess();
    refreshModules();
  }
  const [renderMode, setRenderMode] = useState<RenderMode>(toRenderMode(mode));

  const [name, setName]             = useState('');
  const [slug, setSlug]             = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [type, setType]             = useState<string>('module');
  const [isCustom, setIsCustom]     = useState(false);
  const [model, setModel]           = useState('');
  const [request, setRequest]       = useState('');
  const [controller, setController] = useState('');
  const [observer, setObserver]     = useState('');
  const [service, setService]       = useState('');
  const [icon, setIcon]             = useState('');
  const [errors, setErrors]         = useState<FieldErrors>({});

  // Se há contexto inline disponível e o modo é show/edit, delega para a página
  useEffect(() => {
    if (!open) return;
    if ((mode === 'show' || mode === 'edit') && goInline && record) {
      goInline(record);
      onOpenChange(false);
    }
  }, [open, mode, goInline, record, onOpenChange]);

  useEffect(() => {
    if (open) {
      setRenderMode(toRenderMode(mode));
      if (record) {
        setName(record.name);
        setSlug(record.slug);
        setSlugManual(true);
        setType(record.type);
        setIsCustom(record.is_custom ?? false);
        setModel(record.model ?? '');
        setRequest(record.request ?? '');
        setController(record.controller ?? '');
        setObserver(record.observer ?? '');
        setService(record.service ?? '');
        setIcon(record.icon ?? '');
      } else {
        setName('');
        setSlug('');
        setSlugManual(false);
        setType('module');
        setIsCustom(false);
        setModel('');
        setRequest('');
        setController('');
        setObserver('');
        setService('');
        setIcon('');
      }
      setErrors({});
      setSlugStatus('idle');
    }
  }, [open, record, mode]);

  // Verificação de disponibilidade do slug com debounce de 500ms
  useEffect(() => {
    if (renderMode !== 'create' && renderMode !== 'edit' && renderMode !== 'restore') return;
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
          `/v1/modules/check-slug?${params}`,
        );
        setSlugStatus(res.available ? 'available' : 'unavailable');
      } catch {
        setSlugStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, record?.id, renderMode]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugManual) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugManual(true);
    const sanitized = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-{2,}/g, '-');
    setSlug(sanitized);
    setErrors((prev) => { const e = { ...prev }; delete e.slug; return e; });
  }

  function handleGetData(): Record<string, unknown> | null {
    if (slugStatus === 'checking' || slugStatus === 'unavailable') return null;
    return {
      name,
      slug,
      type,
      is_custom: isCustom,
      icon: icon || null,
      model:      isCustom ? model      : 'GenericModel',
      request:    isCustom ? request    : 'GenericRequest',
      controller: isCustom ? controller : 'GenericController',
      observer:   isCustom ? observer   : 'GenericObserver',
      service:    isCustom ? service    : 'GenericService',
    };
  }

  function handleErrors(errs: Record<string, string[]>) {
    setErrors(errs);
  }

  return (
    <>
      {/* Modal CRM show — abre quando mode é 'edit' ou 'show' e não há contexto inline */}
      {!goInline && (
        <ModuleEdit
          open={open && renderMode === 'show-crm'}
          onOpenChange={(isOpen) => { if (!isOpen) onOpenChange(false); }}
          record={record}
          onSuccess={() => { handleSuccess(); onOpenChange(false); }}
        />
      )}

      {/* Modal de formulário — abre para create/delete/restore */}
      {renderMode !== 'show-crm' && (
        <GenericModal
          open={open}
          onOpenChange={onOpenChange}
          mode={renderMode}
          size={size}
          moduleId={moduleId}
          slug={slugProp}
          record={record}
          onSuccess={handleSuccess}
          onSaveSuccess={(saved) => {
            if (renderMode === 'create' && goInline) {
              goInline(saved as ModuleForEdit);
            }
          }}
          onGetData={handleGetData}
          onErrors={handleErrors}
          saveDisabled={
            slugStatus === 'checking' ||
            slugStatus === 'unavailable' ||
            (renderMode === 'create' && (!name.trim() || !slug.trim()))
          }
        >
          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="module-name">
              Nome <span className="text-destructive">*</span>
            </Label>
            <Input
              id="module-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Nome do módulo"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name[0]}</p>
            )}
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="module-slug">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="module-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="slug-do-modulo"
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

          {/* Tipo */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="module-type">Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="module-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="module">Módulo</SelectItem>
                <SelectItem value="submodule">Submódulo</SelectItem>
                <SelectItem value="pivot">Pivot</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type[0]}</p>
            )}
          </div>

          {/* Customizado */}
          <div className="flex flex-col gap-1.5">
            <Label>Customizado</Label>
            <div className="flex items-center gap-2 h-8.5">
              <Switch
                id="module-is-custom"
                checked={isCustom}
                onCheckedChange={setIsCustom}
                size="sm"
              />
              <span className="text-sm text-muted-foreground">{isCustom ? 'Sim' : 'Não'}</span>
            </div>
          </div>

          {/* Campos de classe — visíveis apenas quando is_custom=true */}
          {isCustom && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="module-model">Model</Label>
                <Input
                  id="module-model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="GenericModel"
                />
                {errors.model && <p className="text-sm text-destructive">{errors.model[0]}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="module-request">Request</Label>
                <Input
                  id="module-request"
                  value={request}
                  onChange={(e) => setRequest(e.target.value)}
                  placeholder="GenericRequest"
                />
                {errors.request && <p className="text-sm text-destructive">{errors.request[0]}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="module-controller">Controller</Label>
                <Input
                  id="module-controller"
                  value={controller}
                  onChange={(e) => setController(e.target.value)}
                  placeholder="GenericController"
                />
                {errors.controller && <p className="text-sm text-destructive">{errors.controller[0]}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="module-observer">Observer</Label>
                <Input
                  id="module-observer"
                  value={observer}
                  onChange={(e) => setObserver(e.target.value)}
                  placeholder="GenericObserver"
                />
                {errors.observer && <p className="text-sm text-destructive">{errors.observer[0]}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="module-service">Service</Label>
                <Input
                  id="module-service"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="GenericService"
                />
                {errors.service && <p className="text-sm text-destructive">{errors.service[0]}</p>}
              </div>
            </>
          )}

        </GenericModal>
      )}
    </>
  );
}
