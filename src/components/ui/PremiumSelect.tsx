import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  label: string;
  value: string;
}

interface PremiumSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  renderUpwards?: boolean;
}

export function PremiumSelect({ value, onChange, options, placeholder = "Select...", className, renderUpwards = false }: PremiumSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between bg-background/60 border border-border/50 hover:border-blue-500/50 rounded-xl p-3 text-sm font-bold text-foreground focus:outline-none shadow-inner transition-all",
          isOpen && "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)] bg-card",
          className
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-muted-foreground font-medium")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180 text-blue-400")} />
      </button>

      {isOpen && (
        <div 
          className={cn(
            "absolute left-0 z-[100] w-full bg-card/95 backdrop-blur-xl border border-border/80 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden max-h-[250px] animate-in fade-in duration-200",
            renderUpwards 
              ? "bottom-full mb-2 slide-in-from-bottom-2" 
              : "top-full mt-2 slide-in-from-top-2"
          )}
        >
          <div className="flex-1 overflow-y-auto p-1.5 custom-scrollbar">
            {options.map((option) => {
              const isActive = option.value === value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-lg transition-all duration-150 mb-0.5 text-sm font-bold text-left",
                    isActive 
                      ? "bg-blue-500/15 text-blue-400" 
                      : "text-foreground hover:bg-white/5"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isActive && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
