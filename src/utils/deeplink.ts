export function buildPlayerJoinUrl(roomId: string): string {
  const origin =
    typeof window !== 'undefined' && window.location && window.location.origin
      ? window.location.origin
      : '';
  const path = '/player';
  const params = new URLSearchParams({ room: roomId });
  return `${origin}${path}?${params.toString()}`;
}

export function getQueryParam(param: string): string | null {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  const value = url.searchParams.get(param);
  return value;
}


