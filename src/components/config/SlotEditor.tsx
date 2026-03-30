import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pokemonQueries } from '../../queries/pokemonQueries';
import { Shield, Sword, Zap, ChevronDown } from 'lucide-react';
import { PokeballLoader } from '../ui/PokeballLoader';
import type { TeamSlotState, Move } from '../../data/mocks';
import { StatPanel } from '../analysis/StatPanel';
import { MoveSlotCard } from './MoveSlotCard';
import { ItemPalette } from './ItemPalette';
import { NumberInput } from '../ui/NumberInput';
import { TypeBadge } from '../ui/TypeBadge';
import { cn, computeEffectiveTypes } from '../../lib/utils';

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
  const [isItemPaletteOpen, setItemPaletteOpen] = useState(false);
  const [isAbilityPaletteOpen, setAbilityPaletteOpen] = useState(false);

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

  const { data: speciesData } = useQuery({
    ...pokemonQueries.species(pokemon.speciesName),
    enabled: !!pokemon
  });

  const altForms = useMemo(() => {
    if (!speciesData || !pokemon) return [];
    
    // Sort logic to prefer mega and gmax heavily
    return speciesData.varieties
      .map((v: any) => v.pokemon.name as string)
      .filter((n: string) => {
        if (n.startsWith('koraidon-') && n.endsWith('-build')) return false;
        if (n.startsWith('miraidon-') && n.endsWith('-mode')) return false;

        const permanentForms = ['lycanroc', 'shellos', 'gastrodon', 'vivillon', 'flabebe', 'floette', 'florges', 'pumpkaboo', 'gourgeist', 'basculin', 'toxtricity', 'sinistea', 'polteageist', 'alcremie', 'urshifu', 'dudunsparce', 'maushold', 'tatsugiri', 'squawkabilly', 'wormadam', 'magearna'];
        if (permanentForms.some(p => n.startsWith(p + '-'))) return false;

        return n !== pokemon.name && !n.includes('totem') && !n.includes('-cap') && !n.includes('starter') && n !== 'greninja-battle-bond';
      })
      .sort((a, b) => {
        if (a.includes('mega') && !b.includes('mega')) return -1;
        if (!a.includes('mega') && b.includes('mega')) return 1;
        if (a.includes('gmax') && !b.includes('gmax')) return -1;
        if (!a.includes('gmax') && b.includes('gmax')) return 1;
        return a.localeCompare(b);
      });
  }, [speciesData, pokemon]);

  const [selectedFormName, setSelectedFormName] = useState<string | null>(null);
  const [animatingTargetForm, setAnimatingTargetForm] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(true);

  // Remove initial spin after load
  useEffect(() => {
    const t = setTimeout(() => setIsSpinning(false), 2000);
    return () => clearTimeout(t);
  }, [pokemon?.name]);

  useEffect(() => {
    setSelectedFormName(null);
    setAnimatingTargetForm(null);
  }, [pokemon?.name]);

  const formQuery = useQuery({
    ...pokemonQueries.detail(selectedFormName || ''),
    enabled: !!selectedFormName
  });

  const checkFormUnlocked = (formName: string): boolean => {
    if (formName === 'greninja-ash') {
      return slot.ability?.name.toLowerCase().replace(/ /g, '-') === 'battle-bond';
    }

    if (formName === 'rayquaza-mega') {
      return slot.moves.some(m => m?.name.toLowerCase() === 'dragon ascent');
    }

    if (formName.includes('mega') || formName.includes('primal')) {
      if (!slot.item) return false;
      const itemName = slot.item.name.toLowerCase();

      if (formName.includes('primal')) {
        if (formName === 'groudon-primal') return itemName.includes('red orb');
        if (formName === 'kyogre-primal') return itemName.includes('blue orb');
      }

      if (formName.includes('-mega-x')) return itemName.endsWith('ite x') || itemName.endsWith('ite-x');
      if (formName.includes('-mega-y')) return itemName.endsWith('ite y') || itemName.endsWith('ite-y');

      if (formName.includes('-mega')) {
        return itemName.endsWith('ite') && itemName.startsWith(pokemon.name.substring(0, 4));
      }
    }

    if (formName.includes('gmax')) {
      const gmaxGames = ['sword-shield', 'the-isle-of-armor', 'the-crown-tundra', 'national'];
      return gmaxGames.includes(selectedGame);
    }

    if (formName === 'zacian-crowned') {
      return slot.item?.name.toLowerCase() === 'rusted sword';
    }

    if (formName === 'zamazenta-crowned') {
      return slot.item?.name.toLowerCase() === 'rusted shield';
    }

    return true; // Others default to unlocked
  };

  const handleToggleForm = (targetForm: string) => {
    if (!checkFormUnlocked(targetForm)) return;

    setIsSpinning(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setIsSpinning(true)));
    setTimeout(() => setIsSpinning(false), 2000);

    if (selectedFormName !== targetForm) {
      if (animatingTargetForm !== null) return; // Prevent spamming
      setAnimatingTargetForm(targetForm);
      setTimeout(() => setSelectedFormName(targetForm), 300); // Swap mid-flash
      setTimeout(() => setAnimatingTargetForm(null), 800); // Clean up classes
    } else {
      setSelectedFormName(null);
    }
  };

  const unlockedForms = altForms.filter(checkFormUnlocked);
  const currentActiveForm = animatingTargetForm || selectedFormName;
  const displayedForms = unlockedForms.filter(formName => !currentActiveForm || formName === currentActiveForm);

  const displayPokemon = (selectedFormName && formQuery.data ? formQuery.data : pokemon) as typeof pokemon;

  if (!displayPokemon) return null;

  const isAnimating = animatingTargetForm !== null;

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header Profile */}
      <div className="flex items-start md:items-center justify-between w-full">
        <div className="flex items-center space-x-4 md:space-x-6">
          <div className="relative h-20 w-20 flex-shrink-0 z-20">
            <div className="absolute inset-0 rounded-full bg-card shadow-inner border border-border/60" />
            {isAnimating && (
              <div className={cn(
                  "absolute inset-[-40%] rounded-full border-[10px] opacity-0 animate-mega-burst pointer-events-none mix-blend-screen",
                  animatingTargetForm.includes('gmax') ? "border-red-500" : "border-cyan-400"
              )} />
            )}
            <img 
              src={displayPokemon.spriteUrl} 
              alt={displayPokemon.name}
              className={cn(
                "absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)] object-contain drop-shadow-xl z-10 origin-center transition-all duration-300",
                isAnimating && "animate-mega-flash"
              )}
            />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black capitalize tracking-tight text-foreground flex items-center">
              {displayPokemon.name.replace(/-/g, ' ')}
              {slot.shiny && <span className="ml-3 text-sm text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-md border border-yellow-400/20">✨ Shiny</span>}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {computeEffectiveTypes({...slot, pokemon: displayPokemon}).map(t => <TypeBadge key={t} type={t} />)}
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

        {displayedForms.length > 0 && (
          <div className="flex-shrink-0 self-start md:self-center ml-4 flex flex-col items-end gap-2">
            {displayedForms.map(formName => {
              const isMega = formName.includes('mega') || formName.includes('primal');
              const isGmax = formName.includes('gmax');
              const active = selectedFormName === formName;

              let label = 'Form';
              if (formName.includes('mega-x')) label = 'Mega X';
              else if (formName.includes('mega-y')) label = 'Mega Y';
              else if (formName.includes('mega')) label = 'Mega Form';
              else if (formName.includes('gmax')) label = 'G-Max';
              else if (formName.includes('primal')) label = 'Primal';
              else if (formName.includes('ash')) label = 'Ash Bond';
              else label = formName.replace(pokemon.name + '-', '').replace(/-/g, ' ');

              return (
                <button
                  key={formName}
                  onClick={() => handleToggleForm(formName)}
                  disabled={isAnimating && !active}
                  title={`Toggle ${label}`}
                  className="group relative overflow-hidden rounded-full p-[2px] transition-all border-none shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <div className={cn(
                    "absolute inset-[-50%] transition-opacity", 
                    isMega ? "bg-mega-ring" : isGmax ? "bg-gmax-ring" : "bg-zinc-600",
                    isSpinning && active ? "animate-[spin_1.5s_cubic-bezier(0.1,0.7,0.1,1)]" : "",
                    active ? "opacity-100" : "opacity-40 group-hover:opacity-80"
                  )} />
                  <div className="relative flex items-center h-full w-full rounded-full bg-black/90 px-4 py-2 z-10 backdrop-blur-sm">
                    {active && formQuery.isLoading ? (
                      <div className="mx-2 flex-shrink-0"><PokeballLoader size={12} className="opacity-80 grayscale" /></div>
                    ) : (
                      <span className={cn(
                          "text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-colors drop-shadow-sm flex items-center",
                          active && isMega ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400" :
                          active && isGmax ? "text-red-500" :
                          active ? "text-primary" : "text-zinc-400 group-hover:text-zinc-200",
                          isAnimating ? "opacity-50" : "opacity-100"
                      )}>
                        {label} {active ? 'On' : ''}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
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
            <div className={cn("rounded-2xl border border-border/50 bg-card/30 p-4 shadow-sm backdrop-blur-lg transition-all relative", isAbilityPaletteOpen ? "z-[100]" : "z-10")}>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center">
                <Zap className="w-3.5 h-3.5 mr-2 text-yellow-400" /> Ability
              </h3>
              {selectedFormName !== null ? (
                <div className="relative w-full h-10 px-3 flex flex-col justify-center rounded-lg bg-black/60 border border-cyan-500/20 shadow-inner group overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-transparent blur-xl pointer-events-none mix-blend-screen" />
                  <div className="relative z-10 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400/80 mb-0.5">
                    {selectedFormName.includes('mega') ? 'Mega' : selectedFormName.includes('gmax') ? 'G-Max' : selectedFormName.includes('primal') ? 'Primal' : 'Form'} Ability
                  </div>
                  <div className="relative z-10 text-xs font-black text-white capitalize truncate drop-shadow-sm">
                    {displayPokemon.abilities[0]?.name || 'Unknown'}
                  </div>
                </div>
              ) : (
                <div className="relative w-full">
                  <button
                    onClick={() => {
                        setAbilityPaletteOpen(!isAbilityPaletteOpen);
                        setItemPaletteOpen(false);
                    }}
                    className={cn(
                      "w-full h-10 px-3 flex items-center justify-between rounded-lg bg-black/40 border transition-all text-left group",
                      isAbilityPaletteOpen ? "border-cyan-500/50" : "border-border/50 hover:bg-black/60 hover:border-cyan-500/30"
                    )}
                  >
                    <span className={slot.ability ? "text-cyan-400 font-bold capitalize truncate" : "text-muted-foreground uppercase tracking-widest text-[10px] font-bold"}>
                      {slot.ability ? slot.ability.name : '- Select Ability -'}
                    </span>
                    <ChevronDown 
                      className="w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 group-hover:text-cyan-400" 
                      style={{ transform: isAbilityPaletteOpen ? 'rotate(180deg)' : 'none' }} 
                    />
                  </button>

                  {isAbilityPaletteOpen && (
                    <div className="absolute left-0 right-0 lg:-right-4 lg:w-80 bottom-full mb-2 z-[100] bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {pokemon.abilities.map(a => (
                          <button
                            key={a.name}
                            onClick={() => {
                              onChange({ ...slot, ability: a });
                              setAbilityPaletteOpen(false);
                            }}
                            className={cn(
                              "w-full flex w-full flex-col text-left px-3 py-2.5 rounded-xl transition-all border",
                              slot.ability?.name === a.name 
                                ? "bg-cyan-500/10 border-cyan-500/30" 
                                : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
                            )}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                               <span className={cn(
                                 "text-[13px] font-black capitalize tracking-tight",
                                 slot.ability?.name === a.name ? "text-cyan-400 drop-shadow-md" : "text-foreground"
                               )}>
                                 {a.name}
                               </span>
                               {a.isHidden && (
                                 <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                   Hidden
                                 </span>
                               )}
                            </div>
                            <span className="text-[11px] font-medium text-muted-foreground leading-snug">
                              {a.description || 'Description unavailable.'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className={cn("rounded-2xl border border-border/50 bg-card/30 p-4 shadow-sm backdrop-blur-lg transition-all relative", isItemPaletteOpen ? "z-[100]" : "z-10")}>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center">
                <Shield className="w-3.5 h-3.5 mr-2 text-emerald-400" /> Item
              </h3>
              
              <div className="relative w-full">
                <button
                  onClick={() => {
                    setItemPaletteOpen(!isItemPaletteOpen);
                    setAbilityPaletteOpen(false);
                  }}
                  className="w-full h-10 px-3 flex items-center justify-between rounded-lg bg-black/40 border border-border/50 text-xs font-bold hover:bg-black/60 hover:border-emerald-500/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-2 truncate">
                    {slot.item?.spriteUrl ? (
                      <img src={slot.item.spriteUrl} alt={slot.item.name} className="w-6 h-6 object-contain rendering-pixelated drop-shadow-md pb-1" />
                    ) : null}
                    <span className={slot.item ? "text-emerald-400 capitalize" : "text-muted-foreground uppercase tracking-widest text-[10px]"}>
                      {slot.item ? slot.item.name : '- None -'}
                    </span>
                  </div>
                </button>

                {isItemPaletteOpen && (
                  <div className="absolute left-0 right-0 lg:-left-[100%] lg:right-auto lg:w-80 bottom-full mb-2 z-[100] bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden max-h-[350px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <ItemPalette 
                      selectedGame={selectedGame}
                      onSelectItem={(item) => {
                        onChange({ ...slot, item });
                        setItemPaletteOpen(false);
                      }}
                      onClose={() => setItemPaletteOpen(false)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: EVs/IVs & Stats */}
        <div className="lg:col-span-7">
          <StatPanel slot={{...slot, pokemon: displayPokemon}} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
