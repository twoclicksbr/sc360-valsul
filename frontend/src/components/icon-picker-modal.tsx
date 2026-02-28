import { useState, useMemo, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface IconPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  selected?: string;
}

// ── Categorias ────────────────────────────────────────────────────────────────

interface CategoryDef {
  id: string;
  label: string;
  keywords: string[];
}

const CATEGORIES: CategoryDef[] = [
  { id: 'all',       label: 'Todos',         keywords: [] },
  { id: 'arrows',    label: 'Setas',         keywords: ['arrow', 'chevron', 'corner', 'undo', 'redo', 'rotate', 'turnup', 'turndown', 'circlefkeyboard'] },
  { id: 'charts',    label: 'Gráficos',      keywords: ['chart', 'trending', 'gauge', 'percent', 'barchart', 'piechart', 'scatter', 'radar', 'candlestick', 'areachart', 'linechart', 'combochart'] },
  { id: 'code',      label: 'Código',        keywords: ['code', 'terminal', 'bug', 'binary', 'brace', 'bracket', 'git', 'github', 'gitlab', 'cpu', 'server', 'webhook', 'variable', 'function', 'hash', 'database', 'regex'] },
  { id: 'comm',      label: 'Comunicação',   keywords: ['message', 'chat', 'phone', 'voicemail', 'reply', 'forward'] },
  { id: 'devices',   label: 'Dispositivos',  keywords: ['monitor', 'laptop', 'tablet', 'smartphone', 'keyboard', 'mouse', 'printer', 'headphone', 'speaker', 'gamepad', 'joystick', 'harddrive', 'usb', 'bluetooth', 'battery', 'cable', 'charger', 'antenna'] },
  { id: 'files',     label: 'Arquivos',      keywords: ['file', 'folder', 'paperclip', 'clipboard', 'archive', 'upload', 'download', 'save'] },
  { id: 'finance',   label: 'Finanças',      keywords: ['dollar', 'euro', 'pound', 'wallet', 'credit', 'banknote', 'coin', 'piggy', 'receipt', 'invoice', 'badgedollar', 'circledollar', 'dollarsign', 'currencydollar'] },
  { id: 'food',      label: 'Alimentos',     keywords: ['coffee', 'teapot', 'wine', 'beer', 'cake', 'cookie', 'pizza', 'apple', 'carrot', 'sandwich', 'icecream', 'soup', 'milk', 'candy', 'croissant', 'drumstick', 'egg', 'fish', 'salad', 'martini', 'popcorn', 'grape', 'cherry', 'banana', 'lemon', 'orange', 'ham', 'bowl', 'utensil', 'chefhat', 'cooking'] },
  { id: 'layout',    label: 'Layout',        keywords: ['layout', 'panel', 'table', 'grid', 'sidebar', 'column', 'row', 'section', 'component', 'menu', 'toolbar', 'app', 'window', 'fullscreen', 'dock', 'layer', 'stack', 'group', 'frame', 'container', 'rows', 'columns'] },
  { id: 'mail',      label: 'E-mail',        keywords: ['mail', 'inbox', 'mailbox', 'atsign', 'mails'] },
  { id: 'maps',      label: 'Mapas',         keywords: ['mappin', 'mapproper', 'globe', 'compass', 'crosshair', 'locate', 'route', 'road', 'milestone', 'navigation'] },
  { id: 'media',     label: 'Mídia',         keywords: ['play', 'pause', 'stop', 'volume', 'music', 'video', 'film', 'image', 'photo', 'gallery', 'camera', 'aperture', 'projector', 'airplay', 'cast', 'mic', 'microphone', 'audiowaveform', 'clapperboard', 'filmreel'] },
  { id: 'medical',   label: 'Médico',        keywords: ['stethoscope', 'syringe', 'pill', 'hospital', 'bandage', 'dna', 'brain', 'microscope', 'thermometer', 'virus', 'ambulance', 'medical', 'radiation', 'biohazard', 'heartpulse', 'activitysquare', 'hearthandshake', 'flask', 'testtubes', 'vial'] },
  { id: 'nature',    label: 'Natureza',      keywords: ['leaf', 'tree', 'flower', 'sprout', 'seedling', 'clover', 'palm', 'cactus', 'fern', 'mushroom', 'snail', 'butterfly', 'bird', 'cat', 'dog', 'fish', 'rabbit', 'turtle', 'bug', 'ant', 'bee', 'dragonfly', 'squirrel', 'rat', 'horse', 'cow', 'pig', 'sheep', 'goat', 'elephant', 'bear', 'tiger', 'lion', 'fox', 'wolf', 'duck', 'bird', 'feather', 'egg', 'paw'] },
  { id: 'notif',     label: 'Notificações',  keywords: ['bell', 'alert', 'megaphone', 'flag', 'badge'] },
  { id: 'people',    label: 'Pessoas',       keywords: ['user', 'person', 'baby', 'contact', 'handshake', 'bot', 'ghost', 'team', 'crowd', 'accessibility', 'personstanding'] },
  { id: 'security',  label: 'Segurança',     keywords: ['lock', 'unlock', 'shield', 'key', 'fingerprint', 'eye', 'spy', 'skull', 'fireextinguisher', 'alarmsmoke'] },
  { id: 'shapes',    label: 'Formas',        keywords: ['circle', 'square', 'rectangle', 'triangle', 'hexagon', 'pentagon', 'octagon', 'diamond', 'star', 'sphere', 'cone', 'cylinder', 'torus', 'shape', 'blob', 'bracketsleft', 'bracketsright'] },
  { id: 'shopping',  label: 'Compras',       keywords: ['shopping', 'package', 'store', 'gift', 'barcode', 'qrcode', 'warehouse', 'box', 'parcel'] },
  { id: 'sports',    label: 'Esportes',      keywords: ['dumbbell', 'trophy', 'medal', 'target', 'sword', 'volleyball', 'football', 'award', 'bike', 'bicycle'] },
  { id: 'text',      label: 'Texto',         keywords: ['text', 'bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'align', 'list', 'quote', 'pilcrow', 'type', 'baseline', 'paragraph', 'heading', 'caseupper', 'caselower', 'casesensitive', 'casemixed', 'lettertext', 'spellcheck', 'wholeword'] },
  { id: 'time',      label: 'Tempo',         keywords: ['clock', 'timer', 'calendar', 'alarm', 'history', 'hourglass', 'watch', 'schedule', 'chrono'] },
  { id: 'tools',     label: 'Ferramentas',   keywords: ['wrench', 'hammer', 'screwdriver', 'settings', 'sliders', 'cog', 'ruler', 'pen', 'pencil', 'eraser', 'scissors', 'brush', 'paintbrush', 'palette', 'pipette', 'axe', 'shovel', 'drill', 'nails', 'glue', 'solder'] },
  { id: 'transport', label: 'Transporte',    keywords: ['car', 'truck', 'bus', 'train', 'plane', 'ship', 'boat', 'bike', 'motorcycle', 'tractor', 'forklift', 'taxi', 'cable', 'anchor', 'ferry', 'helicopter', 'rocket', 'satellite', 'scooter', 'van'] },
  { id: 'travel',    label: 'Viagem',        keywords: ['luggage', 'backpack', 'tent', 'hotel', 'bed', 'passport', 'ticket', 'suitcase', 'cabin', 'campfire', 'compass', 'sunglasses'] },
  { id: 'weather',   label: 'Clima',         keywords: ['sun', 'cloud', 'rain', 'snow', 'lightning', 'wind', 'snowflake', 'thermometer', 'droplet', 'rainbow', 'tornado', 'sunrise', 'sunset', 'cloudy', 'haze', 'fog'] },
];

// ── Lista de ícones ──────────────────────────────────────────────────────────

// Nomes canônicos: PascalCase, sem sufixo 'Icon', sem prefixo 'Lucide'
// Ícones do lucide-react são criados com React.forwardRef → typeof === 'object', não 'function'
const ALL_ICON_NAMES: string[] = Object.keys(LucideIcons)
  .filter(name =>
    /^[A-Z]/.test(name) &&
    !name.endsWith('Icon') &&
    !name.startsWith('Lucide') &&
    (LucideIcons as Record<string, unknown>)[name] != null,
  )
  .sort();

// Classifica um ícone na primeira categoria cujo keyword bate
function categorizeIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.id === 'all') continue;
    if (cat.keywords.some(kw => lower.includes(kw))) return cat.id;
  }
  return 'other';
}

