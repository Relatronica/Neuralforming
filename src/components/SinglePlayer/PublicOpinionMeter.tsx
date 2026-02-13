import React, { useEffect, useState } from 'react';
import { PublicOpinionState, OpinionReactionResult } from '../../game/singlePlayerTypes';
import { PublicOpinion } from '../../game/PublicOpinion';
import { TrendingUp, TrendingDown, Minus, Users, AlertTriangle, Clock } from 'lucide-react';

interface PublicOpinionMeterProps {
  opinion: PublicOpinionState;
  reaction?: OpinionReactionResult | null;
  showDetails?: boolean;
}

export const PublicOpinionMeter: React.FC<PublicOpinionMeterProps> = ({ 
  opinion, 
  reaction,
  showDetails = true,
}) => {
  const [displayValue, setDisplayValue] = useState(opinion.value);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animazione smooth del valore
  useEffect(() => {
    if (displayValue === opinion.value) return;
    
    setIsAnimating(true);
    const step = opinion.value > displayValue ? 1 : -1;
    const interval = setInterval(() => {
      setDisplayValue(prev => {
        const next = prev + step;
        if ((step > 0 && next >= opinion.value) || (step < 0 && next <= opinion.value)) {
          clearInterval(interval);
          setIsAnimating(false);
          return opinion.value;
        }
        return next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [opinion.value]); // eslint-disable-line react-hooks/exhaustive-deps

  const band = PublicOpinion.getOpinionBand(displayValue);
  
  const getBandColor = () => {
    switch (band) {
      case 'high':    return { bar: 'bg-emerald-500', text: 'text-emerald-400', bg: 'from-emerald-900/30 to-emerald-800/10' };
      case 'neutral': return { bar: 'bg-blue-500',    text: 'text-blue-400',    bg: 'from-blue-900/30 to-blue-800/10' };
      case 'low':     return { bar: 'bg-amber-500',   text: 'text-amber-400',   bg: 'from-amber-900/30 to-amber-800/10' };
      case 'crisis':  return { bar: 'bg-red-500',     text: 'text-red-400',     bg: 'from-red-900/30 to-red-800/10' };
    }
  };

  const getBandLabel = () => {
    switch (band) {
      case 'high':    return 'Consenso Alto';
      case 'neutral': return 'Stabile';
      case 'low':     return 'Consenso Basso';
      case 'crisis':  return 'CRISI';
    }
  };

  const getTrendIcon = () => {
    switch (opinion.trend) {
      case 'rising':  return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
      case 'falling': return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
      case 'stable':  return <Minus className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const colors = getBandColor();

  return (
    <div className={`rounded-lg border border-gray-700 bg-gradient-to-br ${colors.bg} p-3`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Users className={`w-4 h-4 ${colors.text}`} />
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
            Opinione Pubblica
          </span>
        </div>
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          <span className={`text-xs font-medium ${colors.text}`}>
            {getBandLabel()}
          </span>
        </div>
      </div>

      {/* Barra principale */}
      <div className="relative mb-2">
        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
          <div
            className={`h-full ${colors.bar} rounded-full transition-all duration-500 ease-out relative`}
            style={{ width: `${displayValue}%` }}
          >
            {/* Effetto glow quando animating */}
            {isAnimating && (
              <div className={`absolute inset-0 ${colors.bar} opacity-50 animate-pulse rounded-full`} />
            )}
          </div>
        </div>
        
        {/* Markers per le fasce */}
        <div className="absolute top-0 left-0 w-full h-4 pointer-events-none">
          <div className="absolute left-[20%] top-0 h-full border-l border-gray-500 opacity-40" />
          <div className="absolute left-[40%] top-0 h-full border-l border-gray-500 opacity-40" />
          <div className="absolute left-[70%] top-0 h-full border-l border-gray-500 opacity-40" />
        </div>

        {/* Valore numerico */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-[10px] font-bold ${displayValue > 50 ? 'text-white' : 'text-gray-300'} drop-shadow-md`}>
            {displayValue}%
          </span>
        </div>
      </div>

      {/* Legenda fasce */}
      <div className="flex justify-between text-[9px] text-gray-500 mb-2">
        <span>Crisi</span>
        <span>Basso</span>
        <span>Stabile</span>
        <span>Alto</span>
      </div>

      {/* Reazione corrente */}
      {reaction && (
        <div className={`mt-2 p-2 rounded-md border ${
          reaction.change > 0 
            ? 'border-emerald-800 bg-emerald-900/20' 
            : reaction.change < 0 
              ? 'border-red-800 bg-red-900/20'
              : 'border-gray-700 bg-gray-800/50'
        }`}>
          <p className="text-xs text-gray-300 leading-relaxed">
            {reaction.message}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-bold ${
              reaction.change > 0 ? 'text-emerald-400' : reaction.change < 0 ? 'text-red-400' : 'text-gray-400'
            }`}>
              {reaction.change > 0 ? '+' : ''}{reaction.change}
            </span>
            {reaction.effectivenessMultiplier !== 1.0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                reaction.effectivenessMultiplier > 1 
                  ? 'bg-emerald-900/40 text-emerald-400' 
                  : 'bg-red-900/40 text-red-400'
              }`}>
                Efficacia: {Math.round(reaction.effectivenessMultiplier * 100)}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* Modificatori attivi */}
      {showDetails && opinion.modifiers.length > 0 && (
        <div className="mt-2 space-y-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
            Effetti attivi
          </span>
          {opinion.modifiers.map((mod, idx) => (
            <div key={idx} className="flex items-center justify-between text-[10px] px-2 py-1 bg-gray-800/60 rounded">
              <span className="text-gray-400 truncate mr-2">{mod.source}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={mod.amount > 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {mod.amount > 0 ? '+' : ''}{mod.amount}
                </span>
                <div className="flex items-center gap-0.5 text-gray-500">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{mod.turnsRemaining}t</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warning se in crisi */}
      {band === 'crisis' && (
        <div className="mt-2 flex items-center gap-1.5 p-2 bg-red-900/30 border border-red-800 rounded-md">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span className="text-[10px] text-red-300">
            {opinion.consecutiveLowTurns >= 2 
              ? `PERICOLO: Il governo cadrà tra ${3 - opinion.consecutiveLowTurns} turno/i!`
              : 'Attenzione: opinione pubblica in crisi. Rischi il game over!'
            }
          </span>
        </div>
      )}
    </div>
  );
};
