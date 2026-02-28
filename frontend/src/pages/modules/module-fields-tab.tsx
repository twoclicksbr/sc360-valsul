import { type CSSProperties, Fragment, useCallback, useEffect, useId, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, GripVertical, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { IconPickerModal } from '@/components/icon-picker-modal';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api';
import { getTenantSlug } from '@/lib/tenant';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModuleField {
  id: number;
  module_id: number;
  name: string;
  label: string;
  icon?: string | null;
  type: string;
  length?: number | null;
  precision?: number | null;
  default?: string | null;
  nullable: boolean;
  required: boolean;
  min?: string | null;
  max?: string | null;
  unique: boolean;
  index: boolean;
  unique_table?: string | null;
  unique_column?: string | null;
  fk_table?: string | null;
  fk_column?: string | null;
  fk_label?: string | null;
  auto_from?: string | null;
  auto_type?: string | null;
  main: boolean;
  is_custom: boolean;
  owner_level: string;
  owner_id: number;
  order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

type FieldFormData = {
  name: string;
  label: string;
  icon: string;
  type: string;
  length: string;
  precision: string;
  nullable: boolean;
  required: boolean;
  min: string;
  max: string;
  unique: boolean;
  index: boolean;
  unique_table: string;
  unique_column: string;
  fk_table: string;
  fk_column: string;
  fk_label: string;
  auto_from: string;
  auto_type: string;
  main: boolean;
  is_custom: boolean;
  owner_level: string;
  active: boolean;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMPTY_FORM: FieldFormData = {
  name: '', label: '', icon: '', type: 'string',
  length: '', precision: '',
  nullable: false, required: false, min: '', max: '',
  unique: false, index: false, unique_table: '', unique_column: '',
  fk_table: '', fk_column: '', fk_label: '',
  auto_from: '', auto_type: '',
  main: false, is_custom: false, owner_level: 'tenant', active: true,
};

const TYPE_BADGE: Record<string, { variant: 'default' | 'primary' | 'secondary' | 'info' | 'warning' }> = {
  string:    { variant: 'secondary' },
  integer:   { variant: 'info' },
  boolean:   { variant: 'warning' },
  bigint:    { variant: 'primary' },
  date:      { variant: 'secondary' },
  datetime:  { variant: 'secondary' },
  decimal:   { variant: 'info' },
  text:      { variant: 'default' },
  json:      { variant: 'warning' },
  timestamp: { variant: 'secondary' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fieldToFormData(field: ModuleField): FieldFormData {
  return {
    name:          field.name,
    label:         field.label,
    icon:          field.icon ?? '',
    type:          field.type,
    length:        field.length != null ? String(field.length) : '',
    precision:     field.precision != null ? String(field.precision) : '',
    nullable:      field.nullable,
    required:      field.required,
    min:           field.min ?? '',
    max:           field.max ?? '',
    unique:        field.unique,
    index:         field.index,
    unique_table:  field.unique_table ?? '',
    unique_column: field.unique_column ?? '',
    fk_table:      field.fk_table ?? '',
    fk_column:     field.fk_column ?? '',
    fk_label:      field.fk_label ?? '',
    auto_from:     field.auto_from ?? '',
    auto_type:     field.auto_type ?? '',
    main:          field.main,
    is_custom:     field.is_custom,
    owner_level:   field.owner_level,
    active:        field.active,
  };
}

function buildPayload(form: FieldFormData, moduleId: number) {
  return {
    module_id:     moduleId,
    name:          form.name,
    label:         form.label,
    icon:          form.icon || null,
    type:          form.type,
    length:        form.length !== '' ? parseInt(form.length, 10) : null,
    precision:     form.precision !== '' ? parseInt(form.precision, 10) : null,
    nullable:      form.nullable,
    required:      form.required,
    min:           form.min || null,
    max:           form.max || null,
    unique:        form.unique,
    index:         form.index,
    unique_table:  form.unique_table || null,
    unique_column: form.unique_column || null,
    fk_table:      form.fk_table || null,
    fk_column:     form.fk_column || null,
    fk_label:      form.fk_label || null,
    auto_from:     form.auto_from || null,
    auto_type:     form.auto_type || null,
    main:          form.main,
    is_custom:     form.is_custom,
    owner_level:   form.owner_level,
    owner_id:      0,
    active:        form.active,
  };
}

// ---------------------------------------------------------------------------
// SortableRow
// ---------------------------------------------------------------------------

interface SortableRowProps {
  field: ModuleField;
  isExpanded: boolean;
  isConfirmingDelete: boolean;
  isDndDisabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

function SortableRow({
  field,
  isExpanded,
  isConfirmingDelete,
  isDndDisabled,
  onEdit,
  onDelete,
  onCancelDelete,
  onConfirmDelete,
}: SortableRowProps) {
  const { attributes, listeners, isDragging, setNodeRef, transform } = useSortable({
    id: String(field.id),
    disabled: isDndDisabled,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0 : 1,
    position: 'relative',
  };

  const typeInfo = TYPE_BADGE[field.type] ?? { variant: 'default' as const };
  const LucideIcon = field.icon
    ? (LucideIcons as Record<string, unknown>)[field.icon] as React.ComponentType<{ className?: string }> | undefined
    : undefined;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b text-sm ${isExpanded ? 'bg-muted/30' : 'hover:bg-muted/20'}`}
    >
      {/* Drag handle */}
      <td className="w-10 px-2">
        {!isDndDisabled && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                  {...attributes}
                  {...listeners}
                >
                  <GripVertical className="size-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="right">Arrastar para reordenar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </td>

      {/* Nome */}
      <td className="px-2 py-2 font-mono text-xs">
        <div className="flex items-center gap-1.5">
          {LucideIcon && <LucideIcon className="size-3.5 text-muted-foreground shrink-0" />}
          {field.name}
        </div>
      </td>

      {/* Rótulo */}
      <td className="px-2 py-2 text-sm">{field.label}</td>

      {/* Tipo */}
      <td className="px-2 py-2">
        <Badge variant={typeInfo.variant} appearance="light" size="sm">{field.type}</Badge>
      </td>

      {/* Obrigatório */}
      <td className="px-2 py-2 text-center">
        {field.required
          ? <Badge variant="success" appearance="light" size="sm">Sim</Badge>
          : <Badge variant="secondary" appearance="light" size="sm">Não</Badge>
        }
      </td>

      {/* Nulo */}
      <td className="px-2 py-2 text-center">
        {field.nullable
          ? <Badge variant="success" appearance="light" size="sm">Sim</Badge>
          : <Badge variant="secondary" appearance="light" size="sm">Não</Badge>
        }
      </td>

      {/* Ações */}
      <td className="px-2 py-2">
        {isConfirmingDelete ? (
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onCancelDelete} title="Cancelar">
              <X className="size-3.5" />
            </Button>
            <Button variant="destructive" size="sm" className="h-7 w-7 p-0" onClick={onConfirmDelete} title="Confirmar exclusão">
              <Check className="size-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onEdit} title="Editar">
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              onClick={onDelete}
              title="Deletar"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// ExpandedFormRow
// ---------------------------------------------------------------------------

interface ExpandedFormRowProps {
  form: FieldFormData;
  onChange: (updates: Partial<FieldFormData>) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  errors: Record<string, string[]>;
  onOpenIconPicker: () => void;
}

function ExpandedFormRow({ form, onChange, onSave, onCancel, saving, errors, onOpenIconPicker }: ExpandedFormRowProps) {
  const LucideIcon = form.icon
    ? (LucideIcons as Record<string, unknown>)[form.icon] as React.ComponentType<{ className?: string }> | undefined
    : undefined;

  const g12: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '0.75rem' };

  return (
    <tr>
      <td colSpan={7} className="p-4 bg-muted/10 border-b">
        <div className="flex flex-col gap-4">

          {/* Seção: Identidade */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Identidade</p>
            <div style={g12}>
              {/* name (3) */}
              <div style={{ gridColumn: 'span 3' }} className="flex flex-col gap-1">
                <Label className="text-xs">Nome <span className="text-destructive">*</span></Label>
                <Input
                  value={form.name}
                  onChange={e => onChange({ name: e.target.value })}
                  className="h-7 text-xs font-mono"
                  placeholder="field_name"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
              </div>
              {/* label (3) */}
              <div style={{ gridColumn: 'span 3' }} className="flex flex-col gap-1">
                <Label className="text-xs">Rótulo <span className="text-destructive">*</span></Label>
                <Input
                  value={form.label}
                  onChange={e => onChange({ label: e.target.value })}
                  className="h-7 text-xs"
                  placeholder="Nome do Campo"
                />
                {errors.label && <p className="text-xs text-destructive">{errors.label[0]}</p>}
              </div>
              {/* icon (1) */}
              <div style={{ gridColumn: 'span 1' }} className="flex flex-col gap-1">
                <Label className="text-xs">Ícone</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="h-7 w-full p-0"
                  title={form.icon || 'Selecionar ícone'}
                  onClick={onOpenIconPicker}
                >
                  {LucideIcon ? <LucideIcon className="size-3.5" /> : <span className="text-[10px] text-muted-foreground">—</span>}
                </Button>
              </div>
              {/* type (2) */}
              <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-1">
                <Label className="text-xs">Tipo <span className="text-destructive">*</span></Label>
                <Select value={form.type} onValueChange={v => onChange({ type: v })}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(TYPE_BADGE).map(k => (
                      <SelectItem key={k} value={k} className="text-xs">{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* length (1) */}
              <div style={{ gridColumn: 'span 1' }} className="flex flex-col gap-1">
                <Label className="text-xs">Tamanho</Label>
                <Input
                  type="number"
                  value={form.length}
                  onChange={e => onChange({ length: e.target.value })}
                  className="h-7 text-xs"
                  placeholder="255"
                />
              </div>
              {/* precision (1) */}
              <div style={{ gridColumn: 'span 1' }} className="flex flex-col gap-1">
                <Label className="text-xs">Dec.</Label>
                <Input
                  type="number"
                  value={form.precision}
                  onChange={e => onChange({ precision: e.target.value })}
                  className="h-7 text-xs"
                  placeholder="2"
                />
              </div>
            </div>
          </div>

          {/* Seção: Validação */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Validação</p>
            <div style={g12}>
              <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-1">
                <Label className="text-xs">Obrigatório</Label>
                <div className="flex items-center h-7">
                  <Switch size="sm" checked={form.required} onCheckedChange={v => onChange({ required: v })} />
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-1">
                <Label className="text-xs">Nulo</Label>
                <div className="flex items-center h-7">
                  <Switch size="sm" checked={form.nullable} onCheckedChange={v => onChange({ nullable: v })} />
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-1">
                <Label className="text-xs">Único</Label>
                <div className="flex items-center h-7">
                  <Switch size="sm" checked={form.unique} onCheckedChange={v => onChange({ unique: v })} />
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-1">
                <Label className="text-xs">Índice</Label>
                <div className="flex items-center h-7">
                  <Switch size="sm" checked={form.index} onCheckedChange={v => onChange({ index: v })} />
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-1">
                <Label className="text-xs">Min</Label>
                <Input value={form.min} onChange={e => onChange({ min: e.target.value })} className="h-7 text-xs" placeholder="0" />
              </div>
              <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-1">
                <Label className="text-xs">Max</Label>
                <Input value={form.max} onChange={e => onChange({ max: e.target.value })} className="h-7 text-xs" placeholder="255" />
              </div>
            </div>
          </div>

          {/* Seção: Unicidade Remota (só quando unique=true) */}
          {form.unique && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Unicidade Remota</p>
              <div style={g12}>
                <div style={{ gridColumn: 'span 4' }} className="flex flex-col gap-1">
                  <Label className="text-xs">Tabela</Label>
                  <Input value={form.unique_table} onChange={e => onChange({ unique_table: e.target.value })} className="h-7 text-xs" placeholder="modules" />
                </div>
                <div style={{ gridColumn: 'span 4' }} className="flex flex-col gap-1">
                  <Label className="text-xs">Coluna</Label>
                  <Input value={form.unique_column} onChange={e => onChange({ unique_column: e.target.value })} className="h-7 text-xs" placeholder="slug" />
                </div>
              </div>
            </div>
          )}

          {/* Seção: Relacionamento FK (só quando type=bigint) */}
          {form.type === 'bigint' && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Relacionamento FK</p>
              <div style={g12}>
                <div style={{ gridColumn: 'span 4' }} className="flex flex-col gap-1">
                  <Label className="text-xs">Tabela FK</Label>
                  <Input value={form.fk_table} onChange={e => onChange({ fk_table: e.target.value })} className="h-7 text-xs" placeholder="modules" />
                </div>
                <div style={{ gridColumn: 'span 4' }} className="flex flex-col gap-1">
                  <Label className="text-xs">Coluna FK</Label>
                  <Input value={form.fk_column} onChange={e => onChange({ fk_column: e.target.value })} className="h-7 text-xs" placeholder="id" />
                </div>
                <div style={{ gridColumn: 'span 4' }} className="flex flex-col gap-1">
                  <Label className="text-xs">Label FK</Label>
                  <Input value={form.fk_label} onChange={e => onChange({ fk_label: e.target.value })} className="h-7 text-xs" placeholder="name" />
                </div>
              </div>
            </div>
          )}

          {/* Seção: Automação */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Automação</p>
            <div style={g12}>
              <div style={{ gridColumn: 'span 4' }} className="flex flex-col gap-1">
                <Label className="text-xs">Origem Auto</Label>
                <Input value={form.auto_from} onChange={e => onChange({ auto_from: e.target.value })} className="h-7 text-xs" placeholder="name" />
              </div>
              <div style={{ gridColumn: 'span 4' }} className="flex flex-col gap-1">
                <Label className="text-xs">Tipo Auto</Label>
                <Select
                  value={form.auto_type || '__none__'}
                  onValueChange={v => onChange({ auto_type: v === '__none__' ? '' : v })}
                >
                  <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" className="text-xs">—</SelectItem>
                    <SelectItem value="slug" className="text-xs">slug</SelectItem>
                    <SelectItem value="uppercase" className="text-xs">uppercase</SelectItem>
                    <SelectItem value="lowercase" className="text-xs">lowercase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Seção: Controle */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Controle</p>
            <div style={g12}>
              <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-1">
                <Label className="text-xs">Sistema</Label>
                <div className="flex items-center h-7">
                  <Switch size="sm" checked={form.main} onCheckedChange={v => onChange({ main: v })} />
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-1">
                <Label className="text-xs">Customizado</Label>
                <div className="flex items-center h-7">
                  <Switch size="sm" checked={form.is_custom} onCheckedChange={v => onChange({ is_custom: v })} />
                </div>
              </div>
              <div style={{ gridColumn: 'span 3' }} className="flex flex-col gap-1">
                <Label className="text-xs">Proprietário</Label>
                <Select value={form.owner_level} onValueChange={v => onChange({ owner_level: v })}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="master" className="text-xs">Master</SelectItem>
                    <SelectItem value="platform" className="text-xs">Plataforma</SelectItem>
                    <SelectItem value="tenant" className="text-xs">Tenant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-1">
                <Label className="text-xs">Ativo</Label>
                <div className="flex items-center h-7">
                  <Switch size="sm" checked={form.active} onCheckedChange={v => onChange({ active: v })} />
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={onCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={saving || !form.name.trim() || !form.label.trim()}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>

        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// ModuleFieldsTab
// ---------------------------------------------------------------------------

interface ModuleFieldsTabProps {
  moduleId: number;
  active: boolean;
}

export function ModuleFieldsTab({ moduleId, active }: ModuleFieldsTabProps) {
  const tenant  = getTenantSlug();
  const dndId   = useId();

  const [fields, setFields]                     = useState<ModuleField[]>([]);
  const [loading, setLoading]                   = useState(false);
  const [expandedId, setExpandedId]             = useState<number | 'new' | null>(null);
  const [formData, setFormData]                 = useState<FieldFormData>(EMPTY_FORM);
  const [saving, setSaving]                     = useState(false);
  const [errors, setErrors]                     = useState<Record<string, string[]>>({});
  const [activeId, setActiveId]                 = useState<UniqueIdentifier | null>(null);
  const [confirmDeleteId, setConfirmDeleteId]   = useState<number | null>(null);
  const [iconPickerOpen, setIconPickerOpen]     = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const fieldIds      = fields.map(f => String(f.id));
  const isDndDisabled = expandedId !== null;

  const loadFields = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        module_id: String(moduleId),
        per_page:  '100',
        sort:      'order',
        direction: 'asc',
      });
      const res = await apiGet<{ data: ModuleField[] }>(`/v1/${tenant}/module-fields?${params}`);
      setFields(res.data);
    } catch {
      setFields([]);
    } finally {
      setLoading(false);
    }
  }, [moduleId, tenant]);

  useEffect(() => {
    if (active && moduleId) loadFields();
  }, [active, moduleId, loadFields]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleNew() {
    setExpandedId('new');
    setFormData(EMPTY_FORM);
    setErrors({});
    setConfirmDeleteId(null);
  }

  function handleEdit(field: ModuleField) {
    setExpandedId(field.id);
    setFormData(fieldToFormData(field));
    setErrors({});
    setConfirmDeleteId(null);
  }

  function handleCancel() {
    setExpandedId(null);
    setErrors({});
  }

  async function handleSave() {
    if (!formData.name.trim() || !formData.label.trim()) return;
    setSaving(true);
    setErrors({});
    try {
      const payload = buildPayload(formData, moduleId);
      if (expandedId === 'new') {
        await apiPost<ModuleField>(`/v1/${tenant}/module-fields`, payload);
      } else {
        await apiPut<ModuleField>(`/v1/${tenant}/module-fields/${expandedId}`, payload);
      }
      setExpandedId(null);
      await loadFields();
    } catch (err: unknown) {
      const e = err as { status?: number; data?: { errors?: Record<string, string[]> } };
      if (e?.status === 422 && e?.data?.errors) setErrors(e.data.errors);
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete(id: number) {
    try {
      await apiDelete<{ message: string }>(`/v1/${tenant}/module-fields/${id}`);
      setConfirmDeleteId(null);
      if (expandedId === id) setExpandedId(null);
      await loadFields();
    } catch {
      setConfirmDeleteId(null);
    }
  }

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveId(null);
    (document.activeElement as HTMLElement)?.blur();
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex(f => String(f.id) === String(active.id));
    const newIndex = fields.findIndex(f => String(f.id) === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered  = arrayMove(fields, oldIndex, newIndex);
    const withOrders = reordered.map((f, i) => ({ ...f, order: i + 1 }));

    // Optimistic update
    setFields(withOrders);

    // Save only changed items (same pattern as GenericGrid)
    const orderMap = new Map(fields.map(f => [f.id, f.order]));
    const changed  = withOrders.filter(f => f.order !== orderMap.get(f.id));

    try {
      await Promise.all(changed.map(f => apiPut(`/v1/${tenant}/module-fields/${f.id}`, f)));
    } catch {
      await loadFields();
    }
  }, [fields, tenant, loadFields]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    (document.activeElement as HTMLElement)?.blur();
  }, []);

  const activeField = activeId ? fields.find(f => String(f.id) === String(activeId)) : null;

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Carregando campos...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {fields.length} campo{fields.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" variant="outline" onClick={handleNew} disabled={expandedId !== null}>
          <Plus className="size-3.5 mr-1" />
          Novo Campo
        </Button>
      </div>

      {/* Table */}
      <DndContext
        id={dndId}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="w-10" />
              <th className="px-2 py-2 text-left font-medium" style={{ width: '20%' }}>Nome</th>
              <th className="px-2 py-2 text-left font-medium" style={{ width: '20%' }}>Rótulo</th>
              <th className="px-2 py-2 text-left font-medium" style={{ width: '15%' }}>Tipo</th>
              <th className="px-2 py-2 text-center font-medium" style={{ width: '8%' }}>Obrigatório</th>
              <th className="px-2 py-2 text-center font-medium" style={{ width: '8%' }}>Nulo</th>
              <th className="px-2 py-2 text-right font-medium w-20">Ações</th>
            </tr>
          </thead>
          <tbody>

            {/* Create row (outside DnD, at top) */}
            {expandedId === 'new' && (
              <ExpandedFormRow
                form={formData}
                onChange={updates => setFormData(prev => ({ ...prev, ...updates }))}
                onSave={handleSave}
                onCancel={handleCancel}
                saving={saving}
                errors={errors}
                onOpenIconPicker={() => setIconPickerOpen(true)}
              />
            )}

            <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
              {fields.map(field => (
                <Fragment key={field.id}>
                  <SortableRow
                    field={field}
                    isExpanded={expandedId === field.id}
                    isConfirmingDelete={confirmDeleteId === field.id}
                    isDndDisabled={isDndDisabled}
                    onEdit={() => handleEdit(field)}
                    onDelete={() => { setConfirmDeleteId(field.id); setExpandedId(null); }}
                    onCancelDelete={() => setConfirmDeleteId(null)}
                    onConfirmDelete={() => handleConfirmDelete(field.id)}
                  />
                  {expandedId === field.id && (
                    <ExpandedFormRow
                      form={formData}
                      onChange={updates => setFormData(prev => ({ ...prev, ...updates }))}
                      onSave={handleSave}
                      onCancel={handleCancel}
                      saving={saving}
                      errors={errors}
                      onOpenIconPicker={() => setIconPickerOpen(true)}
                    />
                  )}
                </Fragment>
              ))}
            </SortableContext>

            {fields.length === 0 && expandedId !== 'new' && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                  Nenhum campo cadastrado
                </td>
              </tr>
            )}

          </tbody>
        </table>

        <DragOverlay dropAnimation={null}>
          {activeField ? (
            <table className="w-full text-sm">
              <tbody>
                <tr className="bg-background border shadow-lg">
                  <td className="w-10 px-2 py-2">
                    <GripVertical className="size-4 text-muted-foreground" />
                  </td>
                  <td className="px-2 py-2 font-mono text-xs">{activeField.name}</td>
                  <td className="px-2 py-2 text-sm">{activeField.label}</td>
                  <td className="px-2 py-2">
                    {(() => {
                      const t = TYPE_BADGE[activeField.type] ?? { variant: 'default' as const };
                      return <Badge variant={t.variant} appearance="light" size="sm">{activeField.type}</Badge>;
                    })()}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tbody>
            </table>
          ) : null}
        </DragOverlay>
      </DndContext>

      <IconPickerModal
        open={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        onSelect={name => { setFormData(prev => ({ ...prev, icon: name })); setIconPickerOpen(false); }}
        selected={formData.icon}
      />

    </div>
  );
}
