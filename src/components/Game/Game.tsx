import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameEngine } from '../../game/GameEngine';
import { GameState, Technology, DilemmaOption, PlayerState, Dilemma, VoteResult, DilemmaVoteResult } from '../../game/types';
import { TurnManager } from '../../game/TurnManager';
import { AIPlayer } from '../../game/AIPlayer';
import { Objectives } from '../../game/Objectives';
import { milestones } from '../../game/Milestones';
import { Board } from '../Board/Board';
import { TechnologyCard } from '../Cards/TechnologyCard';
import { DilemmaCard } from '../Cards/DilemmaCard';
import { ConsequenceCard } from '../Cards/ConsequenceCard';
import { PlayersList } from '../Players/PlayersList';
import { VotingResult } from './VotingResult';
import { VoterPointsNotification } from './VoterPointsNotification';
import { GlobalEventCard } from './GlobalEventCard';
import { NewsCard } from './NewsCard';
import { VoteLoadingScreen } from './VoteLoadingScreen';
import { DilemmaTransitionScreen } from './DilemmaTransitionScreen';
import { TurnTransitionScreen } from './TurnTransitionScreen';
import { MilestoneUnlockAnimation } from './MilestoneUnlockAnimation';
import { OpeningStoryModal } from './OpeningStoryModal';
import { useGameSocketContext } from '../../contexts/GameSocketContext';
import { Bot, Landmark, Users, CheckCircle2, XCircle, Clock, MessageCircle, Scale, Loader2 } from 'lucide-react';
import technologiesData from '../../data/technologies.json';
import dilemmasData from '../../data/dilemmas.json';
import headerNewsData from '../../data/headerNews.json';

