export function getTenantSlug(): string {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  if (parts.length >= 3) {
    return parts[0];
  }

  return (import.meta.env.VITE_TENANT_SLUG as string) ?? 'valsul';
}
