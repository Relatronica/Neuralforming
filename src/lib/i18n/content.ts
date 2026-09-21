import type { Consequence, Dilemma, PlayerObjective, SocietyNews, Technology } from '../../game/types';
import { type Locale } from './locale';
import { getSessionLocale } from './session';

import itDilemmas from '../../data/dilemmas.json';
import itTechnologies from '../../data/technologies.json';
import itConsequences from '../../data/consequences.json';
import itObjectives from '../../data/objectives.json';
import itNews from '../../data/news.json';
import itOpeningStories from '../../data/openingStories.json';
import itHeaderNews from '../../data/headerNews.json';

import enDilemmas from '../../data/en/dilemmas.json';
import enTechnologies from '../../data/en/technologies.json';
import enConsequences from '../../data/en/consequences.json';
import enObjectives from '../../data/en/objectives.json';
import enNews from '../../data/en/news.json';
import enOpeningStories from '../../data/en/openingStories.json';
import enHeaderNews from '../../data/en/headerNews.json';

export interface OpeningStory {
  id: string;
  title: string;
  content: string;
  mood: string;
}

export interface HeaderNewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  shortText: string;
  source: string;
}

export interface GameContent {
  dilemmas: Dilemma[];
  technologies: Technology[];
  consequences: Consequence[];
  objectives: PlayerObjective[];
  news: SocietyNews[];
  openingStories: OpeningStory[];
  headerNews: HeaderNewsItem[];
}

const BUNDLES: Record<Locale, GameContent> = {
  it: {
    dilemmas: itDilemmas as Dilemma[],
    technologies: itTechnologies as Technology[],
    consequences: itConsequences as Consequence[],
    objectives: itObjectives as PlayerObjective[],
    news: itNews as SocietyNews[],
    openingStories: itOpeningStories as OpeningStory[],
    headerNews: itHeaderNews as HeaderNewsItem[],
  },
  en: {
    dilemmas: enDilemmas as Dilemma[],
    technologies: enTechnologies as Technology[],
    consequences: enConsequences as Consequence[],
    objectives: enObjectives as PlayerObjective[],
    news: enNews as SocietyNews[],
    openingStories: enOpeningStories as OpeningStory[],
    headerNews: enHeaderNews as HeaderNewsItem[],
  },
};

export function loadGameContent(locale: Locale = getSessionLocale()): GameContent {
  return BUNDLES[locale] ?? BUNDLES.it;
}
