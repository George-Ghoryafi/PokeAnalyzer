import { useState, useRef, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { PokeballLoader } from '../ui/PokeballLoader';
import { useQueries, useQuery } from '@tanstack/react-query';
import { itemQueries } from '../../queries/itemQueries';
import type { Item } from '../../data/mocks';
import { cn } from '../../lib/utils';

interface ItemPaletteProps {
  onClose: () => void;
  onSelectItem: (item: Item | null) => void;
  selectedGame: string;
}

export function ItemPalette({ onClose, onSelectItem, selectedGame }: ItemPaletteProps) {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'berries' | 'choice' | 'stones' | 'z-crystals'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: allItemsData, isLoading: isLoadingAll } = useQuery(itemQueries.all());

  const searchResults = useMemo(() => {
    if (!allItemsData) return [];
    
    const normalizedQuery = query.toLowerCase().replace(/ /g, '-');
    const isSearching = normalizedQuery.length > 0;
    
    let filtered = allItemsData.results;

    if (isSearching) {
      filtered = filtered.filter(i => i.name.includes(normalizedQuery));
    }

    // Apply strict category heuristics if not 'all'
    if (filterType === 'berries') {
      filtered = filtered.filter(i => i.name.endsWith('-berry'));
    } else if (filterType === 'choice') {
      filtered = filtered.filter(i => i.name.startsWith('choice-'));
    } else if (filterType === 'stones') {
      filtered = filtered.filter(i => i.name.endsWith('ite') || i.name.endsWith('ite-x') || i.name.endsWith('ite-y') || i.name === 'red-orb' || i.name === 'blue-orb');
    } else if (filterType === 'z-crystals') {
      filtered = filtered.filter(i => i.name.endsWith('-z') || i.name.endsWith('-z--held'));
    } else if (filterType === 'all' && !isSearching) {
      // If 'all' and no query, hide the obvious non-holdables from the top UX gracefully
      const exclusions = [
        '-ball', 'potion', 'antidote', 'awakening', 'burn-heal', 
        'ice-heal', 'paralyze-heal', 'full-restore', 'revive', 
        'repel', 'mail', 'fossil', 'candy', 'elixir', 'ether'
      ];
      filtered = filtered.filter(i => !exclusions.some(exc => i.name.includes(exc)));
    }
    
    // Sort berries up top for generic lists
    if (!isSearching && filterType === 'all') {
      filtered.sort((a, b) => {
        const aIsBerry = a.name.endsWith('-berry');
        const bIsBerry = b.name.endsWith('-berry');
        
        if (aIsBerry && !bIsBerry) return -1;
        if (!aIsBerry && bIsBerry) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    return filtered.slice(0, 50); // Cap locally
  }, [allItemsData, query, filterType]);

  const itemsQueriesResults = useQueries({
    queries: searchResults.map(item => itemQueries.detail(item.name))
  });

  const isLoadingDetails = itemsQueriesResults.some(r => r.isLoading);

  const filteredItems = useMemo(() => {
    const resolvedItems = itemsQueriesResults
      .map(r => r.data)
      .filter((i): i is Item => i !== undefined);

    if (selectedGame === 'national') {
      return resolvedItems;
    }

    return resolvedItems.filter(item => {
      if (!item.version_groups || item.version_groups.length === 0) return true;
      return item.version_groups.includes(selectedGame);
    });
  }, [itemsQueriesResults, selectedGame]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, filterType, filteredItems.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length)); 
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex === 0) {
          onSelectItem(null);
        } else {
          const selected = filteredItems[selectedIndex - 1];
          if (selected) {
            onSelectItem(selected);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems, selectedIndex, onClose, onSelectItem]);

  const showLoading = isLoadingAll || isLoadingDetails;

  return (
    <div className="flex flex-col max-h-[350px] w-full">
      <div className="flex items-center border-b border-border/50 px-3 py-2 bg-black/20 shrink-0">
        <Search className="h-3.5 w-3.5 text-emerald-400 mr-2 shrink-0" />
        <input
          ref={inputRef}
          className="flex-1 bg-transparent text-xs font-bold text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
          placeholder="Search 2000+ items..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Mini Filters */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 border-b border-border/30 bg-background/30 shrink-0">
        <button
          onClick={() => setFilterType('all')}
          className={cn("px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all", filterType === 'all' ? "bg-emerald-500 text-white" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground")}
        >
          All
        </button>
        <button
          onClick={() => setFilterType('berries')}
          className={cn("px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all", filterType === 'berries' ? "bg-emerald-500 text-white" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground")}
        >
          Berries
        </button>
        <button
          onClick={() => setFilterType('choice')}
          className={cn("px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all", filterType === 'choice' ? "bg-emerald-500 text-white" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground")}
        >
          Choice
        </button>
        {['x-y', 'omega-ruby-alpha-sapphire', 'sun-moon', 'ultra-sun-ultra-moon', 'lets-go-pikachu-lets-go-eevee', 'national'].includes(selectedGame) && (
          <button
            onClick={() => setFilterType('stones')}
            className={cn("px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all", filterType === 'stones' ? "bg-emerald-500 text-white" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground")}
          >
            Stones
          </button>
        )}
        {['sun-moon', 'ultra-sun-ultra-moon', 'national'].includes(selectedGame) && (
          <button
            onClick={() => setFilterType('z-crystals')}
            className={cn("px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all", filterType === 'z-crystals' ? "bg-emerald-500 text-white" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground")}
          >
            Z-Crystals
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 custom-scrollbar bg-card/50">
        {showLoading ? (
          <div className="py-8 text-center text-muted-foreground flex flex-col items-center">
            <PokeballLoader size={24} className="mb-3 opacity-60" />
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Fetching Items</p>
          </div>
        ) : (
          <>
            {/* The First Option: Unequip Item */}
            <div
              onClick={() => onSelectItem(null)}
              onMouseEnter={() => setSelectedIndex(0)}
              className={cn(
                "flex items-center px-3 py-2 rounded-xl transition-all duration-150 mb-1 border cursor-pointer",
                selectedIndex === 0
                  ? "bg-red-500/15 border-red-500/40 shadow-sm"
                  : "hover:bg-foreground/5 border-transparent"
              )}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-black/40 border border-foreground/10 shadow-inner mr-3 shrink-0">
                <span className="text-red-400 font-bold block pb-0.5 text-xs">X</span>
              </div>
              <h3 className={cn("text-xs font-black uppercase tracking-widest", selectedIndex === 0 ? "text-red-400" : "text-muted-foreground")}>
                No Item
              </h3>
            </div>

            {filteredItems.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-xs font-medium">No legal items found for this game.</p>
              </div>
            )}

            {filteredItems.map((item, idx) => {
              const isActive = idx + 1 === selectedIndex;
              return (
                <div
                  key={item.name}
                  onClick={() => onSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx + 1)}
                  className={cn(
                    "flex flex-col px-3 py-2 rounded-xl transition-all duration-150 mb-1 border cursor-pointer",
                    isActive
                      ? "bg-emerald-500/15 border-emerald-500/40 shadow-sm"
                      : "hover:bg-foreground/5 border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex w-6 h-6 shrink-0 relative items-center justify-center bg-black/20 rounded-md border border-white/5 shadow-inner">
                      {item.spriteUrl ? (
                        <img 
                            src={item.spriteUrl} 
                            alt={item.name} 
                            className="w-8 h-8 absolute drop-shadow-md rendering-pixelated object-contain max-w-none transform -translate-y-0.5" 
                        />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-border" />
                      )}
                    </div>
                    <div className="flex flex-col items-start gap-0.5 mt-0.5">
                      <h3 className={cn("text-xs font-black capitalize tracking-tight leading-none", isActive ? "text-emerald-400" : "text-foreground")}>
                        {item.name}
                      </h3>
                      <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm bg-black/40 text-muted-foreground mt-0.5">
                        {item.category?.replace(/-/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {isActive && item.description && (
                    <div className="mt-2 pt-2 border-t border-border/40 text-[9px] text-muted-foreground leading-relaxed">
                      {item.description}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className="bg-black/60 border-t border-border/50 px-3 py-1.5 text-[9px] text-muted-foreground flex justify-between uppercase tracking-widest font-black shrink-0">
        <span>↓↑ move</span>
        <span>↵ select</span>
      </div>
    </div>
  );
}
