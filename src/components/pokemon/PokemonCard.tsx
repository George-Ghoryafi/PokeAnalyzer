import type { Pokemon } from '../../data/mocks';
import { cn } from '../../lib/utils';
import { TypeBadge } from '../ui/TypeBadge';

interface PokemonCardProps {
  pokemon: Pokemon;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PokemonCard({ pokemon, isSelected, onClick, className }: PokemonCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative group flex cursor-pointer items-center space-x-4 rounded-xl border bg-card p-3 shadow-sm transition-all duration-300 hover:shadow-md',
        isSelected ? 'border-pd-accent bg-pd-accent/10 ring-1 ring-pd-accent' : 'border-border hover:border-muted-foreground/50 hover:bg-foreground/5',
        className
      )}
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-background p-1 shadow-inner transition-transform duration-300 group-hover:scale-110">
        <img
          src={pokemon.spriteUrl}
          alt={pokemon.name}
          className="h-full w-full object-contain drop-shadow-md"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col justify-center">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            #{String(pokemon.id).padStart(3, '0')}
          </span>
          <h3 className="font-bold text-card-foreground capitalize">{pokemon.name}</h3>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {pokemon.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>
      </div>
    </div>
  );
}
