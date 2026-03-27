import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Loader2, Gamepad2 } from 'lucide-react';
import { gameQueries } from '../../queries/gameQueries';
import { cn } from '../../lib/utils';

interface GameSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function GameSelector({ value, onChange }: GameSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Co-locating the data fetch specifically where the UI needs it!
  const { data, isLoading } = useQuery(gameQueries.versionGroups());
  const versionGroups = data?.results || [];

  // Global click listener to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedItem = versionGroups.find(vg => vg.name === value);
  let displayLabel = 'SELECT GAME';
  if (value === 'national') displayLabel = 'NATIONAL DEX (ALL)';
  else if (selectedItem) displayLabel = selectedItem.name.replace(/-/g, ' ').toUpperCase();

  return (
    <div className="relative z-50" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 bg-background hover:bg-white/5 border border-border/50 rounded-full pl-2 pr-3 py-1.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
             {/* 
               Once we have high quality logos, replace this icon with:
               <img src={`/assets/logos/${value}.png`} alt={value} className="w-full h-full object-cover" /> 
             */}
             <Gamepad2 className="w-3.5 h-3.5 text-blue-400" />
        </div>
        
        <span className="text-[11px] font-black tracking-widest text-foreground truncate max-w-[140px]">
          {isLoading ? 'LOADING...' : displayLabel}
        </span>
        
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground ml-1" />
        ) : (
          <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground ml-1 transition-transform duration-200", isOpen && "rotate-180")} />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 max-h-[60vh] overflow-y-auto bg-[#0a0a0a] border border-border rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] py-2 custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-4 py-2 text-[10px] font-black tracking-widest text-muted-foreground/50 uppercase border-b border-white/5 mb-1 sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-sm z-10">
            Theory Crafting
          </div>
          <div className="px-1 mb-2 border-b border-border/40 pb-2">
            <button
               onClick={() => {
                 onChange('national');
                 setIsOpen(false);
               }}
               className={cn(
                 "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left group",
                 value === 'national' ? "bg-blue-500/15 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]" : "hover:bg-white/5 border border-transparent"
               )}
             >
               <div className={cn(
                   "w-10 h-10 rounded shrink-0 flex items-center justify-center border overflow-hidden transition-colors",
                   value === 'national' 
                     ? "bg-blue-500/20 border-blue-500/40" 
                     : "bg-white/5 border-white/10 group-hover:border-white/20"
                 )}
               >
                 <Gamepad2 className={cn("w-5 h-5", value === 'national' ? "text-blue-400" : "text-muted-foreground")} />
               </div>
               <div className="flex flex-col flex-1 min-w-0">
                 <span className={cn(
                   "text-xs font-black tracking-wider uppercase truncate leading-none mb-1",
                   value === 'national' ? "text-blue-400" : "text-foreground"
                 )}>
                   NATIONAL DEX (ALL)
                 </span>
                 <span className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">Theory Builds</span>
               </div>
            </button>
          </div>

          <div className="px-4 py-2 text-[10px] font-black tracking-widest text-muted-foreground/50 uppercase border-b border-white/5 mb-1 sticky top-[33px] bg-[#0a0a0a]/90 backdrop-blur-sm z-10">
            Select Game Version
          </div>
          <div className="px-1">
            {versionGroups.map((vg) => {
              const isActive = value === vg.name;
              return (
                <button
                  key={vg.name}
                  onClick={() => {
                    onChange(vg.name);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left group",
                    isActive ? "bg-blue-500/15" : "hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                      "w-10 h-10 rounded shrink-0 flex items-center justify-center border overflow-hidden transition-colors",
                      isActive 
                        ? "bg-blue-500/20 border-blue-500/40" 
                        : "bg-white/5 border-white/10 group-hover:border-white/20"
                    )}
                  >
                    {/* Placeholder for Game Box Art / Logo */}
                    <Gamepad2 className={cn("w-5 h-5", isActive ? "text-blue-400" : "text-muted-foreground")} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={cn(
                      "text-xs font-black tracking-wider uppercase truncate",
                      isActive ? "text-blue-400" : "text-foreground"
                    )}>
                      {vg.name.replace(/-/g, ' ')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
