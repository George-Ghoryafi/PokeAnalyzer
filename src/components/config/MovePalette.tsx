import { useState, useRef, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import { moveQueries } from '../../queries/moveQueries';
import type { Move } from '../../data/mocks';
import { TypeBadge } from '../ui/TypeBadge';
import { CategoryIcon } from './MoveSlotCard';
import { cn } from '../../lib/utils';
import type { EnrichedMove } from './SlotEditor';

interface MovePaletteProps {
  onClose: () => void;
  onSelectMove: (move: Move) => void;
  allowedMoves: EnrichedMove[];
  level: number;
}

export function MovePalette({ onClose, onSelectMove, allowedMoves, level }: MovePaletteProps) {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'physical' | 'special' | 'status'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const moveQueriesResults = useQueries({
    queries: allowedMoves.map(m => moveQueries.detail(m.name))
  });

  const isLoading = moveQueriesResults.some(result => result.isLoading);

  const allMoves = moveQueriesResults
    .map(result => result.data)
    .filter((m): m is Move => m !== undefined);

  // Apply textual and category filters
  const filtered = allMoves.filter(m => {
    const matchesQuery = m.name.includes(query.toLowerCase().replace(/ /g, '-')) || m.type.includes(query.toLowerCase());
    const matchesFilter = filterType === 'all' || m.category === filterType;
    return matchesQuery && matchesFilter;
  });

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, filterType]);

  // Keyboard trap internal to the tooltip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filtered[selectedIndex];
        if (selected) {
          const req = allowedMoves.find(m => m.name === selected.name);
          const isLocked = req?.method === 'level-up' && req.levelLearned > level;
          if (!isLocked) {
            onSelectMove(selected);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, selectedIndex, onClose, onSelectMove]);

  return (
    <div className="flex flex-col max-h-[350px] w-full">
      {/* Compact Header Search */}
      <div className="flex items-center border-b border-border/50 px-3 py-2 bg-black/20 shrink-0">
        <Search className="h-3.5 w-3.5 text-muted-foreground mr-2 shrink-0" />
        <input
          ref={inputRef}
          className="flex-1 bg-transparent text-xs font-bold text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
          placeholder="Filter moves..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Mini Filters */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/30 bg-background/30 shrink-0">
        <button
          onClick={() => setFilterType('all')}
          className={cn("px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md transition-all", filterType === 'all' ? "bg-pd-accent text-white" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground")}
        >
          All
        </button>
        <button
          onClick={() => setFilterType('physical')}
          className={cn("px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md transition-all flex items-center gap-1", filterType === 'physical' ? "bg-pd-accent text-white" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground")}
        >
          <CategoryIcon category="physical" className={cn("w-2.5 h-2.5", filterType === 'physical' && "text-white")} />
          Phys
        </button>
        <button
          onClick={() => setFilterType('special')}
          className={cn("px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md transition-all flex items-center gap-1", filterType === 'special' ? "bg-indigo-500 text-white" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground")}
        >
          <CategoryIcon category="special" className={cn("w-2.5 h-2.5", filterType === 'special' && "text-white")} />
          Spec
        </button>
        <button
          onClick={() => setFilterType('status')}
          className={cn("px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md transition-all flex items-center gap-1", filterType === 'status' ? "bg-slate-500 text-white" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground")}
        >
          <CategoryIcon category="status" className={cn("w-2.5 h-2.5", filterType === 'status' && "text-white")} />
          Stat
        </button>
      </div>

      {/* Tooltip List Body */}
      <div className="flex-1 overflow-y-auto p-1.5 custom-scrollbar bg-background/50">
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground flex flex-col items-center">
            <Loader2 className="h-6 w-6 mb-3 opacity-50 animate-spin text-pd-accent" />
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Fetching Data</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Search className="h-6 w-6 mx-auto mb-3 opacity-20" />
            <p className="text-xs font-medium">No valid moves found.</p>
          </div>
        ) : (
          filtered.map((move, idx) => {
            const isActive = idx === selectedIndex;
            const requirement = allowedMoves.find(m => m.name === move.name);
            const isLocked = requirement?.method === 'level-up' && requirement.levelLearned > level;

            return (
              <div
                key={move.name}
                onClick={() => {
                  if (!isLocked) onSelectMove(move);
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={cn(
                  "flex flex-col px-3 py-2 rounded-xl transition-all duration-150 mb-1 border",
                  isLocked ? "opacity-40 grayscale cursor-not-allowed" : "cursor-pointer",
                  isActive && !isLocked
                    ? "bg-pd-accent/15 border-pd-accent/40 shadow-sm"
                    : isActive && isLocked
                    ? "bg-white/10 border-white/20"
                    : "hover:bg-foreground/5 border-transparent"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-card border border-foreground/10 shadow-inner">
                      <CategoryIcon category={move.category} className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className={cn("text-xs font-black capitalize tracking-tight leading-none", isActive && !isLocked ? "text-pd-accent" : "text-foreground line-through decoration-1 decoration-foreground/50")}>
                          {move.name}
                        </h3>
                        {requirement?.method === 'level-up' ? (
                          <span className={cn("text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm", isLocked ? "bg-pd-accent/20 text-pd-accent" : "bg-white/10 text-muted-foreground")}>
                            Lv. {requirement.levelLearned}
                          </span>
                        ) : (
                          <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm bg-white/10 text-muted-foreground">
                            {requirement?.method.replace(/-/g, ' ')}
                          </span>
                        )}
                      </div>
                      <div className="scale-75 origin-top-left -mt-0.5">
                        <TypeBadge type={move.type} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] uppercase font-black text-muted-foreground tracking-[0.2em] leading-none mb-0.5">Pow</span>
                      <span className="text-xs font-black text-foreground leading-none">{move.power || '—'}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] uppercase font-black text-muted-foreground tracking-[0.2em] leading-none mb-0.5">Acc</span>
                      <span className="text-xs font-black text-foreground leading-none">{move.accuracy ? `${move.accuracy}` : '—'}</span>
                    </div>
                  </div>
                </div>

                {isActive && move.description && (
                  <div className="mt-2 pt-2 border-t border-border/40 text-[10px] text-muted-foreground leading-relaxed">
                    {isLocked ? (
                      <span className="text-pd-accent font-bold block mb-1">Move is locked until Level {requirement.levelLearned}.</span>
                    ) : null}
                    {move.description}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Mini Footer */}
      <div className="bg-black/60 border-t border-border/50 px-3 py-1.5 text-[9px] text-muted-foreground flex justify-between uppercase tracking-widest font-black shrink-0">
        <span>↓↑ move</span>
        <span>↵ select</span>
      </div>
    </div>
  );
}
