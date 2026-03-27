import { useState, useRef } from 'react';
import { TeamBuilder } from './components/team/TeamBuilder';
import { SlotEditor } from './components/config/SlotEditor';
import { TeamCoverage } from './components/analysis/TeamCoverage';
import { CommandPalette } from './components/search/CommandPalette';
import { GameSelector } from './components/ui/GameSelector';
import { createEmptyStats } from './data/mocks';
import type { TeamSlotState, Pokemon } from './data/mocks';
import { cn, isPokemonAllowedInGame } from './lib/utils';
import { Database, AlertOctagon, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { gameQueries } from './queries/gameQueries';

export default function App() {
  const [team, setTeam] = useState<TeamSlotState[]>(
    Array(6).fill(null).map(() => ({
      pokemon: null,
      level: 50,
      shiny: false,
      ability: null,
      item: null,
      nature: null,
      evs: createEmptyStats(0),
      ivs: createEmptyStats(31),
      moves: [null, null, null, null],
      teraType: null,
    }))
  );
  
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'coverage'>('config');
  const [isRosterExpanded, setIsRosterExpanded] = useState(true);
  
  // High-level Game State Config
  const [selectedGame, setSelectedGame] = useState<string>('national');
  const { data: allowedSpecies } = useQuery(gameQueries.allowedPokemon(selectedGame));

  const lastScrollY = useRef(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentY = e.currentTarget.scrollTop;
    if (currentY > 50 && currentY > lastScrollY.current && isRosterExpanded) {
      setIsRosterExpanded(false);
    } else if (currentY < 20 && currentY < lastScrollY.current && !isRosterExpanded) {
      setIsRosterExpanded(true);
    }
    lastScrollY.current = currentY;
  };

  const handleSelectPokemon = (pokemon: Pokemon) => {
    setTeam((prev) => {
      const newTeam = [...prev];
      newTeam[selectedSlotIndex] = {
        ...newTeam[selectedSlotIndex],
        pokemon,
        ability: pokemon.abilities[0] || null,
        teraType: pokemon.types[0],
      };
      return newTeam;
    });
  };

  const handleRemoveFromTeam = (index: number) => {
    setTeam((prev) => {
      const newTeam = [...prev];
      newTeam[index] = {
        pokemon: null,
        level: 50,
        shiny: false,
        ability: null,
        item: null,
        nature: null,
        evs: createEmptyStats(0),
        ivs: createEmptyStats(31),
        moves: [null, null, null, null],
        teraType: null,
      };
      return newTeam;
    });
  };

  const handleUpdateSlot = (updated: TeamSlotState) => {
    setTeam((prev) => {
      const newTeam = [...prev];
      newTeam[selectedSlotIndex] = updated;
      return newTeam;
    });
  };

  const activeSlot = team[selectedSlotIndex];

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background font-sans overflow-hidden text-foreground selection:bg-blue-500/30">
      <CommandPalette 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onSelectPokemon={handleSelectPokemon} 
        selectedGame={selectedGame}
      />

      {/* UNIFIED COMPACT HEADER & ROSTER BAR */}
      <header className="w-full bg-card/80 backdrop-blur-3xl border-b border-border/80 shrink-0 z-20 shadow-sm flex flex-col">
        {/* Top Control Strip */}
        <div className="flex items-center justify-between px-4 lg:px-8 py-2 border-b border-border/30">
          {/* Left section: using flex-1 to anchor the layout */}
          <div className="flex items-center space-x-2 flex-1 justify-start">
            <Database className="w-4 h-4 text-blue-400" />
            <h1 className="text-sm font-black tracking-tight text-foreground uppercase hidden sm:block">PokéAnalyzer</h1>
          </div>
          
          {/* Center section: static width / shrink-0 */}
          <div className="flex items-center bg-background/80 border border-border/50 rounded-lg p-0.5 shadow-inner shrink-0">
            <button 
              onClick={() => setActiveTab('config')}
              className={cn("px-4 py-1 rounded-md text-[10px] md:text-xs uppercase tracking-widest font-black transition-all", activeTab === 'config' ? "bg-card shadow-sm text-foreground border border-border/50" : "text-muted-foreground hover:text-foreground")}
            >Slot Config</button>
            <button 
              onClick={() => setActiveTab('coverage')}
              className={cn("px-4 py-1 rounded-md text-[10px] md:text-xs uppercase tracking-widest font-black transition-all", activeTab === 'coverage' ? "bg-card shadow-sm text-foreground border border-border/50" : "text-muted-foreground hover:text-foreground")}
            >Team Coverage</button>
          </div>

          {/* Right section: flex-1 to counter-balance the left section */}
          <div className="hidden sm:flex items-center gap-2 flex-1 justify-end">
            <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest flex items-center gap-1 mr-1">
              Mode:
            </span>
            <GameSelector 
              value={selectedGame}
              onChange={setSelectedGame}
            />
          </div>
        </div>

        {/* Compact Render Engine Dock */}
        <TeamBuilder 
          team={team} 
          onRemove={handleRemoveFromTeam}
          onSelectSlot={setSelectedSlotIndex}
          onOpenSearch={() => setIsSearchOpen(true)}
          selectedSlotIndex={selectedSlotIndex}
          isExpanded={isRosterExpanded}
          onToggleExpand={() => setIsRosterExpanded(!isRosterExpanded)}
          allowedSpecies={allowedSpecies}
        />
      </header>

      {/* MAIN CONTENT AREA */}
      <main 
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 custom-scrollbar relative z-0 scroll-smooth"
        onScroll={handleScroll}
      >
        <div className="absolute top-[-100px] right-[-100px] w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="mx-auto max-w-[1600px] h-full pb-10">
          {activeTab === 'config' ? (
            activeSlot.pokemon ? (
              isPokemonAllowedInGame(activeSlot.pokemon.name, allowedSpecies) ? (
                <SlotEditor slot={activeSlot} onChange={handleUpdateSlot} selectedGame={selectedGame} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in duration-500 pb-20">
                  <div className="relative w-32 h-32 mb-6 pointer-events-none">
                    <img src={activeSlot.pokemon.spriteUrl} className="w-full h-full object-contain grayscale opacity-30 blur-sm" />
                    <AlertOctagon className="absolute inset-0 m-auto w-12 h-12 text-red-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-red-400 mb-2 uppercase tracking-tight">Illegal Pokemon</h2>
                  <p className="text-muted-foreground max-w-md font-medium text-sm md:text-base leading-relaxed mb-8">
                    <strong className="text-foreground capitalize">{activeSlot.pokemon.name}</strong> is not available in <strong className="text-foreground uppercase">{selectedGame.replace(/-/g, ' ')}</strong> according to the regional pokédex.
                  </p>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleRemoveFromTeam(selectedSlotIndex)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/50 rounded-xl font-bold transition-all shadow-inner"
                    >
                      <Trash2 className="w-4 h-4" /> Remove Pokémon
                    </button>
                    <button 
                      onClick={() => setIsSearchOpen(true)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-card hover:bg-white/5 text-foreground border border-border/50 hover:border-border rounded-xl font-bold transition-all shadow-sm"
                    >
                      Swap Pokémon
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground opacity-60 animate-in fade-in duration-700">
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="w-24 h-24 md:w-32 md:h-32 mb-6 md:mb-8 rounded-full border-4 border-dashed border-blue-500/30 flex items-center justify-center hover:bg-blue-500/10 hover:border-blue-500/60 transition-all cursor-pointer group shadow-inner"
                >
                  <span className="text-5xl md:text-6xl font-black text-blue-500/30 group-hover:text-blue-500/70 transition-colors">+</span>
                </button>
                <p className="text-lg md:text-xl font-bold tracking-tight text-foreground">Empty Slot</p>
                <p className="text-xs md:text-sm mt-2 font-medium opacity-80">Click the plus icon to search the Pokédex.</p>
              </div>
            )
          ) : (
            <TeamCoverage team={team} />
          )}
        </div>
      </main>
    </div>
  );
}
