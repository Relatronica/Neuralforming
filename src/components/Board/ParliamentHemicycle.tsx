import React, { useEffect, useRef } from 'react';
import { PlayerState } from '../../game/types';
import * as d3 from 'd3';
// @ts-ignore - d3-parliament-chart non ha types ufficiali
import { parliamentChart } from 'd3-parliament-chart';
import { getPartyColor } from '../../game/partyColors';
import { Bot, User } from 'lucide-react';

interface ParliamentHemicycleProps {
  players: PlayerState[];
  currentPlayerId: string;
}

export const ParliamentHemicycle: React.FC<ParliamentHemicycleProps> = ({ 
  players, 
  currentPlayerId 
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
    return Math.floor(totalScore / 2); // Ogni 2 punti = 1 seggio (più seggi per partito)
  };

  // Numero totale di seggi nel parlamento (fisso)
  // Aumentato significativamente per riempire completamente il semicerchio senza zone vuote
  const totalParliamentSeats = 800;

  // Prepara i dati per d3-parliament-chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Pulisci il contenuto precedente
    d3.select(svgRef.current).selectAll('*').remove();

    // Calcola seggi occupati
    const occupiedSeats = playersWithColors.reduce((sum, player) => {
      return sum + calculateSeats(player);
    }, 0);

    // Prepara dati aggregati per d3-parliament-chart
    const aggregatedData: Array<{ seats: number; color: string; playerId?: string }> = [];

    // Aggiungi seggi per ogni partito
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

    // Aggiungi seggi vuoti (grigi scuri per dark mode)
    const emptySeats = totalParliamentSeats - occupiedSeats;
    if (emptySeats > 0) {
      aggregatedData.push({ 
        seats: emptySeats, 
        color: '#374151' // gray-700 per dark mode
      });
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

    // Aggiungi interattività: evidenzia i seggi del giocatore corrente
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

  }, [players, currentPlayerId, playersWithColors]);

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

      {/* Legenda partiti */}
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
    </div>
  );
};