// Mapa pré-computado: iconName → categoryId
const ICON_CATEGORY_MAP = new Map<string, string>(
  ALL_ICON_NAMES.map(name => [name, categorizeIcon(name)]),
);

// Contagem pré-computada por categoria
const CATEGORY_COUNTS: Record<string, number> = (() => {
  const counts: Record<string, number> = { all: ALL_ICON_NAMES.length };
  for (const cat of ICON_CATEGORY_MAP.values()) {
    counts[cat] = (counts[cat] ?? 0) + 1;
  }
  return counts;
})();

// Máximo de ícones exibidos em "Todos" sem busca (performance)
const MAX_ALL_NO_SEARCH = 500;

// ── Hook de debounce ─────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Componente ───────────────────────────────────────────────────────────────

export function IconPickerModal({ open, onClose, onSelect, selected }: IconPickerModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchRaw, setSearchRaw] = useState('');
  const search = useDebounce(searchRaw, 300);

  // Reseta ao abrir
  useEffect(() => {
    if (open) {
      setActiveCategory('all');
      setSearchRaw('');
    }
  }, [open]);

  // Ícones filtrados
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    let names = ALL_ICON_NAMES;

    // Filtro de categoria
    if (activeCategory !== 'all') {
      names = names.filter(n => ICON_CATEGORY_MAP.get(n) === activeCategory);
    }

    // Filtro de busca
    if (term) {
      names = names.filter(n => n.toLowerCase().includes(term));
    }

    // Limite quando "Todos" sem busca
    const limited = activeCategory === 'all' && !term && names.length > MAX_ALL_NO_SEARCH;
    return { names: limited ? names.slice(0, MAX_ALL_NO_SEARCH) : names, limited };
  }, [activeCategory, search]);

  function handleSelect(iconName: string) {
    onSelect(iconName);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent aria-describedby={undefined} showCloseButton={false} className="max-w-5xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-5 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Selecionar Ícone</DialogTitle>
            <div className="flex items-center gap-1">
              {selected && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => { onSelect(''); onClose(); }}
                >
                  <LucideIcons.X className="size-3" />
                  Limpar
                </Button>
              )}
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                  <LucideIcons.X className="size-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="p-0 flex flex-1 overflow-hidden">

          {/* ── Sidebar de categorias ── */}
          <aside className="w-52 shrink-0 border-r flex flex-col overflow-hidden">
            <p className="text-xs font-semibold text-muted-foreground uppercase px-3 pt-3 pb-2 shrink-0">
              Categorias
            </p>
            <div className="overflow-y-auto flex-1 pb-2">
              {CATEGORIES.map(cat => {
                const count = cat.id === 'all'
                  ? ALL_ICON_NAMES.length
                  : (CATEGORY_COUNTS[cat.id] ?? 0);

                if (count === 0) return null;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-3 py-1.5 text-sm rounded-none text-left transition-colors',
                      activeCategory === cat.id
                        ? 'bg-primary/10 text-primary font-semibold border-r-2 border-primary'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    <span className="truncate">{cat.label}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{count}</span>
                  </button>
                );
              })}

              {/* Outros (sem categoria) */}
              {(() => {
                const count = CATEGORY_COUNTS['other'] ?? 0;
                if (count === 0) return null;
                return (
                  <button
                    onClick={() => setActiveCategory('other')}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-3 py-1.5 text-sm rounded-none text-left transition-colors',
                      activeCategory === 'other'
                        ? 'bg-primary/10 text-primary font-semibold border-r-2 border-primary'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    <span className="truncate">Outros</span>
                    <span className="text-xs text-muted-foreground shrink-0">{count}</span>
                  </button>
                );
              })()}
            </div>
          </aside>

          {/* ── Conteúdo principal ── */}
          <div className="flex flex-col flex-1 overflow-hidden">

            {/* Barra de busca */}
            <div className="px-4 py-3 border-b shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={searchRaw}
                  onChange={e => setSearchRaw(e.target.value)}
                  placeholder="Pesquisar ícones..."
                  className="pl-8"
                  autoFocus
                />
              </div>
            </div>

            {/* Contador */}
            <p className="text-xs text-muted-foreground px-4 py-1.5 shrink-0">
              {filtered.names.length === 0
                ? 'Nenhum ícone encontrado'
                : `${filtered.names.length} ícone${filtered.names.length !== 1 ? 's' : ''}${filtered.limited ? ` (mostrando primeiros ${MAX_ALL_NO_SEARCH} — use a busca para filtrar)` : ''}`}
            </p>

            {/* Grid de ícones */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4">
              <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))' }}>
                {filtered.names.map(iconName => {
                  const IconComp = (LucideIcons as Record<string, unknown>)[iconName] as React.ComponentType<{ className?: string }>;
                  const isSelected = selected === iconName;

                  return (
                    <button
                      key={iconName}
                      title={iconName}
                      onClick={() => handleSelect(iconName)}
                      className={cn(
                        'relative flex items-center justify-center h-12 w-full rounded-md border transition-all group',
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'border-border hover:border-primary hover:bg-primary/5 text-foreground',
                      )}
                    >
                      <IconComp className="size-[18px]" />

                      {/* Tooltip com nome */}
                      <span className={cn(
                        'absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs whitespace-nowrap',
                        'bg-popover text-popover-foreground border shadow-sm',
                        'opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50',
                      )}>
                        {iconName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
