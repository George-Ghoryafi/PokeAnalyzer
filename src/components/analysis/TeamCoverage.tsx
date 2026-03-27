import { ShieldAlert, Target, Shield, Zap, AlertTriangle } from 'lucide-react';
import { MOCK_TYPE_WEAKNESSES } from '../../data/mocks';
import type { TeamSlotState, PokemonType, Move } from '../../data/mocks';
import { cn } from '../../lib/utils';
import { TypeBadge } from '../ui/TypeBadge';

interface TeamCoverageProps {
  team: TeamSlotState[];
}

export function TeamCoverage({ team }: TeamCoverageProps) {
  const activeSlots = team.filter(s => s.pokemon !== null);
  const activeCount = activeSlots.length;

  if (activeCount === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-1000 text-center px-4 pb-32 h-full min-h-[400px]">
        <div className="w-32 h-32 mb-8 rounded-full border-4 border-dashed border-red-500/20 flex items-center justify-center bg-card/30 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
          <ShieldAlert className="w-12 h-12 text-red-500/30" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Awaiting Roster Data</h2>
        <p className="text-muted-foreground font-medium mt-4 max-w-md leading-relaxed">
          Your active roster is currently empty. Add Pokémon to the top dock to instantly begin computing unified defensive vulnerabilities and outgoing offensive coverage.
        </p>
      </div>
    );
  }

  const allTypes = Object.keys(MOCK_TYPE_WEAKNESSES) as PokemonType[];

  // 1. Calculate Unified Matrix rows
  const unifiedMatrix = allTypes.map(attackType => {
    
    // Defenders against this attackType
    const defenses = team.map(slot => {
      if (!slot.pokemon) return { exists: false, multiplier: 1, pokemon: null };
      
      const types = slot.teraType ? [slot.teraType] : slot.pokemon.types;
      let multiplier = 1;
      types.forEach(defType => {
        multiplier *= (MOCK_TYPE_WEAKNESSES[defType]?.[attackType] ?? 1);
      });
      return { exists: true, multiplier, pokemon: slot.pokemon };
    });
    
    // Attackers that can hit this attackType
    const offensiveHitters = activeSlots.map(slot => {
      const seMoves = slot.moves.filter(m => m && (MOCK_TYPE_WEAKNESSES[attackType]?.[m.type] || 1) > 1) as Move[];
      if (seMoves.length > 0) {
        return { pokemon: slot.pokemon!, moves: seMoves };
      }
      return null;
    }).filter(Boolean) as { pokemon: NonNullable<TeamSlotState['pokemon']>; moves: Move[] }[];

    const dangerScore = defenses.reduce((acc, def) => acc + (def.exists && def.multiplier > 1 ? def.multiplier : 0), 0);
    const offenseScore = offensiveHitters.length;

    return { type: attackType, defenses, offensiveHitters, dangerScore, offenseScore };
  });

  // Sort by biggest threats
  unifiedMatrix.sort((a, b) => b.dangerScore - a.dangerScore || a.offenseScore - b.offenseScore);

  // --- Threat Analysis Computations ---
  const criticalThreats = unifiedMatrix.filter(r => r.offenseScore === 0 && r.dangerScore >= 1);
  const fragileMatchups = unifiedMatrix.filter(r => r.offenseScore === 1 && r.dangerScore >= 1);

  // Global Stats for Header
  const totalCovered = unifiedMatrix.filter(r => r.offenseScore > 0).length;
  const majorVulnerabilities = unifiedMatrix.filter(r => r.dangerScore >= 2).length;
  const perfectImmunities = unifiedMatrix.filter(r => r.defenses.some(d => d.exists && d.multiplier === 0)).length;

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Dashboard Top Header & Vitals */}
      <div className="rounded-3xl border border-border/50 bg-card/30 p-6 md:p-8 shadow-sm backdrop-blur-3xl flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex-1 w-full text-center lg:text-left">
          <h2 className="text-3xl font-black text-foreground tracking-tight">Team Synergy Analysis</h2>
          <p className="text-muted-foreground mt-2 font-medium">Unified Defensive & Offensive Type Matrix</p>
          
          <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-6">
             <div className="px-4 py-2 rounded-xl bg-background/50 border border-border/50 shadow-inner flex flex-col items-center lg:items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center"><Target className="w-3 h-3 mr-1"/> Types Covered</span>
                <span className="text-xl font-black text-foreground">{totalCovered} <span className="text-sm opacity-50">/ 18</span></span>
             </div>
             <div className="px-4 py-2 rounded-xl bg-background/50 border border-border/50 shadow-inner flex flex-col items-center lg:items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center"><ShieldAlert className="w-3 h-3 mr-1"/> Vulnerabilities</span>
                <span className="text-xl font-black text-foreground">{majorVulnerabilities}</span>
             </div>
             <div className="px-4 py-2 rounded-xl bg-background/50 border border-border/50 shadow-inner flex flex-col items-center lg:items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center"><Shield className="w-3 h-3 mr-1"/> Immunities</span>
                <span className="text-xl font-black text-foreground">{perfectImmunities}</span>
             </div>
          </div>
        </div>
        
        {/* Visual Team Roster Cluster */}
        <div className="flex gap-2 p-4 rounded-2xl bg-background/30 border border-border/30 shadow-inner overflow-x-auto w-full lg:w-auto">
           {team.map((slot, i) => slot.pokemon ? (
              <div key={i} className="relative w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-full border border-border/50 bg-card flex items-center justify-center group overflow-hidden shadow-sm">
                 <img src={slot.pokemon.spriteUrl} className="w-full h-full object-contain scale-[1.3] group-hover:scale-[1.5] transition-transform duration-500 drop-shadow-md" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="absolute -bottom-1 -right-1 scale-[0.6] origin-bottom-right drop-shadow-lg">
                    <TypeBadge type={slot.teraType || slot.pokemon.types[0]} />
                 </div>
              </div>
           ) : (
              <div key={i} className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-full border border-dashed border-border/30 bg-background/50" />
           ))}
        </div>
      </div>

      {/* Threat Assessment Module */}
      {(criticalThreats.length > 0 || fragileMatchups.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {criticalThreats.length > 0 && (
              <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-6 shadow-sm flex flex-col items-start relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-colors" />
                <h3 className="text-red-500 font-black uppercase tracking-widest text-[11px] flex items-center mb-3">
                  <ShieldAlert className="w-4 h-4 mr-2" /> Critical Threats
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm font-medium mb-5 leading-relaxed">
                  Matches where your team has <strong>zero offensive coverage</strong> and takes super-effective chunks. If the opponent secures this type advantage, you will be swept.
                </p>
                <div className="flex flex-wrap gap-2 relative z-10">
                  {criticalThreats.map(t => <TypeBadge key={t.type} type={t.type} className="shadow-sm border border-red-500/20" />)}
                </div>
              </div>
          )}

          {fragileMatchups.length > 0 && (
              <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/5 p-6 shadow-sm flex flex-col items-start relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-colors" />
                <h3 className="text-yellow-500 font-black uppercase tracking-widest text-[11px] flex items-center mb-3">
                  <AlertTriangle className="w-4 h-4 mr-2" /> Single Points of Failure
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm font-medium mb-5 leading-relaxed">
                  Matches relying on exactly <strong>one Pokémon</strong> to check. If that Pokémon faints early or is out-sped, these types immediately promote to critical sweeps.
                </p>
                <div className="flex flex-wrap gap-2 relative z-10">
                  {fragileMatchups.map(t => <TypeBadge key={t.type} type={t.type} className="shadow-sm border border-yellow-500/20" />)}
                </div>
              </div>
          )}
        </div>
      )}

      {/* Unified Master Table */}
      <div className="rounded-3xl border border-border/50 bg-card/30 shadow-[0_10px_40px_rgba(0,0,0,0.1)] backdrop-blur-lg flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 md:gap-4 p-4 border-b border-border/50 bg-background/80 backdrop-blur-3xl shadow-sm sticky -top-5 md:-top-7 z-30 rounded-t-3xl mt-4">
          <div className="col-span-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center">
             Type Matchup
          </div>
          <div className="col-span-5 text-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center">
             <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> Defensive Matrix
          </div>
          <div className="col-span-5 text-left text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center px-4 border-l border-border/30">
             <Target className="w-3.5 h-3.5 mr-1.5 text-red-500" /> Offensive Answers
          </div>
        </div>
        
        {/* Legend Ribbon */}
        <div className="flex justify-center md:justify-end px-6 py-2.5 border-b border-border/30 bg-background/40 text-[9px] font-black uppercase tracking-widest space-x-4">
           <span className="flex items-center text-red-400"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/80 mr-1.5 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />Weak</span>
           <span className="flex items-center text-emerald-400"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/80 mr-1.5 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />Resist</span>
           <span className="flex items-center text-blue-400"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400/80 mr-1.5 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />Immune</span>
           <span className="flex items-center text-muted-foreground"><span className="w-2.5 h-2.5 rounded-sm bg-border/40 mr-1.5" />Neutral</span>
        </div>

        {/* Table Body (Natively scrolling instead of nested) */}
        <div className="p-2 md:p-4 space-y-1.5 relative bg-background/10">
          {unifiedMatrix.map(row => {
            const isHighDanger = row.dangerScore > 1.5;
            
            return (
              <div 
                key={row.type} 
                className={cn(
                  "grid grid-cols-12 gap-2 md:gap-4 items-center p-2 rounded-xl transition-all border",
                  isHighDanger ? "bg-red-500/5 border-red-500/10 hover:bg-red-500/10" : "bg-card/20 border-transparent hover:bg-white/5"
                )}
              >
                {/* Type Column */}
                <div className="col-span-2">
                  <TypeBadge type={row.type} className="scale-90 origin-left" />
                </div>
                
                {/* 6-Pip Defensive Heatmap Column */}
                <div className="col-span-5 flex items-center justify-center space-x-1 sm:space-x-1.5 h-10 sm:h-14 bg-background/50 rounded-xl p-1.5 shadow-inner border border-border/30">
                  {row.defenses.map((def, i) => {
                    if (!def.exists) return <div key={i} className="flex-1 h-full rounded border border-dashed border-border/30 bg-background/30" />;
                    
                    let bgClass = "bg-border/30 hover:bg-border/50";
                    if (def.multiplier === 0) bgClass = "bg-blue-500 border border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]";
                    else if (def.multiplier < 1) bgClass = "bg-emerald-500 border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                    else if (def.multiplier > 1) bgClass = "bg-red-500 border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]";

                    return (
                      <div key={i} className={cn("flex-1 h-full rounded-md relative group/pip overflow-hidden transition-all", bgClass)}>
                        <img src={def.pokemon!.spriteUrl} className="absolute inset-0 w-full h-full object-contain scale-[1.5] mix-blend-overlay grayscale opacity-50 group-hover/pip:opacity-100 group-hover/pip:grayscale-0 transition-all drop-shadow" />
                      </div>
                    );
                  })}
                </div>

                {/* Offensive Hitters Column */}
                <div className="col-span-5 flex items-center justify-start space-x-1 sm:space-x-2 px-2 sm:px-4 border-l border-border/20 overflow-x-auto custom-scrollbar h-full">
                  {row.offensiveHitters.length > 0 ? (
                    row.offensiveHitters.map((hitter, i) => (
                      <div key={i} className="relative w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-background border border-border/80 group/hitter shrink-0 shadow-sm cursor-help hover:border-red-500/50 hover:bg-red-500/5 transition-colors">
                        <img src={hitter.pokemon.spriteUrl} className="w-full h-full object-contain scale-125 drop-shadow-md" />
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-3 bg-card border border-border text-foreground rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] opacity-0 group-hover/hitter:opacity-100 pointer-events-none transition-all duration-200 text-xs whitespace-nowrap z-50 backdrop-blur-xl">
                          <div className="font-black capitalize mb-2 border-b border-border/50 pb-1 flex items-center">
                             <Zap className="w-3.5 h-3.5 text-red-500 mr-1.5" />
                             {hitter.pokemon.name} <span className="text-[9px] text-muted-foreground ml-2 tracking-widest uppercase">Coverage</span>
                          </div>
                          <div className="space-y-1.5">
                             {hitter.moves.map(m => (
                               <div key={m.name} className="flex items-center text-muted-foreground font-bold">
                                 <span className="mr-2 scale-75 origin-left inline-block w-16"><TypeBadge type={m.type} /></span>
                                 {m.name}
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-[9px] md:text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] italic bg-background/50 px-3 py-1 rounded-md border border-border/30">No Answers Displayed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
