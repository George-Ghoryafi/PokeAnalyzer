import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

const BALLS = [
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png'
];

interface PokeballLoaderProps {
  className?: string;
  size?: number;
}

export function PokeballLoader({ className, size = 48 }: PokeballLoaderProps) {
  const [frontIdx, setFrontIdx] = useState(0);
  const [backIdx, setBackIdx] = useState(1);

  useEffect(() => {
    let tick = 0;
    // Fast 1.2s spin total, interval is 600ms. 
    // This perfectly hits the 180deg and 360deg safe "blind spots" where the given face is completely facing away.
    const interval = setInterval(() => {
      tick++;
      if (tick % 2 === 1) {
        // Front face is hidden, safely swap it out
        setFrontIdx(prev => (prev + 2) % 4);
      } else {
        // Back face is hidden, safely swap it out
        setBackIdx(prev => (prev + 2) % 4);
      }
    }, 600);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={cn("relative flex-shrink-0 pointer-events-none", className)}
      style={{ width: size, height: size, perspective: '1000px' }}
    >
      <div 
        className="w-full h-full relative z-10"
        style={{
          transformStyle: 'preserve-3d',
          animation: 'pokeball-loader-spin 1.2s linear infinite'
        }}
      >
        {/* FRONT FACE */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
          }}
        >
          <img 
            src={BALLS[frontIdx]} 
            alt="pokeball-front" 
            className="w-full h-full object-contain rendering-pixelated"
          />
        </div>
        
        {/* BACK FACE */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)', 
          }}
        >
          <img 
            src={BALLS[backIdx]} 
            alt="pokeball-back" 
            className="w-full h-full object-contain rendering-pixelated"
          />
        </div>
      </div>
      
      <style>{`
        @keyframes pokeball-loader-spin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
