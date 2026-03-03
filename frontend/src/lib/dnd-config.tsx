import { createContext, useContext, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  type DraggableAttributes,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { GripVertical } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ---------------------------------------------------------------------------
// useDndSensors
// ---------------------------------------------------------------------------

export function useDndSensors() {
  return useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );
}

// ---------------------------------------------------------------------------
// dndAccessibility
// ---------------------------------------------------------------------------

export const dndAccessibility = { container: document.body };

// ---------------------------------------------------------------------------
// DndOverlayPortal
// ---------------------------------------------------------------------------

export function DndOverlayPortal({ children }: { children: ReactNode }) {
  if (!children) return null;
  return createPortal(
    <DragOverlay dropAnimation={null}>{children}</DragOverlay>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// SortableRowCtx
// ---------------------------------------------------------------------------

export interface SortableRowCtxValue {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  isDragging: boolean;
}

export const SortableRowCtx = createContext<SortableRowCtxValue | null>(null);

// ---------------------------------------------------------------------------
// useSortableRow
// ---------------------------------------------------------------------------

export function useSortableRow(id: string) {
  const { attributes, listeners, isDragging, setNodeRef, transform } = useSortable({
    id,
    animateLayoutChanges: () => false,
  });
  return {
    attributes,
    listeners,
    isDragging,
    setNodeRef,
    transform: CSS.Transform.toString(transform),
    transition: undefined,
  };
}

// ---------------------------------------------------------------------------
// DragHandle
// ---------------------------------------------------------------------------

export function DragHandle({ disabled = false }: { disabled?: boolean }) {
  const ctx = useContext(SortableRowCtx);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const isActive = ctx !== null && !disabled;

  const icon = (
    <span
      className={
        isActive
          ? 'flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground opacity-40 hover:opacity-100 transition-opacity outline-none'
          : 'flex items-center justify-center text-muted-foreground opacity-30'
      }
      {...(isActive ? ctx.attributes : {})}
      {...(isActive ? ctx.listeners : {})}
      onMouseDown={(e) => {
        setTooltipOpen(false);
        // MouseSensor activates via onMouseDown — must call it explicitly
        // because JSX prop merging overrides the spread when names collide
        if (isActive) {
          (ctx.listeners as Record<string, Function>)?.onMouseDown?.(e);
        }
      }}
    >
      <GripVertical className="size-4" />
    </span>
  );

  if (!isActive) return icon;

  return (
    <TooltipProvider>
      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>{icon}</TooltipTrigger>
        <TooltipContent>Arrastar</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
