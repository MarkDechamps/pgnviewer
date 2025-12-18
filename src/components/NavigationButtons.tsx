import { Button } from '@/components/ui/button';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationButtonsProps {
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function NavigationButtons({
  onFirst,
  onPrevious,
  onNext,
  onLast,
  canGoPrevious,
  canGoNext,
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={onFirst}
        disabled={!canGoPrevious}
        className="h-10 w-10"
      >
        <ChevronFirst className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="h-10 w-10"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onNext}
        disabled={!canGoNext}
        className="h-10 w-10"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onLast}
        disabled={!canGoNext}
        className="h-10 w-10"
      >
        <ChevronLast className="h-5 w-5" />
      </Button>
    </div>
  );
}
