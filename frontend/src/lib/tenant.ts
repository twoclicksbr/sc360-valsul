// Padrão de URL frontend: {tenant}.{platform-domain}
// Exemplos:
//   master.twoclicks.test      → tenant=master
//   valsul.smartclick360.test  → tenant=valsul
//
// O platform-slug é lido de VITE_PLATFORM_SLUG (definido por deployment).
// Usado para construir a URL da API: {tenant}.{platform-slug}.api.{VITE_API_BASE_DOMAIN}

// Lê o tenant do primeiro subdomínio do hostname atual.
export function getUrlTenantSlug(): string {
  const parts = window.location.hostname
    .split('.')
    .filter((p) => p !== 'sandbox');

  // master.twoclicks.test → parts = ['master', 'twoclicks', 'test'] → 'master'
  // twoclicks.test (sem subdomínio) → parts = ['twoclicks', 'test'] → 'master' (fallback)
  return parts.length >= 3 ? parts[0] : 'master';
}

// Retorna o slug da platform configurado via env.
// Cada deployment define seu próprio VITE_PLATFORM_SLUG (ex: tc, sc360, b360).
export function getPlatformSlug(): string {
  return (import.meta.env.VITE_PLATFORM_SLUG as string) || 'tc';
}

// Retorna o tenant ativo para chamadas de API.
// Mantido para compatibilidade com paths /v1/{tenant}/... (será removido em fase futura).
export function getTenantSlug(): string {
  return getUrlTenantSlug();
}

export function isSandbox(): boolean {
  return window.location.hostname.split('.').includes('sandbox');
}
