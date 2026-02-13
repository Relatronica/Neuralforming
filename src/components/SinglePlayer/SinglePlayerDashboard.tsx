import React from 'react';
import { SinglePlayerState, DecisionHistoryEntry } from '../../game/singlePlayerTypes';
import { Scoring } from '../../game/Scoring';
import { Objectives } from '../../game/Objectives';
import { milestones } from '../../game/Milestones';
import { DifficultyManager } from '../../game/DifficultyManager';
import { PublicOpinionMeter } from './PublicOpinionMeter';
import { 
  Brain, 
  Microscope, 
  Scale, 
  Trophy, 
  Target, 
  Award, 
  History,
  TrendingUp,
  TrendingDown,
  Gauge,
  Zap,
} from 'lucide-react';

interface SinglePlayerDashboardProps {
  state: SinglePlayerState;
}

export const SinglePlayerDashboard: React.FC<SinglePlayerDashboardProps> = ({ state }) => {
  const { player, publicOpinion, lastOpinionReaction, difficulty, turn, decisionHistory } = state;
  
  const balance = Scoring.calculateBalance(player);
  const objective = player.objectiveId ? Objectives.getObjectiveById(player.objectiveId) : null;
  const objectiveProgress = player.objectiveId 
    ? Objectives.getObjectiveProgressDetails(player, player.objectiveId)
    : null;
  
  const difficultyInfo = DifficultyManager.getDifficultyInfo(difficulty);
  
  // Ultimi 4 record dalla storia
  const recentHistory = decisionHistory.slice(-4).reverse();

  // Milestone sbloccati dal giocatore
  const unlockedMilestones = milestones.filter(m => 
    player.unlockedMilestones.includes(m.id)
  );

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
      
      {/* Turno e Difficoltà */}
      <div className="flex items-center justify-between bg-gray-800 rounded-lg p-2.5 border border-gray-700">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">
            Turno <span className="font-bold text-white">{turn}</span>
            <span className="text-gray-500"> / 15</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className={`w-3.5 h-3.5 ${difficultyInfo.color}`} />
          <span className={`text-xs font-semibold ${difficultyInfo.color}`}>
            {difficultyInfo.label}
          </span>
        </div>
      </div>

      {/* Opinione Pubblica */}
      <PublicOpinionMeter 
        opinion={publicOpinion} 
        reaction={lastOpinionReaction}
      />

      {/* Stats del giocatore */}
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">
          Punteggi
        </h3>
        
        <div className="space-y-2">
          {/* Tech Points */}
          <StatBar 
            icon={<Microscope className="w-3.5 h-3.5 text-cyan-400" />}
            label="Tecnologia"
            value={player.techPoints}
            color="bg-cyan-500"
          />
          
          {/* Ethics Points */}
          <StatBar 
            icon={<Scale className="w-3.5 h-3.5 text-violet-400" />}
            label="Etica"
            value={player.ethicsPoints}
            color="bg-violet-500"
          />
          
          {/* Neuralforming Points */}
          <StatBar 
            icon={<Brain className="w-3.5 h-3.5 text-amber-400" />}
            label="Neuralforming"
            value={player.neuralformingPoints}
            color="bg-amber-500"
          />
          
          {/* Balance */}
          <div className="flex items-center gap-2 pt-1 border-t border-gray-700">
            <Scale className="w-3 h-3 text-gray-500" />
            <span className="text-[10px] text-gray-500">Bilanciamento</span>
            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  balance >= 0.6 ? 'bg-emerald-500' : balance >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.round(balance * 100)}%` }}
              />
            </div>
            <span className={`text-[10px] font-mono ${
              balance >= 0.6 ? 'text-emerald-400' : balance >= 0.4 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {Math.round(balance * 100)}%
            </span>
          </div>

          {/* Tecnologie implementate */}
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <Zap className="w-3 h-3" />
            <span>Tecnologie implementate: <span className="text-gray-300 font-medium">{player.technologies.length}</span></span>
          </div>
        </div>
      </div>

      {/* Obiettivo */}
      {objective && objectiveProgress && (
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-1.5 mb-2">
            <Target className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Obiettivo
            </h3>
          </div>
          
          <p className="text-sm font-medium text-gray-200 mb-1">{objective.title}</p>
          <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">{objective.description}</p>
          
          {/* Barra progresso generale */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  objectiveProgress.completed ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${objectiveProgress.overallProgress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-gray-300">
              {objectiveProgress.overallProgress}%
            </span>
          </div>
          
          {/* Dettagli requisiti */}
          <div className="space-y-1">
            {objectiveProgress.details.map((detail, idx) => (
              <div key={idx} className="flex items-center justify-between text-[10px]">
                <span className="text-gray-500">{detail.requirement}</span>
                <span className={detail.progress >= 100 ? 'text-emerald-400' : 'text-gray-400'}>
                  {detail.current}/{detail.target}
                  {detail.progress >= 100 && ' ✓'}
                </span>
              </div>
            ))}
          </div>

          {/* Nota opinione pubblica */}
          {objectiveProgress.completed && publicOpinion.value < 40 && (
            <div className="mt-2 p-1.5 bg-amber-900/20 border border-amber-800 rounded text-[10px] text-amber-300">
              Obiettivo raggiunto! Ma l'opinione pubblica deve essere ≥40% per vincere.
            </div>
          )}
        </div>
      )}

      {/* Milestones */}
      {unlockedMilestones.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-1.5 mb-2">
            <Award className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Milestones
            </h3>
            <span className="text-[10px] text-gray-600 ml-auto">
              {unlockedMilestones.length}/{milestones.length}
            </span>
          </div>
          
          <div className="space-y-1.5">
            {unlockedMilestones.map(milestone => (
              <div key={milestone.id} className="flex items-start gap-2 p-1.5 bg-gray-700/50 rounded">
                <Trophy className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-medium text-gray-200">{milestone.name}</p>
                  <p className="text-[9px] text-gray-500">{milestone.ability.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Storico decisioni */}
      {recentHistory.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-1.5 mb-2">
            <History className="w-4 h-4 text-gray-400" />
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Ultime Decisioni
            </h3>
          </div>
          
          <div className="space-y-1.5">
            {recentHistory.map((entry, idx) => (
              <HistoryEntry key={idx} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// Sub-components
// ============================================================

const StatBar: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}> = ({ icon, label, value, color }) => {
  // Scala a un max ragionevole per la barra visiva
  const maxDisplay = 80;
  const percentage = Math.min(100, (value / maxDisplay) * 100);
  
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-[10px] text-gray-500 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-mono text-gray-300 w-6 text-right">{value}</span>
    </div>
  );
};

const HistoryEntry: React.FC<{ entry: DecisionHistoryEntry }> = ({ entry }) => {
  const isPositiveOpinion = entry.opinionChange > 0;
  const totalPoints = entry.pointsGained.techPoints + entry.pointsGained.ethicsPoints + entry.pointsGained.neuralformingPoints;
  const isPositivePoints = totalPoints > 0;
  
  return (
    <div className="flex items-center gap-2 text-[10px] py-1 border-b border-gray-700/50 last:border-0">
      <span className="text-gray-600 w-5 shrink-0">T{entry.turn}</span>
      <span className={`px-1 py-0.5 rounded text-[9px] shrink-0 ${
        entry.type === 'technology' ? 'bg-cyan-900/30 text-cyan-400' : 'bg-violet-900/30 text-violet-400'
      }`}>
        {entry.type === 'technology' ? 'TECH' : 'ETH'}
      </span>
      <span className="text-gray-400 truncate flex-1" title={entry.title}>
        {entry.title}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        {isPositiveOpinion 
          ? <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
          : entry.opinionChange < 0 
            ? <TrendingDown className="w-2.5 h-2.5 text-red-500" />
            : null
        }
        <span className={isPositivePoints ? 'text-emerald-400' : 'text-red-400'}>
          {isPositivePoints ? '+' : ''}{totalPoints}
        </span>
      </div>
    </div>
  );
};
