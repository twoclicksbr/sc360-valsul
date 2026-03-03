import { AlertTriangle } from 'lucide-react';

export function SandboxBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white text-sm py-2 text-center flex items-center justify-center gap-2">
      <AlertTriangle className="h-4 w-4" />
      Ambiente Sandbox — Os dados aqui são de teste e podem ser resetados a qualquer momento.
    </div>
  );
}
