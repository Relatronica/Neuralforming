import { GameState, SocietyNews, PlayerState } from './types';
import { Scoring } from './Scoring';
import { TurnManager } from './TurnManager';
import newsData from '../data/news.json';

/**
 * Modulo centralizzato per la gestione delle news dalla società
 */
export class News {
  private static news: SocietyNews[] = newsData as SocietyNews[];

  /**
   * Ottiene tutte le news disponibili
   */
  static getAllNews(): SocietyNews[] {
    return [...this.news];
  }

  /**
   * Ottiene una news per ID
   */
  static getNewsById(id: string): SocietyNews | undefined {
    return this.news.find(n => n.id === id);
  }

  /**
   * Pesca una news randomica (escludendo quelle troppo recenti se necessario)
   */
  static drawRandomNews(excludeIds?: string[]): SocietyNews {
    let available = [...this.news];
    
    if (excludeIds && excludeIds.length > 0) {
      available = available.filter(n => !excludeIds.includes(n.id));
    }
    
    // Se non ci sono news disponibili (esclusa), riusa tutte
    if (available.length === 0) {
      available = [...this.news];
    }
    
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }

  /**
   * Applica l'effetto di una news ai giocatori
   */
  static applyNewsEffect(gameState: GameState, news: SocietyNews): GameState {
    const targets = news.targets || 'all';
    let updatedPlayers = [...gameState.players];

    switch (targets) {
      case 'all':
        // Applica a tutti i giocatori
        updatedPlayers = updatedPlayers.map(player => 
          this.applyEffectToPlayer(player, news.effect)
        );
        break;
      
      case 'current':
        // Applica solo al giocatore corrente
        updatedPlayers = updatedPlayers.map(player => {
          if (player.id === gameState.currentPlayerId) {
            return this.applyEffectToPlayer(player, news.effect);
          }
          return player;
        });
        break;
      
      case 'others':
        // Applica a tutti tranne il giocatore corrente
        updatedPlayers = updatedPlayers.map(player => {
          if (player.id !== gameState.currentPlayerId) {
            return this.applyEffectToPlayer(player, news.effect);
          }
          return player;
        });
        break;
    }

    return {
      ...gameState,
      players: updatedPlayers,
      currentNews: news,
      lastNewsTurn: gameState.turn,
    };
  }

  /**
   * Applica un effetto a un singolo giocatore
   */
  private static applyEffectToPlayer(player: PlayerState, effect: SocietyNews['effect']): PlayerState {
    return {
      ...player,
      techPoints: Math.max(0, player.techPoints + (effect.techPoints || 0)),
      ethicsPoints: Math.max(0, player.ethicsPoints + (effect.ethicsPoints || 0)),
      neuralformingPoints: Math.max(0, player.neuralformingPoints + (effect.neuralformingPoints || 0)),
    };
  }

  /**
   * Verifica se dovrebbe apparire una news in questo turno
   * Le news appaiono ogni 2-3 turni (random tra 2 e 3)
   */
  static shouldShowNews(gameState: GameState): boolean {
    // Non mostrare news al turno 1
    if (gameState.turn <= 1) return false;

    // Se c'è già una news attiva, non mostrare un'altra
    if (gameState.currentNews) return false;

    // Se non c'è un lastNewsTurn, significa che non è mai apparsa una news
    // Mostra la prima news al turno 2 o 3
    if (!gameState.lastNewsTurn) {
      return gameState.turn >= 2 && gameState.turn <= 3;
    }

    // Calcola il turno da quando è apparsa l'ultima news
    const turnsSinceLastNews = gameState.turn - gameState.lastNewsTurn;
    
    // Le news appaiono ogni 2-3 turni (random)
    // Per semplicità, alterniamo tra 2 e 3 turni
    const newsInterval = (gameState.turn % 2 === 0) ? 2 : 3;
    
    return turnsSinceLastNews >= newsInterval;
  }

  /**
   * Processa le news e ritorna lo stato aggiornato se necessario
   */
  static processNews(gameState: GameState): GameState {
    if (!this.shouldShowNews(gameState)) {
      return gameState;
    }

    // Escludi le news già mostrate recentemente (ultime 3)
    // Per semplicità, non manteniamo uno storico dettagliato
    const drawnNews = this.drawRandomNews();
    
    const stateWithNews = this.applyNewsEffect(gameState, drawnNews);
    
    // Verifica se qualcuno ha raggiunto il suo obiettivo dopo gli effetti delle news
    // Le news possono modificare i punti e quindi completare gli obiettivi
    return TurnManager.checkGameEnd(stateWithNews);
  }
}

