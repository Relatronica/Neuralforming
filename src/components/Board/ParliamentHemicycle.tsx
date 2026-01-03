import React, { useEffect, useRef } from 'react';
import { PlayerState, VoteResult } from '../../game/types';
import * as d3 from 'd3';
// @ts-ignore - d3-parliament-chart non ha types ufficiali
import { parliamentChart } from 'd3-parliament-chart';
import { getPartyColor } from '../../game/partyColors';
import { Bot, User } from 'lucide-react';

interface ParliamentHemicycleProps {
  players: PlayerState[];
  currentPlayerId: string;
  mode?: 'composition' | 'vote' | undefined;
  voteResult?: VoteResult | null;
}

export const ParliamentHemicycle: React.FC<ParliamentHemicycleProps> = ({
  players,
  currentPlayerId,
  mode,
  voteResult = null,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Assegna colori ai partiti usando la funzione condivisa
  const playersWithColors = players.map(player => ({
    ...player,
    color: getPartyColor(player.id, player.color)
  }));

  // Calcola il numero di "seggi" per ogni partito basato sui punteggi
  const calculateSeats = (player: PlayerState): number => {
    const totalScore = player.neuralformingPoints + player.ethicsPoints;
    // Ridotto ulteriormente il divisore per avere molti più seggi e riempire le zone vuote
    // Assegna almeno 1 seggio per garantire visibilità a tutti i giocatori
    return Math.max(1, Math.floor(totalScore / 2)); // Ogni 2 punti = 1 seggio (minimo 1)
  };

  // Numero totale di seggi nel parlamento (fisso)
  // Aumentato significativamente per riempire completamente il semicerchio senza zone vuote
  const totalParliamentSeats = 800;

  // Prepara i dati per d3-parliament-chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Pulisci il contenuto precedente
    d3.select(svgRef.current).selectAll('*').remove();

    // Calcola seggi occupati per modalità "composition"
    const occupiedSeats = playersWithColors.reduce((sum, player) => {
      return sum + calculateSeats(player);
    }, 0);

    // Prepara dati aggregati per d3-parliament-chart
    const aggregatedData: Array<{ seats: number; color: string; playerId?: string }> = [];

    if (mode === 'composition') {
      // Aggiungi seggi per ogni partito basati sui punteggi
      playersWithColors.forEach(player => {
        const seats = calculateSeats(player);
        if (seats > 0) {
          aggregatedData.push({
            seats,
            color: player.color,
            playerId: player.id
          });
        }
      });
    } else if (voteResult) {
      // Modalità "vote": ripartisci i seggi tra vincitori e sconfitti
      const approval = voteResult.approvalRate; // 0..1
      const isApproved = approval >= 0.5;
      const winnersIds = isApproved ? voteResult.supporters : voteResult.opponents;
      let losersIds = isApproved ? voteResult.opponents : voteResult.supporters;

      // Includi eventuali astenuti nel gruppo perdente per garantire visibilità a tutti
      const allIds = new Set(playersWithColors.map(p => p.id));
      const knownIds = new Set([...winnersIds, ...losersIds]);
      const abstainers = [...allIds].filter(id => !knownIds.has(id));
      if (abstainers.length > 0) {
        losersIds = [...losersIds, ...abstainers];
      }

      const winners = playersWithColors.filter(p => winnersIds.includes(p.id));
      const losers = playersWithColors.filter(p => losersIds.includes(p.id));

      const winnersSeatsTotal = Math.round(totalParliamentSeats * (isApproved ? approval : (1 - approval)));
      const losersSeatsTotal = Math.max(0, totalParliamentSeats - winnersSeatsTotal);

      const distributeSeatsEqually = (count: number, group: typeof playersWithColors) => {
        const map = new Map<string, number>();

        if (group.length === 0 || count <= 0) {
          group.forEach(p => map.set(p.id, 0));
          return map;
        }

        if (count >= group.length) {
          // Assegna almeno 1 seggio a ciascuno, poi distribuisci il resto equamente
          const baseSeats = Math.floor(count / group.length);
          const remainder = count % group.length;

          group.forEach((p, idx) => {
            const seats = baseSeats + (idx < remainder ? 1 : 0);
            map.set(p.id, seats);
          });
        } else {
          // Se i seggi sono meno dei membri, assegna 1 ai primi "count" e 0 agli altri
          group.forEach((p, idx) => {
            map.set(p.id, idx < count ? 1 : 0);
          });
        }

        return map;
      };

      const winnersSeatsMap = distributeSeatsEqually(winnersSeatsTotal, winners);
      const losersSeatsMap = distributeSeatsEqually(losersSeatsTotal, losers);

      winners.forEach(player => {
        const seats = winnersSeatsMap.get(player.id) || 0;
        if (seats > 0) {
          aggregatedData.push({
            seats,
            color: player.color,
            playerId: player.id,
          });
        }
      });
      losers.forEach(player => {
        const seats = losersSeatsMap.get(player.id) || 0;
        if (seats > 0) {
          aggregatedData.push({
            seats,
            color: player.color,
            playerId: player.id,
          });
        }
      });
    } else {
      // Visualizzazione di default: tutti i seggi sono vuoti (non assegnati)
      aggregatedData.push({
        seats: totalParliamentSeats,
        color: '#374151' // gray-700 per dark mode
      });
    }

    // Aggiungi seggi vuoti (grigi scuri per dark mode) solo in modalità "composition"
    if (mode === 'composition') {
      const emptySeats = totalParliamentSeats - occupiedSeats;
      if (emptySeats > 0) {
        aggregatedData.push({
          seats: emptySeats,
          color: '#374151' // gray-700 per dark mode
        });
      }
    }

    // Ottieni dimensioni del container
    const containerWidth = containerRef.current.clientWidth || 400;
    const containerHeight = containerRef.current.clientHeight || 450;
    // d3-parliament-chart usa width per calcolare l'altezza (metà della larghezza)
    const chartWidth = containerWidth;

    // Crea array di seggi individuali per tracciare i seggi del giocatore corrente
    const seatData: Array<{ color: string; playerId?: string }> = [];
    aggregatedData.forEach(item => {
      for (let i = 0; i < item.seats; i++) {
        seatData.push({ 
          color: item.color,
          playerId: item.playerId 
        });
      }
    });

    // Crea SVG se non esiste
    let svg = d3.select(svgRef.current);
    if (svg.empty()) {
      svg = d3.select(containerRef.current)
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeight);
    }

    // Aggiorna dimensioni SVG
    svg
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Pulisci il contenuto precedente
    svg.selectAll('*').remove();

    // Crea un gruppo per il chart
    // d3-parliament-chart posiziona il semicerchio con il centro a (graphicHeight, graphicHeight)
    // dove graphicHeight = width/2. Il semicerchio si estende da (0,0) a (width, width/2)
    // Dobbiamo centrare sia orizzontalmente che verticalmente nel container
    const chartHeight = chartWidth / 2; // Altezza del semicerchio calcolata dalla libreria
    const horizontalOffset = (containerWidth - chartWidth) / 2; // Centra orizzontalmente
    const verticalOffset = (containerHeight - chartHeight) / 2; // Centra verticalmente
    const g = svg.append('g')
      .attr('transform', `translate(${horizontalOffset}, ${verticalOffset})`); // Centra sia orizzontalmente che verticalmente

    // Crea il chart usando d3-parliament-chart
    const chart = parliamentChart(seatData, chartWidth);
    
    // Configura il chart
    // Parametri ottimizzati per evitare organizzazione radiale e mantenere distribuzione uniforme
    chart
      .sections(20) // Numero di righe/sezioni (ridotto per evitare organizzazione radiale)
      .sectionGap(4) // Gap tra sezioni (aumentato per distribuzione più uniforme lungo gli archi)
      .seatRadius(3.5) // Raggio dei seggi (bilanciato per evitare sovrapposizioni)
      .rowHeight(8); // Altezza delle righe (bilanciato per distribuzione uniforme)

    // Chiama il chart sul gruppo usando .call()
    g.call(chart);

    // Aggiungi interattività: evidenzia i seggi del giocatore corrente solo quando non c'è votazione
    if (!voteResult) {
      setTimeout(() => {
        g.selectAll('circle')
          .each(function(_d: any, i: number) {
            const seat = seatData[i];
            if (seat && seat.playerId === currentPlayerId) {
              d3.select(this)
                .attr('stroke', '#fbbf24')
                .attr('stroke-width', '2')
                .attr('r', 5); // Leggermente più grande
            }
          });
      }, 0);
    }

  }, [players, currentPlayerId, playersWithColors, mode, voteResult]);

  // Raggruppa seggi per partito per la legenda
  const seatsByParty = playersWithColors.map(player => ({
    player,
    seats: calculateSeats(player),
    color: getPartyColor(player.id)
  })).sort((a, b) => b.seats - a.seats);

  const occupiedSeats = seatsByParty.reduce((sum, { seats }) => sum + seats, 0);

  return (
    <div className="space-y-4">
      {/* Emiciclo con seggi */}
      <div 
        ref={containerRef}
        className="relative w-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden"
        style={{ minHeight: '330px', height: '330px' }}
      >
        <svg 
          ref={svgRef}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      {/* Legenda */}
      {mode === 'composition' ? (
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-gray-100">Composizione Parlamentare</h4>
            <span className="text-[10px] text-gray-400">
              {occupiedSeats}/{totalParliamentSeats} seggi occupati
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {seatsByParty.map(({ player, seats, color }) => {
              const isCurrent = player.id === currentPlayerId;
              return (
                <div
                  key={player.id}
                  className={`
                    flex items-center gap-2 p-1.5 rounded text-xs border
                    ${isCurrent ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-gray-700'}
                  `}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 border-gray-700 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex items-center gap-1.5 font-semibold text-gray-100 flex-1">
                    {player.isAI ? (
                      <Bot className="w-3 h-3" />
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                    <span>{player.name}</span>
                  </div>
                  <span className="text-gray-300 font-bold">{seats}</span>
                  {isCurrent && (
                    <span className="text-[10px] bg-gray-600 text-gray-100 px-1.5 py-0.5 rounded font-bold">
                      TU
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : voteResult ? (
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-gray-100">Esito Votazione</h4>
            <span className="text-[10px] text-gray-400">
              {Math.round((voteResult.approvalRate || 0) * 100)}% favorevoli
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {playersWithColors
              .filter(p => voteResult.supporters.includes(p.id))
              .map(player => {
                const isCurrent = player.id === currentPlayerId;
                return (
                  <div
                    key={player.id}
                    className={`
                      flex items-center gap-2 p-1.5 rounded text-xs border
                      ${isCurrent ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-gray-700'}
                    `}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 border-gray-700 shadow-sm"
                      style={{ backgroundColor: player.color }}
                    />
                    <div className="flex items-center gap-1.5 font-semibold text-gray-100 flex-1">
                      {player.isAI ? (
                        <Bot className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      <span>{player.name}</span>
                    </div>
                    <span className="text-gray-300">Sì</span>
                  </div>
                );
              })}
            {playersWithColors
              .filter(p => voteResult.opponents.includes(p.id))
              .map(player => {
                const isCurrent = player.id === currentPlayerId;
                return (
                  <div
                    key={player.id}
                    className={`
                      flex items-center gap-2 p-1.5 rounded text-xs border
                      ${isCurrent ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-gray-700'}
                    `}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 border-gray-700 shadow-sm"
                      style={{ backgroundColor: player.color }}
                    />
                    <div className="flex items-center gap-1.5 font-semibold text-gray-100 flex-1">
                      {player.isAI ? (
                        <Bot className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      <span>{player.name}</span>
                    </div>
                    <span className="text-gray-300">No</span>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-gray-100">Emiciclo Parlamentare</h4>
            <span className="text-[10px] text-gray-400">
              {totalParliamentSeats} seggi disponibili
            </span>
          </div>
          <div className="text-center text-gray-400 text-xs py-4">
            I seggi non sono ancora stati assegnati
          </div>
        </div>
      )}
    </div>
  );
};
