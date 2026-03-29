import { useMemo } from 'react';
import type { TeamSlotState } from '../../data/mocks';
import { generateHeuristics } from '../../lib/telemetry';
import { Shield, Target, Wrench, CheckCircle2, XCircle } from 'lucide-react';
import { PokeballLoader } from '../ui/PokeballLoader';
import { PokedexTooltip } from '../ui/PokedexTooltip';
import { cn } from '../../lib/utils';
import { TypeBadge } from '../ui/TypeBadge';
import { useAllTypeMatchups } from '../../queries/typeQueries';

interface HeuristicInsightsProps {
  team: TeamSlotState[];
}

export function HeuristicInsights({ team }: HeuristicInsightsProps) {
  const { data: typeMatrix, isLoading } = useAllTypeMatchups();

  const h = useMemo(() => {
    if (!typeMatrix) return null;
    return generateHeuristics(team, typeMatrix);
  }, [team, typeMatrix]);

  const activeMembers = team.filter(t => t.pokemon !== null).length;

  if (activeMembers === 0) return null;

  if (isLoading || !h) {
    return (
      <div className="mt-8 rounded-[2rem] border border-border bg-card p-12 flex flex-col items-center justify-center">
        <PokeballLoader size={32} className="mb-4 opacity-80" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Compiling Math Matrix</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 mt-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
      
      {/* Defensive Core Widget */}
      <div className="rounded-[2rem] border border-border bg-card overflow-hidden flex flex-col shadow-sm">
        <div className="bg-pd-accent/10 px-6 py-4 border-b border-border flex items-center">
          <Shield className="w-5 h-5 text-pd-accent mr-3" />
          <h3 className="font-black uppercase tracking-widest text-sm text-foreground flex-1">Defensive Profile</h3>
          <PokedexTooltip content="Scans your roster for type-based defensive liabilities. Stacked Weaknesses flag types that hit 3+ members for super-effective damage. Unresisted Threats flag attack types that no team member resists or is immune to." />
        </div>
        <div className="p-6 space-y-6 flex-1">
          <div>
             <h4 className="text-[10px] font-black uppercase text-muted-foreground mb-3 tracking-[0.2em]">Stacked Weaknesses (3+ Members)</h4>
             <div className="flex flex-wrap gap-2">
               {h.defense.stackedWeaknesses.length === 0 ? (
                 <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">None</span>
               ) : (
                 h.defense.stackedWeaknesses.map(t => <TypeBadge key={t} type={t} />)
               )}
             </div>
          </div>
          <div>
             <h4 className="text-[10px] font-black uppercase text-muted-foreground mb-3 tracking-[0.2em]">Unresisted Threats</h4>
             <div className="flex flex-wrap gap-2">
               {h.defense.unresistedThreats.length === 0 ? (
                 <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">None</span>
               ) : (
                 h.defense.unresistedThreats.map(t => <TypeBadge key={t} type={t} />)
               )}
             </div>
          </div>
        </div>
      </div>

      {/* Offensive Profile Widget */}
      <div className="rounded-[2rem] border border-border bg-card overflow-hidden flex flex-col shadow-sm">
        <div className="bg-emerald-500/10 px-6 py-4 border-b border-border flex items-center">
          <Target className="w-5 h-5 text-emerald-500 mr-3" />
          <h3 className="font-black uppercase tracking-widest text-sm text-foreground flex-1">Offensive Profile</h3>
          <PokedexTooltip content="Analyzes your team's equipped movesets for offensive coverage gaps. Missing SE Coverage lists types that no equipped damaging move can hit for super-effective damage. Status moves are excluded from this analysis." />
        </div>
        <div className="p-6 space-y-6 flex-1 flex flex-col">
          <div className="flex-1">
             <h4 className="text-[10px] font-black uppercase text-muted-foreground mb-3 tracking-[0.2em]">Missing SE Coverage</h4>
             <div className="flex flex-wrap gap-2">
               {h.offense.uncoveredTypes.length === 0 ? (
                 <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Perfect Coverage</span>
               ) : (
                 h.offense.uncoveredTypes.map(t => <TypeBadge key={t} type={t} />)
               )}
             </div>
          </div>
          <div className="mt-auto">
             <h4 className="text-[10px] font-black uppercase text-muted-foreground mb-3 tracking-[0.2em] flex items-center justify-between">
               <span>Damage Split</span>
               <span className="text-foreground">{h.offense.physicalPercent}% P / {h.offense.specialPercent}% S</span>
             </h4>
             <div className="h-3 rounded-full bg-border overflow-hidden flex shadow-inner">
               <div className="bg-orange-500 h-full transition-all" style={{ width: `${h.offense.physicalPercent}%` }} />
               <div className="bg-blue-500 h-full transition-all" style={{ width: `${h.offense.specialPercent}%` }} />
             </div>
             {(h.offense.physicalPercent > 80 || h.offense.specialPercent > 80) && (
               <p className="text-[10px] font-bold text-yellow-500 mt-2 uppercase tracking-wide">Extreme Imbalance Detected</p>
             )}
          </div>
        </div>
      </div>

      {/* Utility Profile Widget */}
      <div className="rounded-[2rem] border border-border bg-card overflow-hidden flex flex-col shadow-sm">
        <div className="bg-yellow-500/10 px-6 py-4 border-b border-border flex items-center">
          <Wrench className="w-5 h-5 text-yellow-500 mr-3" />
          <h3 className="font-black uppercase tracking-widest text-sm text-foreground flex-1">Utility & Hazards</h3>
          <PokedexTooltip content="Checks for critical competitive utility. Entry Hazards (Stealth Rock, Spikes) are essential for chip damage. Hazard Removal (Defog, Rapid Spin) prevents the opponent from gaining passive value." />
        </div>
        <div className="p-6 space-y-4 flex-1 flex flex-col justify-center">
          
          <div className={cn(
            "rounded-xl p-4 border flex items-center justify-between transition-colors",
            h.utility.hasHazards ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
          )}>
            <div>
              <h4 className="font-bold text-sm text-foreground">Entry Hazards</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Stealth Rock, Spikes</p>
            </div>
            {h.utility.hasHazards ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-red-500 opacity-50" />}
          </div>

          <div className={cn(
            "rounded-xl p-4 border flex items-center justify-between transition-colors",
            h.utility.hasRemoval ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
          )}>
            <div>
              <h4 className="font-bold text-sm text-foreground">Hazard Removal</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Defog, Rapid Spin</p>
            </div>
            {h.utility.hasRemoval ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-red-500 opacity-50" />}
          </div>

        </div>
      </div>

    </div>
  );
}
