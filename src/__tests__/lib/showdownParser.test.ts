import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportTeamToShowdown, importTeamFromShowdown } from '../../lib/showdownParser';
import { createEmptyStats } from '../../data/mocks';

// ── Mock the API module so importTeamFromShowdown doesn't hit the network ──
vi.mock('../../lib/api', () => ({
  getPokemonDetails: vi.fn(),
  getMoveDetails: vi.fn(),
  getItemDetails: vi.fn(),
}));

import { getPokemonDetails, getMoveDetails, getItemDetails } from '../../lib/api';
import {
  createMockSlot, createMockItem, createMockAbility,
  CHARIZARD, GENGAR, FLAMETHROWER, EARTHQUAKE,
} from '../fixtures/teamFixtures';

describe('showdownParser — exportTeamToShowdown', () => {
  it('returns empty string for an empty team', () => {
    const team = Array(6).fill(null).map(() => createMockSlot());
    expect(exportTeamToShowdown(team)).toBe('');
  });

  it('exports Pokémon name with proper capitalization', () => {
    const team = [
      createMockSlot({ pokemon: CHARIZARD }),
      ...Array(5).fill(null).map(() => createMockSlot()),
    ];

    const result = exportTeamToShowdown(team);
    expect(result).toContain('Charizard');
  });

  it('exports Pokémon with item using @ separator', () => {
    const team = [
      createMockSlot({
        pokemon: CHARIZARD,
        item: createMockItem({ name: 'life orb' }),
      }),
      ...Array(5).fill(null).map(() => createMockSlot()),
    ];

    const result = exportTeamToShowdown(team);
    expect(result).toContain('Charizard @ Life Orb');
  });

  it('omits @ when no item is equipped', () => {
    const team = [
      createMockSlot({ pokemon: CHARIZARD }),
      ...Array(5).fill(null).map(() => createMockSlot()),
    ];

    const result = exportTeamToShowdown(team);
    expect(result).not.toContain('@');
  });

  it('omits Level line when level is 100 (default)', () => {
    const team = [
      createMockSlot({ pokemon: CHARIZARD, level: 100 }),
      ...Array(5).fill(null).map(() => createMockSlot()),
    ];

    const result = exportTeamToShowdown(team);
    expect(result).not.toContain('Level:');
  });

  it('includes Level line when level is not 100', () => {
    const team = [
      createMockSlot({ pokemon: CHARIZARD, level: 50 }),
      ...Array(5).fill(null).map(() => createMockSlot()),
    ];

    const result = exportTeamToShowdown(team);
    expect(result).toContain('Level: 50');
  });

  it('includes Shiny: Yes when shiny is true', () => {
    const team = [
      createMockSlot({ pokemon: CHARIZARD, shiny: true }),
      ...Array(5).fill(null).map(() => createMockSlot()),
    ];

    const result = exportTeamToShowdown(team);
    expect(result).toContain('Shiny: Yes');
  });

  it('includes nature line', () => {
    const team = [
      createMockSlot({
        pokemon: CHARIZARD,
        nature: { name: 'Timid', increasedStat: 'speed', decreasedStat: 'attack' },
      }),
      ...Array(5).fill(null).map(() => createMockSlot()),
    ];

    const result = exportTeamToShowdown(team);
    expect(result).toContain('Timid Nature');
  });

  it('exports only non-zero EVs', () => {
    const team = [
      createMockSlot({
        pokemon: CHARIZARD,
        evs: { ...createEmptyStats(0), specialAttack: 252, speed: 252, hp: 4 },
      }),
      ...Array(5).fill(null).map(() => createMockSlot()),
    ];

    const result = exportTeamToShowdown(team);
    expect(result).toContain('EVs:');
    expect(result).toContain('252 SpA');
    expect(result).toContain('252 Spe');
    expect(result).toContain('4 HP');
    // Should NOT mention Atk, Def, SpD since they're 0
    expect(result).not.toContain('Atk');
    expect(result).not.toContain('Def');
  });

  it('exports only non-31 IVs', () => {
    const team = [
      createMockSlot({
        pokemon: CHARIZARD,
        ivs: { ...createEmptyStats(31), attack: 0 },
      }),
      ...Array(5).fill(null).map(() => createMockSlot()),
    ];

    const result = exportTeamToShowdown(team);
    expect(result).toContain('IVs: 0 Atk');
    // Other IVs are 31, so they should not appear
    expect(result).not.toContain('HP');
    expect(result).not.toContain('Spe');
  });

  it('exports moves preceded by dash', () => {
    const team = [
      createMockSlot({
        pokemon: CHARIZARD,
        moves: [FLAMETHROWER, EARTHQUAKE, null, null],
      }),
      ...Array(5).fill(null).map(() => createMockSlot()),
    ];

    const result = exportTeamToShowdown(team);
    expect(result).toContain('- Flamethrower');
    expect(result).toContain('- Earthquake');
  });

  it('exports Tera Type', () => {
    const team = [
      createMockSlot({
        pokemon: CHARIZARD,
        teraType: 'grass',
      }),
      ...Array(5).fill(null).map(() => createMockSlot()),
    ];

    const result = exportTeamToShowdown(team);
    expect(result).toContain('Tera Type: Grass');
  });

  it('separates multiple Pokémon blocks with double newline', () => {
    const team = [
      createMockSlot({ pokemon: CHARIZARD }),
      createMockSlot({ pokemon: GENGAR }),
      ...Array(4).fill(null).map(() => createMockSlot()),
    ];

    const result = exportTeamToShowdown(team);
    expect(result).toContain('Charizard');
    expect(result).toContain('Gengar');
    expect(result.split('\n\n').length).toBe(2);
  });

  it('exports ability line', () => {
    const team = [
      createMockSlot({
        pokemon: CHARIZARD,
        ability: createMockAbility({ name: 'solar power' }),
      }),
      ...Array(5).fill(null).map(() => createMockSlot()),
    ];

    const result = exportTeamToShowdown(team);
    expect(result).toContain('Ability: Solar Power');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// importTeamFromShowdown — with mocked API calls
// ══════════════════════════════════════════════════════════════════════════

const mockCharizard = {
  ...CHARIZARD,
  abilities: [
    { name: 'blaze', description: 'Powers up Fire-type moves.', isHidden: false },
    { name: 'solar power', description: 'Ups Sp.Atk but loses HP in sun.', isHidden: true },
  ],
};

const mockFlamethrower = { ...FLAMETHROWER };
const mockEarthquake = { ...EARTHQUAKE };
const mockItem = createMockItem({ name: 'life orb', description: 'Boosts damage by 30%.' });

describe('showdownParser — importTeamFromShowdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: getPokemonDetails resolves to Charizard
    vi.mocked(getPokemonDetails).mockResolvedValue(mockCharizard);
    vi.mocked(getMoveDetails).mockImplementation(async (name: string) => {
      if (name === 'flamethrower') return mockFlamethrower;
      if (name === 'earthquake') return mockEarthquake;
      throw new Error(`Unknown move: ${name}`);
    });
    vi.mocked(getItemDetails).mockResolvedValue(mockItem);
  });

  it('parses a basic Pokemon name', async () => {
    const text = 'Charizard';
    const team = await importTeamFromShowdown(text);
    expect(team[0].pokemon).not.toBeNull();
    expect(getPokemonDetails).toHaveBeenCalledWith('charizard');
  });

  it('parses Pokemon @ Item on the first line', async () => {
    const text = 'Charizard @ Life Orb';
    const team = await importTeamFromShowdown(text);
    expect(team[0].pokemon).not.toBeNull();
    expect(team[0].item).not.toBeNull();
    expect(getItemDetails).toHaveBeenCalledWith('life-orb');
  });

  it('parses Ability line', async () => {
    const text = `Charizard
Ability: Blaze`;
    const team = await importTeamFromShowdown(text);
    expect(team[0].ability).not.toBeNull();
    expect(team[0].ability!.name).toBe('blaze');
  });

  it('parses Level line', async () => {
    const text = `Charizard
Level: 50`;
    const team = await importTeamFromShowdown(text);
    expect(team[0].level).toBe(50);
  });

  it('defaults level to 100 when Level line is omitted', async () => {
    const text = 'Charizard';
    const team = await importTeamFromShowdown(text);
    expect(team[0].level).toBe(100);
  });

  it('parses Shiny: Yes', async () => {
    const text = `Charizard
Shiny: Yes`;
    const team = await importTeamFromShowdown(text);
    expect(team[0].shiny).toBe(true);
  });

  it('parses Tera Type', async () => {
    const text = `Charizard
Tera Type: Grass`;
    const team = await importTeamFromShowdown(text);
    expect(team[0].teraType).toBe('grass');
  });

  it('parses Nature line', async () => {
    const text = `Charizard
Timid Nature`;
    const team = await importTeamFromShowdown(text);
    expect(team[0].nature).not.toBeNull();
    expect(team[0].nature!.name).toBe('Timid');
    expect(team[0].nature!.increasedStat).toBe('speed');
    expect(team[0].nature!.decreasedStat).toBe('attack');
  });

  it('parses EV spread', async () => {
    const text = `Charizard
EVs: 4 HP / 252 SpA / 252 Spe`;
    const team = await importTeamFromShowdown(text);
    expect(team[0].evs.hp).toBe(4);
    expect(team[0].evs.specialAttack).toBe(252);
    expect(team[0].evs.speed).toBe(252);
    // Unspecified EVs should default to 0
    expect(team[0].evs.attack).toBe(0);
  });

  it('parses IV spread', async () => {
    const text = `Charizard
IVs: 0 Atk`;
    const team = await importTeamFromShowdown(text);
    expect(team[0].ivs.attack).toBe(0);
    // Unspecified IVs should default to 31
    expect(team[0].ivs.hp).toBe(31);
    expect(team[0].ivs.speed).toBe(31);
  });

  it('parses move lines (prefixed with dash)', async () => {
    const text = `Charizard
- Flamethrower
- Earthquake`;
    const team = await importTeamFromShowdown(text);
    expect(team[0].moves[0]).not.toBeNull();
    expect(team[0].moves[1]).not.toBeNull();
    expect(getMoveDetails).toHaveBeenCalledWith('flamethrower');
    expect(getMoveDetails).toHaveBeenCalledWith('earthquake');
  });

  it('strips nickname and parses actual Pokemon name in parentheses', async () => {
    const text = 'MyZard (Charizard) @ Life Orb';
    await importTeamFromShowdown(text);
    expect(getPokemonDetails).toHaveBeenCalledWith('charizard');
  });

  it('strips gender marker from name', async () => {
    const text = 'Charizard (M) @ Life Orb';
    await importTeamFromShowdown(text);
    expect(getPokemonDetails).toHaveBeenCalledWith('charizard');
  });

  it('parses multiple Pokemon blocks separated by double newline', async () => {
    vi.mocked(getPokemonDetails).mockImplementation(async (name: string) => {
      if (name === 'charizard') return mockCharizard;
      if (name === 'gengar') return { ...GENGAR, abilities: [{ name: 'cursed body', description: '', isHidden: false }] };
      throw new Error(`Unknown: ${name}`);
    });

    const text = `Charizard @ Life Orb
Ability: Blaze
- Flamethrower

Gengar
Ability: Cursed Body`;

    const team = await importTeamFromShowdown(text);
    expect(team[0].pokemon).not.toBeNull();
    expect(team[0].pokemon!.name).toBe('charizard');
    expect(team[1].pokemon).not.toBeNull();
    expect(team[1].pokemon!.name).toBe('gengar');
  });

  it('handles failed Pokemon lookups gracefully (skips slot)', async () => {
    vi.mocked(getPokemonDetails).mockRejectedValue(new Error('Not found'));

    const text = 'FakeMonDoesNotExist';
    const team = await importTeamFromShowdown(text);
    // Should silently skip the slot
    expect(team[0].pokemon).toBeNull();
  });

  it('roundtrip: export → import preserves core data', async () => {
    // Set up a fully configured slot
    const originalTeam = [
      createMockSlot({
        pokemon: CHARIZARD,
        ability: createMockAbility({ name: 'blaze' }),
        item: createMockItem({ name: 'life orb' }),
        nature: { name: 'Timid', increasedStat: 'speed', decreasedStat: 'attack' },
        level: 50,
        shiny: true,
        evs: { ...createEmptyStats(0), specialAttack: 252, speed: 252, hp: 4 },
        ivs: { ...createEmptyStats(31), attack: 0 },
        moves: [FLAMETHROWER, EARTHQUAKE, null, null],
        teraType: 'grass',
      }),
      ...Array(5).fill(null).map(() => createMockSlot()),
    ];

    // Export
    const showdown = exportTeamToShowdown(originalTeam);

    // Import with mocks
    vi.mocked(getPokemonDetails).mockResolvedValue(mockCharizard);
    vi.mocked(getItemDetails).mockResolvedValue(createMockItem({ name: 'life orb' }));
    vi.mocked(getMoveDetails).mockImplementation(async (name: string) => {
      if (name === 'flamethrower') return mockFlamethrower;
      if (name === 'earthquake') return mockEarthquake;
      throw new Error(`Unknown move: ${name}`);
    });

    const imported = await importTeamFromShowdown(showdown);

    // Verify core data survived the roundtrip
    expect(imported[0].pokemon).not.toBeNull();
    expect(imported[0].level).toBe(50);
    expect(imported[0].shiny).toBe(true);
    expect(imported[0].nature?.name).toBe('Timid');
    expect(imported[0].evs.specialAttack).toBe(252);
    expect(imported[0].evs.speed).toBe(252);
    expect(imported[0].ivs.attack).toBe(0);
    expect(imported[0].teraType).toBe('grass');
    expect(imported[0].moves[0]).not.toBeNull();
    expect(imported[0].moves[1]).not.toBeNull();
  });
});
