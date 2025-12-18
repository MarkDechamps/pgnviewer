import { useState, useEffect, useCallback } from 'react';
import { ChessBoard } from '@/components/ChessBoard';
import { PgnUploader } from '@/components/PgnUploader';
import { GameSelector } from '@/components/GameSelector';
import { MoveList } from '@/components/MoveList';
import { NavigationButtons } from '@/components/NavigationButtons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { parseMultiplePgn, ParsedGame } from '@/lib/pgn-utils';
import {
  savePgnToStorage,
  loadPgnFromStorage,
  clearPgnFromStorage,
  saveViewerState,
  ViewerState,
} from '@/lib/chess-storage';
import { ExternalLink, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function Index() {
  const [games, setGames] = useState<ParsedGame[]>([]);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');

  const flipBoard = () => setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');

  const currentGame = games[selectedGameIndex];
  const currentMoves = currentGame?.moves || [];
  const currentFen = currentMoveIndex >= 0 && currentMoves[currentMoveIndex]
    ? currentMoves[currentMoveIndex].fen
    : (currentGame?.initialFen || INITIAL_FEN);

  // Sync state to localStorage for presenter view
  const syncState = useCallback(() => {
    const move = currentMoveIndex >= 0 ? currentMoves[currentMoveIndex] : null;
    const state: ViewerState = {
      gameIndex: selectedGameIndex,
      moveIndex: currentMoveIndex,
      fen: currentFen,
      lastMove: move ? move.san : null,
      moveNumber: move ? move.moveNumber : 0,
      isWhiteMove: move ? move.isWhite : true,
    };
    saveViewerState(state);
  }, [selectedGameIndex, currentMoveIndex, currentFen, currentMoves]);

  useEffect(() => {
    syncState();
  }, [syncState]);

  // Load stored PGN on mount
  useEffect(() => {
    const stored = loadPgnFromStorage();
    if (stored) {
      const parsed = parseMultiplePgn(stored);
      if (parsed.length > 0) {
        setGames(parsed);
        toast.success(`Loaded ${parsed.length} game(s) from storage`);
      }
    }
  }, []);

  const handlePgnLoad = (pgnContent: string) => {
    const parsed = parseMultiplePgn(pgnContent);
    if (parsed.length === 0) {
      toast.error('No valid games found in the PGN file');
      return;
    }
    
    setGames(parsed);
    setSelectedGameIndex(0);
    setCurrentMoveIndex(-1);
    savePgnToStorage(pgnContent);
    toast.success(`Loaded ${parsed.length} game(s)`);
  };

  const handleClear = () => {
    setGames([]);
    setSelectedGameIndex(0);
    setCurrentMoveIndex(-1);
    clearPgnFromStorage();
    toast.success('PGN data cleared');
  };

  const handleGameSelect = (index: number) => {
    setSelectedGameIndex(index);
    setCurrentMoveIndex(-1);
  };

  const handleMoveClick = (index: number) => {
    setCurrentMoveIndex(index);
  };

  const goToFirst = () => setCurrentMoveIndex(-1);
  const goToPrevious = () => setCurrentMoveIndex((prev) => Math.max(-1, prev - 1));
  const goToNext = () => setCurrentMoveIndex((prev) => Math.min(currentMoves.length - 1, prev + 1));
  const goToLast = () => setCurrentMoveIndex(currentMoves.length - 1);

  const openPresenterView = () => {
    window.open('/presenter', '_blank');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Home') {
        goToFirst();
      } else if (e.key === 'End') {
        goToLast();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMoves.length]);

  return (
    <div className="min-h-screen bg-background chess-gradient">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Chess PGN Viewer</h1>
          <p className="text-muted-foreground">
            Upload a PGN file and navigate through games for your chess lessons
          </p>
        </header>

        {/* Controls */}
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <PgnUploader
            onPgnLoad={handlePgnLoad}
            onClear={handleClear}
            hasPgn={games.length > 0}
          />
          
          {games.length > 0 && (
            <>
              <div className="flex-1 min-w-[250px] max-w-md">
                <GameSelector
                  games={games}
                  selectedIndex={selectedGameIndex}
                  onSelect={handleGameSelect}
                />
              </div>
              
              <Button onClick={openPresenterView} variant="secondary" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Open Presenter View
              </Button>
            </>
          )}
        </div>

        {/* Main Content */}
        {games.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Board Section */}
            <div className="space-y-4">
              <Card className="p-4 bg-card">
                <div className="flex justify-center">
                  <ChessBoard fen={currentFen} boardWidth={Math.min(450, window.innerWidth - 80)} orientation={boardOrientation} />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <NavigationButtons
                    onFirst={goToFirst}
                    onPrevious={goToPrevious}
                    onNext={goToNext}
                    onLast={goToLast}
                    canGoPrevious={currentMoveIndex >= 0}
                    canGoNext={currentMoveIndex < currentMoves.length - 1}
                  />
                  <Button variant="outline" size="icon" onClick={flipBoard} title="Flip board">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Current move display */}
                {currentMoveIndex >= 0 && currentMoves[currentMoveIndex] && (
                  <div className="text-center mt-3 font-mono text-lg">
                    <span className="text-muted-foreground">
                      {currentMoves[currentMoveIndex].moveNumber}.
                      {!currentMoves[currentMoveIndex].isWhite && '..'}
                    </span>{' '}
                    <span className="font-semibold text-foreground">
                      {currentMoves[currentMoveIndex].san}
                    </span>
                  </div>
                )}
              </Card>

              {/* Game Info */}
              {currentGame && Object.keys(currentGame.headers).length > 0 && (
                <Card className="p-4 bg-card">
                  <h3 className="font-semibold mb-2 text-foreground">Game Information</h3>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    {currentGame.headers['Event'] && currentGame.headers['Event'] !== '?' && (
                      <p><span className="font-medium">Event:</span> {currentGame.headers['Event']}</p>
                    )}
                    {currentGame.headers['Date'] && currentGame.headers['Date'] !== '?' && (
                      <p><span className="font-medium">Date:</span> {currentGame.headers['Date']}</p>
                    )}
                    {currentGame.headers['White'] && (
                      <p><span className="font-medium">White:</span> {currentGame.headers['White']}</p>
                    )}
                    {currentGame.headers['Black'] && (
                      <p><span className="font-medium">Black:</span> {currentGame.headers['Black']}</p>
                    )}
                    {currentGame.headers['Result'] && (
                      <p><span className="font-medium">Result:</span> {currentGame.headers['Result']}</p>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Move List Section */}
            <Card className="p-4 bg-card h-[600px] flex flex-col">
              <h3 className="font-semibold mb-3 text-foreground">Moves</h3>
              <div className="flex-1 overflow-hidden">
                <MoveList
                  moves={currentMoves}
                  currentMoveIndex={currentMoveIndex}
                  onMoveClick={handleMoveClick}
                />
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-12 bg-card text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-3xl">♟</span>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-foreground">No PGN Loaded</h2>
              <p className="text-muted-foreground mb-4">
                Upload a PGN file to start viewing chess games. The file can contain multiple games.
              </p>
              <p className="text-sm text-muted-foreground">
                Tip: Use arrow keys to navigate through moves
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
