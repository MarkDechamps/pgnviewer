import { Chessboard } from 'react-chessboard';
import React from 'react';
import type { CustomSquareStyles } from 'react-chessboard/dist/chessboard/types';

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
  const customSquareStyles: CustomSquareStyles = {};
  
  if (lastMoveSquares) {
    const highlightStyle: React.CSSProperties = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
    customSquareStyles[lastMoveSquares.from] = highlightStyle;
    customSquareStyles[lastMoveSquares.to] = highlightStyle;
  }

  return (
    <div 
      className={`${isPresenter ? 'presenter-board' : 'board-container'} ${className}`}
      style={{ width: boardWidth, height: boardWidth }}
    >
      <Chessboard
        position={fen}
        boardOrientation={orientation}
        arePiecesDraggable={false}
        customLightSquareStyle={{ backgroundColor: 'hsl(39, 46%, 84%)' }}
        customDarkSquareStyle={{ backgroundColor: 'hsl(30, 25%, 44%)' }}
        customSquareStyles={customSquareStyles}
        boardWidth={boardWidth}
      />
    </div>
  );
}
