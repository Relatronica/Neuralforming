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

/**
 * Estrae il roomId da un input che può essere:
 * - Un URL completo (es: https://example.com/player?room=ABC123)
 * - Solo il roomId (es: ABC123)
 */
export function extractRoomId(input: string): string {
  if (!input || !input.trim()) {
    return '';
  }

  const trimmed = input.trim();

  // Prova a parsare come URL
  try {
    const url = new URL(trimmed);
    const roomId = url.searchParams.get('room');
    if (roomId) {
      return roomId;
    }
  } catch {
    // Non è un URL valido, potrebbe essere solo il roomId
  }

  // Se non è un URL o non ha il parametro room, restituisci l'input così com'è
  // (potrebbe essere già il roomId)
  return trimmed;
}


