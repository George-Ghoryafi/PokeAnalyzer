import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEffect, useState } from 'react';

interface NumberInputProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  className?: string;
}

export function NumberInput({ value, min = 0, max = 999, step = 1, onChange, className }: NumberInputProps) {
  const [internalVal, setInternalVal] = useState(value.toString());

  useEffect(() => {
    setInternalVal(value.toString());
  }, [value]);

  const handleBlur = () => {
    let parsed = parseInt(internalVal, 10);
    if (isNaN(parsed)) parsed = min;
    parsed = Math.max(min, Math.min(max, parsed));
    setInternalVal(parsed.toString());
    onChange(parsed);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const spin = (direction: 1 | -1) => {
    let parsed = parseInt(internalVal, 10);
    if (isNaN(parsed)) parsed = min;
    const next = Math.max(min, Math.min(max, parsed + (direction * step)));
    setInternalVal(next.toString());
    onChange(next);
  };

  return (
    <div className={cn("relative flex items-center group", className)}>
      <input
        type="text"
        value={internalVal}
        onChange={(e) => setInternalVal(e.target.value.replace(/[^0-9-]/g, ''))}
        onBlur={handleBlur}
        onKeyDown={handleKey}
        className="w-full h-full bg-transparent text-center font-bold font-mono outline-none pr-3"
      />
      
      {/* Custom Scrubber Spinners */}
      <div className="absolute right-0 inset-y-0 flex flex-col border-l border-border/20 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity w-3.5 overflow-hidden rounded-r-lg">
        <button 
          onClick={() => spin(1)}
          className="flex-1 flex items-center justify-center bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 text-muted-foreground transition-colors"
        >
          <ChevronUp className="w-2.5 h-2.5" />
        </button>
        <button 
          onClick={() => spin(-1)}
          className="flex-1 flex items-center justify-center bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-muted-foreground transition-colors border-t border-border/20"
        >
          <ChevronDown className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
}
