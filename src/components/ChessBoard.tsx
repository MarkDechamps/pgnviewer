import { Chessboard } from 'react-chessboard';

interface ChessBoardProps {
  fen: string;
  className?: string;
  boardWidth?: number;
  isPresenter?: boolean;
  orientation?: 'white' | 'black';
}

export function ChessBoard({ fen, className = '', boardWidth = 400, isPresenter = false, orientation = 'white' }: ChessBoardProps) {
  return (
    <div 
      className={`${isPresenter ? 'presenter-board' : 'board-container'} ${className}`}
      style={{ width: boardWidth, height: boardWidth }}
    >
      <Chessboard
        options={{
          position: fen,
          allowDragging: false,
          boardOrientation: orientation,
          lightSquareStyle: { backgroundColor: '#E8D9C0' },
          darkSquareStyle: { backgroundColor: '#8B7355' },
        }}
      />
    </div>
  );
}
