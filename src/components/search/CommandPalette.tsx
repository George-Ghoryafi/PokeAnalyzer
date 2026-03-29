import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { PokeballLoader } from '../ui/PokeballLoader';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pokemonQueries } from '../../queries/pokemonQueries';
import pokemonTypesRaw from '../../data/pokemonTypes.json';
import { TypeBadge } from '../ui/TypeBadge';
import type { PokemonType } from '../../data/mocks';

const pokemonTypes = pokemonTypesRaw as Record<string, PokemonType[]>;
import { gameQueries } from '../../queries/gameQueries';
import type { Pokemon } from '../../data/mocks';
import { cn, isPokemonAllowedInGame } from '../../lib/utils';

// Helper to extract Pokémon ID safely from PokeAPI url string
const extractIdFromUrl = (url: string) => {
  const parts = url.split('/').filter(Boolean);
  return parts[parts.length - 1];
};

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPokemon: (pokemon: Pokemon) => void;
  selectedGame: string;
}

export function CommandPalette({ isOpen, onClose, onSelectPokemon, selectedGame }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSelecting, setIsSelecting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const queryClient = useQueryClient();

  // 1. Fetch Master List utilizing React Query.
  // We rely on the caching and 7-day TTL established in main.tsx.
  const { data, isLoading: isMasterLoading } = useQuery(pokemonQueries.list());
  const masterList = data?.results || [];

  // 2. Fetch Allowed Pokémon for the selected game (utilizes heavily optimized parallel cache via queryOptions)
  const { data: allowedSpecies, isLoading: isAllowedLoading } = useQuery(gameQueries.allowedPokemon(selectedGame));

  // Filter master list based on search term AND allowed species
  const filtered = masterList.filter(p => {
    // Game Filter Constraints
    if (!isPokemonAllowedInGame(p.name, allowedSpecies)) return false;

    // Text Search Constraints
    return p.name.includes(query.toLowerCase().trim());
  }).slice(0, 100); // Only render top 100 results for heavy DOM performance

  // Calculate composite loading state
  const isLoading = isMasterLoading || isAllowedLoading;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setIsSelecting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = async (name: string) => {
    if (isSelecting) return;
    setIsSelecting(true);
    
    try {
      // Direct cache fetch: Uses our query options to resolve locally or via network instantly
      const pokemon = await queryClient.fetchQuery(pokemonQueries.detail(name));
      onSelectPokemon(pokemon);
      onClose();
    } catch (err) {
      console.error('Failed to fetch pokemon details:', err);
      setIsSelecting(false);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen || isSelecting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex].name);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose, handleSelect, isSelecting]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_0_50px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center border-b border-border/50 px-4 py-4">
          {isSelecting ? (
            <div className="mr-4"><PokeballLoader size={24} className="opacity-80" /></div>
          ) : (
            <Search className="h-6 w-6 text-muted-foreground mr-4" />
          )}
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-xl font-medium text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            placeholder="Search Pokémon..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSelecting}
          />
          <button onClick={onClose} disabled={isSelecting} className="p-1.5 rounded-md text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors disabled:opacity-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2 custom-scrollbar">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground flex flex-col items-center">
              <PokeballLoader size={40} className="mb-4 opacity-60" />
              <p className="text-lg font-medium">Loading Pokédex...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No Pokémon found matching "{query}"</p>
            </div>
          ) : (
            filtered.map((pokemon, idx) => {
              const isActive = idx === selectedIndex;
              const id = extractIdFromUrl(pokemon.url);
              // Derived sprite URL using our known PokeAPI patterns
              const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
              
              return (
                <div
                  key={id}
                  onClick={() => handleSelect(pokemon.name)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "flex items-center space-x-4 px-4 py-3 cursor-pointer rounded-xl transition-colors duration-150",
                    isActive ? "bg-pd-accent/10 border border-pd-accent/30" : "hover:bg-foreground/5 border border-transparent",
                    isSelecting && "opacity-50 pointer-events-none"
                  )}
                >
                  <img src={spriteUrl} alt={pokemon.name} className="w-14 h-14 object-contain drop-shadow bg-background/50 rounded-full shrink-0" />
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h3 className={cn("text-lg font-black capitalize tracking-tight", isActive ? "text-pd-accent" : "text-foreground")}>
                        {pokemon.name.replace('-', ' ')}
                      </h3>
                      <span className="text-xs font-bold text-muted-foreground tracking-widest hidden sm:inline-block">#{String(id).padStart(3, '0')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 origin-right scale-90 sm:scale-100 pr-2">
                       {pokemonTypes[pokemon.name]?.map((t) => (
                          <TypeBadge key={t} type={t} />
                       ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="bg-background/80 border-t border-border/50 px-5 py-3 text-[10px] text-muted-foreground flex justify-between uppercase tracking-widest font-black">
          <div className="flex items-center space-x-4">
            <span>↓↑ to navigate</span>
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
          <span className="text-pd-accent/50">PokéAnalyzer Search</span>
        </div>
      </div>
    </div>
  );
}
