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
  from: string;
  to: string;
  comment?: string;
  variations?: MoveNode[][];
  nag?: string[];
}

export function parseMultiplePgn(pgnText: string): ParsedGame[] {
  const games: ParsedGame[] = [];
  const normalized = pgnText.replace(/\r\n/g, '\n').trim();

  if (!normalized) return games;

  // Treat each [Event "..."] header as the start of a new game.
  // This avoids breaking files that contain blank lines between every header tag.
  const eventStartRegex = /(^|\n)\s*\[Event\s+"/g;
  const starts: number[] = [];
  let match: RegExpExecArray | null;

  while ((match = eventStartRegex.exec(normalized)) !== null) {
    starts.push(match.index + (match[1] ? match[1].length : 0));
  }

  const gameTexts = starts.length
    ? starts.map((start, i) => normalized.slice(start, starts[i + 1] ?? normalized.length).trim())
    : [normalized];

  for (const gameText of gameTexts) {
    if (!gameText) continue;

    try {
      const game = parseSingleGame(gameText);
      if (game) games.push(game);
    } catch (e) {
      console.warn('Failed to parse game:', e);
    }
  }

  return games;
}

function stripParenthesizedVariations(text: string): string {
  let out = '';
  let depth = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '(') {
      depth++;
      continue;
    }
    if (ch === ')') {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth === 0) out += ch;
  }

  return out;
}

function sanitizeMoveText(moveText: string): string {
  let text = moveText;

  // Remove PGN comments and common lesson annotations
  text = text.replace(/\{[^}]*\}/gs, ' ');
  text = text.replace(/;[^\n]*/g, ' ');

  // Remove variations: ( ... ) — keep mainline only
  text = stripParenthesizedVariations(text);

  // Remove numeric annotation glyphs: $15, $1, etc.
  text = text.replace(/\$\d+/g, ' ');

  // Remove move annotation suffixes: !, ?, !?, ??, etc.
  text = text.replace(/[!?]+/g, '');

  // Normalize whitespace
  return text.replace(/\s+/g, ' ').trim();
}

function parseSingleGame(pgnText: string): ParsedGame | null {
  const chess = new Chess();

  // Extract headers
  const headers: Record<string, string> = {};
  const headerRegex = /\[(\w+)\s+"([^"]*)"\]/g;
  let headerMatch;

  while ((headerMatch = headerRegex.exec(pgnText)) !== null) {
    headers[headerMatch[1]] = headerMatch[2];
  }

  // Check if this is a FEN position
  const initialFen = headers['FEN'] || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  // Remove headers from pgn text
  const rawMoveText = pgnText.replace(/\[.*?\]\s*/g, '').trim();
  const cleanedMoveText = sanitizeMoveText(rawMoveText);

  // If there are no actual moves (e.g. only headers, or only comments), treat it as a position.
  if (!cleanedMoveText) {
    return {
      headers,
      moves: [],
      initialFen,
    };
  }

  // Preserve the header section if we need to rebuild a sanitized PGN for chess.js
  const headerSectionMatch = pgnText.match(/^(?:\s*\[[^\]]+\]\s*)+/);
  const headerSection = headerSectionMatch ? headerSectionMatch[0].trim() : '';

  // Try to load the PGN as-is; if it fails (common with lesson-style comments/variations),
  // retry with a sanitized mainline-only version.
  try {
    if (headers['FEN']) chess.load(headers['FEN']);
    chess.loadPgn(pgnText, { strict: false });
  } catch (e) {
    try {
      const sanitizedPgn = `${headerSection}\n\n${cleanedMoveText}`.trim();
      chess.reset();
      if (headers['FEN']) chess.load(headers['FEN']);
      chess.loadPgn(sanitizedPgn, { strict: false });
    } catch (e2) {
      console.warn('Failed to load PGN:', e2);
      // Still allow FEN-only display when a FEN is provided.
      if (headers['FEN']) {
        return {
          headers,
          moves: [],
          initialFen,
        };
      }
      return null;
    }
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
      from: move.from,
      to: move.to,
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
