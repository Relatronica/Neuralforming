
// Colori distintivi per ogni partito
const partyColors: Record<string, string> = {
  'player-human': '#3b82f6', // Blu
};

// Colori per AI (assegnati dinamicamente)
const aiColors = [
  '#ef4444', // Rosso
  '#10b981', // Verde
  '#eab308', // Giallo
  '#a855f7', // Viola
];

// Cache per i colori assegnati agli AI
const assignedColors: Record<string, string> = {};
let aiColorIndex = 0;

/**
 * Imposta il colore del partito per un giocatore
 * @param playerId - ID del giocatore
 * @param color - Colore esadecimale
 */
export function setPartyColor(playerId: string, color: string): void {
  partyColors[playerId] = color;
}

/**
 * Ottiene il colore del partito per un giocatore
 * @param playerId - ID del giocatore
 * @param playerColor - Colore opzionale dal PlayerState
 * @returns Colore esadecimale del partito
 */
export function getPartyColor(playerId: string, playerColor?: string): string {
  // Se il giocatore ha un colore personalizzato, usalo
  if (playerColor) {
    return playerColor;
  }
  
  // Se è già assegnato, ritorna il colore
  if (partyColors[playerId]) {
    return partyColors[playerId];
  }
  
  // Se è già nella cache, ritorna
  if (assignedColors[playerId]) {
    return assignedColors[playerId];
  }
  
  // Assegna un nuovo colore
  const color = aiColors[aiColorIndex % aiColors.length];
  assignedColors[playerId] = color;
  aiColorIndex++;
  
  return color;
}

/**
 * Resetta i colori assegnati (utile per nuove partite)
 */
export function resetPartyColors(): void {
  Object.keys(assignedColors).forEach(key => delete assignedColors[key]);
  aiColorIndex = 0;
}

