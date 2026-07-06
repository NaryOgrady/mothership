export type PageId = 'crew' | 'mission' | 'ship' | 'info';

export const PAGE_IDS: PageId[] = ['crew', 'mission', 'ship', 'info'];

export interface PageContent {
  title: string;
  body: string;
}

export type CrewStatus = 'active' | 'mia' | 'deceased';

export interface CrewMember {
  id: string;
  name: string;
  className: string;
  portraitUrl: string;
  stress: number;
  health: number;
  maxHealth: number;
  wounds: number;
  maxWounds: number;
  condition: string;
  status: CrewStatus;
}

export interface GameState {
  envName: string;
  mapImageUrl: string;
  alertMessage: string;
  alertLevel: 'none' | 'yellow' | 'red';
  activePage: PageId | null;
  pages: Record<PageId, PageContent>;
  crew: CrewMember[];
  updatedAt: number;
}

export const DEFAULT_STATE: GameState = {
  envName: 'ENV: EUROPA',
  mapImageUrl: '',
  alertMessage: '',
  alertLevel: 'none',
  activePage: null,
  pages: {
    crew: { title: 'Crew', body: '' },
    mission: { title: 'Mission', body: '' },
    ship: { title: 'Ship', body: '' },
    info: { title: 'Info', body: '' },
  },
  crew: [],
  updatedAt: Date.now(),
};

export const STORAGE_KEY = 'mothership-gui-state';
