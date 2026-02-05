// Storage keys for cross-tab synchronization
export const STORAGE_KEYS = {
  PGN_DATA: 'chess-viewer-pgn',
  VIEWER_STATE: 'chess-viewer-state',
} as const;

export interface ViewerState {
  gameIndex: number;
  moveIndex: number;
  fen: string;
  lastMove: string | null;
  lastMoveSquares: { from: string; to: string } | null;
  moveNumber: number;
  isWhiteMove: boolean;
  boardOrientation?: 'white' | 'black';
}

export interface StoredPgnData {
  raw: string;
  timestamp: number;
}

export function savePgnToStorage(pgn: string): void {
  const data: StoredPgnData = {
    raw: pgn,
    timestamp: Date.now(),
  };
  localStorage.setItem(STORAGE_KEYS.PGN_DATA, JSON.stringify(data));
}

export function loadPgnFromStorage(): string | null {
  const stored = localStorage.getItem(STORAGE_KEYS.PGN_DATA);
  if (!stored) return null;
  
  try {
    const data: StoredPgnData = JSON.parse(stored);
    return data.raw;
  } catch {
    return null;
  }
}

export function clearPgnFromStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.PGN_DATA);
  localStorage.removeItem(STORAGE_KEYS.VIEWER_STATE);
}

export function saveViewerState(state: ViewerState): void {
  console.log('[Storage] Saving viewer state:', state);
  localStorage.setItem(STORAGE_KEYS.VIEWER_STATE, JSON.stringify(state));
  // Dispatch a custom event for same-window listeners
  window.dispatchEvent(new CustomEvent('chess-state-change', { detail: state }));
}

export function loadViewerState(): ViewerState | null {
  const stored = localStorage.getItem(STORAGE_KEYS.VIEWER_STATE);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// Subscribe to storage changes from other tabs
export function subscribeToStateChanges(
  callback: (state: ViewerState) => void
): () => void {
  let lastStateJson = '';

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEYS.VIEWER_STATE && event.newValue) {
      try {
        const state = JSON.parse(event.newValue);
        lastStateJson = event.newValue;
        callback(state);
      } catch {
        // Ignore parse errors
      }
    }
  };

  const handleCustomEvent = (event: CustomEvent<ViewerState>) => {
    callback(event.detail);
  };

  // Polling fallback for cross-tab sync (storage events can be unreliable)
  const pollInterval = setInterval(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.VIEWER_STATE);
    if (stored && stored !== lastStateJson) {
      console.log('[Storage] Polling detected change:', stored);
      lastStateJson = stored;
      try {
        const state = JSON.parse(stored);
        callback(state);
      } catch {
        // Ignore parse errors
      }
    }
  }, 200);

  window.addEventListener('storage', handleStorage);
  window.addEventListener('chess-state-change', handleCustomEvent as EventListener);

  return () => {
    clearInterval(pollInterval);
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('chess-state-change', handleCustomEvent as EventListener);
  };
}