// Componente per la fase di discussione e votazione (master view)
const DiscussionAndVotingPanel: React.FC<{
  pendingVote: { technologyId: string; technology: any; proposerId: string };
  gameState: GameState;
  currentPlayer: PlayerState | null | undefined;
  isMaster: boolean;
  voteStatus: { hasVoted: boolean; myVote: boolean | null; totalVotes: number; requiredVotes: number } | null;
  discussionPhase: {
    technologyId: string;
    technology: any;
    proposerId: string;
    discussionEndTime: number;
    isReady: boolean;
    readyCount: number;
    requiredCount: number;
  } | null;
  onVote: (vote: boolean) => void;
  onReadyToVote: (technologyId: string) => void;
}> = ({ pendingVote, gameState, currentPlayer, isMaster, voteStatus, discussionPhase, onVote, onReadyToVote }) => {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!discussionPhase) {
      setSecondsLeft(0);
      return;
    }
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((discussionPhase.discussionEndTime - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [discussionPhase]);

  const isInDiscussion = discussionPhase !== null && secondsLeft > 0;
  const isReady = discussionPhase?.isReady ?? false;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timerProgress = Math.max(0, Math.min(100, (secondsLeft / 90) * 100));

  // Barra progresso voti con colore dinamico
  const voteProgressColor = voteStatus 
    ? voteStatus.totalVotes >= voteStatus.requiredVotes 
      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
      : 'bg-gradient-to-r from-amber-500 to-amber-400'
    : 'bg-gray-500';

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-750 to-gray-800 rounded-lg shadow-lg p-3 border-2 border-gray-600">
      {/* Header: Discussion or Voting */}
      {isInDiscussion ? (
        <>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="bg-amber-600/20 rounded-full p-1.5 shadow-md">
              <MessageCircle className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-base font-bold text-gray-100">
              Discussione in Corso
            </h2>
          </div>
          <p className="text-amber-300/80 text-center text-xs mb-2">
            I giocatori discutono la proposta prima di votare
          </p>
          {/* Countdown - visibile a TUTTI (incluso proponente e master) */}
          <div className="mb-2">
            <div className="bg-gray-800 rounded-lg p-2 border border-gray-700">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className={`text-xl font-mono font-bold ${
                  secondsLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-amber-300'
                }`}>
                  {formatTime(secondsLeft)}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-1000 ${
                    secondsLeft <= 10 ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${timerProgress}%` }}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="bg-blue-600/20 rounded-full p-1.5 shadow-md">
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <h2 className="text-base font-bold text-gray-100">
            Proposta in Votazione
          </h2>
        </div>
      )}

      {/* Technology Card */}
      <div className="mb-2 flex justify-center">
        <div className="bg-gray-800 rounded-lg shadow-md p-2 border border-gray-600 max-w-xs w-full">
          <TechnologyCard
            technology={pendingVote.technology}
            isSelectable={false}
            isInHand={false}
            isVotingCard={true}
            showVotingEffects={false}
          />
        </div>
      </div>

      {/* Proposer name */}
      <div className="bg-gray-800 rounded-lg p-2 mb-2 shadow-sm border border-gray-600">
        <p className="text-gray-200 text-center text-xs">
          <span className="font-bold text-gray-100">
            {gameState.players.find(p => p.id === pendingVote.proposerId)?.name || 'Un giocatore'}
          </span>
          <span className="text-gray-400"> ha proposto questa tecnologia</span>
        </p>
      </div>

      {/* Discussion phase: ready button for non-proposer players */}
      {isInDiscussion && currentPlayer && currentPlayer.id !== pendingVote.proposerId && (
        <div className="space-y-2">
          {!isReady ? (
            <button
              onClick={() => onReadyToVote(pendingVote.technologyId)}
              className="w-full font-bold py-2 px-3 rounded-lg transition-all duration-200 shadow-md text-xs bg-amber-600 hover:bg-amber-500 active:bg-amber-400 text-white hover:shadow-lg flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Pronto a Votare</span>
            </button>
          ) : (
            <div className="bg-gray-800 rounded-lg p-2 border border-amber-600/40 text-center">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-amber-400" />
                <p className="text-amber-300 font-semibold text-xs">
                  Sei pronto! In attesa degli altri...
                </p>
              </div>
            </div>
          )}
          {discussionPhase && discussionPhase.requiredCount > 0 && (
            <div className="bg-gray-800 rounded-lg p-1.5 border border-gray-700">
              <p className="text-center text-xs text-gray-300">
                Pronti: <span className="font-bold text-amber-300">{discussionPhase.readyCount}</span>
                <span className="text-gray-500"> / </span>
                <span className="font-bold text-gray-200">{discussionPhase.requiredCount}</span>
              </p>
              <div className="mt-1 w-full bg-gray-700 rounded-full h-1">
                <div
                  className="bg-amber-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${(discussionPhase.readyCount / discussionPhase.requiredCount) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Discussion phase: proposer view - ORA con timer e progresso */}
      {isInDiscussion && currentPlayer && currentPlayer.id === pendingVote.proposerId && (
        <div className="bg-gradient-to-r from-amber-900/30 to-gray-800 border border-amber-600/30 rounded-lg p-2 text-center space-y-2">
          <div className="flex items-center justify-center gap-1">
            <MessageCircle className="w-3 h-3 text-amber-400" />
            <p className="text-amber-200 font-bold text-xs">
              I giocatori discutono la tua proposta...
            </p>
          </div>
          {discussionPhase && discussionPhase.requiredCount > 0 && (
            <div className="bg-gray-800/60 rounded p-1.5 border border-gray-700">
              <p className="text-xs text-gray-300">
                Pronti: <span className="font-bold text-amber-300">{discussionPhase.readyCount}</span>
                <span className="text-gray-500"> / </span>
                <span className="font-bold text-gray-200">{discussionPhase.requiredCount}</span>
              </p>
              <div className="mt-1 w-full bg-gray-700 rounded-full h-1">
                <div
                  className="bg-amber-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${(discussionPhase.readyCount / discussionPhase.requiredCount) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Discussion phase: master view */}
      {isInDiscussion && isMaster && !currentPlayer && (
        <div className="bg-gradient-to-r from-amber-900/30 to-gray-800 border border-amber-600/30 rounded-lg p-2 text-center space-y-2">
          <div className="flex items-center justify-center gap-1">
            <MessageCircle className="w-3 h-3 text-amber-400" />
            <p className="text-amber-200 font-bold text-xs">
              I giocatori discutono la proposta...
            </p>
          </div>
          {discussionPhase && discussionPhase.requiredCount > 0 && (
            <div className="bg-gray-800/60 rounded p-1.5 border border-gray-700">
              <p className="text-xs text-gray-300">
                Pronti: <span className="font-bold text-amber-300">{discussionPhase.readyCount}</span>
                <span className="text-gray-500"> / </span>
                <span className="font-bold text-gray-200">{discussionPhase.requiredCount}</span>
              </p>
              <div className="mt-1 w-full bg-gray-700 rounded-full h-1">
                <div
                  className="bg-amber-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${(discussionPhase.readyCount / discussionPhase.requiredCount) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voting phase: vote buttons for non-proposer players - COLORI SEMANTICI */}
      {!isInDiscussion && currentPlayer && currentPlayer.id !== pendingVote.proposerId && (
        <div className="space-y-2">
          <p className="text-gray-200 text-center font-semibold text-xs">
            Vuoi votare a favore o contro?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onVote(true)}
              disabled={voteStatus?.hasVoted}
              className={`flex-1 font-bold py-2 px-3 rounded-lg transition-all duration-200 shadow-md text-xs ${
                voteStatus?.hasVoted && voteStatus?.myVote === true
                  ? 'bg-emerald-800/60 text-emerald-300 cursor-not-allowed ring-2 ring-emerald-500/50'
                  : voteStatus?.hasVoted
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{voteStatus?.hasVoted && voteStatus?.myVote === true ? 'Votato Sì' : 'Vota Sì'}</span>
              </div>
            </button>
            <button
              onClick={() => onVote(false)}
              disabled={voteStatus?.hasVoted}
              className={`flex-1 font-bold py-2 px-3 rounded-lg transition-all duration-200 shadow-md text-xs ${
                voteStatus?.hasVoted && voteStatus?.myVote === false
                  ? 'bg-red-800/60 text-red-300 cursor-not-allowed ring-2 ring-red-500/50'
                  : voteStatus?.hasVoted
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <XCircle className="w-3 h-3" />
                <span>{voteStatus?.hasVoted && voteStatus?.myVote === false ? 'Votato No' : 'Vota No'}</span>
              </div>
            </button>
          </div>
          {voteStatus && (
            <div className="bg-gray-800 rounded-lg p-2 border border-gray-600">
              <p className="text-center text-xs font-semibold text-gray-200">
                <span className="text-gray-100">{voteStatus.totalVotes}</span>
                <span className="text-gray-500"> / </span>
                <span className="text-gray-300">{voteStatus.requiredVotes}</span>
                <span className="text-gray-500 text-xs ml-1">voti</span>
              </p>
              <div className="mt-1 w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className={`${voteProgressColor} h-1.5 rounded-full transition-all duration-500`}
                  style={{ width: `${(voteStatus.totalVotes / voteStatus.requiredVotes) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voting phase: proposer view - con progress bar colorata */}
      {!isInDiscussion && currentPlayer && currentPlayer.id === pendingVote.proposerId && (
        <div className="bg-gradient-to-r from-blue-900/20 to-gray-800 border border-blue-600/30 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-blue-400 animate-pulse" />
            <p className="text-blue-200 font-bold text-xs">
              Votazione sulla tua proposta...
            </p>
          </div>
          {voteStatus && (
            <div className="bg-gray-800 rounded p-1.5 border border-gray-700">
              <p className="text-gray-200 text-xs font-bold">
                {voteStatus.totalVotes} / {voteStatus.requiredVotes} voti
              </p>
              <div className="mt-1 w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className={`${voteProgressColor} h-1.5 rounded-full transition-all duration-500`}
                  style={{ width: `${(voteStatus.totalVotes / voteStatus.requiredVotes) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voting phase: master (non-player) view */}
      {!isInDiscussion && isMaster && !currentPlayer && (
        <div className="bg-gradient-to-r from-blue-900/20 to-gray-800 border border-blue-600/30 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="w-3 h-3 text-blue-400" />
            <p className="text-blue-200 font-bold text-xs">
              Votazione in corso
            </p>
          </div>
          {voteStatus && (
            <div className="bg-gray-800 rounded p-1.5 border border-gray-700">
              <p className="text-gray-200 text-xs font-bold">
                {voteStatus.totalVotes} / {voteStatus.requiredVotes} voti
              </p>
              <div className="mt-1 w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className={`${voteProgressColor} h-1.5 rounded-full transition-all duration-500`}
                  style={{ width: `${(voteStatus.totalVotes / voteStatus.requiredVotes) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface GameProps {
  mode?: 'single' | 'multiplayer';
  roomId?: string | null;
  onBackToSetup?: () => void;
}

export const Game: React.FC<GameProps> = ({ mode = 'single', roomId = null, onBackToSetup }) => {
  // Single player: stato locale
  // IMPORTANTE: In multiplayer, questo NON viene usato - viene sempre usato serverGameState
  const [localGameState, setLocalGameState] = useState<GameState>(() => 
    mode === 'single' ? GameEngine.initializeGame() : {
      players: [],
      currentPlayerId: '',
      currentPhase: 'development',
      currentDilemma: null,
      currentConsequence: null,
      technologyDeck: [],
      dilemmaDeck: [],
      turn: 1,
      gameWon: false,
      gameLost: false,
      winnerId: null,
      activeJoker: null,
      lastVoteResult: null,
      lastVoteMessage: null,
      currentGlobalEvent: null,
      newlyUnlockedMilestones: null,
    } as GameState
  );
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  
  // Loading states
  const [showVoteLoading, setShowVoteLoading] = useState(false);
  const [pendingVoteResult, setPendingVoteResult] = useState<{ voteResult: VoteResult; players: PlayerState[]; message?: string } | null>(null);
  const [showVoterPointsNotification, setShowVoterPointsNotification] = useState(false);
  const [showDilemmaTransition, setShowDilemmaTransition] = useState(false);
  const [showTurnTransition, setShowTurnTransition] = useState(false);
  const [turnTransitionPlayer, setTurnTransitionPlayer] = useState<{ name: string; color?: string; icon?: string } | null>(null);
  const [showMilestoneAnimation, setShowMilestoneAnimation] = useState(false);
  const [milestoneAnimation, setMilestoneAnimation] = useState<{ name: string } | null>(null);
  const [previousPlayerId, setPreviousPlayerId] = useState<string | null>(null);
  const [previousPhase, setPreviousPhase] = useState<string | null>(null);
  const [showOpeningStory, setShowOpeningStory] = useState(false);
  const [hasShownOpeningStory, setHasShownOpeningStory] = useState(false);
  const [selectedOpeningStory, setSelectedOpeningStory] = useState<{ id: string; title: string; content: string; mood: string } | null>(null);
  const [headerNewsIndex, setHeaderNewsIndex] = useState(() => 
    Math.floor(Math.random() * headerNewsData.length)
  );

  // Multiplayer: stato dal server
  // Usa il context invece di creare una nuova istanza - questo condivide lo stato con RoomSetup
  // IMPORTANTE: sempre chiamare useGameSocketContext() (non condizionalmente) per rispettare le regole degli Hooks
  const socketContext = useGameSocketContext();
  
  const {
    gameState: serverGameState,
    playerState,
    isConnected,
    roomInfo,
    sendAction,
    sendVote,
    sendReadyToVote,
    pendingVote,
    voteStatus,
    discussionPhase,
    pendingDilemmaVote,
    dilemmaVoteStatus,
    dilemmaDiscussionPhase,
    openingStoryStatus,
    sendOpeningStory,
    setGameState: updateServerGameState,
    socket,
  } = (mode === 'multiplayer' && socketContext) ? socketContext : {
    gameState: null,
    playerState: null,
    isConnected: false,
    roomInfo: null,
    sendAction: () => {},
    sendVote: () => {},
    sendReadyToVote: () => {},
    pendingVote: null,
    voteStatus: null,
    discussionPhase: null,
    pendingDilemmaVote: null,
    dilemmaVoteStatus: null,
    dilemmaDiscussionPhase: null,
    openingStoryStatus: null,
    sendOpeningStory: () => {},
    setGameState: undefined,
    socket: null,
  };

  // Determina se siamo il master
  useEffect(() => {
    if (mode === 'multiplayer' && roomInfo && socket) {
      // Il master è identificato confrontando il socket.id con masterSocketId
      const isMasterPlayer = roomInfo.masterSocketId === socket.id;
      console.log('🔍 Master check:', {
        socketId: socket.id,
        masterSocketId: roomInfo.masterSocketId,
        isMaster: isMasterPlayer,
      });
      setIsMaster(isMasterPlayer);
    } else {
      setIsMaster(false);
    }
  }, [mode, roomInfo, socket]);

  // Inizializza il gioco quando il master avvia la partita
  useEffect(() => {
    // Aspetta che il gioco sia iniziato E che ci siano giocatori nella room
    console.log('🎮 Initialization check:', {
      mode,
      isMaster,
      isConnected,
      hasServerGameState: !!serverGameState,
      hasSocket: !!socket,
      isGameStarted: roomInfo?.isGameStarted,
      playersCount: roomInfo?.players.length,
    });
    
    if (mode === 'multiplayer' && isMaster && isConnected && !serverGameState && socket && roomInfo?.isGameStarted && roomInfo.players.length > 0) {
      console.log('✅ Starting game initialization...');
      
      // Crea un nuovo stato di gioco con solo i giocatori reali
      const initializeMultiplayerGame = (): GameState => {
        // Mescola i mazzi - usa gli stessi import di GameEngine
        
        const shuffleArray = <T,>(array: T[]): T[] => {
          const shuffled = [...array];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return shuffled;
        };

        const technologyDeck = shuffleArray([...technologiesData] as Technology[]);
        const dilemmaDeck = shuffleArray([...dilemmasData] as Dilemma[]);

        // Crea i giocatori reali dalla room (escludi eventuali master)
        let players: PlayerState[] = [];
        
        if (roomInfo && roomInfo.players.length > 0) {
          // Filtra eventuali giocatori master (non dovrebbero esserci, ma per sicurezza)
          const realPlayers = roomInfo.players.filter(p => !p.isMaster);
          
          realPlayers.forEach((p) => {
            const playerHand = technologyDeck.splice(0, 2);
            players.push({
              id: p.id,
              name: p.name,
              isAI: false,
              techPoints: 0,
              ethicsPoints: 0,
              neuralformingPoints: 0,
              technologies: [],
              hand: playerHand,
              unlockedMilestones: [],
              color: p.color,
              icon: p.icon,
            });
          });
        }

        // Assegna obiettivi randomicamente ai giocatori
        const objectiveAssignments = Objectives.assignObjectives(players);
        players = players.map(player => ({
          ...player,
          objectiveId: objectiveAssignments.get(player.id),
        }));

        return {
          players,
          currentPlayerId: players[0]?.id || '',
          currentPhase: 'development',
          currentDilemma: null,
          currentConsequence: null,
          technologyDeck,
          dilemmaDeck,
          turn: 1,
          gameWon: false,
          gameLost: false,
          winnerId: null,
          activeJoker: null,
          lastVoteResult: null,
          lastVoteMessage: null,
          currentGlobalEvent: null,
          newlyUnlockedMilestones: null,
          currentNews: null,
          lastNewsTurn: undefined,
        };
      };

      const initialState = initializeMultiplayerGame();
      
      console.log('🎮 Initialized game state:', {
        playersCount: initialState.players.length,
        currentPlayerId: initialState.currentPlayerId,
        phase: initialState.currentPhase,
      });
      
      // Il master deve inviare il gameState al server
      // IMPORTANTE: Usa direttamente updateGameStateOnServer invece di updateServerGameState
      // perché updateServerGameState potrebbe non inviare il gameState se il socket ID non corrisponde
      if (socket && roomId) {
        try {
          console.log('📤 Master sending initial game state to server...');
          console.log('📤 Current socket.id:', socket.id);
          console.log('📤 Current roomInfo.masterSocketId:', roomInfo?.masterSocketId);
          
          // Imposta il gameState localmente PRIMA di inviarlo al server
          // Questo evita il ritardo tra invio e ricezione
          if (updateServerGameState) {
            updateServerGameState(initialState);
          }
          
          // Invia anche direttamente al server via WebSocket con ack (più affidabile di HTTP POST)
          socket.emit('updateGameState', { roomId, gameState: initialState }, (response: { success: boolean; error?: string }) => {
            if (response?.success) {
              console.log('✅ Initial game state sent to server via WebSocket');
            } else {
              console.error('❌ Failed to send initial game state:', response?.error);
            }
          });
        } catch (error) {
          console.error('❌ Error sending game state to server:', error);
        }
      } else {
        console.error('❌ Cannot send game state: socket or roomId missing', { socket: !!socket, roomId: !!roomId });
      }
    }
  }, [mode, isMaster, isConnected, serverGameState, socket, roomId, roomInfo, updateServerGameState]);

  // Usa lo stato appropriato in base alla modalità
  // IMPORTANTE: In multiplayer, usa SEMPRE serverGameState, MAI localGameState
  // localGameState contiene giocatori IA e non deve essere usato in multiplayer
  const gameState = mode === 'multiplayer' 
    ? serverGameState  // In multiplayer, usa SOLO serverGameState (null se non ancora arrivato)
    : localGameState;

  // Mostra la storia di apertura quando il gioco inizia (turno 1, fase development)
  useEffect(() => {
    if (!gameState) return;
    if (hasShownOpeningStory) return;
    
    // Mostra la storia solo al primo turno, in fase development, quando non ci sono dilemmi o conseguenze attivi
    if (
      gameState.turn === 1 &&
      gameState.currentPhase === 'development' &&
      !gameState.currentDilemma &&
      !gameState.currentConsequence &&
      gameState.players.length > 0
    ) {
      // Piccolo delay per permettere al gioco di renderizzare completamente
      const timer = setTimeout(() => {
        setShowOpeningStory(true);
        setHasShownOpeningStory(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [gameState, hasShownOpeningStory]);

  // Mostra automaticamente la notifica dei punti votanti quando disponibile
  // Usa un ref per tracciare se abbiamo già mostrato questa notifica
  const voterPointsShownRef = useRef<string | null>(null);
  
  // Ref per tracciare se abbiamo già avviato la votazione sul dilemma corrente
  const dilemmaVotingStartedRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (!gameState) return;
    
    // Crea un ID univoco per questa notifica basato sui dati
    const notificationId = gameState.voterPointsInfo 
      ? JSON.stringify(gameState.voterPointsInfo.map(v => ({ playerId: v.playerId, vote: v.vote })))
      : null;
    
    // Mostra la notifica solo se:
    // 1. voterPointsInfo è disponibile
    // 2. Non è già mostrata
    // 3. Non abbiamo già mostrato questa specifica notifica
    if (
      gameState.voterPointsInfo && 
      gameState.voterPointsInfo.length > 0 && 
      !showVoterPointsNotification &&
      notificationId !== voterPointsShownRef.current
    ) {
      // Piccolo delay per permettere al VotingResult di essere mostrato prima
      const timer = setTimeout(() => {
        setShowVoterPointsNotification(true);
        voterPointsShownRef.current = notificationId;
      }, 1500);
      
      return () => clearTimeout(timer);
    }
    
    // Reset il ref quando voterPointsInfo cambia (nuova votazione)
    if (!gameState.voterPointsInfo) {
      voterPointsShownRef.current = null;
    }
  }, [gameState?.voterPointsInfo, showVoterPointsNotification]);
  
  // Per multiplayer, il master gestisce lo stato e lo invia al server
  const setGameState = mode === 'multiplayer' && isMaster
    ? (updater: GameState | ((prev: GameState) => GameState)) => {
        if (!gameState) {
          console.warn('⚠️ Cannot update game state: gameState is null');
          return;
        }
        const newState = typeof updater === 'function' ? updater(gameState) : updater;
        console.log('🔄 Master updating game state:', {
          currentPhase: newState.currentPhase,
          currentPlayerId: newState.currentPlayerId,
          hasLastVoteResult: !!newState.lastVoteResult,
          turn: newState.turn,
        });
        if (updateServerGameState) {
          updateServerGameState(newState);
        }
      }
    : setLocalGameState;

  // Per multiplayer, usa playerState se disponibile (per giocatori non-master)
  // Il master NON è un giocatore, quindi non ha un currentPlayer
  const currentPlayer = mode === 'multiplayer' && isMaster
    ? null // Il master non è un giocatore
    : (mode === 'multiplayer' && playerState && !isMaster
      ? playerState
      : (gameState ? TurnManager.getCurrentPlayer(gameState) : null));
  
  // Il master non può mai avere il turno (non è un giocatore)
  const isHumanTurn = Boolean(!isMaster && currentPlayer && !currentPlayer.isAI && 
    (mode === 'single' || (mode === 'multiplayer' && gameState?.currentPlayerId === currentPlayer.id)));

  // ✅ Auto-skip turno per giocatori disconnessi (solo master in multiplayer)
  const disconnectSkipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const DISCONNECT_SKIP_DELAY_MS = 30000; // 30 secondi prima di skippare il turno
  
  useEffect(() => {
    // Solo il master in multiplayer gestisce lo skip
    if (mode !== 'multiplayer' || !isMaster || !gameState || !roomInfo) {
      if (disconnectSkipTimerRef.current) {
        clearTimeout(disconnectSkipTimerRef.current);
        disconnectSkipTimerRef.current = null;
      }
      return;
    }

    if (gameState.currentPhase === 'gameOver') return;

    const currentPlayerId = gameState.currentPlayerId;
    const isCurrentPlayerDisconnected = roomInfo.disconnectedPlayers?.some(
      dp => dp.id === currentPlayerId
    );
    const isCurrentPlayerConnected = roomInfo.players?.some(
      p => p.id === currentPlayerId
    );

    if (isCurrentPlayerDisconnected && !isCurrentPlayerConnected) {
      // Il giocatore corrente è disconnesso - avvia timer per skip
      if (!disconnectSkipTimerRef.current) {
        const playerName = gameState.players.find(p => p.id === currentPlayerId)?.name || 'Giocatore';
        console.log(`⏳ Player ${playerName} is disconnected during their turn. Auto-skip in ${DISCONNECT_SKIP_DELAY_MS / 1000}s...`);
        
        disconnectSkipTimerRef.current = setTimeout(() => {
          console.log(`⏭️ Auto-skipping turn for disconnected player ${playerName}`);
          // Salta al prossimo giocatore
          setGameState(prev => TurnManager.nextPlayer(prev));
          disconnectSkipTimerRef.current = null;
        }, DISCONNECT_SKIP_DELAY_MS);
      }
    } else {
      // Il giocatore è connesso (o si è riconnesso) - cancella il timer
      if (disconnectSkipTimerRef.current) {
        console.log(`✅ Current player reconnected, cancelling auto-skip timer`);
        clearTimeout(disconnectSkipTimerRef.current);
        disconnectSkipTimerRef.current = null;
      }
    }

    return () => {
      if (disconnectSkipTimerRef.current) {
        clearTimeout(disconnectSkipTimerRef.current);
        disconnectSkipTimerRef.current = null;
      }
    };
  }, [mode, isMaster, gameState?.currentPlayerId, gameState?.currentPhase, roomInfo?.disconnectedPlayers, roomInfo?.players, setGameState]);

  // Gestisce i turni AI automaticamente (solo single-player)
  useEffect(() => {
    if (mode === 'multiplayer') return; // In multiplayer non ci sono AI
    if (!gameState) return; // Aspetta che gameState sia disponibile
    if (gameState.currentPhase === 'gameOver') return;
    if (isProcessingAI) return;
    
    const currentPlayer = TurnManager.getCurrentPlayer(gameState);
    const isHumanTurn = currentPlayer && !currentPlayer.isAI;
    
    if (!isHumanTurn && currentPlayer) {
      setIsProcessingAI(true);
      
      const processAITurn = async () => {
        setGameState(prevState => {
          let state = { ...prevState };
          let player = TurnManager.getCurrentPlayer(state);
          if (!player) return state;

          // Fase sviluppo: pesca tecnologia se necessario, poi scegli
          if (player.hand.length === 0) {
            state = GameEngine.drawTechnology(state, player.id);
            player = GameEngine.getPlayer(state, player.id);
            if (!player) return state;
          }
          
          // Gioca una carta tecnologia (che automaticamente pesca un dilemma)
          if (player.hand.length > 0) {
            const chosenTech = AIPlayer.chooseTechnology(player, player.hand);
            if (chosenTech) {
              state = GameEngine.addTechnology(state, player.id, chosenTech);
              player = GameEngine.getPlayer(state, player.id);
              if (!player) return state;

              // Se c'è un dilemma (pescato automaticamente), risolvilo
          if (state.currentDilemma && player) {
            const chosenOption = AIPlayer.chooseDilemmaOption(player, state.currentDilemma);
            state = GameEngine.resolveDilemma(state, player.id, chosenOption);
              }
            }
          }

          // Se c'è una conseguenza, passa al prossimo giocatore dopo
          if (!state.currentConsequence) {
            state = TurnManager.nextPlayer(state);
          }

          return state;
        });
        
        // Se c'è una conseguenza, attendi prima di continuare
        if (gameState?.currentConsequence) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          setGameState(prev => GameEngine.completeConsequencePhase(prev));
        }
        
        setIsProcessingAI(false);
      };

      processAITurn();
    }
  }, [mode, gameState?.currentPhase, gameState?.currentPlayerId, isProcessingAI, gameState?.currentConsequence, setGameState]);

  const handleDrawTechnology = useCallback(() => {
    if (!currentPlayer) return;
    if (mode === 'multiplayer') {
      sendAction('drawTechnology', {});
    } else {
    setGameState(prev => GameEngine.drawTechnology(prev, currentPlayer.id));
    }
  }, [currentPlayer, mode, sendAction, setGameState]);

  const handleAddTechnology = useCallback((technology: Technology) => {
    if (!currentPlayer) return;
    if (mode === 'multiplayer') {
      // In multiplayer, invia l'azione al server
      sendAction('addTechnology', { technology });
      // Il master riceverà l'azione e applicherà la logica
    } else {
    setGameState(prev => GameEngine.addTechnology(prev, currentPlayer.id, technology));
    }
  }, [currentPlayer, mode, sendAction, setGameState]);

  const handleResolveDilemma = useCallback((option: DilemmaOption) => {
    if (!currentPlayer) return;
    // Mostra transizione prima di risolvere
    setShowDilemmaTransition(true);
    // Risolvi dopo un breve delay per permettere alla transizione di apparire
    setTimeout(() => {
      if (mode === 'multiplayer') {
        sendAction('resolveDilemma', { option });
      } else {
        setGameState(prev => GameEngine.resolveDilemma(prev, currentPlayer.id, option));
      }
      // Nascondi transizione dopo che il dilemma è stato risolto
      setTimeout(() => {
        setShowDilemmaTransition(false);
      }, 2000);
    }, 100);
  }, [currentPlayer, mode, sendAction, setGameState]);

  // In multiplayer, quando la fase diventa 'dilemma', avvia la votazione sul dilemma
  useEffect(() => {
    if (mode !== 'multiplayer' || !isMaster || !gameState || !socket || !roomId) return;
    if (gameState.currentPhase !== 'dilemma' || !gameState.currentDilemma) return;
    
    const dilemmaId = gameState.currentDilemma.id;
    
    // Evita di avviare la votazione più volte per lo stesso dilemma
    if (dilemmaVotingStartedRef.current === dilemmaId) return;
    dilemmaVotingStartedRef.current = dilemmaId;
    
    console.log('🎯 Master detected dilemma phase, starting dilemma voting:', {
      dilemmaId,
      dilemmaTitle: gameState.currentDilemma.title,
      currentPlayerId: gameState.currentPlayerId,
    });
    
    // Avvia la votazione sul server via WebSocket con ack
    socket.emit('startDilemmaVoting', {
      roomId,
      dilemmaId,
      dilemma: gameState.currentDilemma,
      currentPlayerId: gameState.currentPlayerId,
    }, (response: { success: boolean; error?: string }) => {
      if (response?.success) {
        console.log('✅ Dilemma voting started successfully via WebSocket');
      } else {
        console.error('❌ Failed to start dilemma voting:', response?.error);
      }
    });
  }, [mode, isMaster, gameState?.currentPhase, gameState?.currentDilemma?.id, socket, roomId]);

  // Reset il ref quando la fase non è più 'dilemma'
  useEffect(() => {
    if (gameState?.currentPhase !== 'dilemma') {
      dilemmaVotingStartedRef.current = null;
    }
  }, [gameState?.currentPhase]);

  // Ascolta il risultato della votazione sul dilemma (solo master)
  useEffect(() => {
    if (mode !== 'multiplayer' || !isMaster || !socket) return;

    const handleDilemmaVotingComplete = (data: {
      dilemmaId: string;
      dilemma: Dilemma;
      currentPlayerId: string;
      winningOption: DilemmaOption;
      winningOptionIndex: number;
      result: DilemmaVoteResult;
    }) => {
      if (!gameState) {
        console.error('❌ Cannot handle dilemma voting complete: gameState is null');
        return;
      }

      console.log('✅ Master received dilemmaVotingComplete:', {
        dilemmaId: data.dilemmaId,
        winningOptionIndex: data.winningOptionIndex,
        winningOptionText: data.winningOption.text,
        votesPerOption: data.result.votesPerOption,
      });

      // Mostra transizione prima di risolvere
      setShowDilemmaTransition(true);

      setTimeout(() => {
        // Risolvi il dilemma con l'opzione vincente, applicando i punti al giocatore corrente
        const newState = GameEngine.resolveDilemma(gameState, data.currentPlayerId, data.winningOption);
        
        // Salva il risultato della votazione nel gameState
        setGameState({
          ...newState,
          lastDilemmaVoteResult: data.result,
        });

        // Nascondi transizione dopo il resolve
        setTimeout(() => {
          setShowDilemmaTransition(false);
        }, 2000);
      }, 100);
    };

    socket.on('dilemmaVotingComplete', handleDilemmaVotingComplete);

    return () => {
      socket.off('dilemmaVotingComplete', handleDilemmaVotingComplete);
    };
  }, [mode, isMaster, socket, gameState, setGameState]);

  const handleCompleteConsequence = useCallback(() => {
    if (mode === 'multiplayer') {
      sendAction('completeConsequence', {});
    } else {
    setGameState(prev => GameEngine.completeConsequencePhase(prev));
    }
  }, [mode, sendAction, setGameState]);

  const handleVote = useCallback((vote: boolean) => {
    if (!pendingVote) return;
    sendVote(pendingVote.technologyId, vote);
  }, [pendingVote, sendVote]);

  const handleDismissGlobalEvent = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentGlobalEvent: null,
    }));
  }, [setGameState]);

  const handleDismissNews = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentNews: null,
    }));
  }, [setGameState]);


  const handleNewGame = useCallback(() => {
    if (mode === 'multiplayer') {
      if (onBackToSetup) {
        onBackToSetup();
      }
    } else {
    setGameState(GameEngine.initializeGame());
    setIsProcessingAI(false);
    setHasShownOpeningStory(false);
    setSelectedOpeningStory(null);
    }
  }, [mode, setGameState, onBackToSetup]);

  // Gestisce le azioni ricevute dal server (solo master)
  useEffect(() => {
    if (mode === 'multiplayer' && isMaster && socket) {
      const handlePlayerAction = (data: { playerId: string; action: string; data: any }) => {
        if (!gameState) {
          console.warn('⚠️ Cannot handle player action: gameState is null');
          return;
        }
        
        const player = gameState.players.find(p => p.id === data.playerId);
        if (!player) {
          console.error('❌ Cannot handle player action: player not found in gameState', {
            playerId: data.playerId,
            availablePlayers: gameState.players.map(p => ({ id: p.id, name: p.name })),
            action: data.action,
          });
          return;
        }

        let newState: GameState = gameState;

        switch (data.action) {
          case 'drawTechnology':
            newState = GameEngine.drawTechnology(gameState, data.playerId);
            break;
          case 'addTechnology':
            // In multiplayer, NON applicare subito la tecnologia
            // Avvia invece una votazione sul server
            console.log('🎯 Master handling addTechnology:', {
              playerId: data.playerId,
              playerName: player.name,
              technologyId: data.data.technology.id,
              technologyName: data.data.technology.name,
              roomId,
              hasSocket: !!socket,
              hasGameState: !!gameState,
            });
            
            if (socket && roomId && gameState) {
              console.log('✅ Starting voting...', {
                playerId: data.playerId,
                playerName: player.name,
                technologyId: data.data.technology.id,
              });
              
              // Usa WebSocket con ack (più affidabile di HTTP POST)
              socket.emit('startVoting', {
                roomId,
                technologyId: data.data.technology.id,
                technology: data.data.technology,
                proposerId: data.playerId,
              }, (response: { success: boolean; error?: string }) => {
                if (response?.success) {
                  console.log('✅ Voting started successfully via WebSocket');
                } else {
                  console.error('❌ Failed to start voting:', response?.error);
                }
              });
            } else {
              console.error('❌ Cannot start voting: missing socket, roomId, or gameState', {
                hasSocket: !!socket,
                hasRoomId: !!roomId,
                hasGameState: !!gameState,
              });
            }
            
            // Rimuovi temporaneamente la carta dalla mano (verrà riaggiunta dopo la votazione)
            const newHand = player.hand.filter(t => t.id !== data.data.technology.id);
            newState = {
              ...gameState,
              players: gameState.players.map(p =>
                p.id === data.playerId ? { ...p, hand: newHand } : p
              ),
            };
            break;
          case 'resolveDilemma':
            console.log('🎯 Master handling resolveDilemma:', {
              playerId: data.playerId,
              option: data.data.option,
            });
            newState = GameEngine.resolveDilemma(gameState, data.playerId, data.data.option);
            console.log('🎯 After resolveDilemma:', {
              currentPhase: newState.currentPhase,
              currentPlayerId: newState.currentPlayerId,
              turn: newState.turn,
            });
            break;
          case 'completeConsequence':
            console.log('🎯 Master handling completeConsequence');
            newState = GameEngine.completeConsequencePhase(gameState);
            console.log('🎯 After completeConsequence:', {
              currentPhase: newState.currentPhase,
              currentPlayerId: newState.currentPlayerId,
              turn: newState.turn,
            });
            break;
        }

        setGameState(newState);
      };

      // Gestisce il completamento della votazione
      const handleVotingComplete = (data: {
        technologyId: string;
        technology: Technology;
        proposerId: string;
        votes: Array<{ playerId: string; vote: boolean }>;
      }) => {
        if (!gameState) {
          console.error('❌ Cannot handle voting complete: gameState is null');
          return;
        }

        console.log('✅ Master received votingComplete:', {
          technologyId: data.technologyId,
          proposerId: data.proposerId,
          votesCount: data.votes.length,
        });

        // Converti i voti in una Map
        const realVotes = new Map<string, boolean>();
        data.votes.forEach(({ playerId, vote }) => {
          realVotes.set(playerId, vote);
        });
        // Il proponente vota sempre a favore
        realVotes.set(data.proposerId, true);

        console.log('📊 Real votes map:', Array.from(realVotes.entries()));

        // Applica la tecnologia con i voti reali
        const newState = GameEngine.addTechnology(
          gameState,
          data.proposerId,
          data.technology,
          realVotes
        );

        console.log('🎮 New game state after addTechnology:', {
          currentPhase: newState.currentPhase,
          currentPlayerId: newState.currentPlayerId,
          hasLastVoteResult: !!newState.lastVoteResult,
          lastVoteMessage: newState.lastVoteMessage,
        });

        // Mostra loading prima del risultato
        if (newState.lastVoteResult) {
          setShowVoteLoading(true);
          setPendingVoteResult({
            voteResult: newState.lastVoteResult,
            players: newState.players,
            message: newState.lastVoteMessage || undefined,
          });
          // Il risultato verrà mostrato dopo il loading
          setGameState({
            ...newState,
            lastVoteResult: null, // Nascondi temporaneamente
            lastVoteMessage: null,
          });
        } else {
          setGameState(newState);
        }
      };

      // Gestisce la rimozione permanente di un giocatore (grace period scaduto)
      const handlePlayerPermanentlyLeft = (data: { playerId: string; playerName: string }) => {
        if (!gameState) return;
        
        console.log(`❌ Player ${data.playerName} permanently left, removing from game state`);
        
        // Rimuovi il giocatore dal gameState usando TurnManager
        const newState = TurnManager.removePlayer(gameState, data.playerId);
        setGameState(newState);
      };

      // Gestisce l'aggiunta di un giocatore a partita in corso
      const handlePlayerJoinedMidGame = (data: { playerId: string; playerName: string; playerColor: string; playerIcon: string }) => {
        if (!gameState) return;
        
        console.log(`🆕 Player ${data.playerName} joined mid-game, adding to game state`);
        
        // Crea un nuovo PlayerState per il giocatore che entra a partita in corso
        // Pesca 2 carte dal mazzo
        const newHand = gameState.technologyDeck.slice(0, 2);
        const remainingDeck = gameState.technologyDeck.slice(2);
        
        const newPlayer: PlayerState = {
          id: data.playerId,
          name: data.playerName,
          isAI: false,
          techPoints: 0,
          ethicsPoints: 0,
          neuralformingPoints: 0,
          technologies: [],
          hand: newHand,
          unlockedMilestones: [],
          color: data.playerColor,
          icon: data.playerIcon,
        };
        
        const newState: GameState = {
          ...gameState,
          players: [...gameState.players, newPlayer],
          technologyDeck: remainingDeck,
        };
        
        setGameState(newState);
      };

      socket.on('playerActionReceived', handlePlayerAction);
      // Ascolta direttamente l'evento dal server invece di un evento intermedio
      socket.on('votingComplete', handleVotingComplete);
      socket.on('playerPermanentlyLeft', handlePlayerPermanentlyLeft);
      socket.on('playerJoinedMidGame', handlePlayerJoinedMidGame);

      return () => {
        socket.off('playerActionReceived', handlePlayerAction);
        socket.off('votingComplete', handleVotingComplete);
        socket.off('playerPermanentlyLeft', handlePlayerPermanentlyLeft);
        socket.off('playerJoinedMidGame', handlePlayerJoinedMidGame);
      };
    }
  }, [mode, isMaster, socket, gameState, roomId, setGameState]);

  // Rotazione automatica delle news nell'header ogni 20 secondi
  useEffect(() => {
    const interval = setInterval(() => {
      setHeaderNewsIndex((prev) => {
        // Cambia alla news successiva, tornando all'inizio se necessario
        return (prev + 1) % headerNewsData.length;
      });
    }, 20000); // Cambia ogni 20 secondi

    return () => clearInterval(interval);
  }, []);

  // Cambia la news nell'header anche quando cambia il turno (random)
  useEffect(() => {
    if (!gameState) return;
    // Cambia news random ad ogni turno
    setHeaderNewsIndex(Math.floor(Math.random() * headerNewsData.length));
  }, [gameState?.turn]);

  // Rileva cambio turno per mostrare transizione
  useEffect(() => {
    if (!gameState) return;
    
    const currentPlayerId = gameState.currentPlayerId;
    const currentPhase = gameState.currentPhase;
    
    // Se il playerId è cambiato, mostra transizione
    if (previousPlayerId && previousPlayerId !== currentPlayerId) {
      const newPlayer = gameState.players.find(p => p.id === currentPlayerId);
      if (newPlayer) {
        setTurnTransitionPlayer({
          name: newPlayer.name,
          color: newPlayer.color,
          icon: newPlayer.icon,
        });
        setShowTurnTransition(true);
      }
    }
    
    // Se la fase è cambiata da dilemma a consequence, la transizione è già gestita
    if (previousPhase === 'dilemma' && currentPhase === 'consequence') {
      // La transizione dilemma è già gestita
    }
    
    setPreviousPlayerId(currentPlayerId);
    setPreviousPhase(currentPhase);
  }, [gameState?.currentPlayerId, gameState?.currentPhase, gameState?.players, previousPlayerId, previousPhase]);

  // Rileva milestone sbloccati
  useEffect(() => {
    if (!gameState?.newlyUnlockedMilestones || gameState.newlyUnlockedMilestones.length === 0) return;
    
    // Mostra animazione per il primo milestone
    const firstMilestone = gameState.newlyUnlockedMilestones[0];
    if (firstMilestone) {
      // Trova il nome del milestone
      const milestone = milestones.find((m) => m.id === firstMilestone.milestoneId);
      if (milestone) {
        setMilestoneAnimation({ name: milestone.name });
        setShowMilestoneAnimation(true);
      }
    }
  }, [gameState?.newlyUnlockedMilestones]);

  // IMPORTANTE: Controllo anticipato per evitare errori quando gameState è null
  // In multiplayer, se il gioco è iniziato ma non abbiamo ancora lo stato, mostra attesa
  // NOTA: Questo deve essere DOPO tutti gli useEffect per rispettare le regole degli Hooks
  if (mode === 'multiplayer') {
    if (!gameState && roomInfo?.isGameStarted) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-700">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Inizializzazione partita...</h2>
            <p className="text-gray-300">Il gioco sta per iniziare...</p>
            {isMaster && (
              <p className="text-xs text-gray-400 mt-2">(Sei il master - inizializzazione in corso...)</p>
            )}
          </div>
        </div>
      );
    }
    // Se non abbiamo gameState e il gioco non è ancora iniziato, mostra attesa
    if (!gameState && !roomInfo?.isGameStarted) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-700">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Attesa...</h2>
            <p className="text-gray-300">Preparazione della partita...</p>
          </div>
        </div>
      );
    }
  }

  // Game Over Screen
  if (gameState && gameState.currentPhase === 'gameOver') {
    const winner = gameState.players.find(p => p.id === gameState.winnerId);
    const humanPlayer = gameState.players.find(p => !p.isAI);
    const isHumanWinner = winner && !winner.isAI;
    
    // Ottieni l'obiettivo del vincitore se presente
    const winnerObjective = winner?.objectiveId ? Objectives.getObjectiveById(winner.objectiveId) : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-700">
          {isHumanWinner ? (
            <>
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold text-gray-100 mb-4">Vittoria!</h1>
              {winnerObjective && (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-400 mb-1">Obiettivo Completato</p>
                  <p className="text-lg font-bold text-gray-100 mb-2">{winnerObjective.title}</p>
                  <p className="text-sm text-gray-300">{winnerObjective.description}</p>
                </div>
              )}
              <p className="text-gray-300 mb-6">
                {winnerObjective 
                  ? `Hai raggiunto per primo il tuo obiettivo! ${winnerObjective.title}`
                  : 'Hai guidato con successo la creazione di un\'IA sostenibile! Le tue decisioni politiche hanno bilanciato innovazione tecnologica e responsabilità etica, creando un futuro migliore per tutti i cittadini.'}
              </p>
              {humanPlayer && (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-200 mb-2">
                    <strong className="text-gray-100">Punti Neuralforming:</strong> {humanPlayer.neuralformingPoints}
                  </p>
                  <p className="text-sm text-gray-200 mb-2">
                    <strong className="text-gray-100">Punti Etica:</strong> {humanPlayer.ethicsPoints}
                  </p>
                  <p className="text-sm text-gray-200">
                    <strong className="text-gray-100">Punti Tecnologia:</strong> {humanPlayer.techPoints}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <Bot className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h1 className="text-3xl font-bold text-gray-100 mb-4">
                {winner ? `${winner.name} ha vinto!` : 'Sconfitta'}
              </h1>
              {winner && winnerObjective && (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-400 mb-1">Obiettivo Raggiunto</p>
                  <p className="text-lg font-bold text-gray-100 mb-2">{winnerObjective.title}</p>
                  <p className="text-sm text-gray-300">{winnerObjective.description}</p>
                </div>
              )}
              <p className="text-gray-300 mb-6">
                {winner 
                  ? winnerObjective
                    ? `${winner.name} ha raggiunto per primo il suo obiettivo: ${winnerObjective.title}. Le sue politiche hanno prevalso.`
                    : `${winner.name} ha completato per primo il programma di IA sostenibile. Le sue politiche hanno prevalso.`
                  : 'Le tue politiche non hanno raggiunto gli obiettivi richiesti. L\'IA creata non è sostenibile.'}
              </p>
              {winner && (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-200 mb-2">
                    <strong className="text-gray-100">Punti Neuralforming:</strong> {winner.neuralformingPoints}
                  </p>
                  <p className="text-sm text-gray-200 mb-2">
                    <strong className="text-gray-100">Punti Etica:</strong> {winner.ethicsPoints}
                  </p>
                  <p className="text-sm text-gray-200">
                    <strong className="text-gray-100">Punti Tecnologia:</strong> {winner.techPoints}
                  </p>
                </div>
              )}
            </>
          )}
          <button
            onClick={handleNewGame}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Nuova Partita
          </button>
        </div>
      </div>
    );
  }

  // IMPORTANTE: Il master in multiplayer non ha currentPlayer (non è un giocatore)
  // Quindi il controllo deve essere diverso per il master
  const shouldShowLoading = mode === 'multiplayer' && isMaster
    ? !gameState // Il master ha bisogno solo di gameState
    : (!gameState || !currentPlayer); // I giocatori normali hanno bisogno di entrambi
  
  if (shouldShowLoading) {
    if (mode === 'multiplayer') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-700">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Caricamento partita...</h2>
            <p className="text-gray-300">Attendere l'inizializzazione del gioco...</p>
            {isMaster && (
              <p className="text-xs text-gray-400 mt-2">(Sei il master - inizializzazione in corso...)</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  // Controllo finale per assicurare che gameState non sia null (TypeScript guard)
  if (!gameState) {
    return null;
  }

  return (
    <>
      {/* Opening story modal */}
      {showOpeningStory && (
        <OpeningStoryModal
          onClose={() => setShowOpeningStory(false)}
          story={selectedOpeningStory}
          readyCount={openingStoryStatus?.readyCount ?? 0}
          totalPlayers={openingStoryStatus?.totalPlayers ?? 0}
          onStorySelected={(story) => {
            setSelectedOpeningStory(story);
            if (mode === 'multiplayer' && sendOpeningStory) {
              sendOpeningStory(story);
            }
          }}
        />
      )}

      {/* Loading screens overlay */}
      {showTurnTransition && turnTransitionPlayer && (
        <TurnTransitionScreen
          playerName={turnTransitionPlayer.name}
          playerColor={turnTransitionPlayer.color}
          playerIcon={turnTransitionPlayer.icon}
          onComplete={() => {
            setShowTurnTransition(false);
            setTurnTransitionPlayer(null);
          }}
          duration={2000}
        />
      )}

      {showMilestoneAnimation && milestoneAnimation && (
        <MilestoneUnlockAnimation
          milestoneName={milestoneAnimation.name}
          onComplete={() => {
            setShowMilestoneAnimation(false);
            setMilestoneAnimation(null);
          }}
          duration={1800}
        />
      )}

      <div className="h-screen flex flex-col overflow-hidden relative" style={{
        background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 15%, #1a1a1a 30%, #2a2a2a 45%, #3a3a3a 60%, #4a4a4a 75%, #5a5a5a 90%, #6a6a6a 100%)'
      }}>
        {/* Header con news */}
      <header className="flex-shrink-0 px-4 py-4 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700/50 shadow-sm relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-gray-400 whitespace-nowrap">
              <span className="text-gray-500">📰</span>
              <span>NEWS</span>
            </div>
            <div className="flex items-center gap-4 flex-1 min-w-0 overflow-hidden">
              {headerNewsData[headerNewsIndex] && (
                <>
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(headerNewsData[headerNewsIndex].date).toLocaleDateString('it-IT', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm text-gray-300 font-medium truncate">
                      {headerNewsData[headerNewsIndex].title}
                    </span>
                    <span className="text-xs text-gray-500 truncate hidden sm:inline">
                      • {headerNewsData[headerNewsIndex].shortText}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap hidden md:inline">
                    {headerNewsData[headerNewsIndex].source}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-300">
              Turno: <span className="font-bold text-gray-100">{gameState.turn}</span>
            </div>
            {isProcessingAI && (
              <div className="bg-gray-800 border border-gray-600 rounded px-2 py-0.5 flex items-center gap-1.5">
                <Bot className="w-3 h-3 text-gray-300" />
                <p className="text-xs text-gray-300 font-semibold">
                  {currentPlayer?.name} sta giocando...
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Dashboard principale - layout a griglia senza scroll */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Colonna 1 - Board compatto (3 colonne) */}
        <div className="col-span-3 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl p-2 overflow-hidden shadow-2xl relative z-20">
          <div className="h-full overflow-hidden">
            <Board 
              technologies={
                mode === 'multiplayer' && isMaster
                  ? gameState.players.flatMap(p => p.technologies)
                  : (currentPlayer?.technologies || [])
              }
              players={gameState.players}
              currentPlayerId={gameState.currentPlayerId}
              voteResult={gameState.lastVoteResult || null}
              isVoting={mode === 'multiplayer' ? !!pendingVote : false}
              roomId={mode === 'multiplayer' ? roomId : null}
            />
          </div>
        </div>

        {/* Colonna 2 - Fase di gioco attiva (6 colonne) */}
        <div className="col-span-6 flex flex-col gap-2 overflow-hidden relative z-10">
          {/* Fase di gioco attiva - compatto */}
          <div className="flex-1 bg-gray-900/90 backdrop-blur-sm rounded-xl p-2 overflow-hidden shadow-lg border border-gray-700/50">
            <div className="h-full overflow-y-auto">
            
            {/* Mostra evento globale se presente */}
            {gameState.currentGlobalEvent && (
              <GlobalEventCard
                event={gameState.currentGlobalEvent}
                onDismiss={handleDismissGlobalEvent}
              />
            )}

            {/* Mostra news dalla società se presente */}
            {gameState.currentNews && (
              <NewsCard
                news={gameState.currentNews}
                onDismiss={handleDismissNews}
              />
            )}

            {/* Votazione in corso (multiplayer) - Mostrata a TUTTI i giocatori */}
            {mode === 'multiplayer' && pendingVote && (
              <DiscussionAndVotingPanel
                pendingVote={pendingVote}
                gameState={gameState}
                currentPlayer={currentPlayer}
                isMaster={isMaster}
                voteStatus={voteStatus}
                discussionPhase={discussionPhase}
                onVote={handleVote}
                onReadyToVote={(technologyId) => sendReadyToVote(technologyId)}
              />
            )}
            
            {/* Loading screen per votazione */}
            {showVoteLoading && (
              <div className="mb-2">
                <VoteLoadingScreen
                  onComplete={() => {
                    setShowVoteLoading(false);
                    if (pendingVoteResult) {
                      // Mostra il risultato dopo il loading
                      setGameState(prev => prev ? {
                        ...prev,
                        lastVoteResult: pendingVoteResult.voteResult,
                        lastVoteMessage: pendingVoteResult.message || null,
                      } : prev);
                      setPendingVoteResult(null);
                    }
                  }}
                  duration={2500}
                />
              </div>
            )}

            {/* Mostra risultato votazione dopo aver giocato una tecnologia */}
            {(() => {
              const shouldShowVoteResult = gameState.lastVoteResult !== null && !showVoteLoading;
              return shouldShowVoteResult && gameState.lastVoteResult ? (
                <div className="mb-2">
                  <VotingResult
                    voteResult={gameState.lastVoteResult}
                    players={gameState.players}
                    message={gameState.lastVoteMessage || undefined}
                  />
                </div>
              ) : null;
            })()}

            {/* Mostra notifica punti votanti */}
            {gameState.voterPointsInfo && gameState.voterPointsInfo.length > 0 && showVoterPointsNotification && (
              <VoterPointsNotification
                voterPoints={gameState.voterPointsInfo}
                players={gameState.players}
                onDismiss={() => {
                  setShowVoterPointsNotification(false);
                  // Reset voterPointsInfo nello stato dopo aver mostrato la notifica
                  setGameState(prev => prev ? { ...prev, voterPointsInfo: null } : prev);
                }}
                autoCloseDelay={5000}
              />
            )}
            
            {/* Development Phase - Solo per giocatore umano */}
            {gameState.currentPhase === 'development' && isHumanTurn && currentPlayer && currentPlayer.hand.length === 0 && (
              <div className="bg-gray-800 rounded-lg shadow-md p-3 border border-blue-700/30">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-gray-100">Sviluppo Politico</h2>
                  <button
                    onClick={handleDrawTechnology}
                    className="bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-semibold py-1 px-3 text-xs rounded transition-all duration-200 shadow-sm"
                  >
                    Nuova Proposta
                  </button>
                </div>
                <p className="text-xs text-gray-300">
                  Non hai proposte disponibili. Clicca su "Nuova Proposta" per presentare una nuova iniziativa legislativa.
                </p>
              </div>
            )}

            {/* Transizione Dilemma → Consequence */}
            {showDilemmaTransition && gameState.currentPhase === 'dilemma' && (
              <div className="mb-2">
                <DilemmaTransitionScreen
                  onComplete={() => {
                    setShowDilemmaTransition(false);
                  }}
                  duration={1200}
                />
              </div>
            )}

            {/* Dilemma Phase - In multiplayer, votazione collettiva; in single player, solo il giocatore corrente */}
            {gameState.currentPhase === 'dilemma' && gameState.currentDilemma && !showDilemmaTransition && (
              <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-lg shadow-md p-3 border border-gray-600">
                {/* In multiplayer, mostra info sulla votazione in corso */}
                {mode === 'multiplayer' && (pendingDilemmaVote || dilemmaDiscussionPhase) && (
                  <div className="mb-2 text-center bg-gray-800 rounded-lg p-2 shadow-sm border border-gray-600">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Scale className="w-4 h-4 text-amber-400" />
                      <p className="text-xs font-bold text-gray-200">
                        {dilemmaDiscussionPhase
                          ? 'I giocatori stanno discutendo il dilemma...'
                          : 'Votazione sul dilemma in corso...'}
                      </p>
                    </div>
                    {dilemmaVoteStatus && dilemmaVoteStatus.requiredVotes > 0 && !dilemmaDiscussionPhase && (
                      <div className="mt-1">
                        <p className="text-[10px] text-gray-400">
                          Voti: {dilemmaVoteStatus.totalVotes} / {dilemmaVoteStatus.requiredVotes}
                        </p>
                        <div className="mt-1 w-full bg-gray-700 rounded-full h-1">
                          <div
                            className="bg-amber-500 h-1 rounded-full transition-all duration-500"
                            style={{ width: `${(dilemmaVoteStatus.totalVotes / dilemmaVoteStatus.requiredVotes) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* In single player o quando non c'è votazione attiva */}
                {mode !== 'multiplayer' && !isHumanTurn && (
                  <div className="mb-2 text-center bg-gray-800 rounded-lg p-2 shadow-sm border border-gray-600">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <p className="text-xs font-bold text-gray-200">
                        {gameState.players.find(p => p.id === gameState.currentPlayerId)?.name || 'Un giocatore'} sta risolvendo un dilemma etico
                      </p>
                    </div>
                  </div>
                )}
                <DilemmaCard
                  dilemma={gameState.currentDilemma}
                  onSelectOption={isHumanTurn && mode !== 'multiplayer' ? handleResolveDilemma : () => {}}
                  activeJoker={gameState.activeJoker ?? undefined}
                  isInteractive={isHumanTurn && mode !== 'multiplayer'}
                  showOptions={true}
                  selectedOption={gameState.resolvedDilemmaOption ?? undefined}
                />
              </div>
            )}

            {/* Mostra il dilemma anche durante la fase consequence per vedere la scelta fatta */}
            {gameState.currentPhase === 'consequence' && gameState.currentDilemma && gameState.resolvedDilemmaOption && (
              <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-lg shadow-md p-3 border border-gray-600">
                <div className="mb-2 text-center bg-gray-800 rounded-lg p-2 shadow-sm border border-gray-600">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-bold text-gray-200">
                      Decisione presa da {gameState.players.find(p => p.id === gameState.currentPlayerId)?.name || 'il giocatore corrente'}
                    </p>
                  </div>
                </div>
                <DilemmaCard
                  dilemma={gameState.currentDilemma}
                  onSelectOption={() => {}} // Non interattivo durante consequence
                  activeJoker={gameState.activeJoker ?? undefined}
                  isInteractive={false}
                  showOptions={true} // Mostra sempre le opzioni durante consequence
                  selectedOption={gameState.resolvedDilemmaOption ?? undefined}
                />
              </div>
            )}

            {/* Consequence Phase - Mostrato a tutti, ma solo il giocatore corrente può continuare */}
            {gameState.currentPhase === 'consequence' && gameState.currentConsequence && (
              <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-lg shadow-md p-3 border border-gray-600">
                {!isHumanTurn && (
                  <div className="mb-2 text-center bg-gray-800 rounded-lg p-2 shadow-sm border border-gray-600">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <p className="text-xs font-bold text-gray-200">
                        Conseguenza per {gameState.players.find(p => p.id === gameState.currentPlayerId)?.name || 'il giocatore corrente'}
                      </p>
                    </div>
                  </div>
                )}
                <ConsequenceCard
                  consequence={gameState.currentConsequence}
                  onContinue={isHumanTurn ? handleCompleteConsequence : () => {}}
                  isInteractive={isHumanTurn ?? false}
                />
              </div>
            )}

            {/* Mostra messaggio durante turno di altri giocatori */}
            {!isHumanTurn && gameState.currentPhase !== 'dilemma' && gameState.currentPhase !== 'consequence' && (
              <div className="bg-gray-800 rounded-lg shadow-md p-4 text-center border border-gray-700">
                {mode === 'multiplayer' ? (
                  <>
                    {(() => {
                      const activePlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
                      const activeColor = activePlayer?.color || '#6B7280';
                      return (
                        <>
                          <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-gray-600" style={{ backgroundColor: activeColor + '33', borderColor: activeColor }}>
                            <Users className="w-5 h-5" style={{ color: activeColor }} />
                          </div>
                          <h2 className="text-sm font-bold text-gray-100 mb-1">
                            Turno di {activePlayer?.name || 'Altro Giocatore'}
                          </h2>
                          <p className="text-xs text-gray-400 mb-2">
                            {isMaster ? 'Osservando il gioco...' : 'Aspetta il tuo turno...'}
                          </p>
                          <div className="flex items-center justify-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                            <span className="text-xs text-gray-500">Turno {gameState.turn}</span>
                          </div>
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    <Bot className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <h2 className="text-sm font-bold text-gray-100 mb-1">
                      Turno di {currentPlayer?.name}
                    </h2>
                    <p className="text-xs text-gray-400">
                      {currentPlayer?.name} sta valutando le proprie strategie politiche...
                    </p>
                  </>
                )}
              </div>
            )}
            </div>
          </div>

          {/* Carte in mano - Solo per giocatore umano - compatto */}
          {isHumanTurn && currentPlayer && currentPlayer.hand.length > 0 && (
            <div className="flex-shrink-0 bg-gray-900/90 backdrop-blur-sm rounded-xl p-2 border border-gray-700/50 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-blue-400" />
                  <h3 className="text-xs font-bold text-gray-100">
                    Proposte di Legge
                  </h3>
                  <span className="bg-blue-600/80 text-white font-bold px-1.5 py-0.5 rounded text-xs">
                    {currentPlayer.hand.length}
                  </span>
                </div>
                <button
                  onClick={handleDrawTechnology}
                  className="bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-semibold py-1 px-2 text-xs rounded transition-all duration-200 shadow-sm"
                >
                  + Nuova
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {currentPlayer.hand.map((tech) => (
                  <div key={tech.id} className="transform hover:scale-105 transition-transform duration-200">
                    <TechnologyCard
                      technology={tech}
                      onSelect={handleAddTechnology}
                      isSelectable={true}
                      isInHand={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonna 3 - Giocatori e info (3 colonne) */}
        <div className="col-span-3 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl p-2 flex flex-col overflow-hidden shadow-2xl relative z-20">
          <div className="flex-1 overflow-y-auto">
            <PlayersList
              players={gameState.players}
              currentPlayerId={gameState.currentPlayerId}
              winnerId={gameState.winnerId}
              disconnectedPlayerIds={roomInfo?.disconnectedPlayers?.map(dp => dp.id) || []}
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
