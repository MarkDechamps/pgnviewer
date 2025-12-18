# Chess PGN Viewer - Dual Screen Chess Lesson Tool

## Overview
A specialized PGN (Portable Game Notation) viewer designed for chess instructors to give lessons in chess clubs. The key feature is dual-screen support: one screen for the instructor to control and annotate, and another presenter screen for audience viewing via projector.

## Key Features

### Main Viewer (Instructor Screen)
- **PGN Upload**: Upload large PGN files containing multiple games
- **Game Selection**: Dropdown to select specific games or FEN positions from the uploaded PGN
- **Move List**: Display all moves with variations and annotations
- **Interactive Board**: Click on any move to jump to that position
- **Navigation**: Next/Previous move buttons below the board
- **Persistence**: PGN stored in localStorage for session continuity

### Presenter Mode (Audience Screen)
- **Clean Display**: Shows only the chess board optimized for projector display
- **Current Move**: Displays the last played move with move number
- **Hidden Notes**: Annotations/notes are hidden by default (checkbox to toggle)
- **Real-time Sync**: Automatically syncs with instructor's screen via localStorage events

## Technical Architecture

### State Synchronization
The two screens communicate via localStorage events:
- `chess-viewer-state`: Contains current game index, move index, and FEN position
- `chess-viewer-pgn`: Stores the uploaded PGN data

### Libraries Used
- `chess.js`: PGN parsing, move validation, and position management
- `react-chessboard`: Chess board visualization
- React Router: Page routing between viewer and presenter modes

### File Structure
- `/src/pages/Index.tsx` - Main instructor view
- `/src/pages/Presenter.tsx` - Audience/projector view
- `/src/components/ChessBoard.tsx` - Reusable chess board component
- `/src/components/MoveList.tsx` - Interactive move notation display
- `/src/components/GameSelector.tsx` - Game/position dropdown
- `/src/components/PgnUploader.tsx` - File upload handler
- `/src/lib/chess-storage.ts` - localStorage sync utilities
- `/src/lib/pgn-utils.ts` - PGN parsing utilities

## Usage
1. Upload a PGN file on the main page
2. Select a game from the dropdown
3. Click "Open Presenter View" to open second screen
4. Navigate through moves - both screens stay in sync
5. Use the presenter screen on projector for audience

## For AI Tools
This is a chess lesson application with dual-screen support. The main complexity is in PGN parsing and localStorage-based synchronization between browser tabs.
