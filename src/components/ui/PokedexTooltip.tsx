import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PokedexTooltipProps {
  content: string;
  className?: string;
}

export function PokedexTooltip({ content, className }: PokedexTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, arrowOffset: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Measure trigger position and clamp to viewport bounds
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 288; // w-72 = 18rem = 288px
    const padding = 12; // px from viewport edge
    const centerX = rect.left + rect.width / 2;

    // Clamp so tooltip doesn't overflow right or left edge
    let clampedLeft = centerX;
    if (centerX + tooltipWidth / 2 > window.innerWidth - padding) {
      clampedLeft = window.innerWidth - padding - tooltipWidth / 2;
    }
    if (centerX - tooltipWidth / 2 < padding) {
      clampedLeft = padding + tooltipWidth / 2;
    }

    setPosition({
      top: rect.top + window.scrollY,
      left: clampedLeft + window.scrollX,
      arrowOffset: centerX - clampedLeft, // how far the arrow needs to shift from center
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      // Hold closed doors for 500ms, then open them, then reveal text 350ms after
      const doorTimer = setTimeout(() => setDoorsOpen(true), 500);
      const revealTimer = setTimeout(() => setIsRevealed(true), 500 + 350);
      return () => {
        clearTimeout(doorTimer);
        clearTimeout(revealTimer);
      };
    } else {
      setDoorsOpen(false);
      setIsRevealed(false);
    }
  }, [isOpen, updatePosition]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        const portal = document.getElementById('pokedex-tooltip-portal');
        if (portal && portal.contains(e.target as Node)) return;
        setIsOpen(false);
      }
    };
    // Reposition on scroll/resize
    const handleReposition = () => updatePosition();
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [isOpen, updatePosition]);

  return (
    <>
      {/* Trigger Button — Styled as Pokédex scan button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 shrink-0",
          isOpen
            ? "bg-pd-accent text-white shadow-[0_0_12px_rgba(239,68,68,0.5)] scale-110"
            : "bg-muted-foreground/10 text-muted-foreground/40 hover:bg-pd-accent/20 hover:text-pd-accent hover:scale-110",
          className
        )}
        title="Info"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {/* Portal — renders at document body so no overflow clipping */}
      {isOpen && createPortal(
        <div
          id="pokedex-tooltip-portal"
          className="fixed z-[9999] w-72 pointer-events-auto"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translate(-50%, -100%) translateY(-12px)',
          }}
        >
          {/* Pokédex Tooltip Shell */}
          <div className="relative rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-pd-accent/30">

            {/* The Content Layer (behind the doors) */}
            <div className="bg-[#1a1a2e] p-4 min-h-[60px] flex items-center">
              <p className={cn(
                "text-[11px] leading-relaxed font-medium text-emerald-300 font-mono transition-all duration-500",
                isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              )}>
                {/* Pokédex scan cursor */}
                <span className="text-pd-accent font-black mr-1.5">▶</span>
                {content}
              </p>
            </div>

            {/* Sliding Door Overlay — Top Half (Red) */}
            <div className={cn("absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#c62828] to-[#b71c1c] z-10 border-b border-[#8b0000]/50", doorsOpen && "pokedex-door-top-open")}>
              {/* Pokéball center circle */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-5 h-5 rounded-full bg-[#1a1a2e] border-[3px] border-[#8b0000] z-20" />
              {/* Pokéball band */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1a1a2e]" />
            </div>

            {/* Sliding Door Overlay — Bottom Half (White) */}
            <div className={cn("absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#fafafa] to-[#e0e0e0] z-10 border-t border-[#ccc]/50", doorsOpen && "pokedex-door-bottom-open")}>
              {/* Pokéball band */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#1a1a2e]" />
            </div>
          </div>

          {/* Arrow pointing down to trigger */}
          <div className="flex justify-center -mt-[1px]" style={{ transform: `translateX(${position.arrowOffset}px)` }}>
            <div className="w-3 h-3 bg-[#1a1a2e] border-r border-b border-pd-accent/30 rotate-45 -translate-y-1.5" />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
