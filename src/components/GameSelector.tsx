import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ParsedGame, getGameDisplayName } from '@/lib/pgn-utils';

interface GameSelectorProps {
  games: ParsedGame[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function GameSelector({ games, selectedIndex, onSelect }: GameSelectorProps) {
  if (games.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-muted-foreground mb-1.5">
        Select Game
      </label>
      <Select
        value={selectedIndex.toString()}
        onValueChange={(value) => onSelect(parseInt(value, 10))}
      >
        <SelectTrigger className="w-full bg-card">
          <SelectValue placeholder="Select a game" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border max-h-[300px]">
          {games.map((game, index) => (
            <SelectItem 
              key={index} 
              value={index.toString()}
              className="cursor-pointer"
            >
              {getGameDisplayName(game, index)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
