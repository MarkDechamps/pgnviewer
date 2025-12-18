import { Chess } from 'chess.js';

export interface ParsedGame {
  headers: Record<string, string>;
  moves: MoveNode[];
  initialFen: string;
}

export interface MoveNode {
  san: string;
  fen: string;
  moveNumber: number;
  isWhite: boolean;
  comment?: string;
  variations?: MoveNode[][];
  nag?: string[];
}

export function parseMultiplePgn(pgnText: string): ParsedGame[] {
  const games: ParsedGame[] = [];
  
  // Split by double newline followed by [Event or by game termination markers
  const gameTexts = pgnText.split(/\n\n(?=\[Event|\[)/);
  
  for (const gameText of gameTexts) {
    if (!gameText.trim()) continue;
    
    try {
      const game = parseSingleGame(gameText.trim());
      if (game) {
        games.push(game);
      }
    } catch (e) {
      console.warn('Failed to parse game:', e);
    }
  }
  
  return games;
}

function parseSingleGame(pgnText: string): ParsedGame | null {
  const chess = new Chess();
  
  // Extract headers
  const headers: Record<string, string> = {};
  const headerRegex = /\[(\w+)\s+"([^"]*)"\]/g;
  let match;
  
  while ((match = headerRegex.exec(pgnText)) !== null) {
    headers[match[1]] = match[2];
  }
  
  // Check if this is a FEN position
  const initialFen = headers['FEN'] || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  
  // Remove headers from pgn text
  const moveText = pgnText.replace(/\[.*?\]\s*/g, '').trim();
  
  if (!moveText) {
    // Just a FEN position, no moves
    return {
      headers,
      moves: [],
      initialFen,
    };
  }
  
  // Try to load the PGN
  try {
    if (headers['FEN']) {
      chess.load(headers['FEN']);
    }
    chess.loadPgn(pgnText, { strict: false });
  } catch (e) {
    console.warn('Failed to load PGN:', e);
    return null;
  }
  
  // Extract moves with comments and variations
  const moves = extractMoves(chess, initialFen);
  
  return {
    headers,
    moves,
    initialFen,
  };
}

function extractMoves(chess: Chess, initialFen: string): MoveNode[] {
  const moves: MoveNode[] = [];
  const history = chess.history({ verbose: true });
  
  // Reconstruct positions for each move
  const tempChess = new Chess(initialFen);
  
  for (let i = 0; i < history.length; i++) {
    const move = history[i];
    const moveNumber = Math.floor(i / 2) + 1;
    const isWhite = i % 2 === 0;
    
    tempChess.move(move.san);
    
    moves.push({
      san: move.san,
      fen: tempChess.fen(),
      moveNumber,
      isWhite,
    });
  }
  
  // Try to extract comments from PGN
  const pgn = chess.pgn();
  const commentRegex = /\{([^}]*)\}/g;
  let commentMatch;
  let moveIndex = 0;
  
  // Simple comment extraction (maps roughly to moves)
  const pgnParts = pgn.split(/\s+/);
  for (const part of pgnParts) {
    if (part.startsWith('{') || part.includes('{')) {
      const commentStart = pgn.indexOf(part);
      const fullComment = pgn.slice(commentStart).match(/\{([^}]*)\}/);
      if (fullComment && moveIndex > 0 && moves[moveIndex - 1]) {
        moves[moveIndex - 1].comment = fullComment[1].trim();
      }
    }
    if (part.match(/^[KQRBNP]?[a-h]?[1-8]?x?[a-h][1-8](=[QRBN])?[+#]?$/) || 
        part.match(/^O-O(-O)?[+#]?$/)) {
      moveIndex++;
    }
  }
  
  return moves;
}

export function getGameDisplayName(game: ParsedGame, index: number): string {
  const white = game.headers['White'] || 'Unknown';
  const black = game.headers['Black'] || 'Unknown';
  const event = game.headers['Event'];
  const date = game.headers['Date'];
  const result = game.headers['Result'] || '*';
  
  if (white !== 'Unknown' || black !== 'Unknown') {
    let name = `${white} vs ${black}`;
    if (result && result !== '*') {
      name += ` (${result})`;
    }
    if (event && event !== '?') {
      name += ` - ${event}`;
    }
    return name;
  }
  
  if (event && event !== '?') {
    return `${event}${date ? ` (${date})` : ''}`;
  }
  
  return `Game ${index + 1}`;
}

export function formatMoveNumber(moveNumber: number, isWhite: boolean): string {
  if (isWhite) {
    return `${moveNumber}.`;
  }
  return `${moveNumber}...`;
}
