import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiGet, apiPost } from '@/lib/api';
import { useModules } from '@/providers/modules-provider';
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDndSensors, dndAccessibility, DndOverlayPortal, useSortableRow, SortableRowCtx, DragHandle } from '@/lib/dnd-config';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  LayoutGrid,
  FormInput,
  Square,
  Type,
  MousePointer,
  Box,
  Layers,
  BarChart2,
  Image,
  Minus,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  Save,
  Trash2,
  Maximize2,
  Minimize2,
  X,
  GripVertical,
  Columns2,
  AArrowDown,
  AArrowUp,
  Bold,
  // AlignLeft, AlignCenter, AlignRight — reservados para text-align (desabilitado)
} from 'lucide-react';
import { Header } from '@/layouts/demo3/components/header';
import { Sidebar } from '@/layouts/demo3/components/sidebar';
import { Footer } from '@/layouts/demo3/components/footer';
import { Navbar } from '@/layouts/demo3/components/navbar';

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

const PAGE_TABS = [
  { value: 'index',     label: 'Index' },
  { value: 'show',      label: 'Show' },
  { value: 'create',    label: 'Create' },
  { value: 'edit',      label: 'Edit' },
  { value: 'delete',    label: 'Delete' },
  { value: 'restore',   label: 'Restore' },
  { value: 'print',     label: 'Print' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'publica',   label: 'Pública' },
];

const COMPONENTS = [
  { id: 'container', Icon: Box,          label: 'Container' },
  { id: 'text',      Icon: Type,         label: 'Texto' },
  { id: 'grid',      Icon: LayoutGrid,   label: 'Grid' },
  { id: 'form',      Icon: FormInput,    label: 'Form' },
  { id: 'card',      Icon: Square,       label: 'Card' },
  { id: 'btn',       Icon: MousePointer, label: 'Botões' },
  { id: 'tabs',      Icon: Layers,       label: 'Abas' },
  { id: 'chart',     Icon: BarChart2,    label: 'Gráfico' },
  { id: 'image',     Icon: Image,        label: 'Imagem' },
  { id: 'divider',   Icon: Minus,        label: 'Divisor' },
];

const CONTAINER_PROPS = {
  cols:    { label: 'Colunas',  options: [{ v: '1', l: '1' }, { v: '2', l: '2' }, { v: '3', l: '3' }, { v: '4', l: '4' }, { v: '5', l: '5' }, { v: '6', l: '6' }, { v: '12', l: '12' }], def: '1' },
  width:   { label: 'Largura',  options: [{ v: 'w-full', l: 'Full' }, { v: 'max-w-screen-lg mx-auto', l: 'Fixed' }, { v: 'max-w-screen-md mx-auto', l: 'Compacto' }], def: 'w-full' },
  padding: { label: 'Padding',  options: [{ v: 'p-0', l: 'Nenhum' }, { v: 'p-2', l: 'Pequeno' }, { v: 'p-4', l: 'Médio' }, { v: 'p-6', l: 'Grande' }, { v: 'p-8', l: 'Extra Grande' }], def: 'p-0' },
  bg:      { label: 'Fundo',    options: [{ v: '', l: 'Transparente' }, { v: 'bg-white', l: 'Branco' }, { v: 'bg-gray-100', l: 'Cinza claro' }, { v: 'bg-gray-800', l: 'Escuro' }], def: '' },
} as const;

type ContainerPropKey = keyof typeof CONTAINER_PROPS;


const SPAN_CLASS: Record<number, string> = {
  1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
  5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
  9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12',
};

const COLUMN_PROPS = {
  span:    { label: 'Largura (colunas)',       options: [{ v: '1', l: '1' }, { v: '2', l: '2' }, { v: '3', l: '3' }, { v: '4', l: '4' }, { v: '5', l: '5' }, { v: '6', l: '6' }, { v: '7', l: '7' }, { v: '8', l: '8' }, { v: '9', l: '9' }, { v: '10', l: '10' }, { v: '11', l: '11' }, { v: '12', l: '12' }], def: '12' },
  padding: { label: 'Padding',                options: [{ v: 'p-0', l: 'Nenhum' }, { v: 'p-2', l: 'Pequeno' }, { v: 'p-4', l: 'Médio' }, { v: 'p-6', l: 'Grande' }], def: 'p-0' },
  alignH:  { label: 'Alinhamento horizontal', options: [{ v: 'justify-start', l: 'Esquerda' }, { v: 'justify-center', l: 'Centro' }, { v: 'justify-end', l: 'Direita' }], def: 'justify-start' },
  alignV:  { label: 'Alinhamento vertical',   options: [{ v: 'items-start', l: 'Topo' }, { v: 'items-center', l: 'Centro' }, { v: 'items-end', l: 'Base' }], def: 'items-start' },
  bg:      { label: 'Fundo',                  options: [{ v: '', l: 'Transparente' }, { v: 'bg-white', l: 'Branco' }, { v: 'bg-gray-100', l: 'Cinza claro' }, { v: 'bg-gray-800', l: 'Escuro' }], def: '' },
} as const;

type ColPropKey = keyof typeof COLUMN_PROPS;

function parseColProps(raw?: string): Record<string, string> {
  try { return JSON.parse(raw ?? '{}'); } catch { return {}; }
}

