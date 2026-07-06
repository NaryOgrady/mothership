export type PageId = 'crew' | 'mission' | 'ship' | 'info';

export const PAGE_IDS: PageId[] = ['crew', 'mission', 'ship', 'info'];

export interface PageContent {
  title: string;
  body: string;
  fontScale: number;
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

export type SystemStatus = 'active' | 'inactive' | 'damaged' | 'unknown';

export interface ShipSystem {
  id: string;
  name: string;
  energy: number;
  status: SystemStatus;
}

export interface ShipInfo {
  name: string;
  type: string;
  shipId: string;
  mapUrl: string;
  systems: ShipSystem[];
}

export interface GameState {
  envName: string;
  mapImageUrl: string;
  alertTitle: string;
  alertDescription: string;
  alertLevel: 'none' | 'yellow' | 'red';
  activePage: PageId | null;
  pages: Record<PageId, PageContent>;
  crew: CrewMember[];
  ship: ShipInfo;
  fontScale: number;
  screenFlipped: boolean;
  updatedAt: number;
}

export const DEFAULT_STATE: GameState = {
  envName: 'ENV: EUROPA',
  mapImageUrl: '',
  alertTitle: '',
  alertDescription: '',
  alertLevel: 'none',
  activePage: null,
  pages: {
    crew: { title: 'Crew', body: '', fontScale: 1 },
    mission: { title: 'Mission', body: '', fontScale: 1 },
    ship: { title: 'Ship', body: '', fontScale: 1 },
    info: { title: 'Info', body: '', fontScale: 1 },
  },
  crew: [],
  ship: { name: '', type: '', shipId: '', mapUrl: '', systems: [] },
  fontScale: 1,
  screenFlipped: false,
  updatedAt: Date.now(),
};

export const STORAGE_KEY = 'mothership-gui-state';
