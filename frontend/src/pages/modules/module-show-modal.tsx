import { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { apiGet, apiPut } from '@/lib/api';
import { getTenantSlug } from '@/lib/tenant';
import { type ModuleForEdit } from './module-modal';

interface ModuleShowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: ModuleForEdit | null;
  onSuccess: () => void;
}

type SlugStatus = 'idle' | 'checking' | 'available' | 'unavailable';
type FieldErrors = Record<string, string[]>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDateTimeBR(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

function formatId(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

const TYPE_LABELS: Record<string, { label: string; variant: 'primary' | 'secondary' | 'warning' }> = {
  module:    { label: 'Módulo',    variant: 'primary' },
  submodule: { label: 'Submódulo', variant: 'secondary' },
  pivot:     { label: 'Pivot',     variant: 'warning' },
};

const OWNER_LABELS: Record<string, { label: string; variant: 'primary' | 'secondary' | 'default' }> = {
  master:   { label: 'Master',     variant: 'primary' },
  platform: { label: 'Plataforma', variant: 'secondary' },
  tenant:   { label: 'Tenant',     variant: 'default' },
};

export function ModuleShowModal({ open, onOpenChange, record, onSuccess }: ModuleShowModalProps) {
  const [name, setName]               = useState('');
  const [slug, setSlug]               = useState('');
  const [slugManual, setSlugManual]   = useState(false);
  const [slugStatus, setSlugStatus]   = useState<SlugStatus>('idle');
  const [icon, setIcon]               = useState('');
  const [type, setType]               = useState('module');
  const [ownerLevel, setOwnerLevel]   = useState('master');
  const [model, setModel]             = useState('');
  const [request, setRequest]         = useState('');
  const [sizeModal, setSizeModal]     = useState('');
  const [afterStore, setAfterStore]   = useState('');
  const [afterUpdate, setAfterUpdate] = useState('');
  const [afterRestore, setAfterRestore] = useState('');
  const [descIndex, setDescIndex]     = useState('');
  const [descShow, setDescShow]       = useState('');
  const [descStore, setDescStore]     = useState('');
  const [descUpdate, setDescUpdate]   = useState('');
  const [descDelete, setDescDelete]   = useState('');
  const [descRestore, setDescRestore] = useState('');
  const [active, setActive]           = useState(true);
  const [saving, setSaving]           = useState(false);
  const [errors, setErrors]           = useState<FieldErrors>({});

  useEffect(() => {
    if (open && record) {
      setName(record.name);
      setSlug(record.slug);
      setSlugManual(true);
      setIcon(record.icon ?? '');
      setType(record.type);
      setOwnerLevel(record.owner_level);
      setModel(record.model ?? '');
      setRequest(record.request ?? '');
      setSizeModal(record.size_modal ?? '');
      setAfterStore(record.after_store ?? '');
      setAfterUpdate(record.after_update ?? '');
      setAfterRestore(record.after_restore ?? '');
      setDescIndex(record.description_index ?? '');
      setDescShow(record.description_show ?? '');
      setDescStore(record.description_store ?? '');
      setDescUpdate(record.description_update ?? '');
      setDescDelete(record.description_delete ?? '');
      setDescRestore(record.description_restore ?? '');
      setActive(record.active ?? true);
      setErrors({});
      setSlugStatus('idle');
      setSaving(false);
    }
  }, [open, record]);

  // Verificação de slug com debounce de 500ms
  useEffect(() => {
    if (!open) return;
    if (!slug) { setSlugStatus('idle'); return; }

    setSlugStatus('checking');
    const excludeId = record?.id;
    const tenant    = getTenantSlug();

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ slug });
        if (excludeId) params.set('exclude_id', String(excludeId));
        const res = await apiGet<{ available: boolean }>(
          `/v1/${tenant}/modules/check-slug?${params}`,
        );
        setSlugStatus(res.available ? 'available' : 'unavailable');
      } catch {
        setSlugStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, record?.id, open]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugManual) setSlug(slugify(value));
  }

  function handleSlugChange(value: string) {
    setSlugManual(true);
    setSlug(value);
    setErrors((prev) => { const e = { ...prev }; delete e.slug; return e; });
  }

  async function handleSave() {
    if (!record) return;
    if (slugStatus === 'checking' || slugStatus === 'unavailable') return;
    setSaving(true);
    try {
      await apiPut(`/v1/${getTenantSlug()}/modules/${record.id}`, {
        name,
        slug,
        icon: icon || null,
        type,
        owner_level: ownerLevel,
        owner_id: record.owner_id,
        model: model || null,
        request: request || null,
        size_modal: sizeModal || null,
        after_store: afterStore || null,
        after_update: afterUpdate || null,
        after_restore: afterRestore || null,
        description_index: descIndex || null,
        description_show: descShow || null,
        description_store: descStore || null,
        description_update: descUpdate || null,
        description_delete: descDelete || null,
        description_restore: descRestore || null,
        active,
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      const e = err as { status?: number; data?: { errors?: FieldErrors } };
      if (e?.status === 422 && e?.data?.errors) {
        setErrors(e.data.errors);
      }
    } finally {
      setSaving(false);
    }
  }

  if (!record) return null;

  const typeInfo  = TYPE_LABELS[record.type]  ?? { label: record.type,        variant: 'secondary' as const };
  const ownerInfo = OWNER_LABELS[record.owner_level] ?? { label: record.owner_level, variant: 'default' as const };
  const saveDisabled = saving || !name.trim() || !slug.trim() || slugStatus === 'checking' || slugStatus === 'unavailable';

  const LucideIcon: React.ComponentType<{ className?: string }> = (
    icon && typeof (LucideIcons as Record<string, unknown>)[icon] === 'function'
      ? (LucideIcons as Record<string, unknown>)[icon] as React.ComponentType<{ className?: string }>
      : LucideIcons.Puzzle
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="max-w-6xl h-[85vh]">
        <DialogHeader>
          <DialogTitle>Detalhes do Módulo</DialogTitle>
        </DialogHeader>

        <DialogBody className="p-0 flex flex-col flex-1 overflow-hidden">

          {/* #ID + Nome + Badges */}
          <div className="flex items-center justify-between gap-2 px-6 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-muted-foreground font-normal text-base shrink-0">{formatId(record.id)}</span>
              <span className="text-xl font-bold leading-tight truncate">{record.name}</span>
              {record.active
                ? <Badge variant="success" appearance="light" className="shrink-0">Ativo</Badge>
                : <Badge variant="destructive" appearance="light" className="shrink-0">Inativo</Badge>
              }
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
              <Badge variant={ownerInfo.variant} appearance="light">{ownerInfo.label}</Badge>
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex gap-6 flex-wrap px-6 pb-3">
            <p className="text-xs text-muted-foreground">
              Criado em: <span className="font-medium text-foreground">{formatDateTimeBR(record.created_at)}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Alterado em: <span className="font-medium text-foreground">{formatDateTimeBR(record.updated_at)}</span>
            </p>
            {record.deleted_at && (
              <p className="text-xs text-destructive">
                Deletado em: <span className="font-medium">{formatDateTimeBR(record.deleted_at)}</span>
              </p>
            )}
          </div>

          <Separator />

          <div className="flex flex-1 overflow-hidden">
            <div className="w-full flex flex-col overflow-hidden">
              <Tabs defaultValue="dados" className="flex flex-col flex-1 overflow-hidden">
                <TabsList variant="line" className="px-4 shrink-0">
                  <TabsTrigger value="dados">Dados</TabsTrigger>
                  <TabsTrigger value="campos">Campos</TabsTrigger>
                  <TabsTrigger value="grid">Grid</TabsTrigger>
                  <TabsTrigger value="form">Form</TabsTrigger>
                  <TabsTrigger value="restricoes">Restrições</TabsTrigger>
                  <TabsTrigger value="seeds">Seeds</TabsTrigger>
                </TabsList>

                {/* ── Tab Dados ── */}
                <TabsContent value="dados" className="flex flex-col flex-1 overflow-y-auto pt-5 px-6 pb-4">
                  <div className="flex flex-col gap-4">

                    {/* Linha 1: icon(1) name(5) slug(2) type(2) owner_level(2) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
                      <div style={{ gridColumn: 'span 1' }} className="flex flex-col gap-1.5">
                        <Label>Ícone</Label>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-8.5 p-0"
                          title={icon || 'Sem ícone'}
                        >
                          <LucideIcon className="size-[18px]" />
                        </Button>
                      </div>

                      <div style={{ gridColumn: 'span 5' }} className="flex flex-col gap-1.5">
                        <Label htmlFor="mod-show-name">Nome <span className="text-destructive">*</span></Label>
                        <Input
                          id="mod-show-name"
                          value={name}
                          onChange={(e) => handleNameChange(e.target.value)}
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name[0]}</p>}
                      </div>

                      <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-1.5">
                        <Label htmlFor="mod-show-slug">Slug <span className="text-destructive">*</span></Label>
                        <Input
                          id="mod-show-slug"
                          value={slug}
                          onChange={(e) => handleSlugChange(e.target.value)}
                        />
                        {errors.slug && <p className="text-sm text-destructive">{errors.slug[0]}</p>}
                        {!errors.slug && slugStatus === 'checking'    && <p className="text-xs text-muted-foreground">Verificando...</p>}
                        {!errors.slug && slugStatus === 'unavailable' && <p className="text-xs text-destructive">Slug já em uso</p>}
                        {!errors.slug && slugStatus === 'available'   && <p className="text-xs text-green-600">Slug disponível</p>}
                      </div>

                      <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-1.5">
                        <Label htmlFor="mod-show-type">Tipo</Label>
                        <Select value={type} onValueChange={setType}>
                          <SelectTrigger id="mod-show-type"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="module">Módulo</SelectItem>
                            <SelectItem value="submodule">Submódulo</SelectItem>
                            <SelectItem value="pivot">Pivot</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-1.5">
                        <Label htmlFor="mod-show-owner">Proprietário</Label>
                        <Select value={ownerLevel} onValueChange={setOwnerLevel}>
                          <SelectTrigger id="mod-show-owner"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="master">Master</SelectItem>
                            <SelectItem value="platform">Plataforma</SelectItem>
                            <SelectItem value="tenant">Tenant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Linha 2: model(3) request(3) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
                      <div style={{ gridColumn: 'span 3' }} className="flex flex-col gap-1.5">
                        <Label htmlFor="mod-show-model">Model</Label>
                        <Input
                          id="mod-show-model"
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          placeholder="Ex: Module"
                        />
                        {errors.model && <p className="text-sm text-destructive">{errors.model[0]}</p>}
                      </div>

                      <div style={{ gridColumn: 'span 3' }} className="flex flex-col gap-1.5">
                        <Label htmlFor="mod-show-request">Request</Label>
                        <Input
                          id="mod-show-request"
                          value={request}
                          onChange={(e) => setRequest(e.target.value)}
                          placeholder="Ex: ModuleRequest"
                        />
                        {errors.request && <p className="text-sm text-destructive">{errors.request[0]}</p>}
                      </div>
                    </div>

                    {/* Linha 3: size_modal(2) after_store(2) after_update(2) after_restore(2) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
                      <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-1.5">
                        <Label htmlFor="mod-show-size">Tamanho Modal</Label>
                        <Select value={sizeModal} onValueChange={setSizeModal}>
                          <SelectTrigger id="mod-show-size"><SelectValue placeholder="—" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="p">Pequeno</SelectItem>
                            <SelectItem value="m">Médio</SelectItem>
                            <SelectItem value="g">Grande</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-1.5">
                        <Label htmlFor="mod-show-after-store">Após Criar</Label>
                        <Select value={afterStore} onValueChange={setAfterStore}>
                          <SelectTrigger id="mod-show-after-store"><SelectValue placeholder="—" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="index">Index</SelectItem>
                            <SelectItem value="show">Visualizar</SelectItem>
                            <SelectItem value="create">Criar</SelectItem>
                            <SelectItem value="edit">Editar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-1.5">
                        <Label htmlFor="mod-show-after-update">Após Editar</Label>
                        <Select value={afterUpdate} onValueChange={setAfterUpdate}>
                          <SelectTrigger id="mod-show-after-update"><SelectValue placeholder="—" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="index">Index</SelectItem>
                            <SelectItem value="show">Visualizar</SelectItem>
                            <SelectItem value="create">Criar</SelectItem>
                            <SelectItem value="edit">Editar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-1.5">
                        <Label htmlFor="mod-show-after-restore">Após Restaurar</Label>
                        <Select value={afterRestore} onValueChange={setAfterRestore}>
                          <SelectTrigger id="mod-show-after-restore"><SelectValue placeholder="—" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="index">Index</SelectItem>
                            <SelectItem value="show">Visualizar</SelectItem>
                            <SelectItem value="create">Criar</SelectItem>
                            <SelectItem value="edit">Editar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Linha 4: description_index(4) description_show(4) description_store(4) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
                      <div style={{ gridColumn: 'span 4' }} className="flex flex-col gap-1.5">
                        <Label htmlFor="mod-show-desc-index">Descrição Index</Label>
                        <Textarea
                          id="mod-show-desc-index"
                          value={descIndex}
                          onChange={(e) => setDescIndex(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div style={{ gridColumn: 'span 4' }} className="flex flex-col gap-1.5">
                        <Label htmlFor="mod-show-desc-show">Descrição Visualizar</Label>
                        <Textarea
                          id="mod-show-desc-show"
                          value={descShow}
                          onChange={(e) => setDescShow(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div style={{ gridColumn: 'span 4' }} className="flex flex-col gap-1.5">
                        <Label htmlFor="mod-show-desc-store">Descrição Criar</Label>
                        <Textarea
                          id="mod-show-desc-store"
                          value={descStore}
                          onChange={(e) => setDescStore(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Linha 5: description_update(4) description_delete(4) description_restore(4) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
                      <div style={{ gridColumn: 'span 4' }} className="flex flex-col gap-1.5">
                        <Label htmlFor="mod-show-desc-update">Descrição Editar</Label>
                        <Textarea
                          id="mod-show-desc-update"
                          value={descUpdate}
                          onChange={(e) => setDescUpdate(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div style={{ gridColumn: 'span 4' }} className="flex flex-col gap-1.5">
                        <Label htmlFor="mod-show-desc-delete">Descrição Deletar</Label>
                        <Textarea
                          id="mod-show-desc-delete"
                          value={descDelete}
                          onChange={(e) => setDescDelete(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div style={{ gridColumn: 'span 4' }} className="flex flex-col gap-1.5">
                        <Label htmlFor="mod-show-desc-restore">Descrição Restaurar</Label>
                        <Textarea
                          id="mod-show-desc-restore"
                          value={descRestore}
                          onChange={(e) => setDescRestore(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>

                  </div>
                </TabsContent>

                <TabsContent value="campos" className="flex-1 overflow-y-auto p-6">
                  <p className="text-sm text-muted-foreground">Em desenvolvimento</p>
                </TabsContent>
                <TabsContent value="grid" className="flex-1 overflow-y-auto p-6">
                  <p className="text-sm text-muted-foreground">Em desenvolvimento</p>
                </TabsContent>
                <TabsContent value="form" className="flex-1 overflow-y-auto p-6">
                  <p className="text-sm text-muted-foreground">Em desenvolvimento</p>
                </TabsContent>
                <TabsContent value="restricoes" className="flex-1 overflow-y-auto p-6">
                  <p className="text-sm text-muted-foreground">Em desenvolvimento</p>
                </TabsContent>
                <TabsContent value="seeds" className="flex-1 overflow-y-auto p-6">
                  <p className="text-sm text-muted-foreground">Em desenvolvimento</p>
                </TabsContent>

              </Tabs>
            </div>
          </div>

        </DialogBody>

        <DialogFooter className="flex-row sm:justify-between items-center">
          <div className="flex items-center gap-2">
            <Switch
              id="mod-show-active"
              checked={active}
              onCheckedChange={setActive}
              size="sm"
            />
            {active ? (
              <Badge
                variant="primary"
                appearance="light"
                size="sm"
                className="cursor-pointer"
                onClick={() => setActive(false)}
              >
                Ativo
              </Badge>
            ) : (
              <Badge
                variant="destructive"
                appearance="light"
                size="sm"
                className="cursor-pointer"
                onClick={() => setActive(true)}
              >
                Inativo
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm">Fechar</Button>
            </DialogClose>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saveDisabled}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
