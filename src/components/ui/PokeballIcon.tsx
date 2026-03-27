import { cn } from "../../lib/utils";

// Standard SVG paths sourced dynamically from trusted open-source generic vector libraries 
export function PokeballIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("fill-current", className)}>
      <path d="M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M12 4C15.84 4 19.06 6.75 19.85 10.37H15.06C14.65 8.42 13.46 7 12 7S9.35 8.42 8.94 10.37H4.15C4.94 6.75 8.16 4 12 4M4.15 13.63H8.94C9.35 15.58 10.54 17 12 17S14.65 15.58 15.06 13.63H19.85C19.06 17.25 15.84 20 12 20S4.94 17.25 4.15 13.63M12 9A3 3 0 0 1 15 12A3 3 0 0 1 12 15A3 3 0 0 1 9 12A3 3 0 0 1 12 9M12 10.5A1.5 1.5 0 0 0 10.5 12A1.5 1.5 0 0 0 12 13.5A1.5 1.5 0 0 0 13.5 12A1.5 1.5 0 0 0 12 10.5Z" />
    </svg>
  );
}
