import type { PokemonType } from '../../data/mocks';
import { cn, getTypeIconUrl } from '../../lib/utils';
import { X } from 'lucide-react';

interface TeraTypePaletteProps {
  onSelectType: (type: PokemonType | null) => void;
  currentType: PokemonType | null;
}

const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy', 'stellar'
];

export function TeraTypePalette({ onSelectType, currentType }: TeraTypePaletteProps) {
  return (
    <div className="flex flex-col max-h-[350px] w-full bg-card/95 backdrop-blur-xl overflow-hidden rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-border/80">
      <div className="px-4 py-2 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase border-b border-border/40 mb-1 sticky top-0 bg-black/20 backdrop-blur-md z-10 shrink-0 flex items-center justify-between">
        <span>Select Tera Type</span>
        <button onClick={() => onSelectType(null)} className="flex items-center text-[9px] hover:text-red-400 transition-colors">
           <X className="w-3 h-3 mr-1" /> Reset
        </button>
      </div>
      
      <div className="p-3 overflow-y-auto flex-1 custom-scrollbar">
        <div className="grid grid-cols-4 gap-2 pb-2">
           {ALL_TYPES.map(type => {
              const isActive = currentType === type;
              return (
                 <button
                   key={type}
                   onClick={() => onSelectType(type)}
                   className={cn(
                     "flex flex-col items-center justify-center p-2 rounded-2xl transition-all border relative group aspect-square",
                     isActive ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "bg-card border-border/50 hover:bg-foreground/5 hover:border-cyan-500/30"
                   )}
                 >
                   {isActive && <div className="absolute inset-0 bg-cyan-400/10 rounded-2xl animate-pulse pointer-events-none" />}
                   
                   <img 
                     src={getTypeIconUrl(type)} 
                     alt={type} 
                     className={cn(
                       "w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-md transition-transform duration-300", 
                       isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" : "group-hover:scale-[1.15] group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]"
                     )} 
                   />
                 </button>
              )
           })}
        </div>
      </div>
    </div>
  );
}
