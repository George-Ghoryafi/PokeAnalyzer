import { describe, it, expect, vi, afterEach } from 'vitest';
import { getPokemonDetails, getMoveDetails, getItemDetails } from '../../lib/api';

// We mock fetch globally to avoid real network calls
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createFetchResponse(data: unknown, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  });
}

describe('api response parsing', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getPokemonDetails', () => {
    const mockPokemonResponse = {
      id: 6,
      name: 'charizard',
      species: { name: 'charizard' },
      types: [
        { type: { name: 'fire' } },
        { type: { name: 'flying' } },
      ],
      stats: [
        { base_stat: 78, stat: { name: 'hp' } },
        { base_stat: 84, stat: { name: 'attack' } },
        { base_stat: 78, stat: { name: 'defense' } },
        { base_stat: 109, stat: { name: 'special-attack' } },
        { base_stat: 85, stat: { name: 'special-defense' } },
        { base_stat: 100, stat: { name: 'speed' } },
      ],
      sprites: {
        front_default: 'https://example.com/front.png',
        other: { 'official-artwork': { front_default: 'https://example.com/art.png' } },
      },
      abilities: [
        {
          ability: { name: 'blaze', url: 'https://pokeapi.co/api/v2/ability/66/' },
          is_hidden: false,
        },
        {
          ability: { name: 'solar-power', url: 'https://pokeapi.co/api/v2/ability/94/' },
          is_hidden: true,
        },
      ],
      moves: [],
      cries: { latest: 'https://example.com/cry.ogg', legacy: '' },
    };

    const mockAbilityResponse = {
      flavor_text_entries: [
        { flavor_text: 'Powers up Fire-type moves.', language: { name: 'en' } },
      ],
    };

    it('maps types correctly', async () => {
      mockFetch
        .mockReturnValueOnce(createFetchResponse(mockPokemonResponse))
        .mockReturnValue(createFetchResponse(mockAbilityResponse));

      const result = await getPokemonDetails('charizard');
      expect(result.types).toEqual(['fire', 'flying']);
    });

    it('maps stat names correctly (special-attack → specialAttack)', async () => {
      mockFetch
        .mockReturnValueOnce(createFetchResponse(mockPokemonResponse))
        .mockReturnValue(createFetchResponse(mockAbilityResponse));

      const result = await getPokemonDetails('charizard');
      expect(result.stats.specialAttack).toBe(109);
      expect(result.stats.specialDefense).toBe(85);
    });

    it('replaces hyphens in ability names with spaces', async () => {
      mockFetch
        .mockReturnValueOnce(createFetchResponse(mockPokemonResponse))
        .mockReturnValue(createFetchResponse(mockAbilityResponse));

      const result = await getPokemonDetails('charizard');
      const solarPower = result.abilities.find(a => a.name === 'solar power');
      expect(solarPower).toBeDefined();
    });

    it('flags hidden abilities correctly', async () => {
      mockFetch
        .mockReturnValueOnce(createFetchResponse(mockPokemonResponse))
        .mockReturnValue(createFetchResponse(mockAbilityResponse));

      const result = await getPokemonDetails('charizard');
      const hidden = result.abilities.find(a => a.isHidden);
      expect(hidden).toBeDefined();
      expect(hidden!.name).toBe('solar power');
    });

    it('injects Battle Bond for Greninja', async () => {
      const greninjaResponse = {
        ...mockPokemonResponse,
        id: 658,
        name: 'greninja',
        species: { name: 'greninja' },
        types: [{ type: { name: 'water' } }, { type: { name: 'dark' } }],
        abilities: [
          { ability: { name: 'torrent', url: 'https://pokeapi.co/api/v2/ability/67/' }, is_hidden: false },
        ],
      };

      mockFetch
        .mockReturnValueOnce(createFetchResponse(greninjaResponse))
        .mockReturnValue(createFetchResponse(mockAbilityResponse));

      const result = await getPokemonDetails('greninja');
      const battleBond = result.abilities.find(a => a.name === 'battle bond');
      expect(battleBond).toBeDefined();
      expect(battleBond!.isHidden).toBe(true);
    });
  });

  describe('getMoveDetails', () => {
    it('maps response to Move type correctly', async () => {
      mockFetch.mockReturnValueOnce(createFetchResponse({
        name: 'flamethrower',
        type: { name: 'fire' },
        damage_class: { name: 'special' },
        power: 90,
        accuracy: 100,
        flavor_text_entries: [
          { flavor_text: 'Scorches the target.', language: { name: 'en' } },
        ],
      }));

      const result = await getMoveDetails('flamethrower');
      expect(result.name).toBe('flamethrower');
      expect(result.type).toBe('fire');
      expect(result.category).toBe('special');
      expect(result.power).toBe(90);
      expect(result.accuracy).toBe(100);
    });
  });

  describe('getItemDetails', () => {
    it('unions flavor_text games with game_indices', async () => {
      mockFetch.mockReturnValueOnce(createFetchResponse({
        name: 'leftovers',
        sprites: { default: 'https://example.com/leftovers.png' },
        category: { name: 'held-items' },
        flavor_text_entries: [
          { text: 'Restores HP.', language: { name: 'en' }, version_group: { name: 'sword-shield' } },
        ],
        game_indices: [
          { generation: { name: 'generation-iii' } },
        ],
      }));

      const result = await getItemDetails('leftovers');
      expect(result.version_groups).toContain('sword-shield');
      // generation-iii maps to 'ruby-sapphire', 'emerald', 'firered-leafgreen', etc.
      expect(result.version_groups).toContain('ruby-sapphire');
      expect(result.version_groups).toContain('emerald');
    });
  });
});
