import type { BaseStats, TeamSlotState } from '../../data/mocks';
import { calculateHP, calculateStat, getNatureModifier } from '../../lib/pokemonMath';
import { NumberInput } from '../ui/NumberInput';

interface StatPanelProps {
  slot: TeamSlotState;
  onChange: (updated: TeamSlotState) => void;
}

export function StatPanel({ slot, onChange }: StatPanelProps) {
  const { pokemon, evs, ivs, nature, level } = slot;
  
  if (!pokemon) return null;
  
  const stats = pokemon.stats;
  
  const totalEvs = Object.values(evs).reduce((sum, val) => sum + val, 0);

  const statConfig = [
    { label: 'HP', key: 'hp', color: 'bg-pd-accent' },
    { label: 'Atk', key: 'attack', color: 'bg-orange-500' },
    { label: 'Def', key: 'defense', color: 'bg-yellow-500' },
    { label: 'SpA', key: 'specialAttack', color: 'bg-pd-accent' },
    { label: 'SpD', key: 'specialDefense', color: 'bg-green-500' },
    { label: 'Spe', key: 'speed', color: 'bg-pink-500' },
  ];

  return (
    <div className="rounded-2xl border border-border/50 bg-card/30 p-6 shadow-sm backdrop-blur-lg flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h3 className="text-lg font-black tracking-tight text-foreground">Base Stats & Spread</h3>
          <span className="text-xs text-muted-foreground font-bold mt-1">
            EVs: <span className={totalEvs > 510 ? "text-pd-accent" : "text-pd-accent"}>{totalEvs}</span> / 510
          </span>
        </div>
        {nature && (
          <div className="px-3 py-1 bg-background/50 rounded-lg border border-border/50 text-xs font-bold capitalize text-muted-foreground shadow-inner">
            {nature.name} Nature
          </div>
        )}
      </div>
      <div className="flex items-center text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mb-3 px-2">
        <div className="w-10">Stat</div>
        <div className="w-8 text-right px-1">Base</div>
        <div className="w-14 text-center ml-2">EVs</div>
        <div className="w-12 text-center ml-2">IVs</div>
        <div className="w-12 text-right ml-4">Total</div>
        <div className="flex-1 ml-5">Spread</div>
      </div>

      <div className="space-y-3 flex-1">
        {statConfig.map(({ label, key, color }) => {
          const baseValue = stats[key as keyof BaseStats];
          const evValue = evs[key as keyof BaseStats];
          const ivValue = ivs[key as keyof BaseStats];
          
          let finalTotal = 0;
          if (key === 'hp') {
            finalTotal = calculateHP(baseValue, ivValue, evValue, level);
          } else {
            const modifier = getNatureModifier(key as keyof BaseStats, nature);
            finalTotal = calculateStat(baseValue, ivValue, evValue, level, modifier);
          }
          
          const percentage = Math.min(100, Math.max(0, (finalTotal / 500) * 100)); // cap visually
          
          let natureColor = "text-muted-foreground";
          if (nature?.increasedStat === key) natureColor = "text-pd-accent";
          if (nature?.decreasedStat === key) natureColor = "text-pd-accent";
          
          return (
            <div key={key} className="flex items-center text-sm group">
              <div className={`w-10 font-black tracking-wider transition-colors uppercase text-[10px] ${natureColor}`}>
                {label}
              </div>
              <div className="w-8 text-right font-black text-foreground tabular-nums opacity-50 px-1">{baseValue}</div>
              
              <div className="w-14 ml-2">
                <NumberInput 
                  min={0} max={252} step={4}
                  className="w-full h-6 bg-background/50 focus-within:bg-background border border-border/50 focus-within:border-pd-accent/50 rounded-lg text-xs shadow-inner transition-all overflow-visible"
                  value={evValue}
                  onChange={(val) => onChange({ ...slot, evs: { ...evs, [key]: val } })}
                />
              </div>

              <div className="w-12 ml-2">
                <NumberInput 
                  min={0} max={31}
                  className="w-full h-6 bg-background/50 focus-within:bg-background border border-border/50 focus-within:border-pd-accent/50 rounded-lg text-xs shadow-inner transition-all overflow-visible"
                  value={ivValue}
                  onChange={(val) => onChange({ ...slot, ivs: { ...ivs, [key]: val } })}
                />
              </div>

              <div className="w-12 ml-4 text-right font-black text-foreground tabular-nums text-base">{finalTotal}</div>
              
              <div className="ml-5 flex-1 overflow-hidden rounded-full bg-background/50 p-0.5 border border-border/30 shadow-inner">
                <div
                  className={`h-2.5 rounded-full ${color} transition-all duration-300 ease-out shadow-sm relative overflow-hidden`}
                  style={{ width: `${percentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center text-sm">
        <span className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Total Base Input</span>
        <span className="font-black text-2xl tracking-tighter text-foreground tabular-nums">
          {Object.values(stats).reduce((a, b) => a + b, 0)}
        </span>
      </div>
    </div>
  );
}
