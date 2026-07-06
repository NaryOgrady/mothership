import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_STATE, STORAGE_KEY, type GameState } from './gameState';

const LOCAL_SYNC_EVENT = 'mothership-state-local-sync';

function loadState(): GameState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_STATE;
  try {
    return { ...DEFAULT_STATE, ...JSON.parse(raw) } as GameState;
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: GameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(LOCAL_SYNC_EVENT));
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => loadState());

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setState(loadState());
    }
    function handleLocalSync() {
      setState(loadState());
    }
    window.addEventListener('storage', handleStorage);
    window.addEventListener(LOCAL_SYNC_EVENT, handleLocalSync);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(LOCAL_SYNC_EVENT, handleLocalSync);
    };
  }, []);

  const update = useCallback((patch: Partial<GameState> | ((prev: GameState) => Partial<GameState>)) => {
    setState((prev) => {
      const resolved = typeof patch === 'function' ? patch(prev) : patch;
      const next = { ...prev, ...resolved, updatedAt: Date.now() };
      saveState(next);
      return next;
    });
  }, []);

  return { state, update };
}
