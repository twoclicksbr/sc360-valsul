import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ChevronDown,
  Eye,
  Save,
  Check,
  Maximize2,
  Minimize2,
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
  { id: 'grid',      Icon: LayoutGrid,   label: 'Grid' },
  { id: 'form',      Icon: FormInput,    label: 'Form' },
  { id: 'card',      Icon: Square,       label: 'Card' },
  { id: 'text',      Icon: Type,         label: 'Texto' },
  { id: 'btn',       Icon: MousePointer, label: 'Botões' },
  { id: 'container', Icon: Box,          label: 'Container' },
  { id: 'tabs',      Icon: Layers,       label: 'Abas' },
  { id: 'chart',     Icon: BarChart2,    label: 'Gráfico' },
  { id: 'image',     Icon: Image,        label: 'Imagem' },
  { id: 'divider',   Icon: Minus,        label: 'Divisor' },
];

const PROPERTIES: Record<string, { label: string; type: string; options?: string[]; value?: string | number | boolean }[]> = {
  grid: [
    { label: 'Colunas',    type: 'select', options: ['1', '2', '3', '4', '6', '12'] },
    { label: 'Gap',        type: 'select', options: ['Nenhum', 'Pequeno', 'Médio', 'Grande'] },
    { label: 'Módulo',     type: 'select', options: ['people', 'products', 'modules'] },
    { label: 'Por página', type: 'number', value: 10 },
    { label: 'Busca',      type: 'toggle', value: true },
    { label: 'Paginação',  type: 'toggle', value: true },
  ],
  form: [
    { label: 'Módulo',            type: 'select', options: ['people', 'products', 'modules'] },
    { label: 'Layout',            type: 'select', options: ['1 coluna', '2 colunas', '3 colunas'] },
    { label: 'Botão Salvar',      type: 'text',   value: 'Salvar' },
    { label: 'Botão Cancelar',    type: 'text',   value: 'Cancelar' },
    { label: 'Redirect após salvar', type: 'text', value: 'index' },
  ],
  card: [
    { label: 'Título',  type: 'text',   value: 'Card Title' },
    { label: 'Padding', type: 'select', options: ['Nenhum', 'Pequeno', 'Médio', 'Grande'] },
    { label: 'Borda',   type: 'toggle', value: true },
    { label: 'Sombra',  type: 'toggle', value: false },
  ],
};

interface StageItemData {
  id: number;
  type: string;
  label: string;
  children?: StageItemData[];
}

interface SelectedComponent {
  id: string;
  label: string;
  Icon: React.ElementType;
}

function StageItem({
  item,
  selected,
  onSelect,
}: {
  item: StageItemData;
  selected: number | null;
  onSelect: (item: StageItemData) => void;
}) {
  const colors: Record<string, string> = {
    grid:      'border-blue-300 bg-blue-50',
    form:      'border-green-300 bg-green-50',
    card:      'border-purple-300 bg-purple-50',
    text:      'border-yellow-300 bg-yellow-50',
    btn:       'border-orange-300 bg-orange-50',
    container: 'border-gray-300 bg-gray-50',
  };
  const color = colors[item.type] ?? 'border-gray-300 bg-gray-50';
  const isSelected = selected === item.id;

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(item); }}
      className={`border-2 rounded-lg p-3 cursor-pointer transition-all relative group ${color} ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : 'hover:ring-1 hover:ring-blue-300'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{item.label}</span>
        {isSelected && (
          <span className="ml-auto flex gap-1">
            <button className="text-xs bg-white border rounded px-1.5 py-0.5 text-gray-500 hover:bg-gray-50">⬆</button>
            <button className="text-xs bg-white border rounded px-1.5 py-0.5 text-red-400 hover:bg-red-50">✕</button>
          </span>
        )}
      </div>
      {item.children
        ? item.children.map((child) => (
            <StageItem key={child.id} item={child} selected={selected} onSelect={onSelect} />
          ))
        : (
          <div className="h-12 rounded border border-dashed border-current opacity-30 flex items-center justify-center text-xs">
            conteúdo
          </div>
        )}
    </div>
  );
}

function PropertiesPanel({ component, onClose }: { component: SelectedComponent; onClose: () => void }) {
  const props = PROPERTIES[component.id] ?? [];
  const { Icon } = component;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">{component.label}</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {props.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-8">Nenhuma propriedade disponível</p>
        )}
        {props.map((prop, i) => (
          <div key={i}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{prop.label}</label>
            {prop.type === 'select' && (
              <select className="w-full text-xs border rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400">
                {prop.options!.map((o) => <option key={o}>{o}</option>)}
              </select>
            )}
            {prop.type === 'text' && (
              <input defaultValue={String(prop.value ?? '')} className="w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400" />
            )}
            {prop.type === 'number' && (
              <input type="number" defaultValue={Number(prop.value ?? 0)} className="w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400" />
            )}
            {prop.type === 'toggle' && (
              <div className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${prop.value ? 'bg-blue-500' : 'bg-gray-300'}`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${prop.value ? 'translate-x-4' : 'translate-x-1'}`} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ComponentsCatalog({ onSelect }: { onSelect: (comp: SelectedComponent) => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {COMPONENTS.map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => onSelect({ id, Icon, label })}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all group"
            >
              <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
              <span className="text-xs text-gray-600 group-hover:text-blue-600">{label}</span>
            </button>
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
  const [saved, setSaved]                 = useState(false);
  const [fullscreen, setFullscreen]       = useState(false);

  const handleComponentClick = (comp: SelectedComponent) => {
    setSelectedComponent(comp);
    setStageItems((prev) => [...prev, { id: Date.now(), type: comp.id, label: comp.label }]);
  };

  const handleStageSelect = (item: StageItemData) => {
    setSelectedStageItem(item.id);
    const found = COMPONENTS.find((c) => c.id === item.type);
    setSelectedComponent({ id: item.type, label: item.label, Icon: found?.Icon ?? Square });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
      <div className="flex flex-1 overflow-hidden">

      {/* Left sidebar */}
      <div className={`border-r bg-white flex flex-col transition-all duration-200 ${sidebarOpen ? 'w-56' : 'w-10'}`}>
        {sidebarOpen ? (
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 shrink-0">
              <span className="text-xs font-semibold text-gray-500  tracking-wide">Page Builder</span>
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
              <PropertiesPanel component={selectedComponent} onClose={() => setSelectedComponent(null)} />
            ) : (
              <ComponentsCatalog onSelect={handleComponentClick} />
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
              className={`text-xs px-3 py-1.5 rounded font-medium flex items-center gap-1 transition-all ${
                saved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saved ? <><Check className="w-3.5 h-3.5" /> Salvo</> : <><Save className="w-3.5 h-3.5" /> Salvar</>}
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
          onClick={() => setSelectedStageItem(null)}
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
                <div className="flex-1 p-4">
{stageItems.length === 0 ? (
                    <div className="h-32 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground/40 select-none">Arraste componentes para montar a página</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stageItems.map((item) => (
                        <StageItem key={item.id} item={item} selected={selectedStageItem} onSelect={handleStageSelect} />
                      ))}
                      <div className="h-12 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-300 hover:border-blue-300 hover:text-blue-300 cursor-pointer transition-colors">
                        + adicionar componente
                      </div>
                    </div>
                  )}
                </div>
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
    </div>
  );
}
