import { cn } from '../../lib/utils';
import type { PokemonType } from '../../data/mocks';

interface TypeBadgeProps {
  type: PokemonType;
  className?: string;
}

const typeConfig: Record<PokemonType, { bg: string; text: string }> = {
  normal: { bg: 'bg-[#A8A77A]', text: 'text-white' },
  fire: { bg: 'bg-[#EE8130]', text: 'text-white' },
  water: { bg: 'bg-[#6390F0]', text: 'text-white' },
  electric: { bg: 'bg-[#F7D02C]', text: 'text-gray-900' },
  grass: { bg: 'bg-[#7AC74C]', text: 'text-gray-900' },
  ice: { bg: 'bg-[#96D9D6]', text: 'text-gray-900' },
  fighting: { bg: 'bg-[#C22E28]', text: 'text-white' },
  poison: { bg: 'bg-[#A33EA1]', text: 'text-white' },
  ground: { bg: 'bg-[#E2BF65]', text: 'text-gray-900' },
  flying: { bg: 'bg-[#A98FF3]', text: 'text-gray-900' },
  psychic: { bg: 'bg-[#F95587]', text: 'text-white' },
  bug: { bg: 'bg-[#A6B91A]', text: 'text-gray-900' },
  rock: { bg: 'bg-[#B6A136]', text: 'text-white' },
  ghost: { bg: 'bg-[#735797]', text: 'text-white' },
  dragon: { bg: 'bg-[#6F35FC]', text: 'text-white' },
  dark: { bg: 'bg-[#705746]', text: 'text-white' },
  steel: { bg: 'bg-[#B7B7CE]', text: 'text-gray-900' },
  fairy: { bg: 'bg-[#D685AD]', text: 'text-gray-900' },
};

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const config = typeConfig[type];

  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider shadow-sm transition-transform hover:scale-105 cursor-default',
        config.bg,
        config.text,
        className
      )}
    >
      {type}
    </span>
  );
}
