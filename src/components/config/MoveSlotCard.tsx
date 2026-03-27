import { X, Sword, Zap, Shield, Plus } from 'lucide-react';
import type { Move } from '../../data/mocks';
import { TypeBadge } from '../ui/TypeBadge';
import { cn } from '../../lib/utils';
import { MovePalette } from './MovePalette';

export function CategoryIcon({ category, className }: { category: string, className?: string }) {
  if (category === 'physical') return <Sword className={cn("w-3.5 h-3.5 text-red-400 drop-shadow-md", className)} />
  if (category === 'special') return <Zap className={cn("w-3.5 h-3.5 text-indigo-400 drop-shadow-md", className)} />
  return <Shield className={cn("w-3.5 h-3.5 text-slate-400 drop-shadow-md", className)} />
}
import type { EnrichedMove } from './SlotEditor';

interface MoveSlotCardProps {
  move: Move | null;
  isOpen: boolean;
  onToggle: () => void;
  onRemove: (e: React.MouseEvent) => void;
  onSelectMove: (move: Move) => void;
  allowedMoves: EnrichedMove[];
  level: number;
  renderUpwards?: boolean;
}

export function MoveSlotCard({ move, isOpen, onToggle, onRemove, onSelectMove, allowedMoves, level, renderUpwards = false }: MoveSlotCardProps) {
  const cardBody = !move || !move.name ? (
    <button 
      onClick={onToggle}
      className={cn(
        "w-full flex items-center justify-center border border-dashed rounded-2xl p-4 transition-all group shadow-inner",
        isOpen ? "bg-card/80 border-blue-500 text-blue-400" : "bg-card/20 hover:bg-card/60 border-border/60 hover:border-blue-500/50 text-muted-foreground"
      )}
    >
      <Plus className="w-5 h-5 group-hover:text-blue-400 transition-colors mr-3 shrink-0" />
      <span className="text-sm font-black group-hover:text-blue-400 transition-colors uppercase tracking-widest leading-none">Empty Move Slot</span>
    </button>
  ) : (
    <div 
      onClick={onToggle}
      className={cn(
        "group relative w-full flex items-center justify-between border rounded-2xl p-3 shadow-md cursor-pointer transition-all overflow-hidden",
        isOpen ? "bg-card border-blue-500" : "bg-card/60 hover:bg-card border-border/50 hover:border-blue-500/50"
      )}
    >
      {/* Glossy gradient reflection */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-background border border-white/5 shadow-inner shrink-0 relative">
           <CategoryIcon category={move.category} className="w-5 h-5" />
           {/* Faint elemental glow behind icon */}
           {move.category === 'physical' && <div className="absolute inset-0 bg-red-500/10 blur-md" />}
           {move.category === 'special'  && <div className="absolute inset-0 bg-indigo-500/10 blur-md" />}
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-sm font-black capitalize tracking-tight text-foreground">{move.name}</span>
          <TypeBadge type={move.type} />
        </div>
      </div>

      <div className="flex items-center gap-5 mr-8 shrink-0">
         <div className="flex flex-col items-end">
           <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5">Power</span>
           <span className="text-sm font-black text-foreground drop-shadow-sm">{move.power || '—'}</span>
         </div>
         <div className="flex flex-col items-end">
           <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5">Acc</span>
           <span className="text-sm font-black text-foreground drop-shadow-sm">{move.accuracy ? `${move.accuracy}%` : '—'}</span>
         </div>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onRemove(e);
        }}
        className="absolute right-3 p-2 rounded-lg text-muted-foreground hover:bg-red-500/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="relative w-full">
      {cardBody}

      {isOpen && (
        <div className={cn(
          "absolute left-0 z-[100] w-[calc(100vw-2rem)] max-w-sm sm:w-80 lg:left-full lg:ml-4 bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden max-h-[350px] animate-in fade-in duration-200",
          renderUpwards 
            ? "bottom-full mb-2 slide-in-from-bottom-2 lg:bottom-0 lg:mb-0" 
            : "top-full mt-2 slide-in-from-top-2 lg:top-0 lg:mt-0"
        )}>
          <MovePalette 
            onSelectMove={onSelectMove} 
            allowedMoves={allowedMoves} 
            level={level}
            onClose={onToggle}
          />
        </div>
      )}
    </div>
  );
}
