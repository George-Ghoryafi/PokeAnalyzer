import { useState, useMemo } from 'react';
import { Shield, Sword, Zap } from 'lucide-react';
import type { TeamSlotState, Move } from '../../data/mocks';
import { StatPanel } from '../analysis/StatPanel';
import { MoveSlotCard } from './MoveSlotCard';
import { PremiumSelect } from '../ui/PremiumSelect';
import { NumberInput } from '../ui/NumberInput';
import { TypeBadge } from '../ui/TypeBadge';

export interface EnrichedMove {
  name: string;
  levelLearned: number;
  method: string;
}

interface SlotEditorProps {
  slot: TeamSlotState;
  onChange: (updated: TeamSlotState) => void;
  selectedGame: string;
}

export function SlotEditor({ slot, onChange, selectedGame }: SlotEditorProps) {
  const [activeMoveSlot, setActiveMoveSlot] = useState<number | null>(null);

  const pokemon = slot.pokemon;

  const validMoves = useMemo<EnrichedMove[]>(() => {
    if (!pokemon?.rawMoves) return [];
    return pokemon.rawMoves
      .map((rm: any) => {
        let vgd;
        if (selectedGame === 'national') {
          // Flatten and find best level-up requirement across all generation games
          vgd = rm.version_group_details.reduce((best: any, current: any) => {
            if (!best) return current;
            const isLevelUp = current.move_learn_method.name === 'level-up';
            const bestIsLevelUp = best.move_learn_method.name === 'level-up';
            
            if (isLevelUp && !bestIsLevelUp) return current;
            if (isLevelUp && bestIsLevelUp) {
              return current.level_learned_at < best.level_learned_at ? current : best;
            }
            return best; // fallback: prefer whatever is already stored if no level up
          }, null);
        } else {
          vgd = rm.version_group_details.find((vg: any) => vg.version_group.name === selectedGame);
        }

        if (!vgd) return null;
        return {
          name: rm.move.name.replace(/-/g, ' '),
          levelLearned: vgd.level_learned_at,
          method: vgd.move_learn_method.name
        };
      })
      .filter((m: any): m is EnrichedMove => m !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [pokemon, selectedGame]);

  if (!pokemon) return null;

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header Profile */}
      <div className="flex items-center space-x-4 md:space-x-6">
        <div className="relative h-20 w-20 rounded-full bg-card shadow-inner border border-border/60 p-2">
          <img 
            src={pokemon.spriteUrl} 
            alt={pokemon.name}
            className="h-full w-full object-contain drop-shadow-xl"
          />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black capitalize tracking-tight text-foreground flex items-center">
            {pokemon.name}
            {slot.shiny && <span className="ml-3 text-sm text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-md border border-yellow-400/20">✨ Shiny</span>}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
          </div>
          <div className="flex flex-wrap gap-3 mt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground items-center">
            <span className="flex items-center">
              Level 
              <NumberInput 
                min={1} max={100} 
                value={slot.level} 
                onChange={(val) => onChange({ ...slot, level: val })}
                className="ml-2 w-16 h-6 bg-card/50 border border-border/50 rounded-md text-xs focus-within:border-pd-accent/50 overflow-visible z-10"
              />
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-border" />
            <span>#{String(pokemon.id).padStart(3, '0')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Left Column: Moves & Core Details */}
        <div className="lg:col-span-5 space-y-4 md:space-y-6 relative z-50">
          
          {/* Moves Box - Requires highest inner z-index to cast tooltips over sibling elements */}
          <div className="relative z-[60] rounded-2xl border border-border/50 bg-card/30 p-5 shadow-sm backdrop-blur-lg">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center">
                <Sword className="w-4 h-4 mr-2 text-pd-accent" />
                Moveset
              </h3>
            </div>
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => {
                return (
                  <MoveSlotCard 
                    key={i}
                    move={slot.moves[i] as Move | null}
                    isOpen={activeMoveSlot === i}
                    renderUpwards={i >= 2}
                    onToggle={() => setActiveMoveSlot(activeMoveSlot === i ? null : i)}
                    allowedMoves={validMoves}
                    level={slot.level}
                    onSelectMove={(move) => {
                      const newMoves = [...slot.moves];
                      newMoves[i] = move;
                      onChange({ ...slot, moves: newMoves as any });
                      setActiveMoveSlot(null);
                    }}
                    onRemove={(e) => {
                      e.stopPropagation();
                      const newMoves = [...slot.moves];
                      newMoves[i] = null;
                      onChange({ ...slot, moves: newMoves as any });
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="relative z-[70] grid grid-cols-2 gap-3 md:gap-4">
            <div className="rounded-2xl border border-border/50 bg-card/30 p-4 shadow-sm backdrop-blur-lg">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center">
                <Zap className="w-3.5 h-3.5 mr-2 text-yellow-400" /> Ability
              </h3>
              <PremiumSelect 
                value={slot.ability?.name || ''}
                onChange={(val) => {
                  const ability = pokemon.abilities.find(a => a.name === val) || null;
                  onChange({ ...slot, ability });
                }}
                options={pokemon.abilities.map(a => ({ label: a.name, value: a.name }))}
                placeholder="Select Ability"
                renderUpwards
              />
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/30 p-4 shadow-sm backdrop-blur-lg">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center">
                <Shield className="w-3.5 h-3.5 mr-2 text-emerald-400" /> Item
              </h3>
              <PremiumSelect 
                value={slot.item?.name || ''}
                onChange={(val) => {
                  const item = val ? { name: val } : null;
                  onChange({ ...slot, item });
                }}
                options={[
                  { label: '- None -', value: '' },
                  { label: 'Leftovers', value: 'leftovers' },
                  { label: 'Choice Band', value: 'choiceband' },
                  { label: 'Choice Specs', value: 'choicespecs' },
                  { label: 'Choice Scarf', value: 'choicescarf' },
                  { label: 'Focus Sash', value: 'focussash' }
                ]}
                placeholder="Select Item"
                renderUpwards
              />
            </div>
          </div>
        </div>

        {/* Right Column: EVs/IVs & Stats */}
        <div className="lg:col-span-7">
          <StatPanel slot={slot} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
