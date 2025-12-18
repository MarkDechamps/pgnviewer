import { MoveNode, formatMoveNumber } from '@/lib/pgn-utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';

interface MoveListProps {
  moves: MoveNode[];
  currentMoveIndex: number;
  onMoveClick: (index: number) => void;
}

export function MoveList({ moves, currentMoveIndex, onMoveClick }: MoveListProps) {
  const activeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentMoveIndex]);

  if (moves.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>No moves to display</p>
      </div>
    );
  }

  // Group moves by pairs (white + black)
  const movePairs: { white?: MoveNode; black?: MoveNode; moveNumber: number; whiteIndex: number }[] = [];
  
  for (let i = 0; i < moves.length; i += 2) {
    const white = moves[i];
    const black = moves[i + 1];
    movePairs.push({
      white,
      black,
      moveNumber: white?.moveNumber || Math.floor(i / 2) + 1,
      whiteIndex: i,
    });
  }

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-0.5 pb-4">
        {movePairs.map((pair, pairIndex) => (
          <div key={pairIndex} className="animate-fade-in" style={{ animationDelay: `${pairIndex * 20}ms` }}>
            <div className="flex items-baseline gap-1">
              <span className="text-muted-foreground font-mono text-sm w-8 flex-shrink-0">
                {pair.moveNumber}.
              </span>
              
              {pair.white && (
                <span
                  ref={currentMoveIndex === pair.whiteIndex ? activeRef : null}
                  onClick={() => onMoveClick(pair.whiteIndex)}
                  className={`move-notation ${currentMoveIndex === pair.whiteIndex ? 'active' : ''}`}
                >
                  {pair.white.san}
                </span>
              )}
              
              {pair.black && (
                <span
                  ref={currentMoveIndex === pair.whiteIndex + 1 ? activeRef : null}
                  onClick={() => onMoveClick(pair.whiteIndex + 1)}
                  className={`move-notation ${currentMoveIndex === pair.whiteIndex + 1 ? 'active' : ''}`}
                >
                  {pair.black.san}
                </span>
              )}
            </div>
            
            {/* Comments */}
            {pair.white?.comment && (
              <p className="annotation-text ml-8 mt-1">{pair.white.comment}</p>
            )}
            {pair.black?.comment && (
              <p className="annotation-text ml-8 mt-1">{pair.black.comment}</p>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
