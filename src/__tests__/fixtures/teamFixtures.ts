import type { TeamSlotState, Pokemon, Move, Ability, Item, PokemonType } from '../../data/mocks';
import { createEmptyStats } from '../../data/mocks';

// ─── Factories ──────────────────────────────────────────────────────────────

export function createMockPokemon(overrides: Partial<Pokemon> = {}): Pokemon {
  return {
    id: 1,
    name: 'bulbasaur',
    speciesName: 'bulbasaur',
    types: ['grass', 'poison'],
    stats: { hp: 45, attack: 49, defense: 49, specialAttack: 65, specialDefense: 65, speed: 45 },
    spriteUrl: 'https://example.com/bulbasaur.png',
    abilities: [{ name: 'overgrow', description: 'Powers up Grass-type moves when HP is low.' }],
    learnset: [],
    ...overrides,
  };
}

export function createMockSlot(overrides: Partial<TeamSlotState> = {}): TeamSlotState {
  return {
    pokemon: null,
    level: 100,
    shiny: false,
    ability: null,
    item: null,
    nature: null,
    evs: createEmptyStats(0),
    ivs: createEmptyStats(31),
    moves: [null, null, null, null],
    teraType: null,
    isTerastallized: false,
    ...overrides,
  };
}

export function createMockMove(overrides: Partial<Move> = {}): Move {
  return {
    name: 'tackle',
    type: 'normal',
    category: 'physical',
    power: 40,
    accuracy: 100,
    ...overrides,
  };
}

export function createMockAbility(overrides: Partial<Ability> = {}): Ability {
  return {
    name: 'overgrow',
    description: 'Powers up Grass-type moves.',
    ...overrides,
  };
}

export function createMockItem(overrides: Partial<Item> = {}): Item {
  return {
    name: 'leftovers',
    description: 'Restores HP each turn.',
    spriteUrl: '',
    category: 'held-items',
    ...overrides,
  };
}

// ─── Pre-Built Pokémon ──────────────────────────────────────────────────────

export const CHARIZARD = createMockPokemon({
  id: 6,
  name: 'charizard',
  speciesName: 'charizard',
  types: ['fire', 'flying'],
  stats: { hp: 78, attack: 84, defense: 78, specialAttack: 109, specialDefense: 85, speed: 100 },
  abilities: [{ name: 'blaze', description: 'Powers up Fire-type moves when HP is low.' }],
});

export const GENGAR = createMockPokemon({
  id: 94,
  name: 'gengar',
  speciesName: 'gengar',
  types: ['ghost', 'poison'],
  stats: { hp: 60, attack: 65, defense: 60, specialAttack: 130, specialDefense: 75, speed: 110 },
  abilities: [{ name: 'cursed body', description: 'May disable a move used on the Pokémon.' }],
});

export const SCIZOR = createMockPokemon({
  id: 212,
  name: 'scizor',
  speciesName: 'scizor',
  types: ['bug', 'steel'],
  stats: { hp: 70, attack: 130, defense: 100, specialAttack: 55, specialDefense: 80, speed: 65 },
  abilities: [{ name: 'technician', description: 'Powers up weak moves.' }],
});

export const GASTRODON = createMockPokemon({
  id: 423,
  name: 'gastrodon',
  speciesName: 'gastrodon',
  types: ['water', 'ground'],
  stats: { hp: 111, attack: 83, defense: 68, specialAttack: 92, specialDefense: 82, speed: 39 },
  abilities: [{ name: 'storm drain', description: 'Draws in all Water-type moves.' }],
});

export const DRAGONITE = createMockPokemon({
  id: 149,
  name: 'dragonite',
  speciesName: 'dragonite',
  types: ['dragon', 'flying'],
  stats: { hp: 91, attack: 134, defense: 95, specialAttack: 100, specialDefense: 100, speed: 80 },
  abilities: [{ name: 'multiscale', description: 'Reduces damage when HP is full.' }],
});

export const SYLVEON = createMockPokemon({
  id: 700,
  name: 'sylveon',
  speciesName: 'sylveon',
  types: ['fairy'],
  stats: { hp: 95, attack: 65, defense: 65, specialAttack: 110, specialDefense: 130, speed: 60 },
  abilities: [{ name: 'pixilate', description: 'Normal-type moves become Fairy-type.' }],
});

export const SHEDINJA = createMockPokemon({
  id: 292,
  name: 'shedinja',
  speciesName: 'shedinja',
  types: ['bug', 'ghost'],
  stats: { hp: 1, attack: 90, defense: 45, specialAttack: 30, specialDefense: 30, speed: 40 },
  abilities: [{ name: 'wonder guard', description: 'Only supereffective moves will hit.' }],
});