const PROPERTIES: Record<string, { key?: string; label: string; type: string; options?: string[]; value?: string | number | boolean }[]> = {
  text: [
    { key: 'field_binding', label: 'Campo dinâmico',   type: 'field-binding'  },
    { key: 'content',       label: 'Conteúdo',         type: 'text',          value: 'Texto aqui' },
    { key: 'size',          label: 'Tamanho',          type: 'font-size',     value: 'base' },
    { key: 'weight',        label: 'Peso',             type: 'font-weight',   value: 'normal' },
    // { key: 'align', label: 'Alinhamento', type: 'text-align', value: 'left' },
  ],
  grid: [
    { key: 'cols',      label: 'Colunas',    type: 'select', options: ['1', '2', '3', '4', '6', '12'],                           value: '1' },
    { key: 'gap',       label: 'Gap',        type: 'select', options: ['Nenhum', 'Pequeno', 'Médio', 'Grande'],                   value: 'Médio' },
    { key: 'module',    label: 'Módulo',     type: 'select', options: ['people', 'products', 'modules'],                          value: 'people' },
    { key: 'per_page',  label: 'Por página', type: 'number', value: 10 },
    { key: 'search',    label: 'Busca',      type: 'toggle', value: true },
    { key: 'paginate',  label: 'Paginação',  type: 'toggle', value: true },
  ],
  form: [
    { key: 'module',    label: 'Módulo',               type: 'select', options: ['people', 'products', 'modules'],                value: 'people' },
    { key: 'layout',    label: 'Layout',               type: 'select', options: ['1 coluna', '2 colunas', '3 colunas'],           value: '1 coluna' },
    { key: 'btn_save',  label: 'Botão Salvar',         type: 'text',   value: 'Salvar' },
    { key: 'btn_cancel',label: 'Botão Cancelar',       type: 'text',   value: 'Cancelar' },
    { key: 'redirect',  label: 'Redirect após salvar', type: 'text',   value: 'index' },
  ],
  card: [
    { key: 'title',     label: 'Título',  type: 'text',   value: 'Card Title' },
    { key: 'padding',   label: 'Padding', type: 'select', options: ['Nenhum', 'Pequeno', 'Médio', 'Grande'],                      value: 'Médio' },
    { key: 'border',    label: 'Borda',   type: 'toggle', value: true },
    { key: 'shadow',    label: 'Sombra',  type: 'toggle', value: false },
  ],
};

interface StageItemData {
  id: number;
  type: string;
  label: string;
  props?: Record<string, string>;
  children?: StageItemData[];
  columns?: StageItemData[][];
}

interface SelectedComponent {
  id: string;
  label: string;
  Icon: React.ElementType;
}

function DroppableCell({ dropId, children, className, onClick }: {
  dropId: string;
  children: React.ReactNode;
  className: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dropId });
  return (
    <div ref={setNodeRef} onClick={onClick} className={`${className} ${isOver ? '!border-blue-400 !bg-blue-50/70' : ''}`}>
      {children}
    </div>
  );
}

const ITEM_COLORS: Record<string, string> = {
  grid:      'border-blue-300 bg-blue-50',
  form:      'border-green-300 bg-green-50',
  card:      'border-purple-300 bg-purple-50',
  text:      'border-yellow-400 border-dashed',
  btn:       'border-orange-300 bg-orange-50',
  container: 'border-gray-300 bg-gray-50',
};

