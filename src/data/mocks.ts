export type PokemonType = 
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice' 
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug' 
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface Ability {
  name: string;
  description: string;
}

export interface Move {
  name: string;
  type: PokemonType;
  category: 'physical' | 'special' | 'status';
  power: number | null;
  accuracy: number | null;
  description?: string;
}

export interface Item {
  name: string;
}

export interface Nature {
  name: string;
  increasedStat: keyof BaseStats | null;
  decreasedStat: keyof BaseStats | null;
}

export interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  stats: BaseStats;
  spriteUrl: string;
  abilities: Ability[];
  // Potential moves a pokemon can learn (mock subset)
  learnset: Move[];
  rawMoves?: any[]; // Cached raw payload from PokeAPI containing version group mapping
  cries?: {
    latest: string;
    legacy: string;
  };
}

// Represents deep configuration of a team slot
export interface TeamSlotState {
  pokemon: Pokemon | null;
  level: number;
  shiny: boolean;
  ability: Ability | null;
  item: Item | null;
  nature: Nature | null;
  evs: BaseStats;
  ivs: BaseStats;
  moves: (Move | null)[]; // tuple of length 4
  teraType: PokemonType | null;
}

// Helper to create an empty stat spread
export const createEmptyStats = (val: number): BaseStats => ({
  hp: val, attack: val, defense: val, specialAttack: val, specialDefense: val, speed: val
});

export const MOCK_MOVES: Record<string, Move> = {
  flamethrower: { name: 'Flamethrower', type: 'fire', category: 'special', power: 90, accuracy: 100 },
  earthquake: { name: 'Earthquake', type: 'ground', category: 'physical', power: 100, accuracy: 100 },
  thunderbolt: { name: 'Thunderbolt', type: 'electric', category: 'special', power: 90, accuracy: 100 },
  shadowball: { name: 'Shadow Ball', type: 'ghost', category: 'special', power: 80, accuracy: 100 },
  sludgebomb: { name: 'Sludge Bomb', type: 'poison', category: 'special', power: 90, accuracy: 100 },
  airslash: { name: 'Air Slash', type: 'flying', category: 'special', power: 75, accuracy: 95 },
  bulletpunch: { name: 'Bullet Punch', type: 'steel', category: 'physical', power: 40, accuracy: 100 },
  moonblast: { name: 'Moonblast', type: 'fairy', category: 'special', power: 95, accuracy: 100 },
};

export const MOCK_ABILITIES: Record<string, Ability> = {
  overgrow: { name: 'Overgrow', description: 'Powers up Grass-type moves when HP is low.' },
  blaze: { name: 'Blaze', description: 'Powers up Fire-type moves when HP is low.' },
  levitate: { name: 'Levitate', description: 'Immunity to Ground-type moves.' },
  technician: { name: 'Technician', description: 'Powers up weak moves.' },
  multiscale: { name: 'Multiscale', description: 'Reduces damage when HP is full.' },
  pixilate: { name: 'Pixilate', description: 'Normal-type moves become Fairy-type and increase power.' },
};

export const MOCK_ITEMS: Item[] = [
  { name: 'Leftovers' },
  { name: 'Choice Scarf' },
  { name: 'Choice Band' },
  { name: 'Choice Specs' },
  { name: 'Life Orb' },
  { name: 'Focus Sash' },
];

export const MOCK_NATURES: Nature[] = [
  { name: 'Timid', increasedStat: 'speed', decreasedStat: 'attack' },
  { name: 'Jolly', increasedStat: 'speed', decreasedStat: 'specialAttack' },
  { name: 'Modest', increasedStat: 'specialAttack', decreasedStat: 'attack' },
  { name: 'Adamant', increasedStat: 'attack', decreasedStat: 'specialAttack' },
];

