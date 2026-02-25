import { Eye, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type RowMode = 'create' | 'edit' | 'show' | 'delete' | 'restore';

interface GridActionsProps {
  record: Record<string, unknown>;
  isDeleted: boolean;
  showActionShow: boolean;
  showActionEdit: boolean;
  showActionDelete: boolean;
  showActionRestore: boolean;
  openModal: (mode: RowMode, record: Record<string, unknown>) => void;
}

export function GridActions({
  record,
  isDeleted,
  showActionShow,
  showActionEdit,
  showActionDelete,
  showActionRestore,
  openModal,
}: GridActionsProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center justify-end gap-1">
        {showActionShow && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" mode="icon" className="bg-muted/50 hover:bg-gray-500 hover:text-white" onClick={() => openModal('show', record)}>
                <Eye className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Visualizar</TooltipContent>
          </Tooltip>
        )}
        {showActionEdit && !isDeleted && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="primary" appearance="ghost" mode="icon" className="bg-primary/10 hover:bg-primary hover:text-white" onClick={() => openModal('edit', record)}>
                <Pencil className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Editar</TooltipContent>
          </Tooltip>
        )}
        {showActionDelete && !isDeleted && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="destructive" appearance="ghost" mode="icon" className="bg-destructive/10 hover:bg-destructive hover:text-white" onClick={() => openModal('delete', record)}>
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Deletar</TooltipContent>
          </Tooltip>
        )}
        {showActionRestore && isDeleted && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" mode="icon" className="bg-green-500/10 hover:bg-green-500 hover:text-white" onClick={() => openModal('restore', record)}>
                <RotateCcw className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Restaurar</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
