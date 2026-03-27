import { ShieldAlert, Shield, AlertTriangle, Crosshair, XCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { PokedexTooltip } from '../ui/PokedexTooltip';
import type { TeamSlotState, PokemonType, Move } from '../../data/mocks';
import { cn } from '../../lib/utils';
import { TypeBadge } from '../ui/TypeBadge';
import { HeuristicInsights } from './HeuristicInsights';
import { ExpertAnalyst } from './ExpertAnalyst';
import { useAllTypeMatchups } from '../../queries/typeQueries';

interface TeamCoverageProps {
  team: TeamSlotState[];
}

export function TeamCoverage({ team }: TeamCoverageProps) {
  const { data: typeMatrix, isLoading: isLoadingTypes } = useAllTypeMatchups();
  const activeSlots = team.filter(s => s.pokemon !== null);
  const activeCount = activeSlots.length;

  if (activeCount === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-1000 text-center px-4 pb-32 h-full min-h-[400px]">
        <div className="w-32 h-32 mb-8 rounded-full border-4 border-dashed border-pd-accent/20 flex items-center justify-center bg-card/30 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
          <ShieldAlert className="w-12 h-12 text-pd-accent/30" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Awaiting Roster Data</h2>
        <p className="text-muted-foreground font-medium mt-4 max-w-md leading-relaxed">
          Your active roster is currently empty. Add Pokémon to automatically compute critical defensive vulnerabilities and offensive pressure logic.
        </p>
      </div>
    );
  }

  if (isLoadingTypes || !typeMatrix) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-1000 text-center px-4 pb-32 h-full min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-pd-accent mb-6" />
        <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">Loading Type Matrix</h2>
        <p className="text-muted-foreground font-medium mt-2">Fetching matchup data from PokeAPI…</p>
      </div>
    );
  }

  const allTypes = Object.keys(typeMatrix) as PokemonType[];

  // 1. Silent Computation Engine (Calculates Deltas & Extremes instead of rendering a raw map)
  const analysis = allTypes.map(attackType => {
    
    // Who defends against this type?
    const defenders = activeSlots.map(slot => {
      const types = slot.teraType ? [slot.teraType] : slot.pokemon!.types;
      let mult = 1;
      // Multiply across ALL defender types to handle dual-typing correctly
      types.forEach(t => mult *= (typeMatrix[t]?.[attackType] ?? 1));
      return { pokemon: slot.pokemon!, mult };
    });

    // Who can attack this type for Super Effective damage? (Status moves excluded — they deal no damage)
    const attackers = activeSlots.flatMap(slot => {
       const seMoves = slot.moves.filter(m => m && m.category !== 'status' && (typeMatrix[attackType]?.[m.type] ?? 1) > 1) as Move[];
       if (seMoves.length > 0) return [{ pokemon: slot.pokemon!, moves: seMoves }];
       return [];
    });

    const maxDamageTaken = Math.max(...defenders.map(d => d.mult), 0);
    const minDamageTaken = Math.min(...defenders.map(d => d.mult), 1);
    const weakCount = defenders.filter(d => d.mult >= 2).length;

    // Contextual Rules
    // Unmitigated Weakness: Somebody takes 2x or 4x, and nobody resists it (< 1).
    const isUnmitigatedWeakness = maxDamageTaken >= 2 && minDamageTaken >= 1;
    // Stacked Weakness: 3+ members take super-effective damage — critical even if someone resists
    const isStackedWeakness = weakCount >= 3;
    // Mitigated Weakness: Somebody takes 2x or 4x, but somebody else resists it or is immune 
    const isMitigatedWeakness = maxDamageTaken >= 2 && minDamageTaken < 1 && !isStackedWeakness;
    
    // Core Defenses: Immunities or massive 0.25x resistances
    const isWalled = minDamageTaken === 0;
    const isHeavilyResisted = minDamageTaken === 0.25 || minDamageTaken === 0.125;
    
    // Offense
    const isCovered = attackers.length > 0;

    return {
      type: attackType,
      defenders,
      attackers,
      maxDamageTaken,
      minDamageTaken,
      weakCount,
      isUnmitigatedWeakness,
      isStackedWeakness,
      isMitigatedWeakness,
      isWalled,
      isHeavilyResisted,
      isCovered
    };
  });

  // 2. Bucketing Insights
  const criticalVulnerabilities = analysis.filter(t => t.isUnmitigatedWeakness || t.isStackedWeakness).sort((a,b) => b.weakCount - a.weakCount || b.maxDamageTaken - a.maxDamageTaken);
  
  const coreDefenses = analysis.filter(t => t.isWalled || t.isHeavilyResisted).sort((a,b) => a.minDamageTaken - b.minDamageTaken);
  
  const offensiveCoverage = analysis.filter(t => t.isCovered).sort((a,b) => b.attackers.length - a.attackers.length);
  const blindSpots = analysis.filter(t => !t.isCovered);

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      <HeuristicInsights team={team} />

      {/* Section Divider */}
      <div className="flex items-center gap-4 pt-2">
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Detailed Breakdown</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
         {/* LEFT COLUMN: DEFENSE */}
         <div className="space-y-6 md:space-y-8">
            
            {/* Critical Vulnerabilities */}
            <div className="rounded-[2rem] border-2 border-pd-accent/30 bg-card p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col items-start group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-pd-accent/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-pd-accent/10 transition-colors duration-700" />
              <div className="flex items-center justify-between w-full mb-6">
                <h3 className="text-pd-accent font-black uppercase tracking-widest text-sm md:text-base flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" /> Critical Vulnerabilities
                </h3>
                <PokedexTooltip content="Types that threaten your team with no safe switch-in. Includes unmitigated weaknesses (no member resists) and stacked weaknesses (3+ members hit for super-effective damage)." />
              </div>
              
              <div className="space-y-4 w-full relative z-10">
                 {criticalVulnerabilities.length > 0 ? criticalVulnerabilities.map(vuln => (
                    <div key={vuln.type} className="flex flex-col sm:flex-row sm:items-center p-4 rounded-xl bg-pd-accent/5 border border-pd-accent/20 hover:border-pd-accent/40 transition-colors gap-4">
                       <TypeBadge type={vuln.type} className="shrink-0 scale-110 origin-left" />
                       <div className="flex-1 flex flex-wrap gap-2 items-center sm:justify-end">
                          {vuln.defenders.filter(d => d.mult >= 2).map((def, i) => (
                             <div key={i} className="flex items-center bg-background border border-border rounded-full pl-1 pr-3 py-1 shadow-sm">
                                <img src={def.pokemon.spriteUrl} className="w-6 h-6 object-contain scale-125 mr-1" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-pd-accent whitespace-nowrap">{def.mult}x DMG</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 )) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground italic font-medium opacity-60 bg-background/50 border border-dashed border-border/50 rounded-2xl">
                       <CheckCircle2 className="w-4 h-4 mr-2" /> No unmitigated massive weaknesses
                    </div>
                 )}
              </div>
            </div>

            {/* Defensive Core (Immunities / Hard Resists) */}
            <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8 shadow-sm flex flex-col items-start relative overflow-hidden group">
              <div className="flex items-center justify-between w-full mb-6 z-10">
                <h3 className="text-emerald-500 font-black uppercase tracking-widest text-sm md:text-base flex items-center">
                  <Shield className="w-5 h-5 mr-2" /> Defensive Core
                </h3>
                <PokedexTooltip content="Your team's strongest defensive anchors against specific types. Shows members with immunities (0x) or double-resistances (0.25x), critical for safely pivoting against predictable threats." />
              </div>
              
              <div className="space-y-4 w-full relative z-10">
                 {coreDefenses.length > 0 ? coreDefenses.map(core => (
                    <div key={core.type} className="flex flex-col sm:flex-row sm:items-center p-4 rounded-xl bg-background/50 border border-border/50 hover:bg-foreground/5 transition-colors gap-4">
                       <TypeBadge type={core.type} className="shrink-0" />
                       <div className="flex-1 flex flex-wrap gap-2 items-center sm:justify-end">
                          {core.defenders.filter(d => d.mult <= 0.25).map((def, i) => (
                             <div key={i} className={cn(
                               "flex items-center bg-card border rounded-full pl-1 pr-3 py-1 shadow-sm",
                               def.mult === 0 ? "border-emerald-500/50 text-emerald-500" : "border-border text-emerald-500/70"
                             )}>
                                <img src={def.pokemon.spriteUrl} className="w-6 h-6 object-contain scale-125 mr-1" />
                                <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                                  {def.mult === 0 ? 'IMMUNE' : `${def.mult}x RESIST`}
                                </span>
                             </div>
                          ))}
                       </div>
                    </div>
                 )) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground italic font-medium opacity-60 bg-background/50 border border-dashed border-border/50 rounded-2xl">
                       No immunities or double-resistances
                    </div>
                 )}
              </div>
            </div>
         </div>

         {/* RIGHT COLUMN: OFFENSE */}
         <div className="space-y-6 md:space-y-8">
            
            {/* Blind Spots */}
            {blindSpots.length > 0 && (
               <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8 shadow-sm relative overflow-hidden">
                 <div className="flex items-center justify-between w-full mb-4">
                   <h3 className="text-muted-foreground font-black uppercase tracking-widest text-[11px] flex items-center">
                     <XCircle className="w-4 h-4 mr-2" /> Offensive Blind Spots
                   </h3>
                   <PokedexTooltip content="Types that none of your equipped damaging moves can hit for super-effective damage. These Pokémon can freely switch in and wall your entire team's offensive pressure." />
                 </div>
                 <p className="text-xs font-medium text-muted-foreground mb-4">
                   Your current equipped movesets hit neutral or worse against these specific typings:
                 </p>
                 <div className="flex flex-wrap gap-2">
                    {blindSpots.map(bs => <TypeBadge key={bs.type} type={bs.type} className="opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-crosshair" />)}
                 </div>
               </div>
            )}

            {/* Offensive Pressure Mapping */}
            <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8 shadow-sm flex flex-col items-start relative overflow-hidden group">
              <div className="flex items-center justify-between w-full mb-6 relative z-10 border-b border-border/50 pb-4">
                <h3 className="text-foreground font-black uppercase tracking-widest text-sm md:text-base flex items-center">
                  <Crosshair className="w-5 h-5 mr-2 text-pd-accent" /> Offensive Checkmates
                </h3>
                <PokedexTooltip content="Types your team can threaten with super-effective damage. Shows which members carry the coverage and what moves deliver the hit. More coverage options per type means more flexible play." />
              </div>
              
              <div className="space-y-2 w-full relative z-10">
                 {offensiveCoverage.length > 0 ? offensiveCoverage.map(off => (
                    <div key={off.type} className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-border/30 last:border-0 hover:bg-foreground/5 -mx-4 px-4 transition-colors gap-3">
                       <TypeBadge type={off.type} className="shrink-0" />
                       <div className="flex-1 flex flex-wrap gap-1.5 items-center sm:justify-end">
                          {off.attackers.map((atk, i) => (
                             <div key={i} className="flex items-center gap-1 bg-background border border-border rounded-lg pl-1 pr-2 py-0.5 shadow-sm">
                                <img src={atk.pokemon.spriteUrl} className="w-5 h-5 object-contain scale-125" />
                                <div className="flex flex-col">
                                  {atk.moves.map(m => (
                                     <span key={m.name} className="text-[9px] font-bold uppercase text-foreground leading-tight whitespace-nowrap">{m.name}</span>
                                  ))}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 )) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground italic font-medium opacity-60">
                       Equip attacking moves to see your offensive spread.
                    </div>
                 )}
              </div>
            </div>

         </div>
      </div>

      <ExpertAnalyst team={team} />
    </div>
  );
}
