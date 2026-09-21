import React from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { GamePhase } from '../../game/types';
import { useGameCopy } from '../../lib/i18n/useGameCopy';

interface GameTourProps {
  run: boolean;
  onComplete: () => void;
  currentPhase?: GamePhase;
  hasNews?: boolean;
}

export const GameTour: React.FC<GameTourProps> = ({ 
  run, 
  onComplete,
  hasNews = false
}) => {
  const { t } = useGameCopy();
  const newsStep: Step = {
    target: '[data-tour="news"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-gray-100 mb-2">{t.tour.newsTitle}</h3>
        <p className="text-gray-300 text-sm">
          {t.tour.newsBody}
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
            <h3 className="text-lg font-bold text-gray-100 mb-2">{t.tour.welcomeTitle}</h3>
            <p className="text-gray-300 text-sm">
              {t.tour.welcomeBody}
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
          <h3 className="text-lg font-bold text-gray-100 mb-2">{t.tour.menuTitle}</h3>
          <p className="text-gray-300 text-sm">
            {t.tour.menuBody}
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
          <h3 className="text-lg font-bold text-gray-100 mb-2">{t.tour.sectionsTitle}</h3>
          <p className="text-gray-300 text-sm mb-2">
            {t.tour.sectionsLead}
          </p>
          <ul className="text-gray-300 text-sm list-disc list-inside space-y-1">
            <li>{t.tour.sectionsProposals}</li>
            <li>{t.tour.sectionsLaws}</li>
            <li>{t.tour.sectionsMilestones}</li>
            <li>{t.tour.sectionsObjective}</li>
          </ul>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="objective-tab"]',
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">{t.tour.objectiveTitle}</h3>
          <p className="text-gray-300 text-sm">
            {t.tour.objectiveBody}
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="hand-tab"]',
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">{t.tour.proposalsTitle}</h3>
          <p className="text-gray-300 text-sm">
            {t.tour.proposalsBody}
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="draw-button"]',
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">{t.tour.drawTitle}</h3>
          <p className="text-gray-300 text-sm">
            {t.tour.drawBody}
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
          <h3 className="text-lg font-bold text-gray-100 mb-2">{t.tour.lawsTitle}</h3>
          <p className="text-gray-300 text-sm">
            {t.tour.lawsBody}
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="milestones-tab"]',
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">{t.tour.milestonesTitle}</h3>
          <p className="text-gray-300 text-sm">
            {t.tour.milestonesBody}
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">{t.tour.howTitle}</h3>
          <p className="text-gray-300 text-sm mb-2">
            {t.tour.howDev}
          </p>
          <p className="text-gray-300 text-sm mb-2">
            {t.tour.howVote}
          </p>
          <p className="text-gray-300 text-sm">
            {t.tour.howDilemma}
          </p>
        </div>
      ),
      placement: 'center',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
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
          primaryColor: '#8b5cf6',
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
          backgroundColor: '#8b5cf6',
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
        back: t.tour.back,
        close: t.tour.close,
        last: t.tour.last,
        next: t.tour.next,
        skip: t.tour.skip,
      }}
    />
  );
};