export const MOCK_POKEMON: Pokemon[] = [
  {
    id: 1,
    name: "Bulbasaur",
    types: ["grass", "poison"],
    stats: { hp: 45, attack: 49, defense: 49, specialAttack: 65, specialDefense: 65, speed: 45 },
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
    abilities: [MOCK_ABILITIES.overgrow],
    learnset: [MOCK_MOVES.sludgebomb]
  },
  {
    id: 6,
    name: "Charizard",
    types: ["fire", "flying"],
    stats: { hp: 78, attack: 84, defense: 78, specialAttack: 109, specialDefense: 85, speed: 100 },
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    abilities: [MOCK_ABILITIES.blaze],
    learnset: [MOCK_MOVES.flamethrower, MOCK_MOVES.airslash, MOCK_MOVES.earthquake]
  },
  {
    id: 94,
    name: "Gengar",
    types: ["ghost", "poison"],
    stats: { hp: 60, attack: 65, defense: 60, specialAttack: 130, specialDefense: 75, speed: 110 },
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png",
    abilities: [MOCK_ABILITIES.levitate],
    learnset: [MOCK_MOVES.shadowball, MOCK_MOVES.sludgebomb, MOCK_MOVES.thunderbolt]
  },
  {
    id: 149,
    name: "Dragonite",
    types: ["dragon", "flying"],
    stats: { hp: 91, attack: 134, defense: 95, specialAttack: 100, specialDefense: 100, speed: 80 },
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png",
    abilities: [MOCK_ABILITIES.multiscale],
    learnset: [MOCK_MOVES.earthquake, MOCK_MOVES.flamethrower]
  },
  {
    id: 212,
    name: "Scizor",
    types: ["bug", "steel"],
    stats: { hp: 70, attack: 130, defense: 100, specialAttack: 55, specialDefense: 80, speed: 65 },
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/212.png",
    abilities: [MOCK_ABILITIES.technician],
    learnset: [MOCK_MOVES.bulletpunch]
  },
  {
    id: 700,
    name: "Sylveon",
    types: ["fairy"],
    stats: { hp: 95, attack: 65, defense: 65, specialAttack: 110, specialDefense: 130, speed: 60 },
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/700.png",
    abilities: [MOCK_ABILITIES.pixilate],
    learnset: [MOCK_MOVES.moonblast, MOCK_MOVES.shadowball]
  }
];

export const MOCK_TYPE_WEAKNESSES: Record<PokemonType, Record<string, number>> = {
  grass: { fire: 2, water: 0.5, grass: 0.5, electric: 0.5, ice: 2, poison: 2, ground: 0.5, flying: 2, bug: 2 },
  fire: { fire: 0.5, water: 2, grass: 0.5, ice: 0.5, ground: 2, bug: 0.5, rock: 2, steel: 0.5, fairy: 0.5 },
  water: { fire: 0.5, water: 0.5, electric: 2, grass: 2, ice: 0.5, steel: 0.5 },
  electric: { electric: 0.5, ground: 2, flying: 0.5, steel: 0.5 },
  poison: { grass: 0.5, fighting: 0.5, poison: 0.5, ground: 2, psychic: 2, bug: 0.5, fairy: 0.5 },
  flying: { electric: 2, grass: 0.5, ice: 2, fighting: 0.5, ground: 0, bug: 0.5, rock: 2 },
  ghost: { normal: 0, fighting: 0, poison: 0.5, bug: 0.5, ghost: 2, dark: 2 },
  dragon: { fire: 0.5, water: 0.5, electric: 0.5, grass: 0.5, ice: 2, dragon: 2, fairy: 2 },
  ground: { water: 2, electric: 0, grass: 2, ice: 2, poison: 0.5, rock: 0.5 },
  bug: { fire: 2, grass: 0.5, fighting: 0.5, ground: 0.5, flying: 2, rock: 2 },
  steel: { normal: 0.5, fire: 2, water: 1, electric: 1, grass: 0.5, ice: 0.5, fighting: 2, poison: 0, ground: 2, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 0.5, dragon: 0.5, steel: 0.5, fairy: 0.5 },
  fairy: { fighting: 0.5, poison: 2, bug: 0.5, dragon: 0, dark: 0.5, steel: 2 },
  normal: { fighting: 2, ghost: 0 },
  fighting: { flying: 2, psychic: 2, bug: 0.5, rock: 0.5, dark: 0.5, fairy: 2 },
  psychic: { fighting: 0.5, psychic: 0.5, bug: 2, ghost: 2, dark: 2 },
  rock: { normal: 0.5, fire: 0.5, water: 2, grass: 2, fighting: 2, poison: 0.5, ground: 2, flying: 0.5, steel: 2 },
  ice: { fire: 2, water: 1, ice: 0.5, fighting: 2, rock: 2, steel: 2 },
  dark: { fighting: 2, psychic: 0, bug: 2, ghost: 0.5, dark: 0.5, fairy: 2 }
};
