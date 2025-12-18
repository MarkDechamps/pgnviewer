import { useState, useEffect } from 'react';
import { ChessBoard } from '@/components/ChessBoard';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  loadViewerState,
  subscribeToStateChanges,
  ViewerState,
} from '@/lib/chess-storage';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function Presenter() {
  const [state, setState] = useState<ViewerState | null>(null);
  const [showMoveInfo, setShowMoveInfo] = useState(false);

  // Load initial state and subscribe to changes
  useEffect(() => {
    const initial = loadViewerState();
    if (initial) {
      setState(initial);
    }

    const unsubscribe = subscribeToStateChanges((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  const currentFen = state?.fen || INITIAL_FEN;

  // Calculate board size based on viewport
  const [boardSize, setBoardSize] = useState(600);

  useEffect(() => {
    const updateSize = () => {
      const maxWidth = window.innerWidth - 80;
      const maxHeight = window.innerHeight - 180;
      setBoardSize(Math.min(maxWidth, maxHeight, 800));
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Board */}
      <div className="mb-6">
        <ChessBoard 
          fen={currentFen} 
          boardWidth={boardSize} 
          isPresenter={true}
        />
      </div>

      {/* Move Display */}
      <div className="text-center mb-6 h-16 flex items-center justify-center">
        {showMoveInfo && state?.lastMove && (
          <div className="animate-fade-in">
            <span className="font-mono text-3xl md:text-4xl text-foreground">
              <span className="text-muted-foreground">
                {state.moveNumber}.{!state.isWhiteMove && '..'}
              </span>{' '}
              <span className="font-bold">{state.lastMove}</span>
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="fixed bottom-4 right-4 bg-card/90 backdrop-blur rounded-lg p-3 shadow-lg border border-border">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-move"
            checked={showMoveInfo}
            onCheckedChange={(checked) => setShowMoveInfo(checked === true)}
          />
          <Label htmlFor="show-move" className="text-sm cursor-pointer">
            Show current move
          </Label>
        </div>
      </div>

      {/* Sync indicator */}
      <div className="fixed top-4 left-4 text-xs text-muted-foreground">
        {state ? (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Synced with main viewer
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-muted-foreground rounded-full" />
            Waiting for connection...
          </span>
        )}
      </div>
    </div>
  );
}
