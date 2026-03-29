import type { TeamSlotState, BaseStats, PokemonType } from '../data/mocks';
import { createEmptyStats } from '../data/mocks';
import { getPokemonDetails, getMoveDetails, getItemDetails } from './api';

const STAT_KEYS: (keyof BaseStats)[] = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];

const STAT_ABBR_MAP: Record<keyof BaseStats, string> = {
  hp: 'HP',
  attack: 'Atk',
  defense: 'Def',
  specialAttack: 'SpA',
  specialDefense: 'SpD',
  speed: 'Spe',
};

const INVERSE_STAT_MAP: Record<string, keyof BaseStats> = {
  'hp': 'hp',
  'atk': 'attack',
  'def': 'defense',
  'spa': 'specialAttack',
  'spd': 'specialDefense',
  'spe': 'speed',
};

const capitalizeWords = (str: string) => 
  str.split(/[- ]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export function exportTeamToShowdown(team: TeamSlotState[]): string {
  const activeSlots = team.filter((s) => s.pokemon !== null);
  if (activeSlots.length === 0) return '';

  return activeSlots.map(slot => {
    if (!slot.pokemon) return '';
    let block = '';

    // First line: Pokemon Name @ Item
    const pokemonName = capitalizeWords(slot.pokemon.name);
    const itemName = slot.item ? capitalizeWords(slot.item.name) : '';
    block += `${pokemonName}${itemName ? ` @ ${itemName}` : ''}\n`;

    // Ability
    if (slot.ability) {
      block += `Ability: ${capitalizeWords(slot.ability.name)}\n`;
    }

    // Level (only if not 100)
    if (slot.level !== 100) {
      block += `Level: ${slot.level}\n`;
    }

    // Shiny
    if (slot.shiny) {
      block += `Shiny: Yes\n`;
    }

    // Tera Type
    if (slot.teraType) {
      block += `Tera Type: ${capitalizeWords(slot.teraType)}\n`;
    }

    // EVs
    const evParts = STAT_KEYS
      .filter(stat => slot.evs[stat] > 0)
      .map(stat => `${slot.evs[stat]} ${STAT_ABBR_MAP[stat]}`);
    if (evParts.length > 0) {
      block += `EVs: ${evParts.join(' / ')}\n`;
    }

    // Nature
    if (slot.nature) {
      block += `${capitalizeWords(slot.nature.name)} Nature\n`;
    }

    // IVs
    const ivParts = STAT_KEYS
      .filter(stat => slot.ivs[stat] < 31)
      .map(stat => `${slot.ivs[stat]} ${STAT_ABBR_MAP[stat]}`);
    if (ivParts.length > 0) {
      block += `IVs: ${ivParts.join(' / ')}\n`;
    }

    // Moves
    for (const move of slot.moves) {
      if (move) {
        block += `- ${capitalizeWords(move.name)}\n`;
      }
    }

    return block.trim();
  }).join('\n\n');
}

export async function importTeamFromShowdown(text: string): Promise<TeamSlotState[]> {
  const teamBlocks = text.split(/\n\n+/).map(b => b.trim()).filter(b => b.length > 0);
  const resultTeam: TeamSlotState[] = Array(6).fill(null).map(() => ({
    pokemon: null,
    level: 100, // Reverts to default 100 per Showdown spec if omitted
    shiny: false,
    ability: null,
    item: null,
    nature: null,
    evs: createEmptyStats(0),
    ivs: createEmptyStats(31),
    moves: [null, null, null, null],
    teraType: null,
  }));

  for (let i = 0; i < Math.min(teamBlocks.length, 6); i++) {
    const block = teamBlocks[i];
    const lines = block.split('\n').map(l => l.trim());
    if (lines.length === 0) continue;

    // First line: Format can be "Nickname (Pokemon Name) (M) @ Item" or "Pokemon Name @ Item"
    const firstLine = lines[0];
    let pokemonNameSegment = firstLine;
    let itemSegment = '';

    if (firstLine.includes('@')) {
      const parts = firstLine.split('@');
      pokemonNameSegment = parts[0].trim();
      itemSegment = parts[1].trim();
    }

    let pokemonNameStr = pokemonNameSegment;
    // Strip gender (M) or (F)
    pokemonNameStr = pokemonNameStr.replace(/\s\([MF]\)$/i, '');
    
    // Resolve Nickname vs Actual Name
    const nameMatch = pokemonNameStr.match(/(?:.*\s\()?([a-zA-Z0-9-’\s]+)\)?/);
    if (nameMatch && nameMatch[1]) {
        pokemonNameStr = nameMatch[1].trim();
    }
    // Remove lingering parenth if matched wrong
    pokemonNameStr = pokemonNameStr.replace(/[()]/g, '');

    const normalizedPokemonName = pokemonNameStr.toLowerCase().replace(/ /g, '-');
    const slotState = resultTeam[i];

    try {
      // Hydrate Pokemon
      const pokemon = await getPokemonDetails(normalizedPokemonName);
      slotState.pokemon = pokemon;
    } catch (e) {
      if (normalizedPokemonName.includes('-')) {
        try {
           const fallbackName = normalizedPokemonName.split('-')[0];
           const pokemon = await getPokemonDetails(fallbackName);
           slotState.pokemon = pokemon;
        } catch(e2) {
           continue; 
        }
      } else {
        // Failed to load this pokemon, skip slot entirely
        console.warn('Completely failed to load pokemon', normalizedPokemonName);
        continue;
      }
    }

    try {
      // Hydrate Item
      if (itemSegment) {
        const normalizedItemName = itemSegment.toLowerCase().replace(/ /g, '-');
        const item = await getItemDetails(normalizedItemName);
        slotState.item = item;
      }
    } catch (e) {
      console.warn('Failed to parse load item', itemSegment);
    }

    let nextMoveIndex = 0;

    for (let j = 1; j < lines.length; j++) {
      const line = lines[j];
      
      if (line.startsWith('Ability:')) {
        const abilityNameStr = line.split(':')[1].trim().toLowerCase().replace(/-/g, ' ');
        const found = slotState.pokemon.abilities.find(a => a.name.toLowerCase() === abilityNameStr);
        if (found) {
            slotState.ability = found;
        } else {
            // Unverified or invalid ability... just inject a raw generic ability type if strictly needed.
            slotState.ability = { name: abilityNameStr, description: '' };
        }
      } else if (line.startsWith('Level:')) {
        slotState.level = parseInt(line.split(':')[1].trim(), 10) || 100;
      } else if (line.startsWith('Shiny:')) {
        slotState.shiny = line.split(':')[1].trim().toLowerCase() === 'yes';
      } else if (line.startsWith('Tera Type:')) {
        slotState.teraType = line.split(':')[1].trim().toLowerCase() as PokemonType;
      } else if (line.endsWith('Nature')) {
        const natureNameStr = line.replace('Nature', '').trim().toLowerCase();
        // Since we don't have a giant hardcoded nature list exported in api, we construct a dummy one,
        // unless we augment a nature map. We leave it as a synthetic record.
        slotState.nature = { name: natureNameStr, increasedStat: null, decreasedStat: null }; 
      } else if (line.startsWith('EVs:')) {
        const evString = line.split(':')[1].trim();
        const evChunks = evString.split('/');
        for (const chunk of evChunks) {
          const [valStr, statStr] = chunk.trim().split(' ');
          const val = parseInt(valStr, 10);
          const statKey = INVERSE_STAT_MAP[statStr.toLowerCase()];
          if (statKey && !isNaN(val)) {
            slotState.evs[statKey] = val;
          }
        }
      } else if (line.startsWith('IVs:')) {
        const ivString = line.split(':')[1].trim();
        const ivChunks = ivString.split('/');
        for (const chunk of ivChunks) {
          const [valStr, statStr] = chunk.trim().split(' ');
          const val = parseInt(valStr, 10);
          const statKey = INVERSE_STAT_MAP[statStr.toLowerCase()];
          if (statKey && !isNaN(val)) {
            slotState.ivs[statKey] = val;
          }
        }
      } else if (line.length > 0 && nextMoveIndex < 4) {
        // Assume anything not matching standard headers that isn't empty is a move line
        const moveNameStr = line.replace(/^- /, '').trim().toLowerCase().replace(/ /g, '-');
        try {
          const move = await getMoveDetails(moveNameStr);
          slotState.moves[nextMoveIndex] = move;
        } catch(e) {
          console.warn('Failed to parse load move', moveNameStr);
        }
        nextMoveIndex++;
      }
    }
  }

  return resultTeam;
}
