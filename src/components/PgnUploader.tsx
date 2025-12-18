import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Trash2 } from 'lucide-react';

interface PgnUploaderProps {
  onPgnLoad: (pgn: string) => void;
  onClear: () => void;
  hasPgn: boolean;
}

export function PgnUploader({ onPgnLoad, onClear, hasPgn }: PgnUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onPgnLoad(content);
    };
    reader.readAsText(file);

    // Reset input so same file can be selected again
    event.target.value = '';
  };

  return (
    <div className="flex gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pgn,.txt"
        className="hidden"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="default"
        className="gap-2"
      >
        <Upload className="w-4 h-4" />
        Upload PGN
      </Button>
      {hasPgn && (
        <Button
          onClick={onClear}
          variant="outline"
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
