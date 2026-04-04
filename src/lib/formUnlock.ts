/**
 * Form unlock logic — extracted from SlotEditor.tsx for testability.
 * 
 * Determines whether a Pokémon's alternate form is "unlocked" based on:
 * - Equipped item (mega stones, primal orbs, rusted sword/shield)
 * - Selected ability (Battle Bond for Ash-Greninja)
 * - Equipped moves (Dragon Ascent for Mega Rayquaza)
 * - Selected game (G-Max only in SwSh/DLC/national)
 */
import type { TeamSlotState } from '../data/mocks';

export function checkFormUnlocked(
  formName: string,
  slot: TeamSlotState,
  selectedGame: string
): boolean {
  const pokemon = slot.pokemon;
  if (!pokemon) return false;

  // ── Ash-Greninja: requires Battle Bond ability ──
  if (formName === 'greninja-ash') {
    return slot.ability?.name.toLowerCase().replace(/ /g, '-') === 'battle-bond';
  }

  // ── Mega Rayquaza: requires Dragon Ascent move ──
  if (formName === 'rayquaza-mega') {
    return slot.moves.some(m => m?.name.toLowerCase() === 'dragon ascent');
  }

  // ── Mega / Primal: requires matching item ──
  if (formName.includes('mega') || formName.includes('primal')) {
    if (!slot.item) return false;
    const itemName = slot.item.name.toLowerCase();

    if (formName.includes('primal')) {
      if (formName === 'groudon-primal') return itemName.includes('red orb');
      if (formName === 'kyogre-primal') return itemName.includes('blue orb');
    }

    if (formName.includes('-mega-x')) return itemName.endsWith('ite x') || itemName.endsWith('ite-x');
    if (formName.includes('-mega-y')) return itemName.endsWith('ite y') || itemName.endsWith('ite-y');

    if (formName.includes('-mega')) {
      return itemName.endsWith('ite') && itemName.startsWith(pokemon.name.substring(0, 4));
    }
  }

  // ── G-Max: only available in specific games ──
  if (formName.includes('gmax')) {
    const gmaxGames = ['sword-shield', 'the-isle-of-armor', 'the-crown-tundra', 'national'];
    return gmaxGames.includes(selectedGame);
  }

  // ── Zacian Crowned: requires Rusted Sword ──
  if (formName === 'zacian-crowned') {
    return slot.item?.name.toLowerCase() === 'rusted sword';
  }

  // ── Zamazenta Crowned: requires Rusted Shield ──
  if (formName === 'zamazenta-crowned') {
    return slot.item?.name.toLowerCase() === 'rusted shield';
  }

  // Default: unlocked
  return true;
}
