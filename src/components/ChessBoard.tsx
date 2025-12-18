import { Chessboard } from 'react-chessboard';

interface ChessBoardProps {
  fen: string;
  className?: string;
  boardWidth?: number;
  isPresenter?: boolean;
}

export function ChessBoard({ fen, className = '', boardWidth = 400, isPresenter = false }: ChessBoardProps) {
  return (
    <div 
      className={`${isPresenter ? 'presenter-board' : 'board-container'} ${className}`}
      style={{ width: boardWidth, height: boardWidth }}
    >
      <Chessboard
        options={{
          position: fen,
          allowDragging: false,
          lightSquareStyle: { backgroundColor: '#E8D9C0' },
          darkSquareStyle: { backgroundColor: '#8B7355' },
        }}
      />
    </div>
  );
}
