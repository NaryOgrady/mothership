import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_STATE, STORAGE_KEY, normalizeGameState, type GameState } from './gameState';

const LOCAL_SYNC_EVENT = 'mothership-state-local-sync';

function loadState(): GameState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_STATE;
  try {
    return normalizeGameState(JSON.parse(raw));
  } catch {
    return DEFAULT_STATE;
  }
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => loadState());
  const skipNextPersist = useRef(false);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        skipNextPersist.current = true;
        setState(loadState());
      }
    }
    function handleLocalSync() {
      skipNextPersist.current = true;
      setState(loadState());
    }
    window.addEventListener('storage', handleStorage);
    window.addEventListener(LOCAL_SYNC_EVENT, handleLocalSync);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(LOCAL_SYNC_EVENT, handleLocalSync);
    };
  }, []);

  // Persisting here (rather than inside the setState updater) keeps the
  // updater a pure function of prev state, which React may otherwise
  // invoke more than once per update (e.g. under StrictMode).
  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(LOCAL_SYNC_EVENT));
  }, [state]);

  const update = useCallback((patch: Partial<GameState> | ((prev: GameState) => Partial<GameState>)) => {
    setState((prev) => {
      const resolved = typeof patch === 'function' ? patch(prev) : patch;
      return { ...prev, ...resolved, updatedAt: Date.now() };
    });
  }, []);

  const replace = useCallback((imported: unknown) => {
    setState({ ...normalizeGameState(imported), updatedAt: Date.now() });
  }, []);

  return { state, update, replace };
}
