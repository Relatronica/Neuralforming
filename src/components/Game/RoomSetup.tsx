import React, { useState, useEffect } from 'react';
import { useGameSocketContext } from '../../contexts/GameSocketContext';
import { RoomInfo } from '../../hooks/useGameSocket';
import { Users, Play, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { buildPlayerJoinUrl } from '../../utils/deeplink';

interface RoomSetupProps {
  onGameStart: (roomId: string) => void;
}

const PARTY_COLORS = [
  { name: 'Blu', value: '#3B82F6' },
  { name: 'Rosso', value: '#EF4444' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Giallo', value: '#F59E0B' },
  { name: 'Viola', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Arancione', value: '#F97316' },
  { name: 'Ciano', value: '#06B6D4' },
];

export const RoomSetup: React.FC<RoomSetupProps> = ({ onGameStart }) => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState(PARTY_COLORS[0].value);
  const [isMaster, setIsMaster] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Connetti sempre (anche senza roomId per creare room)
  const socketContext = useGameSocketContext(); // Usa il context invece di creare una nuova istanza
  
  const {
    isConnected,
    roomInfo,
    createRoom,
    startGame,
    error,
    socket,
  } = socketContext || {
    isConnected: false,
    roomInfo: null,
    createRoom: () => {},
    startGame: () => {},
    error: null,
    socket: null,
  };

  // Ascolta la creazione della room
  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = (data: { roomId: string }) => {
      setRoomId(data.roomId);
      setIsMaster(true);
    };

    socket.on('roomCreated', handleRoomCreated);

    return () => {
      socket.off('roomCreated', handleRoomCreated);
    };
  }, [socket]);

  // Ascolta quando il gioco inizia (per tutti i giocatori, non solo master)
  useEffect(() => {
    if (!socket) return;

    const handleGameStarted = (data: { roomId: string }) => {
      // Se riceviamo questo evento, significa che siamo nella room (Socket.io invia solo agli utenti nella room)
      // Usa il roomId dall'evento o da roomInfo (che dovrebbe essere sempre sincronizzato)
      const targetRoomId = data.roomId || roomInfo?.roomId || roomId || roomIdInput;
      
      if (targetRoomId) {
        // Piccolo delay per assicurarsi che tutto sia sincronizzato
        setTimeout(() => {
          onGameStart(targetRoomId);
        }, 100);
      }
    };

    socket.on('gameStarted', handleGameStarted);

    return () => {
      socket.off('gameStarted', handleGameStarted);
    };
  }, [socket, roomId, roomIdInput, roomInfo, onGameStart]);

  // Aggiorna roomId quando roomInfo cambia
  useEffect(() => {
    if (roomInfo && roomInfo.roomId) {
      // Aggiorna sempre roomId se roomInfo ha un roomId (anche se già impostato)
      // Questo assicura che i giocatori non-master abbiano il roomId corretto
      if (!roomId || roomId !== roomInfo.roomId) {
        setRoomId(roomInfo.roomId);
      }
    }
  }, [roomInfo, roomId]);

  const handleCreateRoom = () => {
    if (!isConnected) return;
    // Il master NON ha bisogno di nome e colore (non è un giocatore)
    if (socket) {
      socket.emit('createRoom', {}); // Non inviare nome/colore
    } else {
      createRoom();
    }
  };

  const handleJoinRoom = () => {
    if (!roomIdInput.trim()) {
      alert('Inserisci l\'ID della partita');
      return;
    }
    if (!playerName.trim()) {
      alert('Inserisci il nome del partito');
      return;
    }
    setRoomId(roomIdInput.trim());
    // joinRoom verrà chiamato quando roomId è impostato
  };

  // Quando roomId viene impostato, unisciti alla room (solo se non sei master)
  useEffect(() => {
    // Se siamo master, non dobbiamo fare join (siamo già nella room)
    if (isMaster) {
      return;
    }
    
    // Se abbiamo roomId, siamo connessi, abbiamo socket e nome, facciamo join
    // Ma solo se non siamo già nella lista dei giocatori
    const alreadyJoined = roomInfo?.players.some((p: RoomInfo['players'][0]) => p.name === playerName.trim());
    if (alreadyJoined) {
      return;
    }
    
    if (roomId && isConnected && socket && playerName.trim()) {
      const trimmedName = playerName.trim();
      socket.emit('joinRoom', { roomId, playerName: trimmedName, playerColor });
    }
  }, [roomId, isConnected, socket, playerName, playerColor, isMaster, roomInfo]);

  const handleStartGame = () => {
    if (!isMaster) return;
    
    if (roomInfo && roomInfo.players.length < 2) {
      alert('Devi avere almeno 2 giocatori per iniziare!');
      return;
    }
    if (!roomInfo || roomInfo.players.length === 0) {
      alert('Nessun giocatore nella room!');
      return;
    }
    
    if (!roomId) {
      alert('Errore: ID partita non disponibile');
      return;
    }
    
    startGame();
    
    // Aspetta un attimo per assicurarsi che il server abbia processato startGame
    // Il master naviga subito, gli altri riceveranno l'evento gameStarted
    setTimeout(() => {
      onGameStart(roomId);
    }, 200);
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const joinUrl = roomId ? buildPlayerJoinUrl(roomId) : '';
  const copyJoinUrl = () => {
    if (joinUrl) {
      navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const canStart = isMaster && roomInfo && roomInfo.players.length >= 2 && !roomInfo.isGameStarted;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl p-8 max-w-2xl w-full border border-gray-700">
        <h1 className="text-3xl font-bold text-gray-100 mb-6 text-center">Neuralforming - Setup Partita</h1>

        {!isConnected && !error && (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
            <p className="text-gray-300">Connessione al server in corso...</p>
            <p className="text-xs text-gray-400 mt-2">
              Assicurati che il server sia avviato su {import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
            <p className="text-gray-200 font-semibold">Errore di connessione</p>
            <p className="text-gray-300 text-sm mt-1">{error}</p>
            <p className="text-xs text-gray-400 mt-2">
              Verifica che il server sia avviato: <code className="bg-gray-700 px-1 rounded text-gray-300">cd server && npm run dev</code>
            </p>
          </div>
        )}

        {!roomId ? (
          <div className="space-y-6">
            {/* Il master NON ha bisogno di nome e colore (non è un giocatore) */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
              <p className="text-sm text-gray-200">
                <strong className="text-gray-100">Sei il Master della partita.</strong> Il master non è un giocatore, ma gestisce la partita e vede tutto lo stato del gioco.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">oppure</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ID Partita (per unirsi)
                </label>
                <input
                  type="text"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  placeholder="Incolla l'ID della partita"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent font-mono text-sm text-gray-100 placeholder-gray-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCreateRoom}
                disabled={!isConnected}
                className="flex-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Crea Partita
              </button>
              <button
                onClick={handleJoinRoom}
                disabled={!isConnected || !roomIdInput.trim() || !playerName.trim()}
                className="flex-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Unisciti
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Room ID */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ID Partita (condividi con gli altri giocatori)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomId}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 font-mono text-sm text-gray-100"
                />
                <button
                  onClick={copyRoomId}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2 text-gray-100"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Gli altri giocatori possono unirsi usando questo ID
              </p>
            </div>

            {/* QR Join */}
            <div className="border-t border-gray-700 pt-4">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Inquadra per entrare nella PWA giocatore
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  {joinUrl && (
                    <QRCodeSVG
                      value={joinUrl}
                      size={200}
                      bgColor="#1f2937"
                      fgColor="#e5e7eb"
                      includeMargin={true}
                    />
                  )}
                </div>
                <div className="flex-1 w-full">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={joinUrl}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 font-mono text-sm text-gray-100"
                    />
                    <button
                      onClick={copyJoinUrl}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2 text-gray-100"
                    >
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Link diretto alla PWA giocatore con l'ID già compilato
                  </p>
                </div>
              </div>
            </div>

            {/* Join form (se non master e non ancora unito) */}
            {!isMaster && !roomInfo?.players.some((p: RoomInfo['players'][0]) => p.name === playerName.trim()) && (
              <div className="space-y-4 border-t border-gray-700 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome del Partito
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Es: Partito Democratico"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                    maxLength={30}
                    disabled={!!roomInfo?.players.some((p: RoomInfo['players'][0]) => p.name === playerName.trim())}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Colore del Partito
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PARTY_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setPlayerColor(color.value)}
                        className={`h-12 rounded-lg border-2 transition-all ${
                          playerColor === color.value
                            ? 'border-gray-400 scale-110'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                        disabled={!!roomInfo?.players.some((p: RoomInfo['players'][0]) => p.name === playerName.trim())}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleJoinRoom}
                  disabled={!playerName.trim() || !!roomInfo?.players.some((p: RoomInfo['players'][0]) => p.name === playerName.trim())}
                  className="w-full bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  {roomInfo?.players.some((p: RoomInfo['players'][0]) => p.name === playerName.trim()) ? 'Già Unito' : 'Unisciti alla Partita'}
                </button>
              </div>
            )}

            {/* Messaggio se già unito */}
            {!isMaster && roomInfo?.players.some((p: RoomInfo['players'][0]) => p.name === playerName.trim()) && (
              <div className="border-t border-gray-700 pt-4">
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                  <p className="text-gray-200 font-semibold">✓ Ti sei unito alla partita!</p>
                  <p className="text-sm text-gray-300 mt-1">Aspetta che il master avvii il gioco...</p>
                </div>
              </div>
            )}

            {/* Players list */}
            {roomInfo && (
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-100">
                    Giocatori ({roomInfo.players.length}/{roomInfo.maxPlayers})
                  </h2>
                </div>
                <div className="space-y-2">
                  {roomInfo.players.map((player: RoomInfo['players'][0]) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      <div
                        className="w-8 h-8 rounded-full border-2 border-gray-700"
                        style={{ backgroundColor: player.color }}
                      />
                      <span className="flex-1 font-medium text-gray-100">{player.name}</span>
                      {player.isMaster && (
                        <span className="text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded">
                          Master
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Start game button (solo master) */}
            {isMaster && canStart && (
              <button
                onClick={handleStartGame}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Inizia Partita
              </button>
            )}

            {isMaster && roomInfo && roomInfo.players.length < 2 && (
              <p className="text-sm text-gray-400 text-center">
                Aspetta almeno 2 giocatori per iniziare
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

