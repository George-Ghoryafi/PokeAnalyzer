import { useState, useEffect } from 'react';
import { TeamBuilder } from './components/team/TeamBuilder';
import { SlotEditor } from './components/config/SlotEditor';
import { TeamCoverage } from './components/analysis/TeamCoverage';
import { CommandPalette } from './components/search/CommandPalette';
import { GameSelector } from './components/ui/GameSelector';
import { TeamManager } from './components/team/TeamManager';
import { createEmptyStats } from './data/mocks';
import type { TeamSlotState, Pokemon } from './data/mocks';
import { cn, isPokemonAllowedInGame } from './lib/utils';
import { AlertOctagon, Trash2, Moon, Sun } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { gameQueries } from './queries/gameQueries';
import { useTheme } from './components/theme-provider';

import { playPokemonCry } from './lib/audio';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full bg-pd-surface hover:bg-black/5 dark:hover:bg-foreground/5 border border-pd-border/20 transition-all shadow-sm"
      title="Toggle Theme"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4 text-pd-accent" /> : <Moon className="w-4 h-4 text-pd-border" />}
    </button>
  );
}

export default function App() {
  const [team, setTeam] = useState<TeamSlotState[]>(() => {
    const saved = localStorage.getItem('active_pokemon_team_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached team state', e);
      }
    }
    return Array(6).fill(null).map(() => ({
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
    }));
  });
  
  useEffect(() => {
    localStorage.setItem('active_pokemon_team_state', JSON.stringify(team));
  }, [team]);
  
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'coverage'>('config');
  
  // High-level Game State Config
  const [selectedGame, setSelectedGame] = useState<string>(() => {
    return localStorage.getItem('active_pokemon_game_state') || 'national';
  });

  useEffect(() => {
    localStorage.setItem('active_pokemon_game_state', selectedGame);
  }, [selectedGame]);
  const { data: allowedSpecies } = useQuery(gameQueries.allowedPokemon(selectedGame));

  const handleSelectPokemon = (pokemon: Pokemon) => {
    if (pokemon.cries?.latest) {
      playPokemonCry(pokemon.cries.latest);
    }
    
    setTeam((prev) => {
      const newTeam = [...prev];
      newTeam[selectedSlotIndex] = {
        ...newTeam[selectedSlotIndex],
        pokemon,
        ability: pokemon.abilities[0] || null,
        teraType: null, // Default to native types; user can explicitly Tera-crystallize later
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
  const isTeamEmpty = team.every(slot => slot.pokemon === null);

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[100dvh] bg-background font-sans overflow-hidden text-foreground selection:bg-pd-accent/30 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
      isTeamEmpty ? "p-2 md:p-6 lg:p-8" : "p-0"
    )}>
      
      {/* Pokedex Hardware Shell */}
      <div className={cn(
        "w-full bg-pd-surface border-pd-border flex flex-col overflow-hidden relative isolate ring-1 ring-white/10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isTeamEmpty 
          ? "max-w-7xl h-full md:h-[95vh] border-4 md:border-8 rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]"
          : "max-w-[100vw] h-[100dvh] border-0 rounded-none shadow-none"
      )}>
        
        {/* Pokedex Hardware Deco Header */}
        <div className="h-16 md:h-20 border-b-4 border-pd-border bg-pd-surface w-full flex items-center px-4 md:px-8 gap-3 md:gap-4 shrink-0 shadow-sm z-20 transition-colors duration-500">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-pd-border bg-cyan-400 shadow-[inset_0_-4px_4px_rgba(0,0,0,0.2)] flex items-center justify-center relative overflow-hidden">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-white/70 rounded-full transition-opacity absolute -ml-4 -mt-4 blur-[1px]" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-full" />
          </div>
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-pd-border bg-pd-accent shadow-inner relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" /></div>
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-pd-border bg-yellow-400 shadow-inner relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" /></div>
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-pd-border bg-emerald-500 shadow-inner relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" /></div>
          
          <div className="ml-auto flex items-center gap-2 md:gap-4">
             <div className="hidden sm:flex items-center">
               <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1 mr-2 px-2">
                 Mode:
               </span>
               <GameSelector value={selectedGame} onChange={setSelectedGame} />
               <div className="w-[1px] h-4 bg-border/50 mx-4" />
               <TeamManager 
                 currentTeam={team} 
                 selectedGame={selectedGame}
                 onLoadTeam={(loadedTeam, game) => {
                   setTeam(loadedTeam);
                   setSelectedGame(game);
                   setSelectedSlotIndex(0);
                 }}
               />
             </div>
             {/* Center toggle for config/coverage */}
             <div className="flex items-center bg-pd-screen border border-pd-border/20 rounded-lg p-0.5 shadow-inner shrink-0 mr-1 md:mr-3">
               <button 
                 onClick={() => setActiveTab('config')}
                 className={cn("px-3 md:px-4 py-1.5 rounded-md text-[10px] md:text-xs uppercase tracking-widest font-black transition-all", activeTab === 'config' ? "bg-card shadow-[0_2px_10px_rgba(0,0,0,0.1)] text-foreground border border-pd-border/10" : "text-muted-foreground hover:text-foreground")}
               >Config</button>
               <button 
                 onClick={() => setActiveTab('coverage')}
                 className={cn("px-3 md:px-4 py-1.5 rounded-md text-[10px] md:text-xs uppercase tracking-widest font-black transition-all", activeTab === 'coverage' ? "bg-card shadow-[0_2px_10px_rgba(0,0,0,0.1)] text-foreground border border-pd-border/10" : "text-muted-foreground hover:text-foreground")}
               >Coverage</button>
             </div>
             <ThemeToggle />
          </div>
        </div>

        {/* MAIN DIGITAL SCREEN AREA */}
        <div className="flex-1 flex flex-col bg-pd-screen overflow-hidden relative z-0 md:m-4 md:rounded-2xl md:border-4 md:border-pd-border md:shadow-inner transition-colors duration-500">
           
           <CommandPalette 
             isOpen={isSearchOpen} 
             onClose={() => setIsSearchOpen(false)} 
             onSelectPokemon={handleSelectPokemon} 
             selectedGame={selectedGame}
           />

           {/* UNIFIED COMPACT ROSTER BAR (Act as physical screen tabs) */}
           <header className="w-full bg-card/90 backdrop-blur-xl border-b border-border/80 shrink-0 z-20 shadow-sm flex flex-col">
        <TeamBuilder 
          team={team} 
          onRemove={handleRemoveFromTeam}
          onSelectSlot={setSelectedSlotIndex}
          onOpenSearch={() => setIsSearchOpen(true)}
          selectedSlotIndex={selectedSlotIndex}
          isExpanded={isTeamEmpty}
          allowedSpecies={allowedSpecies}
        />
      </header>

      {/* MAIN CONTENT AREA */}
      <main 
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 custom-scrollbar relative z-0 scroll-smooth"
      >
        <div className="absolute top-[-100px] right-[-100px] w-[800px] h-[800px] bg-pd-accent/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="mx-auto max-w-[1600px] h-full pb-10">
          {activeTab === 'config' ? (
            activeSlot.pokemon ? (
              isPokemonAllowedInGame(activeSlot.pokemon.name, allowedSpecies) ? (
                <SlotEditor slot={activeSlot} onChange={handleUpdateSlot} selectedGame={selectedGame} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in duration-500 pb-20">
                  <div className="relative w-32 h-32 mb-6 pointer-events-none">
                    <img src={activeSlot.pokemon.spriteUrl} className="w-full h-full object-contain grayscale opacity-30 blur-sm" />
                    <AlertOctagon className="absolute inset-0 m-auto w-12 h-12 text-pd-accent" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-pd-accent mb-2 uppercase tracking-tight">Illegal Pokemon</h2>
                  <p className="text-muted-foreground max-w-md font-medium text-sm md:text-base leading-relaxed mb-8">
                    <strong className="text-foreground capitalize">{activeSlot.pokemon.name}</strong> is not available in <strong className="text-foreground uppercase">{selectedGame.replace(/-/g, ' ')}</strong> according to the regional pokédex.
                  </p>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleRemoveFromTeam(selectedSlotIndex)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-pd-accent/10 hover:bg-pd-accent/20 text-pd-accent border border-pd-accent/20 hover:border-pd-accent/50 rounded-xl font-bold transition-all shadow-inner"
                    >
                      <Trash2 className="w-4 h-4" /> Remove Pokémon
                    </button>
                    <button 
                      onClick={() => setIsSearchOpen(true)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-card hover:bg-foreground/5 text-foreground border border-border/50 hover:border-border rounded-xl font-bold transition-all shadow-sm"
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
                  className="w-24 h-24 md:w-32 md:h-32 mb-6 md:mb-8 rounded-full border-4 border-dashed border-pd-accent/30 flex items-center justify-center hover:bg-pd-accent/10 hover:border-pd-accent/60 transition-all cursor-pointer group shadow-inner"
                >
                  <span className="text-5xl md:text-6xl font-black text-pd-accent/30 group-hover:text-pd-accent/70 transition-colors">+</span>
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
      </div>
    </div>
  );
}
