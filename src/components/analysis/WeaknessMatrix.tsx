import { MOCK_TYPE_WEAKNESSES } from '../../data/mocks';
import type { PokemonType } from '../../data/mocks';
import { TypeBadge } from '../ui/TypeBadge';

interface WeaknessMatrixProps {
  types: PokemonType[];
}

export function WeaknessMatrix({ types }: WeaknessMatrixProps) {
  // Aggregate multipliers. Start all at 1x.
  const allTypes = Object.keys(MOCK_TYPE_WEAKNESSES) as PokemonType[];
  const multipliers: Record<PokemonType, number> = {} as any;
  
  allTypes.forEach(t => multipliers[t] = 1);

  // Multiply by defense relations for each type the pokemon has
  types.forEach(defenseType => {
    allTypes.forEach(attackingType => {
      // Find what the attacking type deals to this defense type
      const relation = MOCK_TYPE_WEAKNESSES[defenseType] || {};
      const multiplier = relation[attackingType] !== undefined ? relation[attackingType] : 1;
      multipliers[attackingType] *= multiplier;
    });
  });

  // Group types by multiplier
  const grouped: Record<number, PokemonType[]> = {
    4: [], 2: [], 0.5: [], 0.25: [], 0: []
  };

  allTypes.forEach(t => {
    const val = multipliers[t];
    if (val !== 1 && grouped[val]) {
      grouped[val].push(t);
    }
  });

  const sections = [
    { label: 'Takes 4x Damage', val: 4, color: 'text-red-400' },
    { label: 'Takes 2x Damage', val: 2, color: 'text-orange-400' },
    { label: 'Takes ½x Damage', val: 0.5, color: 'text-emerald-400' },
    { label: 'Takes ¼x Damage', val: 0.25, color: 'text-emerald-500' },
    { label: 'Immune (0x)', val: 0, color: 'text-gray-500' },
  ];

  return (
    <div className="rounded-2xl border border-border/50 bg-card/30 p-6 shadow-sm backdrop-blur-lg h-full flex flex-col">
      <h3 className="mb-6 text-lg font-black tracking-tight text-foreground">Type Defenses</h3>
      <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar">
        {sections.map(({ label, val, color }) => {
          const myTypes = grouped[val];
          if (myTypes?.length === 0) return null;

          return (
            <div key={val}>
              <h4 className={`text-[10px] font-black uppercase tracking-[0.15em] mb-3 ${color}`}>
                {label}
              </h4>
              <div className="flex flex-wrap gap-2">
                {myTypes.map(t => (
                  <TypeBadge key={t} type={t} />
                ))}
              </div>
            </div>
          );
        })}

        {Object.values(grouped).every(arr => arr?.length === 0 || !arr) && (
          <div className="flex h-full items-center justify-center text-sm font-medium text-muted-foreground italic opacity-50">
            No extreme weaknesses or resistances.
          </div>
        )}
      </div>
    </div>
  );
}
