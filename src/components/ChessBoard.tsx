import Chessboard from 'chessboardjsx';

interface ChessBoardProps {
  fen: string;
  className?: string;
  boardWidth?: number;
  isPresenter?: boolean;
  orientation?: 'white' | 'black';
  lastMoveSquares?: { from: string; to: string } | null;
}

export function ChessBoard({ 
  fen, 
  className = '', 
  boardWidth = 400, 
  isPresenter = false, 
  orientation = 'white',
  lastMoveSquares 
}: ChessBoardProps) {
  // Custom square styles for last move highlighting
  const squareStyles: Record<string, React.CSSProperties> = {};
  
  if (lastMoveSquares) {
    const highlightStyle: React.CSSProperties = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
    squareStyles[lastMoveSquares.from] = highlightStyle;
    squareStyles[lastMoveSquares.to] = highlightStyle;
  }

  return (
    <div 
      className={`${isPresenter ? 'presenter-board' : 'board-container'} ${className}`}
    >
      <Chessboard
        position={fen}
        orientation={orientation}
        draggable={false}
        lightSquareStyle={{ backgroundColor: 'hsl(39, 46%, 84%)' }}
        darkSquareStyle={{ backgroundColor: 'hsl(30, 25%, 44%)' }}
        squareStyles={squareStyles}
        width={boardWidth}
      />
    </div>
  );
}
