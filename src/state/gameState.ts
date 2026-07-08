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

interface BasePage {
  id: string;
  title: string;
}

interface BaseContentPage extends BasePage {
  fontScale: number;
}

export interface TextPage extends BaseContentPage {
  type: 'text';
  body: string;
}

export interface CharacterListPage extends BaseContentPage {
  type: 'characterList';
  crew: CrewMember[];
}

export interface ShipPage extends BaseContentPage {
  type: 'ship';
  ship: ShipInfo;
  body: string;
}

export interface ImagePage extends BasePage {
  type: 'image';
  imageUrl: string;
  greenFilter: boolean;
}

/**
 * A folder in the side nav. It renders no content of its own — selecting
 * it never sets `activePageId` — it just groups its `children` under it
 * in the navigation list.
 */
export interface MenuPage extends BasePage {
  type: 'menu';
  children: GamePage[];
}

export type GamePage = TextPage | CharacterListPage | ShipPage | ImagePage | MenuPage;
export type PageType = GamePage['type'];

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  text: 'Text Page',
  characterList: 'Character List',
  ship: 'Ship',
  image: 'Image Page',
  menu: 'Menu',
};

function makeShip(): ShipInfo {
  return { name: '', type: '', shipId: '', mapUrl: '', systems: [] };
}

export function createPage(type: PageType, title?: string): GamePage {
  const id = crypto.randomUUID();
  switch (type) {
    case 'text':
      return { id, type, title: title ?? 'New Page', fontScale: 1, body: '' };
    case 'characterList':
      return { id, type, title: title ?? 'Crew', fontScale: 1, crew: [] };
    case 'ship':
      return { id, type, title: title ?? 'Ship', fontScale: 1, ship: makeShip(), body: '' };
    case 'image':
      return { id, type, title: title ?? 'Image', imageUrl: '', greenFilter: false };
    case 'menu':
      return { id, type, title: title ?? 'Menu', children: [] };
  }
}

/** Depth-first search through top-level pages and menu children. */
export function findPage(pages: GamePage[], id: string): GamePage | undefined {
  for (const page of pages) {
    if (page.id === id) return page;
    if (page.type === 'menu') {
      const found = findPage(page.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

/** Replaces the page with the given id, wherever it sits in the tree. */
export function updatePageInTree(pages: GamePage[], id: string, patch: Partial<GamePage>): GamePage[] {
  return pages.map((page) => {
    if (page.id === id) return { ...page, ...patch } as GamePage;
    if (page.type === 'menu') return { ...page, children: updatePageInTree(page.children, id, patch) };
    return page;
  });
}

/** Removes the page with the given id, wherever it sits in the tree. */
export function removePageFromTree(pages: GamePage[], id: string): GamePage[] {
  return pages
    .filter((page) => page.id !== id)
    .map((page) => (page.type === 'menu' ? { ...page, children: removePageFromTree(page.children, id) } : page));
}

/** Appends a new page to the children of the menu page with the given id. */
export function addChildPage(pages: GamePage[], parentId: string, child: GamePage): GamePage[] {
  return pages.map((page) => {
    if (page.id === parentId && page.type === 'menu') {
      return { ...page, children: [...page.children, child] };
    }
    if (page.type === 'menu') {
      return { ...page, children: addChildPage(page.children, parentId, child) };
    }
    return page;
  });
}

/** True if `id` is this page or, for a menu, appears anywhere among its descendants. */
export function pageContainsId(page: GamePage, id: string): boolean {
  if (page.id === id) return true;
  return page.type === 'menu' && page.children.some((child) => pageContainsId(child, id));
}

export interface NavEntry {
  page: GamePage;
  depth: number;
  /** ASCII tree branch prefix (e.g. "│  ├─ "), empty for root-level entries. */
  connector: string;
}

/**
 * Flattens the page tree into a depth-ordered list for rendering nav lists/tabs,
 * computing an ASCII tree-branch prefix for each entry based on whether it's the
 * last child among its siblings.
 */
export function flattenForNav(pages: GamePage[], depth = 0, ancestorPrefix = ''): NavEntry[] {
  return pages.flatMap((page, index) => {
    const isLast = index === pages.length - 1;
    const connector = depth === 0 ? '' : ancestorPrefix + (isLast ? '└─ ' : '├─ ');
    const childPrefix = depth === 0 ? '' : ancestorPrefix + (isLast ? '   ' : '│  ');
    return [
      { page, depth, connector },
      ...(page.type === 'menu' ? flattenForNav(page.children, depth + 1, childPrefix) : []),
    ];
  });
}

export interface GameState {
  envName: string;
  mapImageUrl: string;
  alertTitle: string;
  alertDescription: string;
  alertLevel: 'none' | 'yellow' | 'red';
  activePageId: string | null;
  pages: GamePage[];
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
  activePageId: null,
  pages: [
    { id: 'crew', type: 'characterList', title: 'Crew', fontScale: 1, crew: [] },
    { id: 'mission', type: 'text', title: 'Mission', fontScale: 1, body: '' },
    { id: 'ship', type: 'ship', title: 'Ship', fontScale: 1, ship: makeShip(), body: '' },
    { id: 'info', type: 'text', title: 'Info', fontScale: 1, body: '' },
  ],
  fontScale: 1,
  screenFlipped: false,
  updatedAt: Date.now(),
};

export const STORAGE_KEY = 'mothership-gui-state';

/**
 * Accepts either the current shape or the pre-dynamic-pages shape
 * (`pages` as a fixed crew/mission/ship/info record, plus top-level
 * `crew`/`ship`/`activePage`) so old saves and exports keep working.
 */
export function normalizeGameState(raw: unknown): GameState {
  if (!raw || typeof raw !== 'object') return DEFAULT_STATE;
  const r = raw as Record<string, unknown>;

  const pages = Array.isArray(r.pages) ? (r.pages as GamePage[]) : migrateLegacyPages(r);

  const activePageId =
    typeof r.activePageId === 'string'
      ? r.activePageId
      : typeof r.activePage === 'string'
        ? r.activePage
        : null;

  return {
    ...DEFAULT_STATE,
    ...r,
    pages,
    activePageId,
  } as GameState;
}

function migrateLegacyPages(r: Record<string, unknown>): GamePage[] {
  const legacyPages = (r.pages ?? {}) as Record<string, { title?: string; body?: string; fontScale?: number }>;
  const legacyCrew = Array.isArray(r.crew) ? (r.crew as CrewMember[]) : [];
  const legacyShip = (r.ship && typeof r.ship === 'object' ? r.ship : makeShip()) as ShipInfo;

  return [
    {
      id: 'crew',
      type: 'characterList',
      title: legacyPages.crew?.title ?? 'Crew',
      fontScale: legacyPages.crew?.fontScale ?? 1,
      crew: legacyCrew,
    },
    {
      id: 'mission',
      type: 'text',
      title: legacyPages.mission?.title ?? 'Mission',
      fontScale: legacyPages.mission?.fontScale ?? 1,
      body: legacyPages.mission?.body ?? '',
    },
    {
      id: 'ship',
      type: 'ship',
      title: legacyPages.ship?.title ?? 'Ship',
      fontScale: legacyPages.ship?.fontScale ?? 1,
      ship: legacyShip,
      body: legacyPages.ship?.body ?? '',
    },
    {
      id: 'info',
      type: 'text',
      title: legacyPages.info?.title ?? 'Info',
      fontScale: legacyPages.info?.fontScale ?? 1,
      body: legacyPages.info?.body ?? '',
    },
  ];
}
