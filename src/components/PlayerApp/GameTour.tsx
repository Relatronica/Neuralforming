import React from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

interface GameTourProps {
  run: boolean;
  onComplete: () => void;
  currentPhase?: 'development' | 'dilemma' | 'consequence';
  hasNews?: boolean;
}

export const GameTour: React.FC<GameTourProps> = ({ 
  run, 
  onComplete,
  currentPhase = 'development',
  hasNews = false
}) => {
  const newsStep: Step = {
    target: '[data-tour="news"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-gray-100 mb-2">Notizie Globali 📰</h3>
        <p className="text-gray-300 text-sm">
          Le notizie mostrano eventi che influenzano il gioco. Puoi chiuderle temporaneamente, ma torneranno quando necessario.
        </p>
      </div>
    ),
    placement: 'bottom',
  };

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">Benvenuto in Neuralforming! 🎮</h3>
          <p className="text-gray-300 text-sm">
            Questo tour ti guiderà attraverso le funzionalità principali del gioco.
            Prendi decisioni politiche per un'IA sostenibile e responsabile!
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="menu"]',
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">Menu di Gioco</h3>
          <p className="text-gray-300 text-sm">
            Da qui puoi accedere alle opzioni del gioco, incluso il pulsante per iniziare una nuova partita.
          </p>
        </div>
      ),
      placement: 'left',
    },
    ...(hasNews ? [newsStep] : []),
    {
      target: '[data-tour="tabs"]',
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">Le Tue Sezioni</h3>
          <p className="text-gray-300 text-sm mb-2">
            Hai 4 sezioni principali:
          </p>
          <ul className="text-gray-300 text-sm list-disc list-inside space-y-1">
            <li><strong>Proposte:</strong> Le carte tecnologia nella tua mano</li>
            <li><strong>Leggi:</strong> Le tecnologie che hai fatto approvare</li>
            <li><strong>Milestone:</strong> Abilità speciali sbloccate</li>
            <li><strong>Obiettivo:</strong> La tua missione segreta per vincere</li>
          </ul>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="objective-tab"]',
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">Il Tuo Obiettivo 🎯</h3>
          <p className="text-gray-300 text-sm">
            Ogni giocatore ha un obiettivo segreto. Raggiungilo per vincere la partita!
            Controlla spesso questa sezione per vedere i tuoi progressi.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="hand-tab"]',
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">Le Tue Proposte</h3>
          <p className="text-gray-300 text-sm">
            Qui vedi le carte tecnologia nella tua mano. Quando è il tuo turno, puoi proporre una tecnologia
            cliccando su una carta. Le altre carte mostrano i punti che guadagnerai se approvate.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="draw-button"]',
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">Pesca Nuove Carte</h3>
          <p className="text-gray-300 text-sm">
            Usa questo pulsante per pescare una nuova carta tecnologia dal mazzo.
            Puoi pescare una carta per turno quando è il tuo momento di giocare.
          </p>
        </div>
      ),
      placement: 'top',
      disableScrolling: false,
    },
    {
      target: '[data-tour="laws-tab"]',
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">Leggi Approvate 📜</h3>
          <p className="text-gray-300 text-sm">
            Quando una tecnologia viene approvata dalla maggioranza dei giocatori, diventa una legge.
            Le leggi approvate ti danno punti permanenti e contano per il tuo obiettivo.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="milestones-tab"]',
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">Milestone 🏆</h3>
          <p className="text-gray-300 text-sm">
            Raggiungendo certi traguardi, sblocchi milestone che ti danno abilità speciali.
            Queste abilità possono cambiare le regole del gioco a tuo favore!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">Come Funziona il Gioco</h3>
          <p className="text-gray-300 text-sm mb-2">
            <strong>Fase di Sviluppo:</strong> Quando è il tuo turno, puoi proporre una tecnologia dalla tua mano.
            Gli altri giocatori voteranno su di essa.
          </p>
          <p className="text-gray-300 text-sm mb-2">
            <strong>Votazione:</strong> Quando qualcuno propone una tecnologia, tutti votano Sì o No.
            Se passa, diventa una legge approvata.
          </p>
          <p className="text-gray-300 text-sm">
            <strong>Dilemmi:</strong> A volte dovrai affrontare dilemmi etici che influenzano i tuoi punti.
            Scegli saggiamente!
          </p>
        </div>
      ),
      placement: 'center',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as STATUS)) {
      onComplete();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      disableScrolling={false}
      disableScrollParentFix={false}
      styles={{
        options: {
          primaryColor: '#3B82F6',
          zIndex: 10000,
        },
        tooltip: {
          backgroundColor: '#1F2937',
          borderRadius: '0.75rem',
          border: '1px solid #374151',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: '#3B82F6',
          color: '#fff',
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: '600',
        },
        buttonBack: {
          color: '#9CA3AF',
          marginRight: '0.5rem',
        },
        buttonSkip: {
          color: '#9CA3AF',
          fontSize: '0.875rem',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
        spotlight: {
          borderRadius: '0.75rem',
        },
      }}
      locale={{
        back: 'Indietro',
        close: 'Chiudi',
        last: 'Fine',
        next: 'Avanti',
        skip: 'Salta',
      }}
    />
  );
};