function StageItem({
  item,
  selected,
  onSelect,
  onDelete,
  isNew,
  selectedCell,
  onCellSelect,
  onDeleteColChild,
  onSelectColChild,
}: {
  item: StageItemData;
  selected: number | null;
  onSelect: (item: StageItemData) => void;
  onDelete: (id: number) => void;
  isNew?: boolean;
  selectedCell?: { itemId: number; colIndex: number } | null;
  onCellSelect?: (itemId: number, colIndex: number) => void;
  onDeleteColChild?: (itemId: number, colIndex: number, childId: number) => void;
  onSelectColChild?: (child: StageItemData, itemId: number, colIndex: number) => void;
}) {
  const color = ITEM_COLORS[item.type] ?? 'border-gray-300 bg-gray-50';
  const isSelected = selected === item.id;

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(item); }}
      className={`border-2 rounded-lg p-3 cursor-pointer transition-all duration-500 relative group ${color} ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : isNew ? 'ring-2 ring-blue-400 ring-offset-1' : 'hover:ring-1 hover:ring-blue-300'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{item.type === 'text' ? (item.props?.content ?? 'Texto') : item.label}</span>
        {isSelected && (
          <span className="ml-auto flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
              className="p-1 rounded text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </span>
        )}
      </div>
      {item.type === 'container' ? (
        (() => {
          const p           = item.props ?? {};
          const cols        = parseInt(p.cols ?? CONTAINER_PROPS.cols.def, 10) || 1;
          const width       = p.width   ?? CONTAINER_PROPS.width.def;
          const padding     = p.padding ?? CONTAINER_PROPS.padding.def;
          const bg          = p.bg      ?? CONTAINER_PROPS.bg.def;
          const defaultSpan = Math.floor(12 / cols);
          return (
            <div className={`${width} ${padding} ${bg} rounded grid grid-cols-12 gap-2`}>
              {Array.from({ length: cols }).map((_, idx) => {
                const colKey   = `col_${idx}`;
                const cp       = parseColProps(item.props?.[colKey]);
                const cSpanNum = parseInt(cp.span ?? String(defaultSpan), 10);
                const cSpan    = SPAN_CLASS[cSpanNum] ?? SPAN_CLASS[defaultSpan] ?? 'col-span-1';
                const cPad     = cp.padding ?? COLUMN_PROPS.padding.def;
                const cAlignH  = cp.alignH  ?? COLUMN_PROPS.alignH.def;
                const cAlignV  = cp.alignV  ?? COLUMN_PROPS.alignV.def;
                const cBg      = cp.bg      ?? COLUMN_PROPS.bg.def;
                const isCellSel = selectedCell?.itemId === item.id && selectedCell?.colIndex === idx;
                const colChildren = item.columns?.[idx] ?? [];
                return (
                  <DroppableCell
                    key={idx}
                    dropId={`container-${item.id}-col-${idx}`}
                    onClick={(e) => { e.stopPropagation(); onCellSelect?.(item.id, idx); }}
                    className={`${cSpan} min-h-[3rem] rounded border border-dashed flex flex-col ${cPad} ${cAlignH} ${cAlignV} ${cBg} cursor-pointer transition-all ${
                      isCellSel ? 'border-blue-400 ring-2 ring-blue-400 ring-offset-1' : 'border-current/30 hover:border-blue-300'
                    }`}
                  >
                    {colChildren.length > 0 ? (
                      <div className="flex flex-row flex-wrap gap-1 p-1 w-full">
                        {colChildren.map((child) => (
                          <DraggableColChild
                            key={child.id}
                            child={child}
                            containerId={item.id}
                            colIndex={idx}
                            onSelect={() => onSelectColChild?.(child, item.id, idx)}
                            onDelete={() => onDeleteColChild?.(item.id, idx, child.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs opacity-30 m-auto">{cols > 1 ? `coluna ${idx + 1}` : 'conteúdo'}</span>
                    )}
                  </DroppableCell>
                );
              })}
            </div>
          );
        })()
      ) : item.children ? (
        item.children.map((child) => (
          <StageItem key={child.id} item={child} selected={selected} onSelect={onSelect} onDelete={onDelete} />
        ))
      ) : (
        <div className="h-12 rounded border border-dashed border-current opacity-30 flex items-center justify-center text-xs">
          conteúdo
        </div>
      )}
    </div>
  );
}

function ContainerPropertiesPanel({ itemProps, onChange }: {
  itemProps: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {(Object.keys(CONTAINER_PROPS) as ContainerPropKey[]).map((key) => {
        const cfg = CONTAINER_PROPS[key];
        const current = itemProps[key] ?? cfg.def;
        return (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{cfg.label}</label>
            <select
              value={current}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full text-xs border rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {cfg.options.map((o) => (
                <option key={o.v} value={o.v}>{o.l}</option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}

function CellPropertiesPanel({ colIndex, colProps, onChange, containerCols }: {
  colIndex: number;
  colProps: Record<string, string>;
  onChange: (key: string, value: string) => void;
  containerCols?: number;
}) {
  const spanDefault = String(Math.floor(12 / (containerCols ?? 1)));
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50 shrink-0">
        <Columns2 className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700">Coluna {colIndex + 1}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(Object.keys(COLUMN_PROPS) as ColPropKey[]).map((key) => {
          const cfg     = COLUMN_PROPS[key];
          const current = colProps[key] ?? (key === 'span' ? spanDefault : cfg.def);
          return (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{cfg.label}</label>
              <select
                value={current}
                onChange={(e) => onChange(key, e.target.value)}
                className="w-full text-xs border rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                {cfg.options.map((o) => (
                  <option key={o.v} value={o.v}>{o.l}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FieldBindingProp({ onChange, currentValues }: {
  onChange?: (key: string, value: string) => void;
  currentValues?: Record<string, string>;
}) {
  const { modules } = useModules();
  const [fields, setFields] = useState<{ name: string }[]>([]);
  const [loadingFields, setLoadingFields] = useState(false);

  const selectedSlug = currentValues?.field_module ?? '';
  const selectedField = currentValues?.field_name ?? '';
  const selectedModule = modules.find((m) => m.slug === selectedSlug);

  useEffect(() => {
    if (!selectedModule) { setFields([]); return; }
    setLoadingFields(true);
    apiGet(`/v1/module-fields?module_id=${selectedModule.id}&per_page=100&active=true&sort=order&direction=asc`)
      .then((res: any) => setFields(res?.data ?? []))
      .catch(() => setFields([]))
      .finally(() => setLoadingFields(false));
  }, [selectedModule?.id]);

  const handleModuleChange = (slug: string) => {
    onChange?.('field_module', slug);
    onChange?.('field_name', '');
    onChange?.('content', '');
  };

  const handleFieldChange = (fieldName: string) => {
    onChange?.('field_name', fieldName);
    if (selectedSlug && fieldName) {
      onChange?.('content', `${selectedSlug}.${fieldName}`);
    }
  };

  const selectClass = 'w-full text-xs border rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400';

  return (
    <div className="space-y-2">
      <select value={selectedSlug} onChange={(e) => handleModuleChange(e.target.value)} className={selectClass}>
        <option value="">— Módulo —</option>
        {modules.map((m) => <option key={m.slug} value={m.slug}>{m.name}</option>)}
      </select>
      {selectedSlug && (
        <select value={selectedField} onChange={(e) => handleFieldChange(e.target.value)} disabled={loadingFields} className={selectClass}>
          <option value="">— Campo —</option>
          {fields.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}
        </select>
      )}
    </div>
  );
}

function GenericPropsBody({ props, onChange, currentValues }: {
  props: { key?: string; label: string; type: string; options?: string[]; value?: string | number | boolean }[];
  onChange?: (key: string, value: string) => void;
  currentValues?: Record<string, string>;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {props.length === 0 && (
        <p className="text-xs text-gray-400 text-center mt-8">Nenhuma propriedade disponível</p>
      )}
      {props.map((prop, i) => (
        <div key={i}>
          <label className="block text-xs font-medium text-gray-600 mb-1">{prop.label}</label>
          {prop.type === 'field-binding' && (
            <FieldBindingProp onChange={onChange} currentValues={currentValues} />
          )}
          {prop.type === 'select' && prop.key && (
            <select
              value={currentValues?.[prop.key] ?? String(prop.value ?? '')}
              onChange={(e) => onChange?.(prop.key!, e.target.value)}
              className="w-full text-xs border rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {prop.options!.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
          {prop.type === 'text' && prop.key && (
            <input
              value={currentValues?.[prop.key] ?? String(prop.value ?? '')}
              onChange={(e) => onChange?.(prop.key!, e.target.value)}
              className="w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          )}
          {prop.type === 'number' && prop.key && (
            <input
              type="number"
              value={currentValues?.[prop.key] ?? String(prop.value ?? 0)}
              onChange={(e) => onChange?.(prop.key!, e.target.value)}
              className="w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          )}
          {prop.type === 'toggle' && prop.key && (() => {
            const checked = currentValues?.[prop.key] !== undefined
              ? currentValues[prop.key] === 'true'
              : Boolean(prop.value);
            return (
              <div
                onClick={() => onChange?.(prop.key!, String(!checked))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
              </div>
            );
          })()}
          {prop.type === 'font-size' && prop.key && (() => {
            const SIZES = ['xs', 'sm', 'base', 'lg', 'xl', '2xl'];
            const current = currentValues?.[prop.key] ?? String(prop.value ?? 'base');
            const idx = SIZES.indexOf(current);
            return (
              <div className="inline-flex rounded-md border border-input overflow-hidden">
                <Button
                  size="sm" variant="ghost"
                  disabled={idx <= 0}
                  onClick={() => onChange?.(prop.key!, SIZES[idx - 1])}
                  className="rounded-none border-0 border-r border-input h-8 px-2"
                >
                  <AArrowDown className="w-3.5 h-3.5" />
                </Button>
                <span className="flex items-center px-3 min-w-[3rem] justify-center text-xs font-mono border-r border-input">
                  {current}
                </span>
                <Button
                  size="sm" variant="ghost"
                  disabled={idx >= SIZES.length - 1}
                  onClick={() => onChange?.(prop.key!, SIZES[idx + 1])}
                  className="rounded-none border-0 h-8 px-2"
                >
                  <AArrowUp className="w-3.5 h-3.5" />
                </Button>
              </div>
            );
          })()}
          {prop.type === 'font-weight' && prop.key && (() => {
            const current = currentValues?.[prop.key] ?? String(prop.value ?? 'normal');
            const weights: { value: string; content: React.ReactNode }[] = [
              { value: 'normal',   content: <Type className="w-3.5 h-3.5" /> },
              { value: 'medium',   content: <span className="text-xs font-medium leading-none">M</span> },
              { value: 'semibold', content: <span className="text-xs font-semibold leading-none">SB</span> },
              { value: 'bold',     content: <Bold className="w-3.5 h-3.5" /> },
            ];
            return (
              <div className="inline-flex rounded-md border border-input overflow-hidden">
                {weights.map((w, wi) => (
                  <Button
                    key={w.value}
                    size="sm"
                    variant={current === w.value ? 'primary' : 'ghost'}
                    onClick={() => onChange?.(prop.key!, w.value)}
                    className={`rounded-none border-0 h-8 px-2.5 ${wi < weights.length - 1 ? 'border-r border-input' : ''}`}
                  >
                    {w.content}
                  </Button>
                ))}
              </div>
            );
          })()}
          {/* text-align — desabilitado temporariamente (text-align requer contexto block adequado no stage)
          {prop.type === 'text-align' && prop.key && (() => {
            const current = currentValues?.[prop.key] ?? String(prop.value ?? 'left');
            const aligns: { value: string; Icon: React.ElementType }[] = [
              { value: 'left',   Icon: AlignLeft },
              { value: 'center', Icon: AlignCenter },
              { value: 'right',  Icon: AlignRight },
            ];
            return (
              <div className="inline-flex rounded-md border border-input overflow-hidden">
                {aligns.map((a, ai) => (
                  <Button
                    key={a.value}
                    size="sm"
                    variant={current === a.value ? 'primary' : 'ghost'}
                    onClick={() => onChange?.(prop.key!, a.value)}
                    className={`rounded-none border-0 h-8 px-2.5 ${ai < aligns.length - 1 ? 'border-r border-input' : ''}`}
                  >
                    <a.Icon className="w-3.5 h-3.5" />
                  </Button>
                ))}
              </div>
            );
          })()} */}
        </div>
      ))}
    </div>
  );
}

function ChildPropertiesPanel({ child, colIndex, onBack, onChange }: {
  child: StageItemData;
  colIndex: number;
  onBack: () => void;
  onChange?: (key: string, value: string) => void;
}) {
  const childProps = PROPERTIES[child.type] ?? [];
  const ChildIcon = COMPONENTS.find((c) => c.id === child.type)?.Icon ?? Square;
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50 shrink-0">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 shrink-0">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-400 shrink-0">Coluna {colIndex + 1} /</span>
        <ChildIcon className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        <span className="text-sm font-semibold text-gray-700 truncate">{child.label}</span>
      </div>
      <GenericPropsBody props={childProps} onChange={onChange} currentValues={child.props} />
    </div>
  );
}

function PropertiesPanel({ component, onHeaderClick, selectedItem, onPropChange, selectedCell, onCellPropChange, childItem, onChildBack, onChildPropChange }: {
  component: SelectedComponent;
  onHeaderClick?: () => void;
  selectedItem: StageItemData | null;
  onPropChange: (key: string, value: string) => void;
  selectedCell?: { itemId: number; colIndex: number } | null;
  onCellPropChange?: (key: string, value: string) => void;
  childItem?: StageItemData | null;
  onChildBack?: () => void;
  onChildPropChange?: (key: string, value: string) => void;
}) {
  const props = PROPERTIES[component.id] ?? [];
  const { Icon } = component;

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onHeaderClick}
      >
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700">{component.label}</span>
      </div>
      {childItem ? (
        <ChildPropertiesPanel
          child={childItem}
          colIndex={selectedCell?.colIndex ?? 0}
          onBack={onChildBack ?? (() => {})}
          onChange={onChildPropChange}
        />
      ) : selectedCell && selectedItem?.type === 'container' ? (
        <CellPropertiesPanel
          colIndex={selectedCell.colIndex}
          colProps={parseColProps(selectedItem.props?.[`col_${selectedCell.colIndex}`])}
          onChange={onCellPropChange ?? (() => {})}
          containerCols={parseInt(selectedItem.props?.cols ?? CONTAINER_PROPS.cols.def, 10) || 1}
        />
      ) : component.id === 'container' && selectedItem ? (
        <ContainerPropertiesPanel itemProps={selectedItem.props ?? {}} onChange={onPropChange} />
      ) : (
        <GenericPropsBody props={props} onChange={onPropChange} currentValues={selectedItem?.props} />
      )}
    </div>
  );
}

function DraggableCatalogItem({ id, Icon, label }: { id: string; Icon: React.ElementType; label: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-all group select-none ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
      <span className="text-xs text-gray-600 group-hover:text-blue-600">{label}</span>
    </div>
  );
}

function DraggableColChild({ child, containerId, colIndex, onSelect, onDelete }: {
  child: StageItemData;
  containerId: number;
  colIndex: number;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const dragId = `child-${containerId}-${colIndex}-${child.id}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: dragId });
  return (
    <div
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={`flex items-center gap-1 px-2 py-1 rounded border text-xs cursor-pointer hover:ring-1 hover:ring-blue-300 ${child.type === 'text' ? 'w-fit' : 'w-full'} ${ITEM_COLORS[child.type] ?? 'border-gray-300 bg-gray-50'}`}
    >
      <span
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 shrink-0"
      >
        <GripVertical className="w-3 h-3" />
      </span>
      {child.type === 'text' ? (() => {
        const SIZE_MAP: Record<string, string> = { xs: 'text-xs', sm: 'text-sm', base: 'text-base', lg: 'text-lg', xl: 'text-xl', '2xl': 'text-2xl' };
        const WEIGHT_MAP: Record<string, string> = { normal: 'font-normal', medium: 'font-medium', semibold: 'font-semibold', bold: 'font-bold' };
        const ALIGN_MAP: Record<string, string> = { left: 'text-left', center: 'text-center', right: 'text-right' };
        const content     = child.props?.content ?? 'Texto';
        const isDynamic   = /^\w+\.\w+$/.test(content);
        const sizeClass   = SIZE_MAP[child.props?.size   ?? 'base']   ?? 'text-base';
        const weightClass = WEIGHT_MAP[child.props?.weight ?? 'normal'] ?? 'font-normal';
        const alignClass  = ALIGN_MAP[child.props?.align  ?? 'left']   ?? 'text-left';
        return (
          <div className={`flex-1 w-full ${alignClass}`}>
            {isDynamic ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700 font-mono">
                ⚡ {content}
              </span>
            ) : (
              <span className={`${sizeClass} ${weightClass}`}>{content}</span>
            )}
          </div>
        );
      })() : (
        <span className="font-medium text-gray-600 flex-1">{child.label}</span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="ml-1 text-red-400 hover:text-red-600 shrink-0"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

function DroppableStage({ children, stageIds }: { children: React.ReactNode; stageIds: string[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'stage' });
  return (
    <SortableContext items={stageIds} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className={`flex-1 p-4 transition-colors duration-150 ${isOver ? 'bg-blue-50/40' : ''}`}
      >
        {children}
      </div>
    </SortableContext>
  );
}

function SortableStageItem({ item, selected, onSelect, onDelete, isNew, selectedCell, onCellSelect, onDeleteColChild, onSelectColChild }: {
  item: StageItemData; selected: number | null; onSelect: (item: StageItemData) => void; onDelete: (id: number) => void; isNew?: boolean;
  selectedCell?: { itemId: number; colIndex: number } | null;
  onCellSelect?: (itemId: number, colIndex: number) => void;
  onDeleteColChild?: (itemId: number, colIndex: number, childId: number) => void;
  onSelectColChild?: (child: StageItemData, itemId: number, colIndex: number) => void;
}) {
  const { setNodeRef, transform, isDragging, attributes, listeners } = useSortableRow(String(item.id));
  return (
    <SortableRowCtx.Provider value={{ attributes, listeners, isDragging }}>
      <div
        ref={setNodeRef}
        style={{ transform: transform ?? undefined, opacity: isDragging ? 0.4 : 1 }}
        className="flex items-start gap-1"
      >
        <div className="pt-3.5 shrink-0">
          <DragHandle />
        </div>
        <div className="flex-1 min-w-0">
          <StageItem item={item} selected={selected} onSelect={onSelect} onDelete={onDelete} isNew={isNew} selectedCell={selectedCell} onCellSelect={onCellSelect} onDeleteColChild={onDeleteColChild} onSelectColChild={onSelectColChild} />
        </div>
      </div>
    </SortableRowCtx.Provider>
  );
}

function ComponentsCatalog() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {COMPONENTS.map(({ id, Icon, label }) => (
            <DraggableCatalogItem key={id} id={id} Icon={Icon} label={label} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ModuleLayoutTabProps {
  moduleId: number;
  moduleName: string;
  moduleActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export function ModuleLayoutTab({ moduleId, moduleName, moduleActive, createdAt, updatedAt }: ModuleLayoutTabProps) {
  const [activePageTab, setActivePageTab] = useState('index');
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<SelectedComponent | null>(null);
  const [selectedStageItem, setSelectedStageItem] = useState<number | null>(null);
  const [stageItems, setStageItems]       = useState<StageItemData[]>([]);
  const [saving, setSaving]               = useState(false);
  const [recentItemId, setRecentItemId]   = useState<number | null>(null);
  const [selectedCell, setSelectedCell]   = useState<{ itemId: number; colIndex: number } | null>(null);
  const [selectedChildItem, setSelectedChildItem] = useState<{ itemId: number; colIndex: number; childId: number; child: StageItemData } | null>(null);
  const [fullscreen, setFullscreen]       = useState(false);
  const [activeDragId, setActiveDragId]   = useState<string | null>(null);
  const sensors          = useDndSensors();
  const activeCatalogComp  = activeDragId ? (COMPONENTS.find((c) => c.id === activeDragId) ?? null) : null;
  const activeChildMatch   = activeDragId?.match(/^child-(\d+)-(\d+)-(\d+)$/) ?? null;
  const activeChildItem    = activeChildMatch
    ? (stageItems
        .find((i) => i.id === parseInt(activeChildMatch[1], 10))
        ?.columns?.[parseInt(activeChildMatch[2], 10)]
        ?.find((c) => c.id === parseInt(activeChildMatch[3], 10)) ?? null)
    : null;
  const activeStageItem    = activeDragId && !activeCatalogComp && !activeChildMatch
    ? (stageItems.find((i) => String(i.id) === activeDragId) ?? null)
    : null;
  const stageIds = stageItems.map((i) => String(i.id));
  const selectedChildData = selectedChildItem
    ? (stageItems
        .find((i) => i.id === selectedChildItem.itemId)
        ?.columns?.[selectedChildItem.colIndex]
        ?.find((c) => c.id === selectedChildItem.childId) ?? null)
    : null;

  const loadPage = useCallback(async (tab: string) => {
    try {
      const page = await apiGet<{ layout: StageItemData[] | null }>(`/v1/modules/${moduleId}/pages/${tab}`);
      setStageItems(page.layout ?? []);
    } catch {
      setStageItems([]);
    }
  }, [moduleId]);

  useEffect(() => {
    setSelectedComponent(null);
    setSelectedStageItem(null);
    setSelectedCell(null);
    setSelectedChildItem(null);
    loadPage(activePageTab);
  }, [activePageTab, loadPage]);

  const handleDragStart = (event: { active: { id: string | number } }) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr   = String(over.id);
    // Child drag between columns
    const childMatch = activeIdStr.match(/^child-(\d+)-(\d+)-(\d+)$/);
    if (childMatch) {
      const colMatch = overIdStr.match(/^container-(\d+)-col-(\d+)$/);
      if (!colMatch) return;
      const srcItemId = parseInt(childMatch[1], 10);
      const srcColIdx = parseInt(childMatch[2], 10);
      const childId   = parseInt(childMatch[3], 10);
      const dstItemId = parseInt(colMatch[1], 10);
      const dstColIdx = parseInt(colMatch[2], 10);
      if (srcItemId === dstItemId && srcColIdx === dstColIdx) return;
      setStageItems((prev) => prev.map((item) => {
        if (item.id === srcItemId && item.id === dstItemId) {
          // Same container, different columns
          const cols = (item.columns ?? []).map((c) => [...c]);
          while (cols.length <= Math.max(srcColIdx, dstColIdx)) cols.push([]);
          const child = cols[srcColIdx]?.find((c) => c.id === childId);
          if (!child) return item;
          cols[srcColIdx] = cols[srcColIdx].filter((c) => c.id !== childId);
          cols[dstColIdx] = [...(cols[dstColIdx] ?? []), child];
          return { ...item, columns: cols };
        }
        if (item.id === srcItemId) {
          // Remove from source container
          const cols = (item.columns ?? []).map((c) => [...c]);
          cols[srcColIdx] = (cols[srcColIdx] ?? []).filter((c) => c.id !== childId);
          return { ...item, columns: cols };
        }
        if (item.id === dstItemId) {
          // Add to destination container (child ref from prev state)
          const srcItem  = prev.find((i) => i.id === srcItemId);
          const child    = srcItem?.columns?.[srcColIdx]?.find((c) => c.id === childId);
          if (!child) return item;
          const cols = (item.columns ?? []).map((c) => [...c]);
          while (cols.length <= dstColIdx) cols.push([]);
          cols[dstColIdx] = [...(cols[dstColIdx] ?? []), child];
          return { ...item, columns: cols };
        }
        return item;
      }));
      return;
    }

    const isCatalog   = COMPONENTS.some((c) => c.id === activeIdStr);
    if (isCatalog) {
      // Drop em coluna de container
      const colMatch = overIdStr.match(/^container-(\d+)-col-(\d+)$/);
      if (colMatch) {
        const targetItemId = parseInt(colMatch[1], 10);
        const colIdx       = parseInt(colMatch[2], 10);
        const comp = COMPONENTS.find((c) => c.id === activeIdStr)!;
        const newChild: StageItemData = { id: Date.now(), type: comp.id, label: comp.label };
        setStageItems((prev) => prev.map((i) => {
          if (i.id !== targetItemId) return i;
          const cols = (i.columns ?? []).map((c) => [...c]);
          while (cols.length <= colIdx) cols.push([]);
          cols[colIdx] = [...(cols[colIdx] ?? []), newChild];
          return { ...i, columns: cols };
        }));
        return;
      }
      // Drop no stage principal
      const comp = COMPONENTS.find((c) => c.id === activeIdStr)!;
      const newId = Date.now();
      const defaultProps = comp.id === 'container'
        ? { cols: CONTAINER_PROPS.cols.def, width: CONTAINER_PROPS.width.def, padding: CONTAINER_PROPS.padding.def, bg: CONTAINER_PROPS.bg.def }
        : undefined;
      const newItem: StageItemData = { id: newId, type: comp.id, label: comp.label, props: defaultProps };
      setStageItems((prev) => [...prev, newItem]);
      setRecentItemId(newId);
      setTimeout(() => setRecentItemId(null), 600);
      setSelectedStageItem(newId);
      setSelectedComponent({ id: comp.id, label: comp.label, Icon: comp.Icon });
    } else {
      if (activeIdStr === overIdStr) return;
      setStageItems((prev) => {
        const oldIdx = prev.findIndex((i) => String(i.id) === activeIdStr);
        const newIdx = prev.findIndex((i) => String(i.id) === overIdStr);
        if (oldIdx === -1 || newIdx === -1) return prev;
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  const handleSelectColChild = (child: StageItemData, itemId: number, colIndex: number) => {
    setSelectedChildItem({ itemId, colIndex, childId: child.id, child });
    setSelectedCell({ itemId, colIndex });
    setSelectedStageItem(itemId);
    const found = COMPONENTS.find((c) => c.id === child.type);
    setSelectedComponent({ id: child.type, label: child.label, Icon: found?.Icon ?? Square });
  };

  const handleDeleteColChild = (itemId: number, colIndex: number, childId: number) => {
    setStageItems((prev) => prev.map((i) => {
      if (i.id !== itemId) return i;
      const cols = (i.columns ?? []).map((c, ci) =>
        ci === colIndex ? c.filter((ch) => ch.id !== childId) : [...c]
      );
      return { ...i, columns: cols };
    }));
  };

  const handleStageSelect = (item: StageItemData) => {
    setSelectedStageItem(item.id);
    setSelectedCell(null);
    setSelectedChildItem(null);
    const found = COMPONENTS.find((c) => c.id === item.type);
    setSelectedComponent({ id: item.type, label: item.label, Icon: found?.Icon ?? Square });
  };

  const handleCellSelect = (itemId: number, colIndex: number) => {
    setSelectedCell({ itemId, colIndex });
    setSelectedChildItem(null);
    const item = stageItems.find((i) => i.id === itemId);
    if (item) {
      setSelectedStageItem(itemId);
      const found = COMPONENTS.find((c) => c.id === item.type);
      setSelectedComponent({ id: item.type, label: item.label, Icon: found?.Icon ?? Square });
    }
  };

  const handleChildPropChange = (key: string, value: string) => {
    if (!selectedChildItem) return;
    const { itemId, colIndex, childId } = selectedChildItem;
    setStageItems((prev) => prev.map((item) => {
      if (item.id !== itemId) return item;
      const cols = (item.columns ?? []).map((c, ci) =>
        ci === colIndex
          ? c.map((ch) => ch.id === childId ? { ...ch, props: { ...ch.props, [key]: value } } : ch)
          : [...c]
      );
      return { ...item, columns: cols };
    }));
  };

  const handleCellPropChange = (key: string, value: string) => {
    if (!selectedCell) return;
    const { itemId, colIndex } = selectedCell;
    const colKey = `col_${colIndex}`;
    setStageItems((prev) => prev.map((i) => {
      if (i.id !== itemId) return i;
      const existing = parseColProps(i.props?.[colKey]);
      return { ...i, props: { ...i.props, [colKey]: JSON.stringify({ ...existing, [key]: value }) } };
    }));
  };

  const handlePropChange = (key: string, value: string) => {
    if (selectedStageItem === null) return;
    setStageItems((prev) => prev.map((i) =>
      i.id === selectedStageItem ? { ...i, props: { ...i.props, [key]: value } } : i
    ));
  };

  const handleDeleteItem = (id: number) => {
    setStageItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedStageItem === id) {
      setSelectedStageItem(null);
      setSelectedComponent(null);
    }
    if (selectedCell?.itemId === id) setSelectedCell(null);
    if (selectedChildItem?.itemId === id) setSelectedChildItem(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPost(`/v1/modules/${moduleId}/pages/${activePageTab}`, { layout: stageItems });
      toast.success('Layout salvo');
    } catch {
      toast.error('Erro ao salvar layout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`flex flex-col overflow-hidden ${fullscreen ? 'fixed inset-x-0 bottom-0 z-50 bg-white' : 'flex-1'}`}
      style={fullscreen ? { top: 'var(--banner-height, 0px)' } : undefined}
    >
      {/* Fullscreen module header */}
      {fullscreen && (
        <div className="border-b bg-white shrink-0">
          <div className="flex items-center gap-3 px-6 py-3">
            <button
              onClick={() => setFullscreen(false)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <span className="text-muted-foreground font-normal text-base shrink-0">{formatId(moduleId)}</span>
            <span className="text-xl font-bold leading-tight truncate">{moduleName}</span>
            {moduleActive
              ? <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 shrink-0">Ativo</span>
              : <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 shrink-0">Inativo</span>
            }
          </div>
          <div className="flex gap-6 px-6 pb-3">
            <p className="text-xs text-muted-foreground">
              Criado em: <span className="font-medium text-foreground">{formatDateTimeBR(createdAt)}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Alterado em: <span className="font-medium text-foreground">{formatDateTimeBR(updatedAt)}</span>
            </p>
          </div>
        </div>
      )}

      {/* Builder body */}
      <DndContext sensors={sensors} accessibility={dndAccessibility} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-1 overflow-hidden">

      {/* Left sidebar */}
      <div className={`border-r bg-white flex flex-col transition-all duration-200 ${sidebarOpen ? 'w-56' : 'w-10'}`}>
        {sidebarOpen ? (
          <>
            <div
              className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 shrink-0 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => { setSelectedComponent(null); setSelectedStageItem(null); setSelectedCell(null); setSelectedChildItem(null); }}
            >
              <span className="text-xs font-semibold text-gray-500 tracking-wide">Page Builder</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Recolher</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {selectedComponent ? (
              <PropertiesPanel
                component={selectedComponent}
                onHeaderClick={() => { setSelectedCell(null); setSelectedChildItem(null); }}
                selectedItem={stageItems.find((i) => i.id === selectedStageItem) ?? null}
                onPropChange={handlePropChange}
                selectedCell={selectedCell}
                onCellPropChange={handleCellPropChange}
                childItem={selectedChildData}
                onChildBack={() => setSelectedChildItem(null)}
                onChildPropChange={handleChildPropChange}
              />
            ) : (
              <ComponentsCatalog />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center py-3 gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Expandir</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span
              className="text-xs font-semibold text-gray-400 tracking-wide select-none"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              Page Builder
            </span>
          </div>
        )}
      </div>

      {/* Main content */}
      <Tabs value={activePageTab} onValueChange={setActivePageTab} className="flex-1 flex flex-col overflow-hidden">
        {/* Page tabs + actions */}
        <div className="flex items-center border-b bg-white px-3 py-2 gap-2">
          <TabsList className="flex-1 overflow-x-auto">
            {PAGE_TABS.map(({ value, label }) => (
              <TabsTrigger key={value} value={value}>{label}</TabsTrigger>
            ))}
          </TabsList>
          <div className="flex items-center gap-2 shrink-0">
            <button className="text-xs px-3 py-1.5 rounded border text-gray-600 hover:bg-gray-50 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
            <button
              onClick={() => setFullscreen((v) => !v)}
              title={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
              className="text-xs px-3 py-1.5 rounded border text-gray-600 hover:bg-gray-50 flex items-center gap-1"
            >
              {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs px-3 py-1.5 rounded font-medium flex items-center gap-1 transition-all bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <><Save className="w-3.5 h-3.5 animate-spin" /> Salvando…</> : <><Save className="w-3.5 h-3.5" /> Salvar</>}
            </button>
          </div>
        </div>

        {/* Stage */}
        <div
          className="flex-1 overflow-auto px-6 pt-6"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #e5e7eb 0, #e5e7eb 1px, transparent 0, transparent 50%)',
            backgroundSize: '12px 12px',
            backgroundColor: '#f9fafb',
          }}
          onClick={() => { setSelectedStageItem(null); setSelectedComponent(null); setSelectedCell(null); setSelectedChildItem(null); }}
        >
          <div className="h-full">
            {/*
             * Demo3Layout real — Header e Sidebar são position:fixed.
             * transform:translateZ(0) no container cria um novo containing block,
             * fazendo os filhos fixed serem posicionados relativos a este div.
             */}
            <div
              className="overflow-hidden relative bg-muted h-full"
              style={{
                transform: 'translateZ(0)',
                '--header-height': '48px',
                '--sidebar-width': '58px',
                '--navbar-height': '56px',
                '--banner-height': '0px',
              } as React.CSSProperties}
            >
              {/*
               * Cada componente fixed tem seu próprio wrapper com transform:translateZ(0)
               * → cria o containing block mais próximo, contendo o elemento fixed de forma confiável.
               * overflow:hidden + dimensões explícitas evitam vazamento para fora do stage.
               */}

              {/* Real Header */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
                style={{ height: '48px', zIndex: 10, transform: 'translateZ(0)' }}
              >
                <Header />
              </div>

              {/* Real Sidebar */}
              <div
                className="pointer-events-none absolute top-0 bottom-0 left-0 overflow-hidden"
                style={{ width: '58px', zIndex: 20, transform: 'translateZ(0)' }}
              >
                <Sidebar />
              </div>

              {/* Real Navbar — transform wrapper contém o fixed element */}
              <div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                style={{ zIndex: 5, transform: 'translateZ(0)' }}
              >
                <Navbar />
              </div>

              {/* Área de conteúdo + Footer real */}
              <div
                className="absolute bg-background overflow-y-auto flex flex-col"
                style={{ top: '104px', left: '58px', right: 0, bottom: 0 }}
              >
                <DroppableStage stageIds={stageIds}>
                  {stageItems.length === 0 ? (
                    <div className="h-32 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground/40 select-none">Arraste componentes para montar a página</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stageItems.map((item) => (
                        <SortableStageItem key={item.id} item={item} selected={selectedStageItem} onSelect={handleStageSelect} onDelete={handleDeleteItem} isNew={item.id === recentItemId} selectedCell={selectedCell} onCellSelect={handleCellSelect} onDeleteColChild={handleDeleteColChild} onSelectColChild={handleSelectColChild} />
                      ))}
                    </div>
                  )}
                </DroppableStage>
                {/* Real Footer — pointer-events-none + texto reduzido via override */}
                <div className="pointer-events-none [&_*]:text-[11px]!">
                  <Footer />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Tabs>
      </div>
      <DndOverlayPortal>
        {activeCatalogComp ? (
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-blue-400 bg-blue-50 shadow-lg opacity-90 select-none">
            <activeCatalogComp.Icon className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-blue-600 font-medium">{activeCatalogComp.label}</span>
          </div>
        ) : activeChildItem ? (
          <div className={`flex items-center gap-1 px-2 py-1 rounded border text-xs shadow-lg opacity-90 select-none ${ITEM_COLORS[activeChildItem.type] ?? 'border-gray-300 bg-gray-50'}`}>
            <GripVertical className="w-3 h-3 text-gray-400" />
            <span className="font-medium text-gray-600">{activeChildItem.label}</span>
          </div>
        ) : activeStageItem ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white shadow-lg opacity-90 select-none">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{activeStageItem.label}</span>
          </div>
        ) : null}
      </DndOverlayPortal>
      </DndContext>
    </div>
  );
}