export const ARCEUS = createMockPokemon({
  id: 493,
  name: 'arceus',
  speciesName: 'arceus',
  types: ['normal'],
  stats: { hp: 120, attack: 120, defense: 120, specialAttack: 120, specialDefense: 120, speed: 120 },
  abilities: [{ name: 'multitype', description: 'Changes the Pokémon\'s type to match the Plate it holds.' }],
});

export const SILVALLY = createMockPokemon({
  id: 773,
  name: 'silvally',
  speciesName: 'silvally',
  types: ['normal'],
  stats: { hp: 95, attack: 95, defense: 95, specialAttack: 95, specialDefense: 95, speed: 95 },
  abilities: [{ name: 'rks system', description: 'Changes the Pokémon\'s type to match the memory disc it holds.' }],
});

// ─── Common Moves ───────────────────────────────────────────────────────────

export const FLAMETHROWER = createMockMove({ name: 'flamethrower', type: 'fire', category: 'special', power: 90, accuracy: 100 });
export const EARTHQUAKE = createMockMove({ name: 'earthquake', type: 'ground', category: 'physical', power: 100, accuracy: 100 });
export const THUNDERBOLT = createMockMove({ name: 'thunderbolt', type: 'electric', category: 'special', power: 90, accuracy: 100 });
export const ICE_BEAM = createMockMove({ name: 'ice beam', type: 'ice', category: 'special', power: 90, accuracy: 100 });
export const SHADOW_BALL = createMockMove({ name: 'shadow ball', type: 'ghost', category: 'special', power: 80, accuracy: 100 });
export const STEALTH_ROCK = createMockMove({ name: 'Stealth Rock', type: 'rock', category: 'status', power: null, accuracy: null });
export const RAPID_SPIN = createMockMove({ name: 'Rapid Spin', type: 'normal', category: 'physical', power: 50, accuracy: 100 });
export const DEFOG = createMockMove({ name: 'Defog', type: 'flying', category: 'status', power: null, accuracy: null });
export const SPIKES = createMockMove({ name: 'Spikes', type: 'ground', category: 'status', power: null, accuracy: null });
export const TOXIC = createMockMove({ name: 'toxic', type: 'poison', category: 'status', power: null, accuracy: null });
export const BULLET_PUNCH = createMockMove({ name: 'bullet punch', type: 'steel', category: 'physical', power: 40, accuracy: 100 });
export const MOONBLAST = createMockMove({ name: 'moonblast', type: 'fairy', category: 'special', power: 95, accuracy: 100 });
export const DRAGON_ASCENT = createMockMove({ name: 'dragon ascent', type: 'flying', category: 'physical', power: 120, accuracy: 100 });

// ─── Pre-Built Teams ────────────────────────────────────────────────────────

export function createEmptyTeam(): TeamSlotState[] {
  return Array(6).fill(null).map(() => createMockSlot());
}

export function createMonoFireTeam(): TeamSlotState[] {
  const fireTypes: PokemonType[] = ['fire'];
  return [
    createMockSlot({ pokemon: createMockPokemon({ name: 'arcanine', types: fireTypes, stats: { hp: 90, attack: 110, defense: 80, specialAttack: 100, specialDefense: 80, speed: 95 } }) }),
    createMockSlot({ pokemon: createMockPokemon({ name: 'typhlosion', types: fireTypes, stats: { hp: 78, attack: 84, defense: 78, specialAttack: 109, specialDefense: 85, speed: 100 } }) }),
    createMockSlot({ pokemon: createMockPokemon({ name: 'infernape', types: ['fire', 'fighting'], stats: { hp: 76, attack: 104, defense: 71, specialAttack: 104, specialDefense: 71, speed: 108 } }) }),
    createMockSlot(),
    createMockSlot(),
    createMockSlot(),
  ];
}

export function createBalancedTeam(): TeamSlotState[] {
  return [
    createMockSlot({
      pokemon: CHARIZARD,
      ability: { name: 'blaze', description: 'Powers up Fire-type moves.' },
      moves: [FLAMETHROWER, EARTHQUAKE, null, null],
    }),
    createMockSlot({
      pokemon: GENGAR,
      ability: { name: 'cursed body', description: 'May disable a move.' },
      moves: [SHADOW_BALL, THUNDERBOLT, null, null],
    }),
    createMockSlot({
      pokemon: SCIZOR,
      ability: { name: 'technician', description: 'Powers up weak moves.' },
      moves: [BULLET_PUNCH, null, null, null],
    }),
    createMockSlot({
      pokemon: GASTRODON,
      moves: [ICE_BEAM, STEALTH_ROCK, null, null],
    }),
    createMockSlot({
      pokemon: SYLVEON,
      moves: [MOONBLAST, null, null, null],
    }),
    createMockSlot({
      pokemon: DRAGONITE,
      moves: [EARTHQUAKE, FLAMETHROWER, null, null],
    }),
  ];
}
