import { AlertTriangle } from 'lucide-react';
import type { TeamSlotState } from '../../data/mocks';
import { cn, isPokemonAllowedInGame } from '../../lib/utils';
import { PokeballIcon } from '../ui/PokeballIcon';

interface TeamBuilderProps {
  team: TeamSlotState[];
  onRemove: (index: number) => void;
  onSelectSlot: (index: number) => void;
  onOpenSearch: (index: number) => void;
  selectedSlotIndex: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  allowedSpecies?: string[];
}

export function TeamBuilder({ team, onRemove, onSelectSlot, onOpenSearch, selectedSlotIndex, isExpanded = true, onToggleExpand, allowedSpecies }: TeamBuilderProps) {

  return (
    <div className={cn(
      "w-full flex flex-col justify-center py-2 lg:py-3 px-2 items-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
      !isExpanded && "cursor-pointer hover:bg-foreground/5"
    )} onClick={!isExpanded ? onToggleExpand : undefined}>
      
      {/* Expanded Grid */}
      <div className={cn(
        "flex space-x-2 sm:space-x-3 md:space-x-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] origin-top px-4 py-4 -mx-4 -my-2",
        isExpanded ? "max-h-[200px] opacity-100 scale-100 mt-2 overflow-visible" : "max-h-0 opacity-0 scale-95 mt-0 overflow-hidden pointer-events-none"
      )}>
        {team.map((slot, index) => {
          const isSelected = selectedSlotIndex === index;
          const pokemon = slot.pokemon;
          
          if (!pokemon) {
            return (
              <button
                key={`empty-${index}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSlot(index);
                  onOpenSearch(index);
                }}
                className={cn(
                  "relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl border-2 border-dashed transition-all duration-300 group overflow-hidden",
                  isSelected 
                    ? "border-pd-accent/70 bg-pd-accent/10 text-pd-accent ring-2 ring-pd-accent/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] cursor-alias" 
                    : "border-border/60 hover:border-muted-foreground/60 hover:bg-foreground/5 text-muted-foreground"
                )}
              >
                <PokeballIcon className="w-6 h-6 md:w-8 md:h-8 opacity-20 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-60" />
                {isSelected && <div className="absolute inset-0 bg-pd-accent/5 blur-xl pointer-events-none" />}
              </button>
            );
          }

          const isLegal = isPokemonAllowedInGame(pokemon.name, allowedSpecies);

          return (
            <div
              key={`slot-${index}-${pokemon.id}`}
              onClick={() => {
                if (isSelected) {
                  onOpenSearch(index);
                } else {
                  onSelectSlot(index);
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                onRemove(index);
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove(index);
              }}
              className={cn(
                "relative group flex items-center justify-center w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm",
                isSelected && isLegal
                  ? "border-pd-accent/70 bg-pd-accent/10 shadow-[0_0_20px_rgba(59,130,246,0.2)] ring-2 ring-pd-accent/20 transform -translate-y-1 md:-translate-y-2" 
                  : isSelected && !isLegal
                  ? "border-pd-accent/70 bg-pd-accent/10 shadow-[0_0_20px_rgba(239,68,68,0.2)] ring-2 ring-pd-accent/20 transform -translate-y-1 md:-translate-y-2 opacity-100"
                  : !isLegal
                  ? "border-pd-accent/30 bg-pd-accent/5 opacity-50 hover:opacity-80 border-dashed"
                  : "border-border/80 bg-card hover:border-muted-foreground/50 hover:bg-foreground/5 opacity-80 hover:opacity-100"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-full blur-xl mix-blend-overlay"></div>
              <img
                src={pokemon.spriteUrl}
                alt={pokemon.name}
                className={cn(
                  "w-[120%] h-[120%] object-contain drop-shadow-xl transition-all duration-500 group-hover:scale-110",
                  (!isSelected && isLegal) && "grayscale-[40%]",
                  !isLegal && "grayscale opacity-50"
                )}
              />
              
              {!isLegal && (
                <div className="absolute inset-0 m-auto flex items-center justify-center pointer-events-none">
                  <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-pd-accent/80 drop-shadow-lg" />
                </div>
              )}
              
              {/* Item Indicator Pip */}
              {slot.item && (
                <div className="absolute bottom-1 right-1 w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-yellow-400 border border-background shadow-sm" title={slot.item.name} />
              )}
              
              {/* Shiny Indicator Pip */}
              {slot.shiny && (
                <div className="absolute top-1 left-1 text-[8px] lg:text-[10px]">✨</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collapsed Mini Ribbon */}
      <div className={cn(
        "flex items-center justify-center gap-2 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] origin-bottom pointer-events-none",
        !isExpanded ? "max-h-[80px] opacity-100 scale-100 mt-1 pointer-events-auto overflow-visible" : "max-h-0 opacity-0 scale-90 mt-0 overflow-hidden"
      )}>
        {team.map((s, i) => {
           const isSelected = selectedSlotIndex === i;
           const isLegal = isPokemonAllowedInGame(s.pokemon?.name, allowedSpecies);
           return (
             <div 
               key={`mini-${i}`} 
               onClick={(e) => {
                 e.stopPropagation();
                 if (isSelected && s.pokemon) {
                   onOpenSearch(i);
                 } else if (!s.pokemon) {
                   onSelectSlot(i);
                   onToggleExpand?.();
                   onOpenSearch(i);
                 } else {
                   onSelectSlot(i);
                 }
               }}
               onContextMenu={(e) => {
                 e.preventDefault();
                 if (s.pokemon) onRemove(i);
               }}
               onDoubleClick={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 if (s.pokemon) onRemove(i);
               }}
               className={cn(
                 "w-8 h-8 md:w-10 md:h-10 rounded-full border flex items-center justify-center shadow-inner cursor-pointer hover:scale-110 transition-all overflow-hidden", 
                 s.pokemon && isLegal ? "bg-card/50 border-border/50 hover:border-pd-accent" :
                 s.pokemon && !isLegal ? "bg-pd-accent/10 border-pd-accent/30 opacity-60" :
                 "bg-background/20 border-border/50 border-dashed",
                 isSelected && isLegal && "border-pd-accent ring-2 ring-pd-accent/20 bg-pd-accent/10 shadow-[0_0_10px_rgba(59,130,246,0.3)] opacity-100",
                 isSelected && !isLegal && "border-pd-accent ring-2 ring-pd-accent/20 bg-pd-accent/20 opacity-100"
               )}
             >
               {s.pokemon ? (
                  <img src={s.pokemon.spriteUrl} className={cn("w-full h-full object-contain scale-[1.3] drop-shadow-sm pointer-events-none transition-all", !isLegal && "grayscale opacity-50")} />
               ) : (
                  <PokeballIcon className={cn("w-5 h-5 opacity-20 pointer-events-none", isSelected ? "text-pd-accent opacity-50" : "text-muted-foreground/40")} />
               )}
             </div>
           );
        })}
      </div>
    </div>
  );
}
